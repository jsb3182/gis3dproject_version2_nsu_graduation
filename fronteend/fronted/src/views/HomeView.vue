<template>
  <div class="d-flex justify-content-center align-items-center position-relative mt-1"
    style="height: calc(100vh - 140px);">

    <!-- Vworld 지도 -->
    <div id="vmap" class="position-fixed top-0 start-0 w-100" style="height:100dvh; z-index:0; pointer-events:auto;">
    </div>

    <!-- 내 위치 새로고침 버튼 -->
    <div class="position-fixed end-0 p-3" style="top: calc(var(--header-h) + 8px); z-index: 2;">
      <button type="button" class="btn btn-primary border rounded-circle shadow-sm" @click="refreshLocation()"
        :disabled="loadingLocation" style="width: 48px; height: 48px; padding: 0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4m8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- 검색 패널 (왼쪽 상단) -->
    <div class="position-fixed start-0 p-3" style="top: calc(var(--header-h) + 8px); z-index: 2;">
      <div class="card shadow-sm" style="min-width: 320px; max-width: 400px;">
        <div class="card-body">
          <h5 class="card-title mb-3">
            <i class="bi bi-shield-fill-exclamation text-danger"></i>
            민방위 대피소 찾기
          </h5>

          <!-- 내 위치 찾기 버튼 -->
          <div class="d-grid gap-2 mb-3">
            <button class="btn btn-primary" @click="getUserLocation" :disabled="loadingLocation">
              <i class="bi bi-geo-alt-fill"></i>
              {{ loadingLocation ? '위치 확인 중...' : '내 위치 찾기' }}
            </button>
          </div>

          <!-- 현재 위치 표시 -->
          <div v-if="userLocation" class="alert alert-success mb-3 py-2">
            <small>
              <i class="bi bi-geo-fill"></i>
              위도: {{ userLocation.lat.toFixed(6) }}<br>
              경도: {{ userLocation.lon.toFixed(6) }}<br>
              <span v-if="userLocation.accuracy" class="text-muted">
                정확도: ±{{ Math.round(userLocation.accuracy) }}m
              </span>
            </small>
          </div>

          <!-- 검색 반경 -->
          <div class="mb-3">
            <label class="form-label">검색 반경</label>
            <select class="form-select" v-model="selectedRadius" @change="searchShelters" :disabled="!userLocation">
              <option :value="1">1km 이내</option>
              <option :value="2">2km 이내</option>
              <option :value="3">3km 이내</option>
              <option :value="5">5km 이내</option>
            </select>
          </div>

          <!-- 대피소 검색 버튼 -->
          <div class="d-grid gap-2 mb-2">
            <button class="btn btn-success" @click="searchShelters" :disabled="!userLocation || loadingShelters">
              <i class="bi bi-search"></i>
              {{ loadingShelters ? '검색 중...' : '대피소 검색' }}
            </button>
          </div>

          <!-- 대피소 개수 -->
          <div v-if="shelters.length > 0" class="text-muted text-center mb-3">
            <small>총 {{ shelters.length }}개 대피소 발견</small>
          </div>

          <!-- 가장 가까운 대피소 3개 표시 -->
          <div v-if="topShelters.length > 0" class="mt-3">
            <h6 class="text-muted small mb-2">
              <i class="bi bi-map-fill"></i>
              가까운 대피소 TOP 3
            </h6>
            <div class="list-group list-group-flush">
              <div v-for="(shelter, idx) in topShelters" :key="shelter.번호"
                   class="list-group-item list-group-item-action p-2 cursor-pointer shelter-top-card"
                   @click="flyToShelter(shelter)"
                   :class="{ 'bg-light': shelter['번호'] === selectedMarkerId }">
                <div class="d-flex align-items-start">
                  <span class="badge bg-primary me-2">{{ idx + 1 }}</span>
                  <div class="flex-grow-1" style="min-width: 0;">
                    <div class="fw-bold small text-truncate">{{ shelter['시설명'] }}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">
                      <i class="bi bi-geo-alt"></i>
                      {{ (shelter.distance / 1000).toFixed(2) }}km
                      <span class="mx-1">|</span>
                      <i class="bi bi-people-fill"></i>
                      {{ shelter['최대수용인원'] ? Math.round(shelter['최대수용인원']).toLocaleString() : '-' }}명
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      <div class="d-flex justify-content-between align-items-center mb-3 ms-3 me-3 mt-2">
        <div class="d-flex align-items-center gap-2">
          <h5 class="fw-bold mb-0">대피소 리스트</h5>
          <span v-if="shelters.length > 0" class="badge bg-primary">{{ shelters.length }}개</span>
        </div>
      </div>

      <!-- 리스트 스크롤 영역 -->
      <div class="overflow-auto px-3">
        <!-- 대피소 목록 -->
        <div class="card shadow-sm mb-3" v-for="(shelter, index) in shelters" :key="shelter['번호']"
          :ref="el => shelterRefs[shelter['번호']] = el"
          :class="{ 'card-selected-highlight': shelter['번호'] === selectedMarkerId }">
          <div class="card-body" @click="flyToShelter(shelter)">
            <div class="d-flex justify-content-between align-items-start">
              <h6 class="card-title text-bold mb-1">
                <span class="badge bg-primary me-2">{{ index + 1 }}</span>
                {{ shelter['시설명'] }}
              </h6>
            </div>

            <!-- 주소 -->
            <p class="mb-2 text-muted small">
              <i class="bi bi-building"></i>
              {{ shelter['도로명전체주소'] || '주소 정보 없음' }}
            </p>

            <!-- 수용인원 -->
            <div class="mb-2">
              <span class="badge bg-secondary">
                <i class="bi bi-people-fill"></i>
                {{ shelter['최대수용인원'] ? shelter['최대수용인원'].toLocaleString() + '명' : '정보없음' }}
              </span>
            </div>

            <!-- 거리 정보 -->
            <div class="text-muted small d-flex align-items-center mb-3">
              <span><i class="bi bi-geo-alt me-1"></i> {{ (shelter.distance / 1000).toFixed(1) }}km</span>
              <span class="mx-2">|</span>
              <span><i class="bi bi-clock me-1"></i> 도보 {{ Math.ceil(shelter.distance / 1000 / 4) }}분</span>
            </div>
          </div>
        </div>

        <!-- 로딩 -->
        <div v-if="loadingShelters" class="text-center text-muted py-4">
          <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">검색 중...</span>
          </div>
          <div class="mt-2">주변 대피소 검색 중...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { initVworldMap, clearMarkers, addMarkerHospital, setupMarkerClick } from '@/utils/vworldfunction'
import { searchNearbyShelters, getCurrentLocation } from '@/utils/shelterApi'

// ====================================
// Reactive State
// ====================================
let vmap = null
const userLocation = ref(null)
const selectedRadius = ref(2)
const shelters = ref([])
const loadingLocation = ref(false)
const loadingShelters = ref(false)

// 마커 관련
const selectedMarkerId = ref(null)
const shelterRefs = ref({})

// 바텀시트 상태
const bottomSheet = ref(null)
const isDragging = ref(false)
const sheetHeightRatio = ref(0)
const dragStart = ref({ y: 0, ratio: 0 })

const MAX_SHEET_HEIGHT = window.innerHeight * 0.8
const MIN_SHEET_HEIGHT = 220

const sheetY = computed(() => (MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT) * (1 - sheetHeightRatio.value))
const sheetStyle = computed(() => ({
  transition: isDragging.value ? 'none' : 'transform 0.3s ease-out',
  transform: `translateY(${sheetY.value}px)`,
  height: `${MAX_SHEET_HEIGHT}px`,
  bottom: '0px',
  top: 'auto',
  willChange: 'transform'
}))

// TOP 3 가까운 대피소
const topShelters = computed(() => {
  return shelters.value.slice(0, 3)
})

// ====================================
// 지도 초기화
// ====================================
const initMap = async () => {
  console.log('🚀 initMap 함수 시작')

  // VWorld 라이브러리 로드 대기
  await new Promise((resolve, reject) => {
    console.log('🔍 VWorld 라이브러리 로드 확인 중...')
    let attempts = 0
    const maxAttempts = 100 // 10초

    const checkVworld = setInterval(() => {
      attempts++

      if (window.vw && window.vw.ol3 && window.ol) {
        console.log('✅ VWorld 라이브러리 로드 완료')
        clearInterval(checkVworld)
        resolve()
      } else if (attempts >= maxAttempts) {
        console.error('❌ VWorld 라이브러리 로드 타임아웃')
        clearInterval(checkVworld)
        reject(new Error('VWorld 라이브러리를 로드할 수 없습니다.'))
      }
    }, 100)
  })

  try {
    // 기본 위치 (서울)
    console.log('📍 기본 위치 설정: 서울 시청')
    let centerCoords = ol.proj.transform([126.9780, 37.5665], 'EPSG:4326', 'EPSG:3857')

    // 지도 초기화
    console.log('🗺️ VWorld 지도 초기화 시작...')
    vmap = initVworldMap({
      containerId: 'vmap',
      defaultCenter: centerCoords,
      defaultZoom: 12
    })

    if (!vmap) {
      throw new Error('vmap 초기화 실패: initVworldMap이 null을 반환했습니다.')
    }

    // 마커 클릭 이벤트
    setupMarkerClick(onMarkerClick)

    console.log('✅ 브이월드 지도 초기화 완료')
  } catch (error) {
    console.error('❌ 지도 초기화 실패:', error)
    console.error('에러 상세:', error.message)
    console.error('에러 스택:', error.stack)
    alert('지도를 불러오는데 실패했습니다. VWorld API가 로드되지 않았거나 네트워크 문제가 있을 수 있습니다.')
  }
}

// ====================================
// GPS 위치
// ====================================
const getUserLocation = async () => {
  loadingLocation.value = true

  try {
    const location = await getCurrentLocation()

    userLocation.value = location
    console.log('✅ 사용자 위치:', location.lat, location.lon)
    console.log('📍 정확도: ±' + Math.round(location.accuracy) + 'm')

    // 지도 중심 이동
    if (vmap) {
      const view = vmap.getView()
      const center = ol.proj.transform([location.lon, location.lat], 'EPSG:4326', 'EPSG:3857')
      view.setCenter(center)
      view.setZoom(15)
    }

    // 사용자 위치 마커
    addUserMarker(location.lon, location.lat)

    // 자동 검색
    await searchShelters()

  } catch (error) {
    console.error('❌ 위치 가져오기 실패:', error)
    alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.')
  } finally {
    loadingLocation.value = false
  }
}

const addUserMarker = (lon, lat) => {
  addMarkerHospital(lon, lat, {
    iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="12" fill="#FF0000" stroke="#FFFFFF" stroke-width="4"/>
        <circle cx="20" cy="20" r="5" fill="#FFFFFF"/>
      </svg>
    `),
    scale: 1.0,
    anchor: [0.5, 0.5],
    isUserLocation: true
  })
}

// ====================================
// 대피소 검색
// ====================================
const searchShelters = async () => {
  if (!userLocation.value) {
    alert('먼저 위치를 확인해주세요.')
    return
  }

  loadingShelters.value = true

  try {
    const { lat, lon } = userLocation.value
    const results = await searchNearbyShelters(lat, lon, selectedRadius.value)

    shelters.value = results
    console.log(`✅ ${shelters.value.length}개 대피소 검색 완료`)

    // 마커 표시
    displaySheltersOnMap()

    // 바텀시트 올리기
    if (shelters.value.length > 0) {
      sheetHeightRatio.value = 0.5
    }

  } catch (error) {
    console.error('❌ 대피소 검색 실패:', error)
    alert('대피소 정보를 가져오는데 실패했습니다.')
    shelters.value = []
  } finally {
    loadingShelters.value = false
  }
}

const displaySheltersOnMap = () => {
  console.log('🗺️ displaySheltersOnMap 호출됨')
  console.log('shelters.value 개수:', shelters.value.length)

  if (shelters.value.length > 0) {
    console.log('첫 번째 대피소 데이터:', shelters.value[0])
  }

  clearMarkers()

  // 사용자 위치 마커 다시 표시
  if (userLocation.value) {
    addUserMarker(userLocation.value.lon, userLocation.value.lat)
  }

  let successCount = 0
  let failCount = 0

  shelters.value.forEach((shelter, index) => {
    const marker = addMarkerHospital(shelter.lon, shelter.lat, {
      iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
          <path d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30C40 9 31 0 20 0z" fill="#0d6efd"/>
          <circle cx="20" cy="20" r="10" fill="#FFFFFF"/>
          <text x="20" y="26" font-size="14" text-anchor="middle" fill="#0d6efd" font-weight="bold">${index + 1}</text>
        </svg>
      `),
      scale: 1.0,
      anchor: [0.5, 1],
      shelterId: shelter['번호']
    })

    if (marker) {
      successCount++
    } else {
      failCount++
      console.error(`마커 추가 실패 - ${shelter['시설명']}`)
    }
  })

  console.log(`✅ 마커 추가 결과: 성공 ${successCount}개, 실패 ${failCount}개`)
}

const flyToShelter = (shelter) => {
  if (!vmap) return

  const view = vmap.getView()
  const center = ol.proj.transform([shelter.lon, shelter.lat], 'EPSG:4326', 'EPSG:3857')

  view.animate({
    center: center,
    zoom: 17,
    duration: 1000
  })
}

const refreshLocation = async () => {
  await getUserLocation()
}

// 마커 클릭
const onMarkerClick = (shelterId) => {
  selectedMarkerId.value = shelterId
  scrollCard(shelterId)
}

const scrollCard = (id) => {
  nextTick(() => {
    const el = shelterRefs.value[id]
    if (el) {
      const container = el.closest('.overflow-auto.px-3')
      if (container) {
        container.scrollTo({
          top: el.offsetTop - container.offsetTop - 10,
          behavior: 'smooth'
        })
      }
    }
  })
}

// ====================================
// 바텀시트 제스처
// ====================================
const onTouchStart = e => {
  isDragging.value = true
  dragStart.value = { y: e.touches[0].clientY, ratio: sheetHeightRatio.value }
}

const onTouchMove = e => {
  if (!isDragging.value) return
  const deltaY = e.touches[0].clientY - dragStart.value.y
  const deltaRatio = -deltaY / (MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT)
  let newRatio = dragStart.value.ratio + deltaRatio
  sheetHeightRatio.value = Math.max(0, Math.min(1, newRatio))
}

const onTouchEnd = () => {
  isDragging.value = false
  sheetHeightRatio.value = sheetHeightRatio.value > 0.5 ? 1 : 0
}

const toggleSheet = () => {
  sheetHeightRatio.value = sheetHeightRatio.value > 0.5 ? 0 : 1
}

// ====================================
// Lifecycle
// ====================================
onMounted(() => {
  console.log('📌 onMounted 실행')
  initMap()
    .then(() => {
      console.log('✅ 지도 초기화 완료')
    })
    .catch(err => {
      console.error('❌ onMounted에서 지도 초기화 실패:', err)
    })
})

onBeforeUnmount(() => {
  if (vmap) {
    vmap = null
  }
})
</script>

<style scoped>
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

.card-selected-highlight {
  background-color: #e2ebff;
  border-color: #0d6efd !important;
  box-shadow: 0 4px 12px rgba(13, 110, 253, .3);
  transform: scale(1.01);
}

.overflow-auto {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
}

.shelter-top-card {
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.shelter-top-card:hover {
  background-color: #f0f6ff !important;
  border-color: #0d6efd;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
