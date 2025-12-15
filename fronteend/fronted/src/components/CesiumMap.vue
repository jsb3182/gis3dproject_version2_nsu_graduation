<template>
  <div class="cesium-container">
    <div ref="cesiumContainer" class="cesium-viewer"></div>

    <!-- 로딩 오버레이 -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-light mt-2">지도를 불러오는 중...</p>
    </div>

    <!-- 대피소 정보 패널 -->
    <div v-if="selectedShelter" class="info-panel card shadow">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h6 class="mb-0">대피소 정보</h6>
        <button
          type="button"
          class="btn-close btn-close-white"
          @click="closeShelterInfo"
        ></button>
      </div>
      <div class="card-body">
        <h6>{{ selectedShelter.properties.name || '이름 정보 없음' }}</h6>
        <p class="mb-1">
          <strong>주소:</strong>
          {{ selectedShelter.properties.address || '주소 정보 없음' }}
        </p>
        <p class="mb-1">
          <strong>수용인원:</strong>
          {{ selectedShelter.properties.capacity || '정보 없음' }}명
        </p>
        <p class="mb-1">
          <strong>면적:</strong>
          {{ selectedShelter.properties.area || '정보 없음' }}㎡
        </p>
        <p class="mb-0">
          <strong>좌표:</strong>
          {{ selectedShelter.geometry.coordinates[1].toFixed(6) }},
          {{ selectedShelter.geometry.coordinates[0].toFixed(6) }}
        </p>
      </div>
    </div>

    <!-- 컨트롤 패널 -->
    <div class="control-panel">
      <div class="btn-group-vertical" role="group">
        <button
          class="btn btn-primary btn-sm"
          @click="goToMyLocation"
          title="내 위치로 이동"
        >
          📍 내 위치
        </button>

        <button
          class="btn btn-secondary btn-sm"
          @click="goToCheonan"
          title="천안시 전체 보기"
        >
          🏙️ 천안시
        </button>

        <button
          class="btn btn-success btn-sm"
          @click="loadShelters"
          title="대피소 데이터 새로고침"
        >
          🔄 새로고침
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as Cesium from 'cesium'
import geoService from '@/services/geoService'

// Cesium Ion 토큰
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZWJiMDRjNi05MDZlLTRiOWMtYTU5OC0yY2Q2MGM2NzE4ODMiLCJpZCI6MzY3MzEyLCJpYXQiOjE3NjUwODQwMTV9.Qwe6fyt1Ooat6PUTnulbjvQXSFAYmL0J3kPc83FG7gA'

// 반응형 데이터
const cesiumContainer = ref(null)
let viewer = null
const loading = ref(true)
const selectedShelter = ref(null)
const shelterEntities = []

// 천안시 중심 좌표
const CHEONAN_CENTER = {
  lon: 127.1139,
  lat: 36.8151,
  height: 15000
}

// Cesium Viewer 초기화
const initCesium = async () => {
  try {
    loading.value = true

    viewer = new Cesium.Viewer(cesiumContainer.value, {
      baseLayer: false,
      animation: false,
      timeline: false,
      fullscreenButton: true,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: Cesium.IonResource.fromAssetId(1)
      })
    })

    // VWorld 영상지도 추가
    viewer.imageryLayers.addImageryProvider(
      new Cesium.WebMapServiceImageryProvider({
        url: 'http://api.vworld.kr/req/wms',
        layers: 'Satellite',
        parameters: {
          service: 'WMS',
          version: '1.3.0',
          request: 'GetMap',
          transparent: 'false',
          format: 'image/jpeg',
          key: '29A4D1FB-AD18-35A5-9E70-8676253EFB4C'
        }
      })
    )

    // VWorld 하이브리드 레이어 추가
    viewer.imageryLayers.addImageryProvider(
      new Cesium.WebMapServiceImageryProvider({
        url: 'http://api.vworld.kr/req/wms',
        layers: 'Hybrid',
        parameters: {
          service: 'WMS',
          version: '1.3.0',
          request: 'GetMap',
          transparent: 'true',
          format: 'image/png',
          key: '29A4D1FB-AD18-35A5-9E70-8676253EFB4C'
        }
      })
    )

    goToCheonan()
    await loadShelters()
    registerClickHandler()

  } catch (error) {
    console.error('[CesiumMap] 초기화 실패:', error)
    alert('지도를 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 대피소 데이터 로드
const loadShelters = async () => {
  try {
    const layers = await geoService.getAllLayers()

    // 기존 엔티티 제거
    shelterEntities.forEach(entity => {
      viewer.entities.remove(entity)
    })
    shelterEntities.length = 0

    // 1. chspoint (대피소 포인트) - 빨간색 3D 원기둥
    if (layers.chspoint && layers.chspoint.features) {
      layers.chspoint.features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
          const [lon, lat] = feature.geometry.coordinates

          const entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
            cylinder: {
              length: 30,
              topRadius: 5,
              bottomRadius: 5,
              material: Cesium.Color.RED.withAlpha(0.7),
              outline: true,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2
            },
            label: {
              text: feature.properties.name || '대피소',
              font: '14px sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -35),
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            properties: {
              featureData: feature,
              layerType: 'chspoint'
            }
          })

          shelterEntities.push(entity)
        }
      })
      console.log(`[CesiumMap] chspoint: ${layers.chspoint.features.length}개 로드`)
    }

    // 2. build (건물) - 파란색 3D
    if (layers.build && layers.build.features) {
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
        }
      })
      console.log(`[CesiumMap] build: ${layers.build.features.length}개 로드`)
    }

    // 3. link (도로) - 노란색
    if (layers.link && layers.link.features) {
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
        }
      })
      console.log(`[CesiumMap] link: ${layers.link.features.length}개 로드`)
    }

    console.log(`[CesiumMap] 총 ${shelterEntities.length}개 데이터 로드 완료`)

  } catch (error) {
    console.error('[CesiumMap] 레이어 로드 실패:', error)
    alert('GeoServer 데이터를 불러오는데 실패했습니다. GeoServer가 실행 중인지 확인하세요.')
  }
}

// 클릭 이벤트 핸들러
const registerClickHandler = () => {
  viewer.screenSpaceEventHandler.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position)

    if (Cesium.defined(pickedObject) && pickedObject.id) {
      const entity = pickedObject.id

      if (entity.properties && entity.properties.featureData) {
        selectedShelter.value = entity.properties.featureData.getValue()

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            selectedShelter.value.geometry.coordinates[0],
            selectedShelter.value.geometry.coordinates[1],
            5000
          ),
          duration: 2
        })
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

// 대피소 정보 패널 닫기
const closeShelterInfo = () => {
  selectedShelter.value = null
}

// 천안시로 이동
const goToCheonan = () => {
  if (!viewer) return

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      CHEONAN_CENTER.lon,
      CHEONAN_CENTER.lat,
      CHEONAN_CENTER.height
    ),
    duration: 2
  })
}

// 내 위치로 이동
const goToMyLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lon = position.coords.longitude
        const lat = position.coords.latitude

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, 5000),
          duration: 2
        })

        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
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
            pixelOffset: new Cesium.Cartesian2(0, -25)
          }
        })
      },
      (error) => {
        console.error('[CesiumMap] 위치 가져오기 실패:', error)
        alert('위치 정보를 가져올 수 없습니다.')
      }
    )
  } else {
    alert('이 브라우저는 위치 정보를 지원하지 않습니다.')
  }
}

// 라이프사이클
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

.info-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 350px;
  max-width: 90vw;
  z-index: 100;
}

.control-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
}

@media (max-width: 768px) {
  .info-panel {
    top: 10px;
    right: 10px;
    width: calc(100% - 20px);
  }

  .control-panel {
    top: 10px;
    left: 10px;
  }
}
</style>
