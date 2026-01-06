/**
 * GIS 유틸리티 함수 모음
 *
 * 거리 계산, 좌표 변환, 데이터 정렬 등
 * GIS 관련 공통 유틸리티 함수를 제공합니다.
 */

// ============================================================================
// 두 지점 간 거리 계산 (Haversine 공식)
// ============================================================================
/**
 * Haversine 공식을 사용하여 두 좌표 간의 직선 거리를 계산합니다.
 *
 * @param {Object} coord1 - 첫 번째 좌표 { lat, lon }
 * @param {Object} coord2 - 두 번째 좌표 { lat, lon }
 * @returns {number} 거리 (킬로미터)
 *
 * @example
 * const distance = calculateDistance(
 *   { lat: 36.8151, lon: 127.1139 },
 *   { lat: 37.5665, lon: 126.9780 }
 * )
 * console.log(`거리: ${distance.toFixed(2)}km`)
 */
export const calculateDistance = (coord1, coord2) => {
  // 지구 반지름 (km)
  const EARTH_RADIUS = 6371

  // 도(degree)를 라디안(radian)으로 변환
  const toRad = (degree) => degree * Math.PI / 180

  // 좌표를 라디안으로 변환
  const lat1 = toRad(coord1.lat)
  const lon1 = toRad(coord1.lon)
  const lat2 = toRad(coord2.lat)
  const lon2 = toRad(coord2.lon)

  // 위도/경도 차이
  const dLat = lat2 - lat1
  const dLon = lon2 - lon1

  // Haversine 공식 적용
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  // 거리 계산 (km)
  return EARTH_RADIUS * c
}

// ============================================================================
// 거리순 정렬
// ============================================================================
/**
 * 사용자 위치를 기준으로 아이템 리스트를 거리순으로 정렬합니다.
 *
 * @param {Array} items - 정렬할 아이템 배열
 * @param {Object} userLocation - 사용자 위치 { lat, lon }
 * @returns {Array} 거리순으로 정렬된 배열
 */
export const sortByDistance = (items, userLocation) => {
  if (!userLocation) return items

  return items.map(item => {
    if (item.lat && item.lon) {
      const distance = calculateDistance(
        { lat: userLocation.lat, lon: userLocation.lon },
        { lat: item.lat, lon: item.lon }
      )
      return { ...item, distance: distance.toFixed(2) }
    }
    return { ...item, distance: null }
  }).sort((a, b) => {
    const distA = parseFloat(a.distance) || Infinity
    const distB = parseFloat(b.distance) || Infinity
    return distA - distB
  })
}

// ============================================================================
// 이름순 정렬
// ============================================================================
/**
 * 아이템 리스트를 이름순(가나다순)으로 정렬합니다.
 *
 * @param {Array} items - 정렬할 아이템 배열
 * @returns {Array} 이름순으로 정렬된 배열
 */
export const sortByName = (items) => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

// ============================================================================
// Polygon 좌표를 Cesium 포맷으로 변환
// ============================================================================
/**
 * GeoJSON Polygon 좌표를 Cesium이 인식할 수 있는 1차원 배열로 변환합니다.
 *
 * @param {Array} coordinates - GeoJSON Polygon 좌표 배열
 * @returns {Array} [lon1, lat1, lon2, lat2, ...] 형태의 1차원 배열
 *
 * @example
 * const coords = [[[127.1, 36.8], [127.2, 36.8], [127.2, 36.9]]]
 * const flat = flattenPolygonCoords(coords)
 * // [127.1, 36.8, 127.2, 36.8, 127.2, 36.9]
 */
export const flattenPolygonCoords = (coordinates) => {
  const flatCoords = []
  coordinates[0].forEach(coord => {
    flatCoords.push(coord[0], coord[1])
  })
  return flatCoords
}

// ============================================================================
// LineString 좌표를 Cesium 포맷으로 변환
// ============================================================================
/**
 * GeoJSON LineString 좌표를 Cesium이 인식할 수 있는 1차원 배열로 변환합니다.
 *
 * @param {Array} coordinates - GeoJSON LineString 좌표 배열
 * @returns {Array} [lon1, lat1, lon2, lat2, ...] 형태의 1차원 배열
 */
export const flattenLineCoords = (coordinates) => {
  return coordinates.flatMap(coord => coord)
}
