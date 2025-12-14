# -*- coding: utf-8 -*-
import os, glob, random
import numpy as np
    import pandas as pd
import geopandas as gpd
from shapely.geometry import Point, Polygon, MultiPolygon
from shapely.ops import unary_union
try:
    from shapely.validation import make_valid  # shapely>=2.0
    def _valid(g): return make_valid(g)
except Exception:
    def _valid(g): return g.buffer(0)

# ========= 경로 =========
ADMIN_SHP  = r"E:\capsstonmisu\graduatetotal\RandomPop_Thematic\TEST.shp"                 # 동남/서북 폴리곤 + RandomPop
LC_SHP     = r"E:\capsstonmisu\graduatetotal\Thematic Map\Thematic_Merge_Clip.shp"       # 클립된 토지피복도
OUT_DIR    = r"E:\capsstonmisu\graduatetotal\RandomPop_Thematic"
OUT_PATH   = os.path.join(OUT_DIR, "RandomPop.shp")

# ========= 설정 =========
MID_FIELD = "L2_CODE"    # 토지피복도 중분류 코드 필드명
ADM_CODE  = "ADM_SECT_C" # 행정구 코드 필드 (44131=동남구, 44133=서북구)
SGG_NM    = "SGG_NM"     # 행정구 이름 필드
POP_FIELD = "RandomPop"  # 폴리곤에 저장된 인구 수

# 인적 드문 지역(배치 제외) 중분류 코드
EXCLUDE_MID = {310, 320, 330, 510, 520, 610, 620, 710, 720}

# 포인트 1개당 인구(명) 범위
MIN_PER_PT, MAX_PER_PT = 1, 200

# ========= 유틸 =========
def delete_shp_bundle(shp_path: str):
    base, _ = os.path.splitext(shp_path)
    for ext in (".shp", ".shx", ".dbf", ".prj", ".cpg", ".qpj"):
        p = base + ext
        if os.path.exists(p):
            try:
                os.remove(p)
            except Exception:
                pass

def random_split_population(total: int, min_k=1, max_k=200) -> list:
    """
    total 인구를 1~200 범위의 정수로 무작위 분할 (합계=total).
    """
    parts = []
    remain = total
    while remain > 0:
        k = random.randint(min_k, max_k)
        if k > remain:
            k = remain
        parts.append(k)
        remain -= k
    return parts

def random_point_in_poly(poly: Polygon, max_try=8000) -> Point:
    poly = _valid(poly)
    minx, miny, maxx, maxy = poly.bounds
    for _ in range(max_try):
        x = random.uniform(minx, maxx)
        y = random.uniform(miny, maxy)
        p = Point(x, y)
        if poly.covers(p):  # 경계 포함
            return p
    return poly.representative_point()

def sample_points_in_multipolygon(mp: MultiPolygon | Polygon, n: int):
    if isinstance(mp, Polygon):
        polys = [_valid(mp)]
    else:
        polys = [_valid(p) for p in mp.geoms if isinstance(p, Polygon) and p.area > 0]
    areas = np.array([p.area for p in polys], dtype=float)
    probs = areas / areas.sum()
    pts = []
    for _ in range(n):
        tgt = np.random.choice(len(polys), p=probs)
        pts.append(random_point_in_poly(polys[tgt]))
    return pts

# ========= 로드 =========
os.makedirs(OUT_DIR, exist_ok=True)
if os.path.exists(OUT_PATH):
    delete_shp_bundle(OUT_PATH)

g_admin = gpd.read_file(ADMIN_SHP)   # 동남/서북 폴리곤 + RandomPop
g_lc    = gpd.read_file(LC_SHP)      # 클립된 토지피복도

# 좌표계 맞추기
if g_admin.crs != g_lc.crs:
    g_lc = g_lc.to_crs(g_admin.crs)

# 허용 영역(= 인적 드문 지역 제외)
mask_excl = g_lc[MID_FIELD].apply(lambda v: int(v) in EXCLUDE_MID if str(v).isdigit() else str(v).strip() in {str(x) for x in EXCLUDE_MID})
allowed_union = _valid(unary_union(g_lc.loc[~mask_excl, "geometry"].values))
if allowed_union.is_empty:
    raise RuntimeError("허용 영역이 비어 있습니다. MID_FIELD/EXCLUDE_MID를 확인하세요.")

# 결과 담을 리스트
rows = []

# 두 구(동남/서북) 각각 처리
for _, row in g_admin.iterrows():
    adm = row[ADM_CODE]
    name = row[SGG_NM]
    pop  = int(row[POP_FIELD])

    # 해당 구의 허용 영역 = (구 폴리곤 ∩ 허용 토지피복도)
    poly_mask = _valid(row.geometry)
    allowed_this = _valid(allowed_union.intersection(poly_mask))
    if allowed_this.is_empty:
        print(f"[WARN] {name} 허용 영역이 비었습니다. 이 구는 스킵합니다.")
        continue

    # 인구를 1~200명 단위로 무작위 분할 → 포인트 개수와 각 포인트의 POP 값 결정
    buckets = random_split_population(pop, MIN_PER_PT, MAX_PER_PT)
    pts = sample_points_in_multipolygon(allowed_this, len(buckets))

    # 레코드 작성
    for p, people in zip(pts, buckets):
        rows.append({
            "ADM_SECT_C": adm,
            "SGG_NM": name,
            "POP": int(people),    # 포인트당 인구(1~200)
            "geometry": p
        })

# GeoDataFrame 생성
g_out = gpd.GeoDataFrame(rows, crs=g_admin.crs)

# 검증: 모든 포인트가 허용영역 안인지 확인, 벗어난 건 재샘플링 3회 시도
tries = 0
inside = g_out.geometry.apply(allowed_union.covers)
while not inside.all() and tries < 3:
    need = (~inside)
    fix_pts = sample_points_in_multipolygon(allowed_union, need.sum())
    g_out.loc[need, "geometry"] = fix_pts
    inside = g_out.geometry.apply(allowed_union.covers)
    tries += 1

# 저장
g_out.to_file(OUT_PATH, driver="ESRI Shapefile", encoding="utf-8")
print(f"[DONE] RandomPop 저장 완료 → {OUT_PATH}")
print(f"총 포인트 수: {len(g_out):,}개 / 총 인구 합계: {g_out['POP'].sum():,}명")
print("구별 합계:")
print(g_out.groupby("SGG_NM")["POP"].sum())