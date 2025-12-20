<template>
  <div class="d-flex justify-content-center align-items-center position-relative mt-1"
    style="height: calc(100vh - 140px);">

    <!-- Cesium 3D 지도 :: start -->
    <div class="cesium-container position-fixed top-0 start-0 w-100" style="height:100dvh; z-index:0;">
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
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button" @click="showShelters()"
          :class="{ 'btn-primary text-white': currentListType === '대피소' }">
          🏠 민방위대피소
        </button>
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button" @click="showBuildings()"
          :class="{ 'btn-primary text-white': currentListType === '건물' }">
          🏢 건물
        </button>
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button" @click="showRoads()"
          :class="{ 'btn-primary text-white': currentListType === '도로' }">
          🛣️ 도로
        </button>
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button" @click="showAll()">
          🌐 전체보기
        </button>
      </div>
    </div>
    <!-- 상단 조회 버튼 :: end -->

    <!-- 천안시 전체보기 버튼 :: start -->
    <div class="position-fixed end-0 p-3" style="top: calc(var(--header-h) + 8px); z-index: 2;">
      <button type="button" class="btn btn-secondary border rounded-circle shadow-sm" @click="goToCheonan()"
        style="width: 48px; height: 48px; padding: 0;" title="천안시 전체보기">
        🏙️
      </button>
    </div>
    <!-- 천안시 전체보기 버튼 :: end -->

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
            <div class="rounded"
              style="width: 12px; height: 12px; background-color: #FF0000; border: 2px solid yellow;"></div>
            <span>대피소 건물</span>
          </div>

          <!-- 천안시 건물 -->
          <div class="d-flex align-items-center gap-2">
            <div class="rounded"
              style="width: 12px; height: 12px; background-color: lightgray; border: 1px solid gray;"></div>
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
            <div class="rounded"
              style="width: 12px; height: 12px; background-color: rgba(128, 0, 128, 0.3); border: 1px solid purple;">
            </div>
            <span>지적도</span>
          </div>

          <!-- 주제도 -->
          <div class="d-flex align-items-center gap-2">
            <div class="rounded"
              style="width: 12px; height: 12px; background-color: rgba(0, 255, 255, 0.3); border: 1px solid darkcyan;">
            </div>
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

            <p class="mb-1 text-muted small" v-if="item.facilityType">
              <strong>시설구분:</strong> {{ item.facilityType }}
            </p>

            <p class="mb-1 text-muted small" v-if="item.buildingType">
              <strong>건물용도:</strong> {{ item.buildingType }}
            </p>

            <p class="mb-1 text-muted small" v-if="item.capacity">
              <strong>수용인원:</strong> {{ item.capacity }}명
            </p>

            <p class="mb-1 text-muted small" v-if="item.buildingArea">
              <strong>건축면적:</strong> {{ item.buildingArea }}㎡
            </p>

            <p class="mb-1 text-muted small" v-if="item.totalArea">
              <strong>연면적:</strong> {{ item.totalArea }}㎡
            </p>
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

    // ========================================================================
    // 브이월드 3D 건물 타일셋 추가
    // ========================================================================
    try {
      const vworld3DTileset = await Cesium.Cesium3DTileset.fromUrl(
        'https://xdworld.vworld.kr/3d/middle/0/data/{lod}/{tileid}.json',
        {
          // 브이월드 3D 건물 스타일링
          maximumScreenSpaceError: 16,  // 화질 조절 (낮을수록 고화질, 기본값 16)
        }
      )

      // 3D 타일셋을 씬에 추가
      viewer.scene.primitives.add(vworld3DTileset)

      console.log('[CesiumMap] 브이월드 3D 건물 타일셋 로드 완료')
    } catch (error) {
      console.error('[CesiumMap] 브이월드 3D 건물 로드 실패:', error)
      // 3D 건물 로드 실패해도 계속 진행
    }

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
              font: '5px sans-serif',  // 더 크게
              fillColor: Cesium.Color.YELLOW,  // 노란색 텍스트
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -50),  // 더 위로
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              showBackground: false,         // 4. 배경 박스 제거 (true -> false)
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -20), // 5. 위치를 마커와 가깝게 조정
              // label 설정 내부에 추가
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
              // 아래 옵션은 viewer 설정이나 레이어 수준에서 지원될 때 효과적입니다.

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
              font: 'bold 10px sans-serif',  // 굵게, 크게
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
              material: Cesium.Color.YELLOW.withAlpha(0.10),
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
              material: Cesium.Color.PURPLE.withAlpha(0.1),
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

    // ========================================================================
    // shelter 레이어 (천안시 대피소 98개) - GeoServer에서 가져온 실제 대피소 데이터
    // ========================================================================
    if (layers.shelter && layers.shelter.features) {
      layers.shelter.features.forEach((feature) => {
        if (feature.geometry.type === 'Point') {
          const [lon, lat] = feature.geometry.coordinates
          // GeoServer의 속성명에 따라 다양한 필드명 지원 (name, vt_nm 등)
          const name = feature.properties.name || feature.properties.vt_nm || '대피소'

          // 3D 원기둥 마커로 대피소 위치 표시
          const entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 45),  // 지면에서 45m 높이
            cylinder: {
              length: 90,  // 원기둥 높이 90m (랜드마크처럼 눈에 잘 띄도록)
              topRadius: 12,  // 상단 반지름 12m
              bottomRadius: 12,  // 하단 반지름 12m
              material: Cesium.Color.fromCssColorString('#FF0000'),  // 순수 빨간색 (투명도 없음)
              outline: true,  // 외곽선 표시
              outlineColor: Cesium.Color.YELLOW,  // 노란색 외곽선
              outlineWidth: 4  // 외곽선 두께 4px
            },
            label: {
              text: name,  // 대피소 이름 표시
              font: 'bold 14px sans-serif',  // 굵은 14px 글꼴
              fillColor: Cesium.Color.YELLOW,  // 노란색 텍스트
              outlineColor: Cesium.Color.BLACK,  // 검은색 외곽선
              outlineWidth: 2,  // 텍스트 외곽선 두께
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  // 라벨을 마커 위에 배치
              pixelOffset: new Cesium.Cartesian2(0, -55),  // 원기둥 위로 55px 띄움
              disableDepthTestDistance: Number.POSITIVE_INFINITY,  // 항상 보이게 (다른 객체에 가려지지 않음)
              showBackground: true,  // 배경 박스 표시
              backgroundColor: Cesium.Color.fromCssColorString('#FF0000').withAlpha(0.7),  // 빨간 배경 (70% 투명도)
              backgroundPadding: new Cesium.Cartesian2(7, 5),  // 배경 패딩

              // *** 라벨 겹침 방지 설정 ***
              // scaleByDistance: 카메라 거리에 따라 라벨 크기 조절
              // NearFarScalar(near거리, near배율, far거리, far배율)
              scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 15000, 0.3),
              // 1000m 거리: 100% 크기, 15000m 거리: 30% 크기로 축소

              // distanceDisplayCondition: 특정 거리에서만 라벨 표시
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000)
              // 0m ~ 20000m(20km) 거리에서만 라벨 표시, 그 이상 멀어지면 숨김
            },
            properties: {
              featureData: feature,  // GeoServer에서 가져온 원본 데이터 저장
              layerType: 'shelter'  // 레이어 타입 식별자
            }
          })
          shelterEntities.push(entity)  // 나중에 제거할 수 있도록 배열에 저장

          // *** 바텀시트 리스트에 대피소 정보 추가 ***
          itemsList.push({
            id: feature.properties.gid || feature.properties.objectid || Math.random(),
            name,
            // DB 테이블 컬럼명에 맞게 매핑
            address: feature.properties.a4 || feature.properties.dt_address || '주소 정보 없음',  // A4: 주소
            buildingType: feature.properties.a9 || '정보 없음',  // A9: 건물 용도
            buildingArea: feature.properties.a12 || '정보 없음',  // A12: 건축면적
            totalArea: feature.properties.a13 || '정보 없음',  // A13: 연면적
            capacity: feature.properties.a22 || '정보 없음',  // A22: 수용인원
            facilityType: feature.properties.vt_acmdfclty_se_nm || feature.properties.type || '대피소',  // 시설구분명
            lat,  // 위도
            lon,  // 경도
            properties: feature.properties  // 모든 속성 정보를 저장 (클릭 시 상세 정보 표시용)
          })
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

    // *** 바텀시트 리스트는 shelter(대피소) 정보만 표시 ***
    items.value = itemsList  // itemsList는 위에서 shelter 레이어 데이터만 추가됨
    console.log(`[CesiumMap] 전체 데이터 로드 완료 - 대피소 ${itemsList.length}개`)

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

// ========================================================================
// 클릭 이벤트 핸들러 - 건물/라벨 클릭 시 상세 정보 표시
// ========================================================================
const registerClickHandler = () => {
  viewer.screenSpaceEventHandler.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position)

    if (Cesium.defined(pickedObject) && pickedObject.id) {
      const entity = pickedObject.id

      if (entity.properties && entity.properties.featureData) {
        const feature = entity.properties.featureData.getValue()
        const layerType = entity.properties.layerType.getValue()

        // shelter 레이어 클릭 시
        if (layerType === 'shelter') {
          const [lon, lat] = feature.geometry.coordinates
          const props = feature.properties

          // 바텀시트에 단일 대피소 정보 표시
          currentListType.value = '대피소'
          items.value = [{
            id: props.gid || props.objectid || Math.random(),
            name: props.vt_nm || props.name || '대피소',
            // DB 컬럼명에 맞게 매핑
            address: props.a4 || props.dt_address || '주소 정보 없음',  // A4: 주소
            buildingType: props.a9 || '정보 없음',  // A9: 건물 용도
            buildingArea: props.a12 || '정보 없음',  // A12: 건축면적
            totalArea: props.a13 || '정보 없음',  // A13: 연면적
            capacity: props.a22 || '정보 없음',  // A22: 수용인원
            facilityType: props.vt_acmdfclty_se_nm || props.type || '대피소',  // 시설구분명
            lat,
            lon,
            properties: props  // 모든 속성 저장
          }]

          // 바텀시트 열기
          sheetHeightRatio.value = 1

          // 카메라를 해당 대피소로 이동
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1500),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-45),
              roll: 0
            },
            duration: 2
          })
        }
        // 다른 레이어 클릭 시 (건물, 도로 등)
        else if (feature.geometry.type === 'Point') {
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              feature.geometry.coordinates[0],
              feature.geometry.coordinates[1],
              3000
            ),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-45),
              roll: 0
            },
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
