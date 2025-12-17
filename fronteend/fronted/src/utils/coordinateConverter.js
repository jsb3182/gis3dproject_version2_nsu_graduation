/**
 * ====================================
 * 좌표 변환 유틸리티
 * ====================================
 *
 * 역할:
 * - EPSG:5174 (Korea 2000 / Central Belt 2010) → WGS84 (EPSG:4326) 좌표 변환
 * - GeoServer 데이터를 Cesium에서 사용할 수 있도록 변환
 */

/**
 * EPSG:5174 → WGS84 변환 (근사값)
 */
export function convertEPSG5174ToWGS84(x, y) {
  const FALSE_EASTING = 200000
  const FALSE_NORTHING = 500000
  const CENTRAL_MERIDIAN = 127.0
  const ORIGIN_LATITUDE = 38.0
  const SCALE_FACTOR = 1.0

  const A = 6378137.0
  const F = 1 / 298.257222101
  const E2 = 2 * F - F * F

  const dx = x - FALSE_EASTING
  const dy = y - FALSE_NORTHING

  const M = dy
  const lat_rad = ORIGIN_LATITUDE * Math.PI / 180
  const lat = lat_rad + M / (A * (1 - E2))

  const lon_rad = CENTRAL_MERIDIAN * Math.PI / 180
  const N = A / Math.sqrt(1 - E2 * Math.sin(lat) ** 2)
  const lon = lon_rad + dx / (N * Math.cos(lat) * SCALE_FACTOR)

  const longitude = lon * 180 / Math.PI
  const latitude = lat * 180 / Math.PI

  return {
    lon: longitude,
    lat: latitude
  }
}

/**
 * WGS84 → EPSG:5174 변환 (역변환)
 */
export function convertWGS84ToEPSG5174(lon, lat) {
  const FALSE_EASTING = 200000
  const FALSE_NORTHING = 500000
  const CENTRAL_MERIDIAN = 127.0
  const ORIGIN_LATITUDE = 38.0
  const SCALE_FACTOR = 1.0

  const A = 6378137.0
  const F = 1 / 298.257222101
  const E2 = 2 * F - F * F

  const lon_rad = lon * Math.PI / 180
  const lat_rad = lat * Math.PI / 180
  const lon0_rad = CENTRAL_MERIDIAN * Math.PI / 180
  const lat0_rad = ORIGIN_LATITUDE * Math.PI / 180

  const N = A / Math.sqrt(1 - E2 * Math.sin(lat_rad) ** 2)
  const dx = N * Math.cos(lat_rad) * (lon_rad - lon0_rad) * SCALE_FACTOR
  const dy = (lat_rad - lat0_rad) * A * (1 - E2)

  const x = dx + FALSE_EASTING
  const y = dy + FALSE_NORTHING

  return { x, y }
}

/**
 * 두 WGS84 좌표 사이의 거리 계산 (Haversine 공식)
 */
export function calculateDistance(coord1, coord2) {
  const EARTH_RADIUS = 6371

  const toRad = (degree) => degree * Math.PI / 180

  const lat1 = toRad(coord1.lat)
  const lon1 = toRad(coord1.lon)
  const lat2 = toRad(coord2.lat)
  const lon2 = toRad(coord2.lon)

  const dLat = lat2 - lat1
  const dLon = lon2 - lon1

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = EARTH_RADIUS * c

  return distance
}

/**
 * 좌표 유효성 검사
 */
export function isValidWGS84(coord) {
  return (
    coord &&
    typeof coord.lat === 'number' &&
    typeof coord.lon === 'number' &&
    coord.lat >= -90 && coord.lat <= 90 &&
    coord.lon >= -180 && coord.lon <= 180
  )
}
