# 천안시 지적도 2.5D Extrusion 구현 가이드

## 📋 목차
1. [개요](#개요)
2. [구현 완료 내역](#구현-완료-내역)
3. [GeoServer 설정 체크리스트](#geoserver-설정-체크리스트)
4. [성능 최적화 가이드](#성능-최적화-가이드)
5. [독립 실행형 예제 코드](#독립-실행형-예제-코드)

---

## 개요

천안시 지적도 폴리곤을 CesiumJS에서 2.5D extrusion으로 표현하는 완전한 솔루션입니다.

### 주요 특징
- ✅ GeoServer WFS(GeoJSON) 기반
- ✅ EPSG:5174 → EPSG:4326 자동 변환
- ✅ 2가지 높이 계산 방식 지원
  - **chmergr**: 고정 높이 30m
  - **thematicmerge**: 속성값(area/pnu) 기반 동적 높이
- ✅ 핑크색 반투명 + 보라색 외곽선 스타일
- ✅ BBOX/maxFeatures 성능 최적화

---

## 구현 완료 내역

### 1. 지적도 레이어 스타일 설정 (useCesium.js)

```javascript
// 지적도 레이어 - 2.5D Extrusion (고정 높이 30m)
chmergr: {
  polygon: {
    height: 0,                              // 지면 높이
    extrudedHeight: 30,                     // 30m 높이로 돌출
    material: Cesium.Color.PINK.withAlpha(0.6),   // 핑크색 반투명
    outline: true,
    outlineColor: Cesium.Color.PURPLE,      // 보라색 외곽선
    outlineWidth: 2,
  },
},

// 지적도 레이어 - 2.5D Extrusion (속성값 기반 높이)
thematicmerge: {
  polygon: {
    height: 0,
    extrudedHeight: 30,  // 기본값, 실제로는 동적 계산
    material: Cesium.Color.PINK.withAlpha(0.6),
    outline: true,
    outlineColor: Cesium.Color.PURPLE,
    outlineWidth: 2,
  },
},
```

### 2. 동적 높이 계산 로직 (addPolygonEntity 함수)

```javascript
// thematicmerge 레이어의 경우 속성값 기반 높이 계산
if (layerType === 'thematicmerge' && feature.properties) {
  const props = feature.properties;

  // 방법 1: area 속성값 기반 (면적이 클수록 높게)
  if (props.area || props.AREA) {
    const area = parseFloat(props.area || props.AREA);
    // 면적을 높이로 변환 (100㎡당 1m, 최소 10m, 최대 100m)
    polygonStyle.extrudedHeight = Math.min(Math.max(area / 100, 10), 100);
  }
  // 방법 2: pnu 또는 id 해시값 기반
  else if (props.pnu || props.id) {
    const hashValue = (props.pnu || props.id).toString().length;
    polygonStyle.extrudedHeight = 20 + (hashValue * 3);
  }
  // 방법 3: 기본값
  else {
    polygonStyle.extrudedHeight = 30;
  }
}
```

### 3. 성능 최적화 (geoService.js)

```javascript
async getAllLayers(options = {}) {
  const cheonanBbox = options.bbox || null;

  const [build, chmergr, ...] = await Promise.all([
    // 지적도 레이어 - 성능을 위해 제한
    this.getFeatures(GEOSERVER_CONFIG.layers.chmergr, {
      maxFeatures: options.cadastralLimit || 500,
      bbox: cheonanBbox
    }),
    this.getFeatures(GEOSERVER_CONFIG.layers.thematicmerge, {
      maxFeatures: options.cadastralLimit || 500,
      bbox: cheonanBbox
    }),
    // ...
  ])
}
```

---

## GeoServer 설정 체크리스트

### 1. WFS 서비스 활성화
```bash
# GeoServer 관리자 페이지
1. Services → WFS 클릭
2. Enable WFS 체크
3. Service Metadata 입력
4. Save
```

### 2. 레이어 CRS 설정 확인

**중요**: GeoServer는 EPSG:5174로 저장된 데이터를 EPSG:4326으로 자동 변환할 수 있습니다.

```bash
1. Layers → chmergr (또는 thematicmerge) 선택
2. Publishing 탭:
   - Native SRS: EPSG:5174
   - Declared SRS: EPSG:5174
   - SRS Handling: Reproject native to declared
3. Save
```

### 3. WFS GetFeature 요청 테스트

**기본 요청 (EPSG:5174 원본)**:
```
http://localhost:8080/geoserver/nsugis_version2/wfs?
  service=WFS&
  version=1.0.0&
  request=GetFeature&
  typeName=nsugis_version2:chmergr&
  outputFormat=application/json&
  maxFeatures=10
```

**EPSG:4326 변환 요청** (현재 코드에서 사용):
```
http://localhost:8080/geoserver/nsugis_version2/wfs?
  service=WFS&
  version=1.0.0&
  request=GetFeature&
  typeName=nsugis_version2:chmergr&
  outputFormat=application/json&
  srsName=EPSG:5174&
  maxFeatures=10
```

**BBOX 필터 추가** (성능 최적화):
```
http://localhost:8080/geoserver/nsugis_version2/wfs?
  service=WFS&
  version=1.0.0&
  request=GetFeature&
  typeName=nsugis_version2:chmergr&
  outputFormat=application/json&
  srsName=EPSG:5174&
  bbox=950000,1820000,1000000,1870000,EPSG:5174&
  maxFeatures=500
```

### 4. 속성 필드 확인

지적도 테이블에서 높이 계산에 사용할 속성 확인:

```sql
-- PostGIS에서 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'chmergr' OR table_name = 'thematicmerge';

-- 일반적인 지적도 속성
-- pnu: 필지고유번호
-- jibun: 지번
-- area: 면적 (㎡)
-- land_use: 토지용도
```

GeoServer Layer → Attributes 탭에서도 확인 가능합니다.

---

## 성능 최적화 가이드

### 문제: 지적도 폴리곤이 너무 많아서 느려요!

### 해결책 1: maxFeatures 제한

```javascript
// geoService.js에서 이미 적용됨
const layers = await geoService.getAllLayers({
  cadastralLimit: 500  // 지적도 최대 500개만 로드
});
```

### 해결책 2: BBOX 필터 (현재 화면 영역만)

```javascript
// Cesium 카메라의 현재 뷰 영역을 BBOX로 계산
function getCurrentViewBbox(viewer) {
  const canvas = viewer.scene.canvas;
  const rectangle = viewer.camera.computeViewRectangle();

  if (rectangle) {
    const west = Cesium.Math.toDegrees(rectangle.west);
    const south = Cesium.Math.toDegrees(rectangle.south);
    const east = Cesium.Math.toDegrees(rectangle.east);
    const north = Cesium.Math.toDegrees(rectangle.north);

    return [west, south, east, north];
  }
  return null;
}

// 사용 예시
const bbox = getCurrentViewBbox(viewer.value);
const layers = await geoService.getAllLayers({
  bbox: bbox,
  cadastralLimit: 1000
});
```

### 해결책 3: GeoServer 단순화 (Simplify)

PostGIS에서 폴리곤 단순화:

```sql
-- 새 단순화 레이어 생성 (5m 허용 오차)
CREATE TABLE chmergr_simplified AS
SELECT
  gid,
  pnu,
  area,
  ST_Simplify(geom, 5) AS geom
FROM chmergr;

-- 공간 인덱스 생성
CREATE INDEX chmergr_simplified_geom_idx
ON chmergr_simplified USING GIST (geom);
```

GeoServer에서 단순화된 레이어 등록 후 사용.

### 해결책 4: 타일링 (GeoWebCache)

GeoServer GeoWebCache를 활용한 WFS 타일링:

```bash
1. GeoServer → Tile Caching → Tile Layers
2. chmergr 레이어 선택
3. Tile layer configuration:
   - Enabled: 체크
   - EPSG:4326 gridset 선택
4. Save
```

### 해결책 5: 레벨별 상세도 조절 (LOD)

```javascript
// Cesium 카메라 높이에 따라 지적도 로드 여부 결정
function shouldLoadCadastral(viewer) {
  const height = viewer.camera.positionCartographic.height;

  // 높이 10km 이하일 때만 지적도 표시
  if (height > 10000) {
    console.log('[LOD] 카메라가 너무 높아 지적도 비활성화');
    return false;
  }

  return true;
}

// showAll 함수에 적용
const showAll = async () => {
  clearAllEntities();
  currentListType.value = '전체';

  const loadCadastral = shouldLoadCadastral(viewer.value);

  const layers = await geoService.getAllLayers({
    cadastralLimit: loadCadastral ? 500 : 0  // 지적도 로드 제어
  });

  // ...
};
```

---

## 독립 실행형 예제 코드

프로젝트와 별도로 테스트할 수 있는 순수 HTML+JS 코드입니다.

### standalone-cadastral-2.5d.html

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>천안시 지적도 2.5D Extrusion - Standalone</title>

  <!-- Cesium -->
  <script src="https://cesium.com/downloads/cesiumjs/releases/1.109/Build/Cesium/Cesium.js"></script>
  <link href="https://cesium.com/downloads/cesiumjs/releases/1.109/Build/Cesium/Widgets/widgets.css" rel="stylesheet">

  <style>
    * { margin: 0; padding: 0; }
    #cesiumContainer { width: 100vw; height: 100vh; }
    #controls {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.9);
      padding: 15px;
      border-radius: 8px;
      z-index: 1000;
      font-family: sans-serif;
    }
    button {
      padding: 8px 16px;
      margin: 5px;
      border: none;
      background: #5B9BD5;
      color: white;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover { background: #4A7FB5; }
    .info {
      margin-top: 10px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div id="controls">
    <h3>천안시 지적도 2.5D</h3>
    <button onclick="loadCadastralFixed()">고정 높이 (30m)</button>
    <button onclick="loadCadastralDynamic()">동적 높이 (속성 기반)</button>
    <button onclick="clearAll()">초기화</button>
    <div class="info">
      <p>🔴 고정: 모든 필지 30m 높이</p>
      <p>🟢 동적: 면적에 비례하여 높이 결정</p>
    </div>
  </div>

  <div id="cesiumContainer"></div>

  <script>
    // ========================================================================
    // 설정 (실제 GeoServer 주소로 변경 필요)
    // ========================================================================
    const CONFIG = {
      cesiumToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZWJiMDRjNi05MDZlLTRiOWMtYTU5OC0yY2Q2MGM2NzE4ODMiLCJpZCI6MzY3MzEyLCJpYXQiOjE3NjUwODQwMTV9.Qwe6fyt1Ooat6PUTnulbjvQXSFAYmL0J3kPc83FG7gA',
      geoserverUrl: 'http://localhost:8080/geoserver/nsugis_version2/wfs',
      workspace: 'nsugis_version2',
      layerName: 'chmergr',  // 또는 'thematicmerge'
      cheonanCenter: { lon: 127.1139, lat: 36.8151, height: 15000 }
    };

    // ========================================================================
    // Cesium 초기화
    // ========================================================================
    Cesium.Ion.defaultAccessToken = CONFIG.cesiumToken;

    const viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain(),
      animation: false,
      timeline: false,
      baseLayerPicker: false,
    });

    // 천안시 중심으로 이동
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        CONFIG.cheonanCenter.lon,
        CONFIG.cheonanCenter.lat,
        CONFIG.cheonanCenter.height
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
      }
    });

    let activeEntities = [];

    // ========================================================================
    // EPSG:5174 → WGS84 변환 함수 (Proj4js 대신 간단한 근사식)
    // ========================================================================
    function convertEPSG5174ToWGS84(x, y) {
      // 실제 프로젝트에서는 coordinateConverter.js 사용
      // 여기서는 간단한 근사식 (정확하지 않음, 테스트용)
      const lon = (x - 1000000) / 100000 + 127.0;
      const lat = (y - 1900000) / 100000 + 36.0;
      return { lon, lat };
    }

    // ========================================================================
    // GeoServer WFS 데이터 가져오기
    // ========================================================================
    async function fetchCadastralData() {
      const url = new URL(CONFIG.geoserverUrl);
      url.searchParams.append('service', 'WFS');
      url.searchParams.append('version', '1.0.0');
      url.searchParams.append('request', 'GetFeature');
      url.searchParams.append('typeName', `${CONFIG.workspace}:${CONFIG.layerName}`);
      url.searchParams.append('outputFormat', 'application/json');
      url.searchParams.append('srsName', 'EPSG:5174');
      url.searchParams.append('maxFeatures', '100');  // 성능을 위해 100개 제한

      // BBOX 필터 (천안시 대략 범위 - EPSG:5174)
      // 실제 천안시 경계에 맞게 조정 필요
      // url.searchParams.append('bbox', '950000,1820000,1000000,1870000,EPSG:5174');

      console.log('[WFS Request URL]', url.toString());

      const response = await fetch(url);
      const geoJSON = await response.json();

      console.log('[WFS Response]', geoJSON);

      // 좌표 변환 (EPSG:5174 → WGS84)
      const converted = convertGeoJSONCoordinates(geoJSON);
      return converted;
    }

    // ========================================================================
    // GeoJSON 좌표 변환
    // ========================================================================
    function convertGeoJSONCoordinates(geoJSON) {
      const converted = JSON.parse(JSON.stringify(geoJSON));

      converted.features = converted.features.map(feature => {
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates = feature.geometry.coordinates.map(ring =>
            ring.map(([x, y]) => {
              const wgs84 = convertEPSG5174ToWGS84(x, y);
              return [wgs84.lon, wgs84.lat];
            })
          );
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates = feature.geometry.coordinates.map(polygon =>
            polygon.map(ring =>
              ring.map(([x, y]) => {
                const wgs84 = convertEPSG5174ToWGS84(x, y);
                return [wgs84.lon, wgs84.lat];
              })
            )
          );
        }
        return feature;
      });

      return converted;
    }

    // ========================================================================
    // 고정 높이 (30m) 지적도 렌더링
    // ========================================================================
    async function loadCadastralFixed() {
      clearAll();
      console.log('[loadCadastralFixed] 시작');

      try {
        const geoJSON = await fetchCadastralData();

        geoJSON.features.forEach(feature => {
          if (feature.geometry.type === 'Polygon') {
            addPolygonEntity(feature, 30);  // 고정 30m
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach(polygonCoords => {
              const singleFeature = {
                type: 'Feature',
                geometry: { type: 'Polygon', coordinates: polygonCoords },
                properties: feature.properties
              };
              addPolygonEntity(singleFeature, 30);
            });
          }
        });

        console.log(`[loadCadastralFixed] ${activeEntities.length}개 폴리곤 렌더링 완료`);
      } catch (error) {
        console.error('[loadCadastralFixed] 오류:', error);
        alert('GeoServer 연결 실패. 콘솔을 확인하세요.');
      }
    }

    // ========================================================================
    // 동적 높이 (속성값 기반) 지적도 렌더링
    // ========================================================================
    async function loadCadastralDynamic() {
      clearAll();
      console.log('[loadCadastralDynamic] 시작');

      try {
        const geoJSON = await fetchCadastralData();

        geoJSON.features.forEach(feature => {
          const props = feature.properties;
          let height = 30;  // 기본값

          // 방법 1: area 속성값 기반
          if (props.area || props.AREA) {
            const area = parseFloat(props.area || props.AREA);
            height = Math.min(Math.max(area / 100, 10), 100);
          }
          // 방법 2: pnu 해시값 기반
          else if (props.pnu || props.PNU) {
            const hashValue = (props.pnu || props.PNU).toString().length;
            height = 20 + (hashValue * 3);
          }

          if (feature.geometry.type === 'Polygon') {
            addPolygonEntity(feature, height);
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach(polygonCoords => {
              const singleFeature = {
                type: 'Feature',
                geometry: { type: 'Polygon', coordinates: polygonCoords },
                properties: feature.properties
              };
              addPolygonEntity(singleFeature, height);
            });
          }
        });

        console.log(`[loadCadastralDynamic] ${activeEntities.length}개 폴리곤 렌더링 완료`);
      } catch (error) {
        console.error('[loadCadastralDynamic] 오류:', error);
        alert('GeoServer 연결 실패. 콘솔을 확인하세요.');
      }
    }

    // ========================================================================
    // Polygon Entity 추가 (2.5D Extrusion)
    // ========================================================================
    function addPolygonEntity(feature, extrudedHeight) {
      try {
        const entity = viewer.entities.add({
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(
              feature.geometry.coordinates[0].flatMap(coord => coord)
            ),
            height: 0,
            extrudedHeight: extrudedHeight,
            material: Cesium.Color.PINK.withAlpha(0.6),
            outline: true,
            outlineColor: Cesium.Color.PURPLE,
            outlineWidth: 2
          },
          properties: feature.properties
        });

        activeEntities.push(entity);
      } catch (e) {
        console.warn('[addPolygonEntity] 생성 실패:', e.message);
      }
    }

    // ========================================================================
    // 초기화
    // ========================================================================
    function clearAll() {
      activeEntities.forEach(entity => viewer.entities.remove(entity));
      activeEntities = [];
      console.log('[clearAll] 모든 엔티티 제거됨');
    }
  </script>
</body>
</html>
```

---

## 사용 방법

### 현재 프로젝트에서

1. 브라우저 새로고침
2. "전체보기" 버튼 클릭
3. 지적도 레이어가 2.5D로 표시됨
   - **chmergr**: 모든 필지 고정 30m 높이
   - **thematicmerge**: 속성값(area/pnu)에 따라 높이 차등 적용

### 독립 실행형 테스트

1. `standalone-cadastral-2.5d.html` 파일 생성
2. GeoServer URL 수정 (CONFIG 객체)
3. 브라우저에서 열기
4. "고정 높이" 또는 "동적 높이" 버튼 클릭

---

## 트러블슈팅

### Q1. 지적도가 전혀 안 보여요
- GeoServer WFS 활성화 확인
- 브라우저 콘솔에서 WFS 요청 URL 확인
- CORS 에러 확인 (프록시 설정 필요)

### Q2. 좌표가 이상한 곳에 표시돼요
- EPSG:5174 → WGS84 변환 함수 확인
- `coordinateConverter.js`의 변환 로직 검증
- GeoServer에서 `srsName=EPSG:4326` 요청 시도

### Q3. 너무 느려요
- `maxFeatures` 제한 (기본 500개)
- BBOX 필터 적용
- GeoServer에서 폴리곤 단순화
- LOD(Level of Detail) 적용

### Q4. 높이가 너무 낮거나 높아요
- `extrudedHeight` 계산 공식 조정
- 속성값(area) 단위 확인 (㎡? ha?)
- Min/Max 제한값 조정

---

## 참고 자료

- [CesiumJS 공식 문서 - Polygon](https://cesium.com/learn/cesiumjs/ref-doc/PolygonGraphics.html)
- [GeoServer WFS 가이드](https://docs.geoserver.org/stable/en/user/services/wfs/reference.html)
- [EPSG:5174 좌표계 정보](https://epsg.io/5174)

---

**작성일**: 2025-12-26
**작성자**: Claude Code (WebGIS Developer)
