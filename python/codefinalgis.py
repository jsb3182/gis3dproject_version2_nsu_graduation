# ============================================
# 0. 라이브러리 임포트
# ============================================
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Tuple
import psycopg2, random
import os
import pickle
import csv

# 자동 저장 폴더
SAVE_DIR = r"E:\capsstonmisu\graduatetotal\Genetic Algorithm\GA_Results"
if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)


# ============================================
# 1. DB 연결 및 데이터 로딩 함수
# ============================================
def get_db_connection(host: str, port: int, dbname: str, user: str, password: str):
    """
    psycopg2를 이용해 PostgreSQL에 연결하고
    connection 객체를 반환합니다.
    """
    conn = psycopg2.connect(
        host=host,
        port=port,
        dbname=dbname,
        user=user,
        password=password
    )
    print(f"[DEBUG] DB 연결 완료: {dbname}@{host}:{port} (user={user})")
    return conn


def load_building_info(conn, min_area: float = 50.0) -> List[Dict]:
    """
    영역이 min_area 이상이고, 이름(name) 필터를 통과하는
    건물 후보지를 로드하여 리스트로 반환합니다.
    """
    sql = f"""
    SELECT target_fid AS gid,
           shape_area,
           ST_X(ST_Centroid(geom)) AS cx,
           ST_Y(ST_Centroid(geom)) AS cy,
           name
    FROM gis_build_2km
    WHERE shape_area > {min_area}
      AND name IS NOT NULL
      AND TRIM(name) <> ''
      AND (
        name ILIKE '%학교' OR name ILIKE '%운동장' OR name ILIKE '%아파트'
        OR name ILIKE '%농협%' OR name ILIKE '%도서관%' OR name ILIKE '%경로당'
        OR name ILIKE '%초등학교' OR name ILIKE '%중학교' OR name ILIKE '%고등학교'
        OR name ILIKE '%마을회관%' OR name ILIKE '%회관%'
      );
    """
    cur = conn.cursor()
    cur.execute(sql)
    rows = cur.fetchall()
    cur.close()

    building_list = []
    for gid, area, cx, cy, name in rows:
        building_list.append({
            'gid': gid,
            'area': float(area),
            'cx': float(cx),
            'cy': float(cy),
            'name': name
        })

    print(f"[DEBUG] 후보 건물 수: {len(building_list)} 건 (min_area={min_area})")
    return building_list


def load_census_info(conn) -> List[Dict]:
    """
    인구 포인트 테이블(public.randompop)에서
    인구 및 좌표를 로드합니다.
    - 실제 컬럼: gid, adm_sect_c, sgg_nm, pop, geom
    - GA 코드 호환을 위해: id 대신 gid를 tot_reg_cd로 사용, cx/cy는 (중심점) 좌표 사용
    """
    cur = conn.cursor()
    sql = """
    SELECT 
        gid AS tot_reg_cd,          -- 고유 ID
        pop AS population,          -- 인구 수
        ST_X(ST_Centroid(geom)) AS cx,
        ST_Y(ST_Centroid(geom)) AS cy
    FROM public.randompop;
    """
    cur.execute(sql)
    rows = cur.fetchall()
    cur.close()

    census_list = [
        {
            'tot_reg_cd': r[0],
            'population': float(r[1]) if r[1] is not None else 0.0,
            'cx': float(r[2]),
            'cy': float(r[3]),
        }
        for r in rows
    ]

    print(f"[DEBUG] 집계구 레코드 수: {len(census_list)}")
    return census_list


def find_nearest_node(conn, x: float, y: float, srid: int = 5174, buffer_dist: int = 1500) -> int:
    """
    주어진 좌표(x, y)를 포함하는 버퍼 내에서 최근접 node_id를 찾고,
    없으면 전체 노드에 대해 KNN fallback을 수행합니다.
    (노드 테이블: public.node_4km, 버퍼 반경: 1500m)
    """
    sql_buf = """
    WITH pt AS (SELECT ST_SetSRID(ST_Point(%s, %s), %s) AS geom)
    SELECT node_id
    FROM public.node_4km
    WHERE ST_DWithin(geom, (SELECT geom FROM pt), %s)
    ORDER BY geom <-> (SELECT geom FROM pt)
    LIMIT 1;
    """
    cur = conn.cursor()
    cur.execute(sql_buf, (x, y, srid, buffer_dist))
    row = cur.fetchone()
    if row:
        cur.close()
        return int(row[0])

    sql_knn = """
    SELECT node_id
    FROM public.node_4km
    ORDER BY geom <-> ST_SetSRID(ST_Point(%s, %s), %s)
    LIMIT 1;
    """
    cur.execute(sql_knn, (x, y, srid))
    row2 = cur.fetchone()
    cur.close()
    return int(row2[0]) if row2 else -1


# ============================================
# 2. GA 클래스
# ============================================
def to_binary_str(value: int, max_digits: int) -> str:
    return bin(int(value))[2:].zfill(max_digits)

def from_binary_str(bin_str: str) -> int:
    return int(bin_str, 2)

class GeneticAlgorithm:
    def __init__(self,
                 building_list: List[Dict],
                 census_list: List[Dict],
                 db_conn,
                 n_shelter: int = 150,
                 population_size: int = 50,
                 crossover_prob: float = 0.8,
                 mutation_prob: float = 0.01,
                 max_generations: int = 100,
                 model_type: str = 'huff'):
        self.building_list = building_list
        self.census_list = census_list
        self.db_conn = db_conn
        self.n_shelter = n_shelter
        self.population_size = population_size
        self.crossover_prob = crossover_prob
        self.mutation_prob = mutation_prob
        self.max_generations = max_generations
        self.model_type = model_type

        max_gid = max(b['gid'] for b in building_list)
        self.max_bin_digits = len(bin(int(max_gid))) - 2
        self.gid_dict = {b['gid']: b for b in building_list}

        self.distance_cache: Dict[Tuple[int, int], float] = {}
        self.census_node_cache: Dict[Tuple[float, float], int] = {}
        self.building_node_cache: Dict[Tuple[float, float], int] = {}
        self.all_census_nodes: List[int] = []

        # ==== __init__에서 all_census_nodes 미리 채움 ====
        for cinfo in self.census_list:
            coord_c = (cinfo["cx"], cinfo["cy"])
            if coord_c not in self.census_node_cache:
                self.census_node_cache[coord_c] = find_nearest_node(self.db_conn, *coord_c)
        self.all_census_nodes = list(self.census_node_cache.values())

        print(f"[DEBUG] GA 초기화: shelters={n_shelter}, pop={population_size}, gens={max_generations}")


    def _init_population(self) -> List[str]:
        pop = []
        for _ in range(self.population_size):
            sampled = random.sample(self.building_list, self.n_shelter)
            chrom = ''.join(to_binary_str(b['gid'], self.max_bin_digits) for b in sampled)
            pop.append(chrom)
        return pop

    def decode_chromosome(self, chrom: str) -> List[int]:
        expected_len = self.n_shelter * self.max_bin_digits
        if not isinstance(chrom, str) or len(chrom) != expected_len:
            return []
        gid_list = []
        for i in range(self.n_shelter):
            segment = chrom[i * self.max_bin_digits:(i + 1) * self.max_bin_digits]
            gid_list.append(int(segment, 2))
        return gid_list

    def encode_chromosome(self, gid_list: List[int]) -> str:
        return ''.join(to_binary_str(g, self.max_bin_digits) for g in gid_list)

    @staticmethod
    def compute_capacity(area: float) -> float:
        return max(area * 1.2156 - 26.218, 0.0)

    def _get_census2building_dist(self, cinfo: Dict, gid: int) -> float:
        key = (cinfo['tot_reg_cd'], gid)
        if key in self.distance_cache:
            return self.distance_cache[key]

        coord_c = (cinfo['cx'], cinfo['cy'])
        c_node = self.census_node_cache.get(coord_c)
        if c_node is None:
            c_node = find_nearest_node(self.db_conn, *coord_c)
            self.census_node_cache[coord_c] = c_node
        if c_node < 0:
            return float('inf')

        b = self.gid_dict[gid]
        coord_b = (b['cx'], b['cy'])
        b_node = self.building_node_cache.get(coord_b)
        if b_node is None:
            b_node = find_nearest_node(self.db_conn, *coord_b)
            self.building_node_cache[coord_b] = b_node
        if b_node < 0:
            return float('inf')

        if not any(k[1] == gid for k in self.distance_cache):
            sql = """
                SELECT node, agg_cost
                FROM pgr_dijkstra(
                    $$SELECT link_id::integer AS id,
                            up_from_no::integer AS source,
                            up_to_node::integer AS target,
                            shape_leng::double precision AS cost
                     FROM public.link_4km
                     UNION ALL
                     SELECT link_id::integer AS id,
                            down_from_::integer AS source,
                            down_to_no::integer AS target,
                            shape_leng::double precision AS cost
                     FROM public.link_4km$$,
                    %s::integer[],
                    %s::integer[],
                    false
                );
            """
            cur = self.db_conn.cursor()
            try:
                cur.execute(sql, ([b_node], self.all_census_nodes))
                rows = cur.fetchall()
            except Exception as e:
                print(f"[ERROR] pgr_dijkstra 실행 실패 (gid={gid}): {e}")
                cur.close()
                return float('inf')
            cur.close()

            census_node_set = set(self.all_census_nodes)
            for node_id, dist_val in rows:
                if node_id in census_node_set:
                    self.distance_cache[(node_id, gid)] = float(dist_val)

        return self.distance_cache.get((c_node, gid), float('inf'))

    # ====== 변경: 페널티 적용/미적용 둘 다 계산 가능하도록 인자 추가 ======
    def compute_model_score(self, gid_list: List[int], penalize: bool = True) -> float:
        """
        penalize=True  -> 기존 베이스라인 (수용초과 페널티 반영)
        penalize=False -> 페널티 미적용 (단순 배치 인원 합계)
        """
        caps = [self.compute_capacity(self.gid_dict[g]['area']) for g in gid_list]
        beta = 2.0
        people_at = [0.0] * self.n_shelter

        for cinfo in self.census_list:
            pop = cinfo['population']
            if pop <= 0:
                continue

            a_vals, denom = [], 0.0
            dists = []
            for i, gid in enumerate(gid_list):
                dist = self._get_census2building_dist(cinfo, gid)
                if not dist or dist < 1e-6:
                    continue
                dists.append((i, dist))

            for i, dist in dists:
                val = caps[i] / (dist**beta) if self.model_type == 'huff' else caps[i] / dist
                a_vals.append((i, val))
                denom += val

            if denom < 1e-9:
                continue

            for i, val in a_vals:
                people_at[i] += pop * (val / denom)

        total = 0.0
        for i, cap in enumerate(caps):
            pa = people_at[i]
            if penalize:
                overload = pa - cap
                total += pa if overload <= 0 else pa - (overload * 0.3)
            else:
                # 페널티 미적용: 단순히 배치 인원 합만 더함
                total += pa

        return total

    def compute_fitness(self, chrom: str) -> float:
        gid_list = self.decode_chromosome(chrom)
        if not gid_list:
            return -1e12
        # 적합도는 기존과 동일: 페널티 적용 값을 사용
        return self.compute_model_score(gid_list, penalize=True)

    def evaluate_population(self, population: List[str]) -> List[float]:
        with ThreadPoolExecutor() as executor:
            return list(executor.map(self.compute_fitness, population))

    def crossover(self, p1: str, p2: str) -> Tuple[str, str]:
        if len(p1) <= 1 or len(p2) <= 1:
            return p1, p2
        if random.random() > self.crossover_prob:
            return p1, p2
        pt = random.randint(1, len(p1) - 1)
        return p1[:pt] + p2[pt:], p2[:pt] + p1[pt:]

    def mutation(self, chrom: str) -> str:
        lst = list(chrom)
        for i in range(len(lst)):
            if random.random() < self.mutation_prob:
                lst[i] = '1' if lst[i] == '0' else '0'
        return ''.join(lst)

    def repair_chromosome(self, chrom: str) -> str:
        gids = self.decode_chromosome(chrom)
        repaired = [
            g if g in self.gid_dict else random.choice(list(self.gid_dict))
            for g in gids
        ]
        return self.encode_chromosome(repaired)

    def run(self) -> Tuple[List[int], float]:
        save_dir = os.path.dirname(os.path.abspath(__file__))
        checkpoint_path = os.path.join(save_dir, "ga_progress.pkl")

        if os.path.exists(checkpoint_path):
            os.remove(checkpoint_path)

        pop = self._init_population()
        best_ch = pop[0]
        best_score = self.compute_fitness(best_ch)  # 페널티 적용
        best_gids = self.decode_chromosome(best_ch)

        for gen in range(0, self.max_generations):
            print(f"[GEN {gen + 1}] 시작")

            # 스냅샷 저장 (둘 다)
            penalized_best = best_score
            raw_best = self.compute_model_score(best_gids, penalize=False)

            save_path = os.path.join(save_dir, f"ga_result_gen_{gen + 1}.py")
            with open(save_path, "w", encoding="utf-8") as f:
                f.write("# GA 자동 저장 결과\n")
                f.write(f"generation = {gen + 1}\n")
                f.write("best_gid_list = " + str(best_gids) + "\n")
                f.write("best_score_penalized = " + str(penalized_best) + "\n")
                f.write("best_score_raw = " + str(raw_best) + "\n")

            scores = [self.compute_fitness(chrom) for chrom in pop]
            paired = sorted(zip(pop, scores), key=lambda x: x[1], reverse=True)
            new_pop = [paired[0][0], paired[1][0]]

            total = sum(scores)
            if total == 0:
                choices = random.choices(pop, k=self.population_size - 2)
            else:
                probs = [s / total for s in scores]
                choices = random.choices(pop, weights=probs, k=self.population_size - 2)
            new_pop += choices

            next_pop = []
            for i in range(0, self.population_size, 2):
                parent1, parent2 = new_pop[i], new_pop[i + 1]
                c1, c2 = self.crossover(parent1, parent2)
                c1, c2 = self.mutation(c1), self.mutation(c2)
                c1, c2 = self.repair_chromosome(c1), self.repair_chromosome(c2)
                next_pop += [c1, c2]
            pop = next_pop

            curr_best = max(scores)
            if curr_best > best_score:
                idx = scores.index(curr_best)
                best_ch, best_score = pop[idx], curr_best
                best_gids = self.decode_chromosome(best_ch)

            # 세대 요약 출력 (둘 다)
            penalized_best = best_score
            raw_best = self.compute_model_score(best_gids, penalize=False)
            print(f"[GEN {gen + 1}] Best Score (penalized) = {penalized_best:.3f} | Best Score (raw) = {raw_best:.3f}")

        return best_gids, best_score


# ============================================
# 3. 메인 실행부
# ============================================
if __name__ == '__main__':
    print("[MAIN] 시작: DB 연결 시도")
    conn = get_db_connection('localhost', 5432, 'ktdb_link', 'postgres', 'postgres')
    conn.autocommit = True
    print("[MAIN] DB 연결 완료")

    print("[MAIN] load_building_info 호출")
    buildings = load_building_info(conn, 50.0)
    print(f"[MAIN] load_building_info 완료: {len(buildings)} 건 로드됨")

    print("[MAIN] load_census_info 호출")
    censuses = load_census_info(conn)
    print(f"[MAIN] load_census_info 완료: {len(censuses)} 건 로드됨")

    print("[MAIN] GeneticAlgorithm 인스턴스 생성 시작")
    ga = GeneticAlgorithm(
        building_list=buildings,
        census_list=censuses,
        db_conn=conn,
        n_shelter=150,
        population_size=50,
        crossover_prob=0.8,
        mutation_prob=0.01,
        max_generations=100,
        model_type='huff'
    )
    print("[MAIN] GeneticAlgorithm 초기화 완료")

    print("[MAIN] GA.run 시작")
    best, score_penalized = ga.run()
    print("[MAIN] GA.run 완료")

    # 최종 해에 대해 raw 점수도 함께 계산/출력
    best_raw = ga.compute_model_score(best, penalize=False)

    print(f"[MAIN] 최적해 건물 GID 목록: {best}")
    print(f"[MAIN] 최적 점수 (penalized): {score_penalized:.3f}")
    print(f"[MAIN] 최적 점수 (raw): {best_raw:.3f}")

    # --- 최종 결과 CSV 저장 (둘 다) ---
    csv_path = os.path.join(SAVE_DIR, "final_best_result.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Best_GID_List", "Best_Score_Penalized", "Best_Score_Raw"])
        writer.writerow([",".join(map(str, best)), f"{score_penalized:.6f}", f"{best_raw:.6f}"])
    print(f"[MAIN] CSV 저장 완료 -> {csv_path}")

    conn.close()
    print("[MAIN] DB 연결 종료")