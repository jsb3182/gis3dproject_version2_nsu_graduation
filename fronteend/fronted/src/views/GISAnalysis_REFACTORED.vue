<!--
  ============================================================================
  GIS 분석 페이지 (리팩토링 버전)
  ============================================================================

  Cesium 3D 지도를 사용하여 천안시의 대피소, 건물, 도로 등을 시각화합니다.

  주요 기능:
  - Cesium 3D 지도 렌더링
  - 대피소, 건물, 도로, 노드 등 GIS 레이어 표시
  - 바텀시트를 통한 리스트 조회
  - 사용자 위치 기반 거리 계산
  - 레이어별 필터링 및 정렬

  리팩토링 내용:
  - 1335줄 → 약 400줄로 감소
  - 설정값은 cesiumConfig.js로 분리
  - 초기화 로직은 cesiumInit.js로 분리
  - 레이어 렌더링은 layerRenderer.js로 분리
  - 유틸리티 함수는 gisUtils.js로 분리
  - 바텀시트 로직은 useBottomSheet.js composable로 분리
  ============================================================================
-->

<template>
  <div class="d-flex justify-content-center align-items-center position-relative mt-1"
    style="height: calc(100vh - 140px);">

    <!-- ========================================================================
         Cesium 3D 지도 컨테이너
         ======================================================================== -->
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

    <!-- ========================================================================
         상단 레이어 선택 버튼
         ======================================================================== -->
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

    <!-- ========================================================================
         천안시 전체보기 버튼 (우측 상단)
         ======================================================================== -->
    <div class="position-fixed end-0 p-3" style="top: calc(var(--header-h) + 8px); z-index: 2;">
      <button type="button" class="btn btn-secondary border rounded-circle shadow-sm"
        @click="goToCheonan()"
        style="width: 48px; height: 48px; padding: 0;" title="천안시 전체보기">
        🏙️
      </button>
    </div>

    <!-- ========================================================================
         범례 (Legend)
         ======================================================================== -->
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

  </div>

  <!-- ========================================================================
       바텀시트 - 데이터 리스트 표시
       ======================================================================== -->
  <div class="position-fixed start-0 end-0 bg-white rounded-top-4 shadow-lg"
    :style="sheetStyle"
    ref="bottomSheet"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    style="z-index: 2; padding-bottom: 150px;">

    <!-- 그립 핸들 -->
    <div class="pt-3 d-flex justify-content-center" @click="toggleSheet" style="cursor: grab;">
      <div class="bg-secondary-subtle rounded-pill w-25" style="height:5px;"></div>
    </div>

    <!-- 내용 -->
    <div class="d-flex flex-column" style="height: 100%;">
      <!-- 타이틀 -->
      <div class="d-flex justify-content-between align-items-center mb-3 ms-2 me-2">
        <!-- 왼쪽: 타이틀 -->
        <div class="d-flex align-items-center gap-2">
          <h5 class="fw-bold mb-0">{{ currentListType }} 리스트</h5>
          <span v-if="items.length > 0" class="badge bg-white text-black">{{ items.length }}개</span>
        </div>

        <!-- 오른쪽: 정렬 드롭다운 -->
        <div class="dropdown">
          <button class="btn dropdown-toggle w-100 d-flex align-items-center justify-content-between
                    bg-white border rounded-pill px-4 fw-bold"
            type="button" data-bs-toggle="dropdown" aria-expanded="false"
            style="height: 42px; font-size: 15px; padding-right: 18px !important;">
            <div class="d-flex align-items-center gap-2">
              <template v-if="currentSort === 'name'">
                📝 이름순
              </template>
              <template v-else>
                📏 거리순
              </template>
            </div>
          </button>

          <!-- 정렬 옵션 -->
          <ul class="dropdown-menu w-100 rounded-4 shadow-sm p-0 overflow-hidden" style="min-width: auto;">
            <li v-if="currentSort !== 'distance'">
              <button class="dropdown-item d-flex align-items-center gap-3 py-2 fw-bold"
                style="font-size: 15px;" @click="changeSort('distance')">
                📏 거리순
              </button>
            </li>
            <li v-if="currentSort !== 'name'">
              <button class="dropdown-item d-flex align-items-center gap-3 py-2 fw-bold"
                style="font-size: 15px;" @click="changeSort('name')">
                📝 이름순
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 리스트 스크롤 영역 -->
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

            <p class="mb-1 text-muted small" v-if="item.buildingArea">
              <strong>건축면적:</strong> {{ item.buildingArea }}㎡
            </p>
          </div>
        </div>

        <!-- 데이터 없음 -->
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
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as Cesium from 'cesium'

// ============================================================================
// 유틸리티 임포트
// ============================================================================
import geoService from '@/services/geoService'
import { CESIUM_ION_TOKEN, CHEONAN_CENTER, BOTTOM_SHEET_CONFIG } from '@/utils/cesium/cesiumConfig'
import {
  createCesiumViewer,
  loadVworld3DTileset,
  flyToPosition,
  getUserLocation
} from '@/utils/cesium/cesiumInit'
import { renderLayer, clearEntities } from '@/utils/cesium/layerRenderer'
import { sortByDistance, sortByName } from '@/utils/cesium/gisUtils'
import { useBottomSheet } from '@/composables/useBottomSheet'

// Cesium Ion 토큰 설정
Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN

// ============================================================================
// 상태 관리
// ============================================================================
const cesiumContainer = ref(null)  // Cesium 컨테이너 DOM 참조
let viewer = null                   // Cesium Viewer 인스턴스
const loading = ref(true)           // 로딩 상태
const items = ref([])               // 바텀시트에 표시할 아이템 리스트
const currentListType = ref('대피소')  // 현재 선택된 레이어 타입
const currentSort = ref('distance') // 현재 정렬 방식 ('distance' | 'name')
const shelterEntities = []          // 렌더링된 엔티티 저장 배열
const userLocation = ref(null)      // 사용자 위치 { lat, lon }

// ============================================================================
// 바텀시트 Composable
// ============================================================================
const {
  sheetStyle,
  toggleSheet,
  openSheet,
  onTouchStart,
  onTouchMove,
  onTouchEnd
} = useBottomSheet({
  maxHeightRatio: 0.8,
  minHeight: BOTTOM_SHEET_CONFIG.minHeight
})

// ============================================================================
// Cesium 초기화
// ============================================================================
/**
 * Cesium Viewer를 초기화하고 기본 레이어를 로드합니다.
 */
const initCesium = async () => {
  try {
    loading.value = true

    // Viewer 생성
    viewer = await createCesiumViewer(cesiumContainer.value)

    // 브이월드 3D 건물 타일셋 로드
    await loadVworld3DTileset(viewer)

    // 천안시로 카메라 이동
    goToCheonan()

    // 사용자 위치 가져오기
    console.log('[GISAnalysis] 사용자 위치 가져오기 시작')
    userLocation.value = await getUserLocation()

    // 전체 레이어 표시
    console.log('[GISAnalysis] 전체 레이어 표시')
    await showAll()

    // 클릭 이벤트 등록
    registerClickHandler()

    console.log('[GISAnalysis] ✅ 초기화 완료')

  } catch (error) {
    console.error('[GISAnalysis] ❌ 초기화 실패:', error)
    alert('3D 지도를 불러오는데 실패했습니다: ' + error.message)
  } finally {
    loading.value = false
  }
}

// ============================================================================
// 레이어 표시 함수들
// ============================================================================

/**
 * 대피소만 표시
 */
const showShelters = async () => {
  try {
    currentListType.value = '대피소'
    clearEntities(viewer, shelterEntities)

    const layers = await geoService.getAllLayers()

    // shelter 레이어 렌더링
    if (layers.shelter) {
      const { entities, items: layerItems } = renderLayer(
        viewer,
        layers.shelter,
        'shelter',
        userLocation.value
      )
      shelterEntities.push(...entities)
      items.value = layerItems
    }

    console.log(`[GISAnalysis] 대피소 ${items.value.length}개 로드`)
  } catch (error) {
    console.error('[GISAnalysis] 대피소 로드 실패:', error)
    alert('대피소 데이터를 불러오는데 실패했습니다.')
  }
}

/**
 * 건물만 표시
 */
const showBuildings = async () => {
  try {
    currentListType.value = '건물'
    clearEntities(viewer, shelterEntities)

    const layers = await geoService.getAllLayers()

    // 건물 레이어 렌더링
    if (layers.build) {
      const { entities } = renderLayer(
        viewer,
        layers.build,
        'building',
        null,
        {
          color: Cesium.Color.BLUE,
          alpha: 0.5,
          outlineColor: Cesium.Color.BLUE,
          extrudedHeight: 15
        }
      )
      shelterEntities.push(...entities)

      // 간단한 아이템 리스트 생성
      items.value = layers.build.features.map(f => ({
        id: f.properties.id || Math.random(),
        name: f.properties.name || '건물'
      }))
    }

    console.log(`[GISAnalysis] 건물 ${items.value.length}개 로드`)
  } catch (error) {
    console.error('[GISAnalysis] 건물 로드 실패:', error)
  }
}

/**
 * 도로만 표시
 */
const showRoads = async () => {
  try {
    currentListType.value = '도로'
    clearEntities(viewer, shelterEntities)

    const layers = await geoService.getAllLayers()

    // 도로 레이어 렌더링
    if (layers.link) {
      const { entities } = renderLayer(
        viewer,
        layers.link,
        'road',
        null,
        {
          width: 5,
          color: Cesium.Color.YELLOW,
          alpha: 0.8
        }
      )
      shelterEntities.push(...entities)

      // 간단한 아이템 리스트 생성
      items.value = layers.link.features.map(f => ({
        id: f.properties.id || Math.random(),
        name: f.properties.name || '도로'
      }))
    }

    console.log(`[GISAnalysis] 도로 ${items.value.length}개 로드`)
  } catch (error) {
    console.error('[GISAnalysis] 도로 로드 실패:', error)
  }
}

/**
 * 전체 레이어 표시
 */
const showAll = async () => {
  try {
    console.log('[GISAnalysis] 전체 레이어 로드 시작')
    currentListType.value = '전체'
    clearEntities(viewer, shelterEntities)

    const layers = await geoService.getAllLayers()
    const allItems = []

    // 대피소 (shelter) - 빨간 원기둥
    if (layers.shelter) {
      const { entities, items: shelterItems } = renderLayer(
        viewer,
        layers.shelter,
        'shelter',
        userLocation.value
      )
      shelterEntities.push(...entities)
      allItems.push(...shelterItems)
    }

    // 천안시 건물 (chbuildclip) - 회색 3D
    if (layers.chbuildclip) {
      const { entities } = renderLayer(
        viewer,
        layers.chbuildclip,
        'building',
        null,
        {
          color: Cesium.Color.LIGHTGRAY,
          alpha: 0.8,
          outlineColor: Cesium.Color.DARKGRAY,
          extrudedHeight: 30
        }
      )
      shelterEntities.push(...entities)
    }

    // 도로 (link) - 노란색 선
    if (layers.link) {
      const { entities } = renderLayer(
        viewer,
        layers.link,
        'road',
        null,
        {
          width: 3,
          color: Cesium.Color.YELLOW,
          alpha: 0.1
        }
      )
      shelterEntities.push(...entities)
    }

    // 노드 (node) - 파란색 점
    if (layers.node) {
      const { entities } = renderLayer(viewer, layers.node, 'node')
      shelterEntities.push(...entities)
    }

    // 일반 건물 (build) - 밝은 회색
    if (layers.build) {
      const { entities } = renderLayer(
        viewer,
        layers.build,
        'building',
        null,
        {
          color: Cesium.Color.WHITESMOKE,
          alpha: 0.7,
          outlineColor: Cesium.Color.GRAY,
          extrudedHeight: 25
        }
      )
      shelterEntities.push(...entities)
    }

    // 지적도 (chmergr) - 보라색
    if (layers.chmergr) {
      const { entities } = renderLayer(
        viewer,
        layers.chmergr,
        'building',
        null,
        {
          color: Cesium.Color.PURPLE,
          alpha: 0.1,
          outlineColor: Cesium.Color.PURPLE,
          extrudedHeight: 5
        }
      )
      shelterEntities.push(...entities)
    }

    // 주제도 (thematicmerge) - 청록색
    if (layers.thematicmerge) {
      const { entities } = renderLayer(
        viewer,
        layers.thematicmerge,
        'building',
        null,
        {
          color: Cesium.Color.CYAN,
          alpha: 0.6,
          outlineColor: Cesium.Color.DARKCYAN,
          extrudedHeight: 8
        }
      )
      shelterEntities.push(...entities)
    }

    // 바텀시트에는 대피소 정보만 표시
    items.value = allItems

    console.log(`[GISAnalysis] 전체 데이터 로드 완료 - 대피소 ${allItems.length}개`)

  } catch (error) {
    console.error('[GISAnalysis] 전체 로드 실패:', error)
  }
}

// ============================================================================
// 클릭 이벤트 핸들러
// ============================================================================
/**
 * 지도 클릭 시 해당 객체의 정보를 바텀시트에 표시합니다.
 */
const registerClickHandler = () => {
  viewer.screenSpaceEventHandler.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position)

    if (Cesium.defined(pickedObject) && pickedObject.id) {
      const entity = pickedObject.id

      if (entity.properties && entity.properties.featureData) {
        const feature = entity.properties.featureData.getValue()
        const layerType = entity.properties.layerType.getValue()

        // shelter 레이어 클릭 시
        if (layerType === 'shelter' && feature.geometry.type === 'Point') {
          const [lon, lat] = feature.geometry.coordinates
          const props = feature.properties

          // 바텀시트에 단일 대피소 정보 표시
          currentListType.value = '대피소'
          items.value = [{
            id: props.gid || props.objectid || Math.random(),
            name: props.vt_nm || props.name || '대피소',
            address: props.a4 || props.dt_address || '주소 정보 없음',
            buildingType: props.a9 || '정보 없음',
            buildingArea: props.a12 || '정보 없음',
            totalArea: props.a13 || '정보 없음',
            facilityType: props.vt_acmdfclty_se_nm || props.type || '대피소',
            lat,
            lon,
            properties: props
          }]

          // 바텀시트 열기
          openSheet()

          // 카메라 이동
          flyToPosition(viewer, { lon, lat, height: 1500 }, -45, 2)
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 천안시 중심으로 카메라 이동
 */
const goToCheonan = () => {
  if (!viewer) return
  flyToPosition(viewer, CHEONAN_CENTER, -45, 2)
}

/**
 * 특정 아이템으로 카메라 이동
 */
const flyToItem = (item) => {
  if (item.lat && item.lon && viewer) {
    flyToPosition(viewer, { lon: item.lon, lat: item.lat, height: 1500 }, -45, 2)
  }
}

/**
 * 정렬 방식 변경
 */
const changeSort = (type) => {
  currentSort.value = type
  if (type === 'distance' && userLocation.value) {
    items.value = sortByDistance(items.value, userLocation.value)
  } else {
    items.value = sortByName(items.value)
  }
}

// ============================================================================
// 라이프사이클 훅
// ============================================================================
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
/* Cesium 컨테이너 스타일 */
.cesium-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.cesium-viewer {
  width: 100%;
  height: 100%;
}

/* 로딩 오버레이 */
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

/* 카드 기본/호버/클릭 스타일 */
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

/* 상단 버튼 포커스 스타일 */
.top-button:focus {
  background-color: #0d6efd;
  box-shadow: 0 3px 10px rgba(0, 0, 0, .15);
}

/* 드롭다운 화살표 여백 */
.dropdown-toggle::after {
  margin-left: 8px !important;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .top-button {
    font-size: 14px;
    padding: 4px 8px !important;
  }
}
</style>
