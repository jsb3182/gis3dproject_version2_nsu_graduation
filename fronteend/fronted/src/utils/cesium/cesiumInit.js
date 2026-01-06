/**
 * Cesium Viewer 초기화 유틸리티
 *
 * Cesium Viewer 생성, 설정, 3D 타일셋 로드 등
 * 초기화 관련 모든 로직을 처리합니다.
 */

import * as Cesium from 'cesium'
import { CESIUM_VIEWER_OPTIONS, VWORLD_3D_TILESET_URL } from './cesiumConfig'

// ============================================================================
// Cesium Viewer 초기화
// ============================================================================
/**
 * Cesium Viewer를 생성하고 기본 설정을 적용합니다.
 *
 * @param {HTMLElement} container - Cesium Viewer가 렌더링될 DOM 요소
 * @returns {Promise<Cesium.Viewer>} 초기화된 Cesium Viewer 인스턴스
 *
 * @example
 * const viewer = await createCesiumViewer(document.getElementById('cesiumContainer'))
 */
export const createCesiumViewer = async (container) => {
  try {
    // Cesium Viewer 생성
    const viewer = new Cesium.Viewer(container, {
      ...CESIUM_VIEWER_OPTIONS,
      // Cesium Ion에서 제공하는 지형 데이터 사용 (고해상도 지형)
      terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1),
      // Bing Maps 위성 이미지 사용 (고해상도 항공사진)
      imageryProvider: await Cesium.IonImageryProvider.fromAssetId(3)
    })

    // 뷰어 기본 설정 적용
    configureViewer(viewer)

    console.log('[CesiumInit] ✅ Cesium Viewer 초기화 완료')
    return viewer
  } catch (error) {
    console.error('[CesiumInit] ❌ Viewer 생성 실패:', error)
    throw error
  }
}

// ============================================================================
// Viewer 설정 적용
// ============================================================================
/**
 * Cesium Viewer에 고품질 렌더링 설정을 적용합니다.
 *
 * @param {Cesium.Viewer} viewer - 설정할 Cesium Viewer 인스턴스
 */
const configureViewer = (viewer) => {
  // 배경색 설정 (투명)
  viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT
  viewer.scene.globe.baseColor = Cesium.Color.WHITE

  // 고품질 렌더링 설정
  viewer.scene.globe.enableLighting = false  // 조명 효과 끄기 (더 밝게)
  viewer.scene.globe.depthTestAgainstTerrain = false  // 지형 깊이 테스트
  viewer.scene.fog.enabled = false  // 안개 효과 끄기 (더 선명하게)
  viewer.scene.skyAtmosphere.show = true  // 대기권 표시

  // 최대 해상도 설정
  viewer.resolutionScale = 1.0  // 1.0 = 100% 해상도
}

// ============================================================================
// 브이월드 3D 건물 타일셋 로드
// ============================================================================
/**
 * 브이월드에서 제공하는 3D 건물 타일셋을 로드하여 씬에 추가합니다.
 *
 * @param {Cesium.Viewer} viewer - 3D 타일셋을 추가할 Viewer
 * @returns {Promise<Cesium.Cesium3DTileset|null>} 로드된 타일셋 또는 null (실패 시)
 */
export const loadVworld3DTileset = async (viewer) => {
  try {
    const tileset = await Cesium.Cesium3DTileset.fromUrl(
      VWORLD_3D_TILESET_URL,
      {
        // 화질 조절 (낮을수록 고화질, 기본값: 16)
        maximumScreenSpaceError: 16
      }
    )

    // 씬에 타일셋 추가
    viewer.scene.primitives.add(tileset)

    console.log('[CesiumInit] ✅ 브이월드 3D 건물 타일셋 로드 완료')
    return tileset
  } catch (error) {
    console.error('[CesiumInit] ❌ 브이월드 3D 건물 로드 실패:', error)
    // 3D 건물 로드 실패해도 계속 진행 (필수 아님)
    return null
  }
}

// ============================================================================
// 카메라를 특정 위치로 이동
// ============================================================================
/**
 * 카메라를 지정된 좌표로 부드럽게 이동시킵니다.
 *
 * @param {Cesium.Viewer} viewer - Cesium Viewer 인스턴스
 * @param {Object} position - 이동할 위치 { lon, lat, height }
 * @param {number} pitch - 카메라 기울기 (기본값: -45도)
 * @param {number} duration - 애니메이션 지속 시간(초) (기본값: 2초)
 *
 * @example
 * flyToPosition(viewer, { lon: 127.1139, lat: 36.8151, height: 15000 })
 */
export const flyToPosition = (viewer, position, pitch = -45, duration = 2) => {
  if (!viewer) {
    console.warn('[CesiumInit] Viewer가 초기화되지 않았습니다.')
    return
  }

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      position.lon,
      position.lat,
      position.height
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0),      // 북쪽 방향
      pitch: Cesium.Math.toRadians(pitch),    // 카메라 기울기
      roll: 0                                  // 회전 없음
    },
    duration
  })
}

// ============================================================================
// 사용자 위치 가져오기
// ============================================================================
/**
 * 브라우저 Geolocation API를 사용하여 사용자의 현재 위치를 가져옵니다.
 *
 * @returns {Promise<Object|null>} 사용자 위치 { lat, lon } 또는 null (실패 시)
 *
 * @example
 * const location = await getUserLocation()
 * if (location) {
 *   console.log(`위도: ${location.lat}, 경도: ${location.lon}`)
 * }
 */
export const getUserLocation = async () => {
  if (!navigator.geolocation) {
    console.warn('[CesiumInit] Geolocation API를 지원하지 않는 브라우저입니다.')
    return null
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }
        console.log('[CesiumInit] ✅ 사용자 위치:', userLocation)
        resolve(userLocation)
      },
      (error) => {
        console.error('[CesiumInit] ❌ 위치 가져오기 실패:', error.message)
        resolve(null)
      }
    )
  })
}
