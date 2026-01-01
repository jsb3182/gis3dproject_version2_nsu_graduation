/**
 * 민방위 대피소 API 유틸리티
 */

import axios from 'axios'

// API 설정
const SHELTER_API_URL = 'https://api.odcloud.kr/api/civildefense/v1/shelter'
const SERVICE_KEY = 'N3U2QYSHCZz9wpke8PfDjhXocLK4lgHcpcK14ZiNm0na%2FU5A2yP2RScVhonB46UXSkLc9DcyO4ZDHvkw6%2F83cw%3D%3D'

/**
 * 모든 대피소 데이터 가져오기
 */
export async function fetchAllShelters() {
  try {
    const response = await axios.get(SHELTER_API_URL, {
      params: {
        page: 1,
        perPage: 10000,
        returnType: 'JSON',
        serviceKey: SERVICE_KEY
      }
    })

    return response.data.data || []
  } catch (error) {
    console.error('❌ 대피소 데이터 조회 실패:', error)
    throw error
  }
}

/**
 * Haversine 거리 계산 (미터)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // 지구 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * 주변 대피소 검색 및 거리순 정렬
 */
export async function searchNearbyShelters(userLat, userLon, radiusKm) {
  const allShelters = await fetchAllShelters()

  const nearbyShelters = allShelters
    .map(shelter => {
      const shelterLat = parseFloat(shelter['위도(EPSG4326)'])
      const shelterLon = parseFloat(shelter['경도(EPSG4326)'])

      if (isNaN(shelterLat) || isNaN(shelterLon)) return null

      const distance = calculateDistance(userLat, userLon, shelterLat, shelterLon)

      return {
        번호: shelter['번호'],
        관리번호: shelter['관리번호'],
        시설명: shelter['시설명'],
        도로명전체주소: shelter['도로명전체주소'],
        최대수용인원: shelter['최대수용인원'],
        lat: shelterLat,
        lon: shelterLon,
        distance: Math.round(distance)
      }
    })
    .filter(shelter => shelter && shelter.distance <= radiusKm * 1000)
    .sort((a, b) => a.distance - b.distance)

  return nearbyShelters
}

/**
 * 현재 위치 가져오기
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      error => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}
