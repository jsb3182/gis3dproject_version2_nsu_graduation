<template>
  <div class="d-flex justify-content-center align-items-center position-relative mt-1"
    style="height: calc(100vh - 140px);">

    <!-- Cesium 3D 지도 :: start -->
    <div class="cesium-container position-fixed top-0 start-0 w-100"
      style="height:100dvh; z-index:0;">
      <div ref="cesiumContainer" class="cesium-viewer"></div>

      <!-- 로딩 오버레이 -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-light mt-2">3D 지도를 불러오는 중...</p>
      </div>
    </div>
    <!-- Cesium 3D 지도 :: end -->

    <!-- 상단 조회 버튼 :: start -->
    <div class="position-fixed start-0 p-3" style="top: calc(var(--header-h) + 8px); z-index: 2;">
      <div class="pe-auto">
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button"
          @click="showShelters()"
          :class="{ 'btn-primary text-white': currentListType === '대피소' }">
          🏠 민방위대피소
        </button>
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button"
          @click="showBuildings()"
          :class="{ 'btn-primary text-white': currentListType === '건물' }">
          🏢 건물
        </button>
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button"
          @click="showRoads()"
          :class="{ 'btn-primary text-white': currentListType === '도로' }">
          🛣️ 도로
        </button>
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button"
          @click="showAll()">
          🌐 전체보기
        </button>
      </div>
    </div>
    <!-- 상단 조회 버튼 :: end -->

    <!-- 내 위치 & 새로고침 버튼 :: start -->
    <div class="position-fixed end-0 p-3" style="top: calc(var(--header-h) + 8px); z-index: 2;">
      <button type="button" class="btn btn-primary border rounded-circle shadow-sm mb-2"
        @click="goToMyLocation()"
        style="width: 48px; height: 48px; padding: 0;"
        title="내 위치로 이동">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4m8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7" />
        </svg>
      </button>
      <button type="button" class="btn btn-secondary border rounded-circle shadow-sm"
        @click="goToCheonan()"
        style="width: 48px; height: 48px; padding: 0;"
        title="천안시 전체보기">
        🏙️
      </button>
    </div>
    <!-- 내 위치 & 새로고침 버튼 :: end -->

    <!-- 범례 (Legend) :: start -->
    <div class="position-fixed start-0 p-3" style="bottom: 280px; z-index: 2;">
      <div class="bg-white rounded-3 shadow-sm p-3" style="min-width: 200px;">
        <h6 class="fw-bold mb-3" style="font-size: 14px;">🗺️ 범례</h6>

        <div class="d-flex flex-column gap-2" style="font-size: 12px;">
          <!-- 대피소 포인트 -->
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle" style="width: 12px; height: 12px; background-color: red;"></div>
            <span>민방위 대피소</span>
          </div>

          <!-- 대피소 폴리곤 -->
          <div class="d-flex align-items-center gap-2">
            <div class="rounded" style="width: 12px; height: 12px; background-color: #FF0000; border: 2px solid yellow;"></div>
            <span>대피소 건물</span>
          </div>

          <!-- 천안시 건물 -->
          <div class="d-flex align-items-center gap-2">
            <div class="rounded" style="width: 12px; height: 12px; background-color: lightgray; border: 1px solid gray;"></div>
            <span>천안시 건물</span>
          </div>

          <!-- 도로 -->
          <div class="d-flex align-items-center gap-2">
            <div style="width: 12px; height: 3px; background-color: yellow;"></div>
            <span>도로 (링크)</span>
          </div>

          <!-- 노드 -->
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle" style="width: 8px; height: 8px; background-color: blue;"></div>
            <span>도로 노드</span>
          </div>

          <!-- 지적도 -->
          <div class="d-flex align-items-center gap-2">
            <div class="rounded" style="width: 12px; height: 12px; background-color: rgba(128, 0, 128, 0.3); border: 1px solid purple;"></div>
            <span>지적도</span>
          </div>

          <!-- 주제도 -->
          <div class="d-flex align-items-center gap-2">
            <div class="rounded" style="width: 12px; height: 12px; background-color: rgba(0, 255, 255, 0.3); border: 1px solid darkcyan;"></div>
            <span>주제도</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 범례 (Legend) :: end -->

  </div>

  <!-- 바텀시트 -->
  <div class="position-fixed start-0 end-0 bg-white rounded-top-4 shadow-lg" :style="sheetStyle" ref="bottomSheet"
    @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd"
    style="z-index: 2; padding-bottom: 150px;">

    <!-- 그립 -->
    <div class="pt-3 d-flex justify-content-center" @click="toggleSheet" style="cursor: grab;">
      <div class="bg-secondary-subtle rounded-pill w-25" style="height:5px;"></div>
    </div>

    <!-- 내용 -->
    <div class="d-flex flex-column" style="height: 100%;">
      <!-- 타이틀 -->
      <div class="d-flex justify-content-between align-items-center mb-3 ms-2 me-2">
        <!-- 왼쪽 -->
        <div class="d-flex align-items-center gap-2">
          <h5 class="fw-bold mb-0">{{ currentListType }} 리스트</h5>
          <span v-if="items.length > 0" class="badge bg-white text-black">{{ items.length }}개</span>
        </div>

        <!-- 오른쪽: 정렬 버튼 -->
        <div class="dropdown">
          <button class="btn dropdown-toggle w-100 d-flex align-items-center justify-content-between
                    bg-white border rounded-pill px-4 fw-bold" type="button" data-bs-toggle="dropdown"
            aria-expanded="false" style="height: 42px; font-size: 15px; padding-right: 18px !important;">
            <div class="d-flex align-items-center gap-2">
              <template v-if="currentSort === 'name'">
                📝 이름순
              </template>
              <template v-else>
                📏 거리순
              </template>
            </div>
          </button>

          <!-- dropdown menu -->
          <ul class="dropdown-menu w-100 rounded-4 shadow-sm p-0 overflow-hidden" style="min-width: auto;">
            <li v-if="currentSort !== 'distance'">
              <button class="dropdown-item d-flex align-items-center gap-3 py-2 fw-bold" style="font-size: 15px;"
                @click="changeSort('distance')">
                📏 거리순
              </button>
            </li>
            <li v-if="currentSort !== 'name'">
              <button class="dropdown-item d-flex align-items-center gap-3 py-2 fw-bold" style="font-size: 15px;"
                @click="changeSort('name')">
                📝 이름순
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 리스트 스크롤 영역 :: start -->
      <div class="overflow-auto px-3 flex-grow-1" style="min-height: 0; max-height: 100%;">
        <!-- 카드 -->
        <div class="card shadow-sm mb-3" v-for="item in items" :key="item.id" @click="flyToItem(item)">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h6 class="card-title fw-bold mb-1">{{ item.name || '이름 정보 없음' }}</h6>
              <span class="badge bg-success-subtle text-success-emphasis rounded-pill">
                {{ currentListType }}
              </span>
            </div>

            <p class="mb-1 text-muted small" v-if="item.address">
              <i class="bi bi-geo-alt me-1"></i>{{ item.address }}
            </p>

            <p class="mb-1 text-muted small" v-if="item.capacity">
              <strong>수용인원:</strong> {{ item.capacity }}명
            </p>

            <p class="mb-1 text-muted small" v-if="item.area">
              <strong>면적:</strong> {{ item.area }}㎡
            </p>

            <div class="text-muted small d-flex align-items-center" v-if="item.distance">
              <span><i class="bi bi-geo-alt me-1"></i> {{ item.distance }}km</span>
            </div>
          </div>
        </div>

        <div v-if="items.length === 0" class="text-center text-muted py-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
            style="display: block; margin: 0 auto 8px;">
            <path fill="currentColor"
              d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
          </svg>
          <p class="mb-1">데이터가 없습니다.</p>
          <small class="text-muted">다른 카테고리를 선택해주세요.</small>
        </div>
      </div>
      <!-- 리스트 스크롤 영역 :: end -->
    </div>
  </div>

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as Cesium from 'cesium'
import geoService from '@/services/geoService'

// Cesium Ion 토큰
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZWJiMDRjNi05MDZlLTRiOWMtYTU5OC0yY2Q2MGM2NzE4ODMiLCJpZCI6MzY3MzEyLCJpYXQiOjE3NjUwODQwMTV9.Qwe6fyt1Ooat6PUTnulbjvQXSFAYmL0J3kPc83FG7gA'

// -----------------------------------------------------------
// 1. 상태 변수
// -----------------------------------------------------------
const cesiumContainer = ref(null)
let viewer = null
const loading = ref(true)
const items = ref([])
const currentListType = ref('대피소')
const currentSort = ref('distance')
const shelterEntities = []
const userLocation = ref(null)

// 바텀시트 관련
const bottomSheet = ref(null)
const isDragging = ref(false)
const sheetHeightRatio = ref(0)
const dragStart = ref({ y: 0, ratio: 0 })
const MAX_SHEET_HEIGHT = window.innerHeight * 0.8
const MIN_SHEET_HEIGHT = 220

// 천안시 중심 좌표
const CHEONAN_CENTER = {
  lon: 127.1139,
  lat: 36.8151,
  height: 15000
}

// -----------------------------------------------------------
// 2. Cesium Viewer 초기화
// -----------------------------------------------------------
const initCesium = async () => {
  try {
    loading.value = true

    viewer = new Cesium.Viewer(cesiumContainer.value, {
      animation: false,
      timeline: false,
      fullscreenButton: true,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1),
      baseLayerPicker: false,
      // Bing Maps Aerial with Labels (고해상도 위성 이미지)
      imageryProvider: await Cesium.IonImageryProvider.fromAssetId(3)
    })

    // 배경색 설정
    viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT
    viewer.scene.globe.baseColor = Cesium.Color.WHITE

    // 고품질 렌더링 설정
    viewer.scene.globe.enableLighting = false  // 조명 효과 끄기 (더 밝게)
    viewer.scene.globe.depthTestAgainstTerrain = false  // 지형에 대한 깊이 테스트
    viewer.scene.fog.enabled = false  // 안개 효과 끄기 (더 선명하게)
    viewer.scene.skyAtmosphere.show = true  // 하늘 대기 표시

    // 최대 해상도 설정
    viewer.resolutionScale = 1.0  // 최대 해상도

    goToCheonan()
    await getUserLocation()
    await showAll()  // 모든 레이어를 처음부터 표시
    registerClickHandler()

  } catch (error) {
    console.error('[CesiumMap] 초기화 실패:', error)
    alert('3D 지도를 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// -----------------------------------------------------------
// 3. 사용자 위치 가져오기
// -----------------------------------------------------------
const getUserLocation = async () => {
  if (navigator.geolocation) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          }

          // 내 위치 마커 추가
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
              userLocation.value.lon,
              userLocation.value.lat,
              0
            ),
            point: {
              pixelSize: 20,
              color: Cesium.Color.BLUE,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 3
            },
            label: {
              text: '내 위치',
              font: '16px sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -25),
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
          })

          resolve()
        },
        (error) => {
          console.error('[CesiumMap] 위치 가져오기 실패:', error)
          resolve()
        }
      )
    })
  }
}

// -----------------------------------------------------------
// 4. 레이어 로드 함수들
// -----------------------------------------------------------

// 대피소 표시
const showShelters = async () => {
  try {
    currentListType.value = '대피소'
    clearEntities()

    const layers = await geoService.getAllLayers()

    if (layers.chspoint && layers.chspoint.features) {
      const itemsList = []

      layers.chspoint.features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
          const [lon, lat] = feature.geometry.coordinates
          const name = feature.properties.name || '대피소'
          const address = feature.properties.address || '주소 정보 없음'
          const capacity = feature.properties.capacity || '정보 없음'
          const area = feature.properties.area || '정보 없음'

          // 3D 원기둥 엔티티 추가
          const entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 40),  // 건물 위에 띄우기
            cylinder: {
              length: 80,  // 원기둥 높이를 매우 높게 (랜드마크처럼)
              topRadius: 10,
              bottomRadius: 10,
              material: Cesium.Color.fromCssColorString('#FF0000'),  // 진한 빨간색 (투명도 없음)
              outline: true,
              outlineColor: Cesium.Color.YELLOW,  // 노란색 외곽선으로 더 눈에 띄게
              outlineWidth: 3
            },
            label: {
              text: name,
              font: 'bold 18px sans-serif',  // 더 크게
              fillColor: Cesium.Color.YELLOW,  // 노란색 텍스트
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 3,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -50),  // 더 위로
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              showBackground: true,  // 배경 표시
              backgroundColor: Cesium.Color.fromCssColorString('#FF0000'),  // 진한 빨간 배경
              backgroundPadding: new Cesium.Cartesian2(7, 5)  // 배경 패딩
            },
            properties: {
              featureData: feature,
              layerType: 'chspoint'
            }
          })

          shelterEntities.push(entity)

          // 리스트에 추가
          let distance = null
          if (userLocation.value) {
            distance = calculateDistance(
              { lat: userLocation.value.lat, lon: userLocation.value.lon },
              { lat, lon }
            ).toFixed(2)
          }

          itemsList.push({
            id: feature.properties.id || Math.random(),
            name,
            address,
            capacity,
            area,
            lat,
            lon,
            distance
          })
        }
      })

      items.value = itemsList
      console.log(`[CesiumMap] 대피소: ${layers.chspoint.features.length}개 로드`)
    }

  } catch (error) {
    console.error('[CesiumMap] 대피소 로드 실패:', error)
    alert('대피소 데이터를 불러오는데 실패했습니다.')
  }
}

// 건물 표시
const showBuildings = async () => {
  try {
    currentListType.value = '건물'
    clearEntities()

    const layers = await geoService.getAllLayers()

    if (layers.build && layers.build.features) {
      const itemsList = []

      layers.build.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          const entity = viewer.entities.add({
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(
                feature.geometry.coordinates[0].flatMap(coord => coord)
              ),
              material: Cesium.Color.BLUE.withAlpha(0.5),
              outline: true,
              outlineColor: Cesium.Color.BLUE,
              outlineWidth: 2,
              height: 0,
              extrudedHeight: 15
            },
            properties: {
              featureData: feature,
              layerType: 'build'
            }
          })
          shelterEntities.push(entity)

          itemsList.push({
            id: feature.properties.id || Math.random(),
            name: feature.properties.name || '건물'
          })

        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(polygonCoords => {
            const entity = viewer.entities.add({
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(
                  polygonCoords[0].flatMap(coord => coord)
                ),
                material: Cesium.Color.BLUE.withAlpha(0.5),
                outline: true,
                outlineColor: Cesium.Color.BLUE,
                outlineWidth: 2,
                height: 0,
                extrudedHeight: 15
              },
              properties: {
                featureData: feature,
                layerType: 'build'
              }
            })
            shelterEntities.push(entity)
          })

          itemsList.push({
            id: feature.properties.id || Math.random(),
            name: feature.properties.name || '건물'
          })
        }
      })

      items.value = itemsList
      console.log(`[CesiumMap] 건물: ${layers.build.features.length}개 로드`)
    }

  } catch (error) {
    console.error('[CesiumMap] 건물 로드 실패:', error)
  }
}

// 도로 표시
const showRoads = async () => {
  try {
    currentListType.value = '도로'
    clearEntities()

    const layers = await geoService.getAllLayers()

    if (layers.link && layers.link.features) {
      const itemsList = []

      layers.link.features.forEach(feature => {
        if (feature.geometry.type === 'LineString') {
          const entity = viewer.entities.add({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray(
                feature.geometry.coordinates.flatMap(coord => coord)
              ),
              width: 5,
              material: Cesium.Color.YELLOW.withAlpha(0.8),
              clampToGround: false
            },
            properties: {
              featureData: feature,
              layerType: 'link'
            }
          })
          shelterEntities.push(entity)

          itemsList.push({
            id: feature.properties.id || Math.random(),
            name: feature.properties.name || '도로'
          })

        } else if (feature.geometry.type === 'MultiLineString') {
          feature.geometry.coordinates.forEach(lineCoords => {
            const entity = viewer.entities.add({
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray(
                  lineCoords.flatMap(coord => coord)
                ),
                width: 5,
                material: Cesium.Color.YELLOW.withAlpha(0.8),
                clampToGround: false
              },
              properties: {
                featureData: feature,
                layerType: 'link'
              }
            })
            shelterEntities.push(entity)
          })

          itemsList.push({
            id: feature.properties.id || Math.random(),
            name: feature.properties.name || '도로'
          })
        }
      })

      items.value = itemsList
      console.log(`[CesiumMap] 도로: ${layers.link.features.length}개 로드`)
    }

  } catch (error) {
    console.error('[CesiumMap] 도로 로드 실패:', error)
  }
}

// 전체 보기
const showAll = async () => {
  try {
    currentListType.value = '전체'
    clearEntities()

    const layers = await geoService.getAllLayers()
    const itemsList = []

    // 대피소
    if (layers.chspoint && layers.chspoint.features) {
      layers.chspoint.features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
          const [lon, lat] = feature.geometry.coordinates

          const entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 40),  // 건물 위에 띄우기
            cylinder: {
              length: 80,  // 원기둥 높이를 매우 높게 (랜드마크처럼)
              topRadius: 10,
              bottomRadius: 10,
              material: Cesium.Color.fromCssColorString('#FF0000'),  // 진한 빨간색
              outline: true,
              outlineColor: Cesium.Color.YELLOW,  // 노란색 외곽선으로 더 눈에 띄게
              outlineWidth: 3
            },
            label: {
              text: feature.properties.name || '대피소',
              font: 'bold 16px sans-serif',  // 굵게, 크게
              fillColor: Cesium.Color.YELLOW,  // 노란색 텍스트
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 3,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -50),  // 더 위로
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              showBackground: true,  // 배경 표시
              backgroundColor: Cesium.Color.RED.withAlpha(0.7),  // 빨간 배경
              backgroundPadding: new Cesium.Cartesian2(7, 5)  // 배경 패딩
            },
            properties: {
              featureData: feature,
              layerType: 'chspoint'
            }
          })

          shelterEntities.push(entity)

          itemsList.push({
            id: feature.properties.id || Math.random(),
            name: feature.properties.name || '대피소',
            lat,
            lon
          })
        }
      })
    }

    // 건물 (일반 건물) - 밝은 회색 3D
    if (layers.build && layers.build.features) {
      layers.build.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          const entity = viewer.entities.add({
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(
                feature.geometry.coordinates[0].flatMap(coord => coord)
              ),
              material: Cesium.Color.WHITESMOKE.withAlpha(0.7),
              outline: true,
              outlineColor: Cesium.Color.GRAY,
              outlineWidth: 1,
              height: 0,
              extrudedHeight: 25  // 높이를 더 높게
            },
            properties: {
              featureData: feature,
              layerType: 'build'
            }
          })
          shelterEntities.push(entity)
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(polygonCoords => {
            const entity = viewer.entities.add({
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(
                  polygonCoords[0].flatMap(coord => coord)
                ),
                material: Cesium.Color.WHITESMOKE.withAlpha(0.7),
                outline: true,
                outlineColor: Cesium.Color.GRAY,
                outlineWidth: 1,
                height: 0,
                extrudedHeight: 25  // 높이를 더 높게
              },
              properties: {
                featureData: feature,
                layerType: 'build'
              }
            })
            shelterEntities.push(entity)
          })
        }
      })
    }

    // 도로 (링크) - 노란색 선
    if (layers.link && layers.link.features) {
      layers.link.features.forEach(feature => {
        if (feature.geometry.type === 'LineString') {
          const entity = viewer.entities.add({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray(
                feature.geometry.coordinates.flatMap(coord => coord)
              ),
              width: 3,
              material: Cesium.Color.YELLOW.withAlpha(0.9),
              clampToGround: true
            },
            properties: {
              featureData: feature,
              layerType: 'link'
            }
          })
          shelterEntities.push(entity)
        } else if (feature.geometry.type === 'MultiLineString') {
          feature.geometry.coordinates.forEach(lineCoords => {
            const entity = viewer.entities.add({
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray(
                  lineCoords.flatMap(coord => coord)
                ),
                width: 3,
                material: Cesium.Color.YELLOW.withAlpha(0.9),
                clampToGround: true
              },
              properties: {
                featureData: feature,
                layerType: 'link'
              }
            })
            shelterEntities.push(entity)
          })
        }
      })
    }

    // 노드 - 파란색 작은 원
    if (layers.node && layers.node.features) {
      layers.node.features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
          const [lon, lat] = feature.geometry.coordinates
          const entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
            point: {
              pixelSize: 4,
              color: Cesium.Color.BLUE.withAlpha(0.8),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 1
            },
            properties: {
              featureData: feature,
              layerType: 'node'
            }
          })
          shelterEntities.push(entity)
        }
      })
    }

    // chmergr (지적도 병합) - 보라색 3D 폴리곤 (토지 구획 표현)
    if (layers.chmergr && layers.chmergr.features) {
      layers.chmergr.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          const entity = viewer.entities.add({
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(
                feature.geometry.coordinates[0].flatMap(coord => coord)
              ),
              material: Cesium.Color.PURPLE.withAlpha(0.5),
              outline: true,
              outlineColor: Cesium.Color.PURPLE,
              outlineWidth: 2,
              height: 0,
              extrudedHeight: 5  // 낮은 높이로 토지 구획 표현
            },
            properties: {
              featureData: feature,
              layerType: 'chmergr'
            }
          })
          shelterEntities.push(entity)
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(polygonCoords => {
            const entity = viewer.entities.add({
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(
                  polygonCoords[0].flatMap(coord => coord)
                ),
                material: Cesium.Color.PURPLE.withAlpha(0.5),
                outline: true,
                outlineColor: Cesium.Color.PURPLE,
                outlineWidth: 2,
                height: 0,
                extrudedHeight: 5  // 낮은 높이로 토지 구획 표현
              },
              properties: {
                featureData: feature,
                layerType: 'chmergr'
              }
            })
            shelterEntities.push(entity)
          })
        }
      })
    }

    // shelter (대피소 포인트) - 진한 빨간색 원기둥 (98개!)
    console.log('[DEBUG] shelter 레이어 데이터:', layers.shelter)
    console.log('[DEBUG] shelter features 개수:', layers.shelter?.features?.length || 0)

    if (layers.shelter && layers.shelter.features) {
      console.log('[DEBUG] shelter 첫 번째 feature:', layers.shelter.features[0])
      console.log('[DEBUG] shelter geometry 타입들:', layers.shelter.features.map(f => f.geometry.type))

      layers.shelter.features.forEach((feature) => {
        if (feature.geometry.type === 'Point') {
          const [lon, lat] = feature.geometry.coordinates
          const name = feature.properties.name || feature.properties.vt_nm || '대피소'

          // 빨간 원기둥으로 표시 (chspoint와 구별하기 위해 약간 다르게)
          const entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 45),  // 약간 더 높게
            cylinder: {
              length: 90,  // 90m로 더 높게
              topRadius: 12,
              bottomRadius: 12,
              material: Cesium.Color.fromCssColorString('#FF0000'),  // 순수 빨간색
              outline: true,
              outlineColor: Cesium.Color.YELLOW,
              outlineWidth: 4  // 더 두껍게
            },
            label: {
              text: name,
              font: 'bold 20px sans-serif',  // 더 크고 굵게
              fillColor: Cesium.Color.YELLOW,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 3,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -55),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('#FF0000'),
              backgroundPadding: new Cesium.Cartesian2(8, 6)
            },
            properties: {
              featureData: feature,
              layerType: 'shelter'
            }
          })
          shelterEntities.push(entity)
        } else if (feature.geometry.type === 'Polygon') {
          const entity = viewer.entities.add({
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(
                feature.geometry.coordinates[0].flatMap(coord => coord)
              ),
              material: Cesium.Color.fromCssColorString('#FF0000'),
              outline: true,
              outlineColor: Cesium.Color.YELLOW,
              outlineWidth: 3,
              height: 0,
              extrudedHeight: 50
            },
            properties: {
              featureData: feature,
              layerType: 'shelter'
            }
          })
          shelterEntities.push(entity)
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(polygonCoords => {
            const entity = viewer.entities.add({
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(
                  polygonCoords[0].flatMap(coord => coord)
                ),
                material: Cesium.Color.fromCssColorString('#FF0000'),
                outline: true,
                outlineColor: Cesium.Color.YELLOW,
                outlineWidth: 3,
                height: 0,
                extrudedHeight: 50
              },
              properties: {
                featureData: feature,
                layerType: 'shelter'
              }
            })
            shelterEntities.push(entity)
          })
        }
      })

      console.log(`[DEBUG] shelter 엔티티 ${layers.shelter.features.length}개 추가 완료!`)
    }

    // chbuildclip (천안시 건물) - 회색 3D 건물
    if (layers.chbuildclip && layers.chbuildclip.features) {
      layers.chbuildclip.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          const entity = viewer.entities.add({
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(
                feature.geometry.coordinates[0].flatMap(coord => coord)
              ),
              material: Cesium.Color.LIGHTGRAY.withAlpha(0.8),
              outline: true,
              outlineColor: Cesium.Color.DARKGRAY,
              outlineWidth: 1,
              height: 0,
              extrudedHeight: 30  // 높이를 더 높게
            },
            properties: {
              featureData: feature,
              layerType: 'chbuildclip'
            }
          })
          shelterEntities.push(entity)
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(polygonCoords => {
            const entity = viewer.entities.add({
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(
                  polygonCoords[0].flatMap(coord => coord)
                ),
                material: Cesium.Color.LIGHTGRAY.withAlpha(0.8),
                outline: true,
                outlineColor: Cesium.Color.DARKGRAY,
                outlineWidth: 1,
                height: 0,
                extrudedHeight: 30  // 높이를 더 높게
              },
              properties: {
                featureData: feature,
                layerType: 'chbuildclip'
              }
            })
            shelterEntities.push(entity)
          })
        }
      })
    }

    // thematicmerge (주제도) - 청록색 3D 폴리곤 (정교한 입체감)
    if (layers.thematicmerge && layers.thematicmerge.features) {
      layers.thematicmerge.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          const entity = viewer.entities.add({
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(
                feature.geometry.coordinates[0].flatMap(coord => coord)
              ),
              material: Cesium.Color.CYAN.withAlpha(0.6),
              outline: true,
              outlineColor: Cesium.Color.DARKCYAN,
              outlineWidth: 2,
              height: 0,
              extrudedHeight: 8  // 낮은 높이로 정교한 레이어 표현
            },
            properties: {
              featureData: feature,
              layerType: 'thematicmerge'
            }
          })
          shelterEntities.push(entity)
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(polygonCoords => {
            const entity = viewer.entities.add({
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(
                  polygonCoords[0].flatMap(coord => coord)
                ),
                material: Cesium.Color.CYAN.withAlpha(0.6),
                outline: true,
                outlineColor: Cesium.Color.DARKCYAN,
                outlineWidth: 2,
                height: 0,
                extrudedHeight: 8  // 낮은 높이로 정교한 레이어 표현
              },
              properties: {
                featureData: feature,
                layerType: 'thematicmerge'
              }
            })
            shelterEntities.push(entity)
          })
        }
      })
    }

    items.value = itemsList
    console.log(`[CesiumMap] 전체 데이터 로드 완료`)

  } catch (error) {
    console.error('[CesiumMap] 전체 로드 실패:', error)
  }
}

// -----------------------------------------------------------
// 5. 유틸리티 함수
// -----------------------------------------------------------

// 엔티티 제거
const clearEntities = () => {
  shelterEntities.forEach(entity => {
    viewer.entities.remove(entity)
  })
  shelterEntities.length = 0
  items.value = []
}

// 클릭 이벤트 핸들러
const registerClickHandler = () => {
  viewer.screenSpaceEventHandler.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position)

    if (Cesium.defined(pickedObject) && pickedObject.id) {
      const entity = pickedObject.id

      if (entity.properties && entity.properties.featureData) {
        const feature = entity.properties.featureData.getValue()

        if (feature.geometry.type === 'Point') {
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              feature.geometry.coordinates[0],
              feature.geometry.coordinates[1],
              3000
            ),
            duration: 2
          })
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

// 천안시로 이동 (3D 뷰)
const goToCheonan = () => {
  if (!viewer) return

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      CHEONAN_CENTER.lon,
      CHEONAN_CENTER.lat,
      CHEONAN_CENTER.height
    ),
    orientation: {
      heading: Cesium.Math.toRadians(0),    // 북쪽 방향
      pitch: Cesium.Math.toRadians(-45),    // 45도 아래로 기울임 (3D 뷰)
      roll: 0
    },
    duration: 2
  })
}

// 내 위치로 이동 (3D 뷰)
const goToMyLocation = () => {
  if (userLocation.value && viewer) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        userLocation.value.lon,
        userLocation.value.lat,
        5000
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),  // 3D 뷰
        roll: 0
      },
      duration: 2
    })
  } else {
    alert('위치 정보를 가져올 수 없습니다.')
  }
}

// 아이템으로 이동 (3D 뷰)
const flyToItem = (item) => {
  if (item.lat && item.lon && viewer) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 1500),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),  // 3D 뷰
        roll: 0
      },
      duration: 2
    })
  }
}

// 거리 계산 (Haversine)
const calculateDistance = (coord1, coord2) => {
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

  return EARTH_RADIUS * c
}

// 정렬 변경
const changeSort = (type) => {
  currentSort.value = type
  if (type === 'distance') {
    items.value.sort((a, b) => {
      const distA = parseFloat(a.distance) || Infinity
      const distB = parseFloat(b.distance) || Infinity
      return distA - distB
    })
  } else {
    items.value.sort((a, b) => a.name.localeCompare(b.name))
  }
}

// -----------------------------------------------------------
// 6. 바텀시트 로직
// -----------------------------------------------------------

const sheetStyle = computed(() => ({
  transition: isDragging.value ? 'none' : 'transform 0.3s ease-out',
  transform: `translateY(${sheetY.value}px)`,
  height: `${MAX_SHEET_HEIGHT}px`,
  bottom: `0px`,
  top: 'auto'
}))

const sheetY = computed(() => (MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT) * (1 - sheetHeightRatio.value))

const onTouchStart = e => {
  if (e.target.closest('button') || e.target.closest('.btn') || e.target.closest('.card-body')) return
  isDragging.value = true
  dragStart.value = { y: e.touches[0].clientY, ratio: sheetHeightRatio.value }
}

const onTouchMove = e => {
  if (!isDragging.value) return
  const dY = e.touches[0].clientY - dragStart.value.y
  const dR = -dY / (MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT)
  sheetHeightRatio.value = Math.min(1, Math.max(0, dragStart.value.ratio + dR))
}

const onTouchEnd = () => {
  isDragging.value = false
  sheetHeightRatio.value = sheetHeightRatio.value > 0.5 ? 1 : 0
}

const toggleSheet = () => {
  sheetHeightRatio.value = sheetHeightRatio.value > 0.5 ? 0 : 1
}

// -----------------------------------------------------------
// 7. 라이프사이클
// -----------------------------------------------------------

onMounted(() => {
  initCesium()
})

onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})
</script>

<style scoped>
.cesium-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.cesium-viewer {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 카드 기본/호버/클릭 */
.card {
  cursor: pointer;
  transform-origin: top center;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.25s ease,
    border-color 0.18s ease;
  background-color: #fff;
}

.card:hover {
  transform: scale(1.02);
  background-color: #f0f6ff;
  border-color: #0d6efd;
  box-shadow: 0 6px 20px rgba(13, 110, 253, .15);
}

.card:active {
  transform: scale(0.98);
  background-color: #e2ebff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, .15);
}

.top-button:focus {
  background-color: #0d6efd;
  box-shadow: 0 3px 10px rgba(0, 0, 0, .15);
}

.dropdown-toggle::after {
  margin-left: 8px !important;
}

@media (max-width: 768px) {
  .top-button {
    font-size: 14px;
    padding: 4px 8px !important;
  }
}
</style>
