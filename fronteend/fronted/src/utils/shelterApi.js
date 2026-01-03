/**
 * 민방위 대피소 API 유틸리티
 * 백엔드 서버를 통해 대피소 데이터 조회
 */

import axios from 'axios'

// 백엔드 API 설정
const BACKEND_URL = 'http://localhost:8081/api/shelters'

/**
 * 주변 대피소 검색 (백엔드 API 사용)
 * @param {number} lat - 위도
 * @param {number} lon - 경도
 * @param {number} radiusKm - 검색 반경 (km)
 * @returns {Promise<Array>} 대피소 목록
 */
export async function searchNearbyShelters(lat, lon, radiusKm) {
  try {
    console.log(`🔍 백엔드 API 호출: lat=${lat}, lon=${lon}, radius=${radiusKm}km`)

    const response = await axios.get(`${BACKEND_URL}/near`, {
      params: {
        lat: lat,
        lon: lon,
        km: radiusKm,
        limit: 200
      }
    })

    console.log('✅ 백엔드 응답:', response.data)

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const shelters = response.data.map(item => ({
      번호: item.gid,
      시설명: item.dedongSemugo || '시설명 없음',
      도로명전체주소: item.detailAddress || item.addressNumber || '주소 정보 없음',
      최대수용인원: item.maxDepiPerson || 0,
      면적: item.maxArea || 0,
      관리번호: item.manageNumber,
      lat: item.latitude,
      lon: item.longitude,
      distance: item.distance || 0
    }))

    console.log(`✅ ${shelters.length}개 대피소 조회 완료`)

    if (shelters.length > 0) {
      console.log('첫 번째 대피소:', shelters[0])
    }

    return shelters

  } catch (error) {
    console.error('❌ 대피소 검색 실패:', error)
    console.error('에러 응답:', error.response?.data)
    throw error
  }
}

/**
 * 대피소 데이터 새로고침 (공공데이터 API → DB 저장)
 */
export async function refreshShelterData() {
  try {
    console.log('🔄 대피소 데이터 새로고침 시작...')

    const response = await axios.post(`${BACKEND_URL}/refresh`)

    console.log('✅ 새로고침 완료:', response.data)
    return response.data

  } catch (error) {
    console.error('❌ 데이터 새로고침 실패:', error)
    throw error
  }
}

/**
 * 저장된 대피소 개수 조회
 */
export async function getShelterCount() {
  try {
    const response = await axios.get(`${BACKEND_URL}/count`)
    return response.data.count

  } catch (error) {
    console.error('❌ 대피소 개수 조회 실패:', error)
    throw error
  }
}

/**
 * 현재 위치 가져오기 (고정밀도)
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('브라우저가 위치 서비스를 지원하지 않습니다'))
      return
    }

    console.log('📍 GPS 위치 요청 시작...')
    console.log('위치 권한 상태 확인 중...')

    const options = {
      enableHighAccuracy: true,  // GPS 사용 (고정밀도)
      timeout: 15000,            // 15초 대기
      maximumAge: 0              // 캐시 사용 안 함 (항상 새로운 위치)
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const result = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        }

        console.log('✅ GPS 위치 수신 성공:', {
          위도: result.lat,
          경도: result.lon,
          정확도: Math.round(result.accuracy) + 'm',
          고도: position.coords.altitude ? position.coords.altitude + 'm' : '없음',
          속도: position.coords.speed ? position.coords.speed + 'm/s' : '없음',
          타임스탬프: new Date(position.timestamp).toLocaleString('ko-KR')
        })

        // 정확도가 너무 낮으면 경고
        if (result.accuracy > 100) {
          console.warn('⚠️ 위치 정확도가 낮습니다 (±' + Math.round(result.accuracy) + 'm)')
          console.warn('💡 GPS 신호가 약할 수 있습니다. 실외로 이동하거나 잠시 후 다시 시도하세요.')
        }

        resolve(result)
      },
      error => {
        let errorMessage = 'GPS 위치를 가져올 수 없습니다'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
            console.error('❌ 위치 권한 거부')
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다. GPS 신호를 확인해주세요.'
            console.error('❌ 위치 정보 사용 불가')
            break
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다. 다시 시도해주세요.'
            console.error('❌ 위치 요청 타임아웃')
            break
          default:
            errorMessage = '알 수 없는 오류가 발생했습니다: ' + error.message
            console.error('❌ 알 수 없는 오류:', error)
        }

        console.error('에러 코드:', error.code)
        console.error('에러 메시지:', error.message)

        reject(new Error(errorMessage))
      },
      options
    )
  })
}
