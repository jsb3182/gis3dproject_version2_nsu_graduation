import * as Cesium from 'cesium';

/**
 * @file src/utils/cesiumUtils.js
 * @description Cesium 관련 순수 함수 및 상수 모음 (수정본)
 * @description 리팩토링 이유:
 *   - 기능 보존: 원본 코드의 모든 기능을 지원하도록 리팩토링합니다.
 *   - 재사용성: 여러 곳에서 사용될 수 있는 공통 기능(카메라 이동, 거리 계산 등)을 분리합니다.
 *   - 가독성 향상: 복잡한 Cesium API 호출을 명확한 목적의 함수로 감싸 유지보수성을 높입니다.
 *   - 중앙 관리: 상수(좌표, URL 등)를 중앙에서 관리하여 변경에 쉽게 대응합니다.
 */

// ========================================================================
// 1. 상수 (Constants)
// ========================================================================

/** @constant {string} CESIUM_ION_TOKEN - Cesium Ion 기본 접근 토큰 */
export const CESIUM_ION_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZWJiMDRjNi05MDZlLTRiOWMtYTU5OC0yY2Q2MGM2NzE4ODMiLCJpZCI6MzY3MzEyLCJpYXQiOjE3NjUwODQwMTV9.Qwe6fyt1Ooat6PUTnulbjvQXSFAYmL0J3kPc83FG7gA';

/** @constant {string} VWORLD_3D_TILES_URL - 브이월드 3D 건물 타일셋 URL (수정됨) */
export const VWORLD_3D_TILES_URL = 'https://xdworld.vworld.kr/TDServer/services/vworld_3d_facility/tileset.json';

/** @constant {object} CHEONAN_CENTER - 천안시 중심 좌표 및 카메라 높이 */
export const CHEONAN_CENTER = {
  lon: 127.1139,
  lat: 36.8151,
  height: 15000,
};

// ========================================================================
// 2. 카메라 제어 (Camera Control)
// ========================================================================

/**
 * 지정된 좌표로 카메라를 비행 이동시킵니다. (3D 뷰)
 * @param {Cesium.Viewer} viewer - Cesium 뷰어 인스턴스
 * @param {object} target - 이동할 목표 위치 { lon, lat, height }
 * @param {number} [duration=2] - 애니메이션 지속 시간 (초)
 */
export function flyTo(viewer, target, duration = 2) {
  // 입력값 방어 코드 추가
  if (!viewer || !target || typeof target.lon !== 'number' || typeof target.lat !== 'number') {
    console.error('[flyTo] 유효하지 않은 인자입니다.', { viewer, target });
    return;
  }

  const destination = Cesium.Cartesian3.fromDegrees(target.lon, target.lat, target.height || 1500);

  viewer.camera.flyTo({
    destination,
    orientation: {
      heading: Cesium.Math.toRadians(0),    // 북쪽 방향
      pitch: Cesium.Math.toRadians(-45),    // 45도 아래로 기울임
      roll: 0,
    },
    duration,
  });
}

/**
 * 천안시 전체 뷰로 카메라를 이동시킵니다.
 * @param {Cesium.Viewer} viewer - Cesium 뷰어 인스턴스
 */
export function flyToCheonan(viewer) {
  flyTo(viewer, CHEONAN_CENTER);
}


// ========================================================================
// 3. 계산 유틸리티 (Calculation Utilities)
// ========================================================================

/**
 * 두 좌표 간의 거리를 Haversine 공식을 사용하여 킬로미터(km) 단위로 계산합니다.
 * @param {object} coord1 - 첫 번째 좌표 { lat, lon }
 * @param {object} coord2 - 두 번째 좌표 { lat, lon }
 * @returns {number} 두 좌표 사이의 거리 (km)
 */
export function calculateDistance(coord1, coord2) {
  if (!coord1 || !coord2) return Infinity;

  const EARTH_RADIUS_KM = 6371;
  const toRad = (degree) => degree * (Math.PI / 180);

  const lat1 = toRad(coord1.lat);
  const lon1 = toRad(coord1.lon);
  const lat2 = toRad(coord2.lat);
  const lon2 = toRad(coord2.lon);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

// ========================================================================
// 4. 사용자 상호작용 (User Interaction)
// ========================================================================

/**
 * 클릭된 위치의 Cesium 엔티티 정보를 추출합니다.
 * @param {Cesium.Viewer} viewer - Cesium 뷰어 인스턴스
 * @param {object} clickPosition - 화면 클릭 위치 (e.g., click.position)
 * @returns {object|null} 추출된 정보 ({ entity, feature, layerType }) 또는 null
 */
export function pickEntity(viewer, clickPosition) {
  const pickedObject = viewer.scene.pick(clickPosition);

  if (Cesium.defined(pickedObject) && pickedObject.id) {
    const entity = pickedObject.id;
    // entity.properties가 존재하는지, getValue 메서드를 지원하는지 확인
    if (entity.properties && typeof entity.properties.getValue === 'function') {
      const properties = entity.properties.getValue(viewer.clock.currentTime);
      if (properties.featureData && properties.layerType) {
        return { 
          entity, 
          feature: properties.featureData, 
          layerType: properties.layerType 
        };
      }
    }
  }
  return null;
}