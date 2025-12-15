<template>
  <div class="d-flex justify-content-center align-items-center position-relative mt-1"
    style="height: calc(100vh - 140px); ">

    <!-- 지도 :: start -->
    <div id="map_div" class="position-fixed top-0 start-0 w-100"
      style="height:100dvh; z-index:0;  pointer-events:auto;"></div>
    <!-- 지도 :: end -->

    <!-- 상단 조회 버튼 :: start -->
    <div class="position-fixed start-0 p-3" style="top: calc(var(--header-h) + 8px); z-index: 2;">
      <div class="pe-auto">
        <button type="button" class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button"
          data-bs-toggle="modal" data-bs-target="#departmentModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
            <path fill="currentColor" d="m17 21l1.8 1.77c.5.5 1.2.1 1.2-.49V18l2.8-3.4A1 1 0 0 0 22 13h-7c-.8 0-1.3 1-.8 1.6L17 18zm-5-10h8V3a2 2 0 0 0-2-2H4c-1.1 0-2 .9-2 2v12a2 2 0 0 0 2 2h9.42L12 15zm0-6h6v4h-6zm-2 10H4v-4h6zm0-6H4V5h6z"/>
          </svg> 진료과
        </button>
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button" title="달빛어린이병원"
          @click="showMoonlight()">
          🌙 달빛어린이병원
        </button>
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button" title="소아과"
          @click="showPediatric()">
          🧒 소아청소년과
        </button>
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button" title="약국"
          @click="showPharmacy()">
          <i class="bi bi-capsule"></i> 약국
        </button>
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button" title="AED"
          @click="showAED()">
          ⚡ AED
        </button>
      </div>
    </div>
    <!-- 상단 조회 버튼 :: end -->

    <!-- 내 위치 새로고침 버튼 :: start -->
    <div class="position-fixed end-0 p-3" style="top: calc(var(--header-h) + 8px); z-index: 2;">
      <button type="button" class="btn btn-primary border rounded-circle shadow-sm" @click="refreshLocation()"
        style="width: 48px; height: 48px; padding: 0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4m8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7" />
        </svg>
      </button>
    </div>
    <!-- 내 위치 새로고침 버튼 :: end -->

  </div>
  <!-- 바텀시트 -->
  <div class="position-fixed start-0 end-0 bg-white  rounded-top-4 shadow-lg " :style="sheetStyle" ref="bottomSheet"
    @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd"
    style="z-index: 2; padding-bottom: 150px;">
    <!-- 그립 -->
    <div class="pt-3 d-flex justify-content-center" @click="toggleSheet" style="cursor: grab;">
      <div class="bg-secondary-subtle rounded-pill w-25" style="height:5px;"></div>
    </div>
    <div class="d-flex justify-content-center" @click="toggleSheet"></div>

    <!-- 내용 -->
    <div class="d-flex flex-column" style="height: 100%;">
      <!-- 상단 라인 -->
      <div class="d-flex align-items-center justify-content-between gap-2 mb-3 ms-2 me-2 flex-shrink-0">
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <div class="d-flex flex-wrap gap-1" v-if="selectedDepartments.length">
            <span v-for="dept in selectedDepartments" :key="dept"
              class="badge text-bg-primary rounded-pill d-inline-flex align-items-center">
              {{ dept }}
              <button type="button" class="btn-close btn-close-white btn-sm ms-1" aria-label="삭제"
                @click="removeDepartment(dept)" style="transform: scale(.8);"></button>
            </span>
          </div>
        </div>
      </div>

      <!-- 타이틀 -->
      <div class="d-flex justify-content-between align-items-center mb-3 ms-2 me-2">
        <!-- 왼쪽 -->
        <div class="d-flex align-items-center gap-2">
          <h5 class="fw-bold mb-0">{{ currentListType }} 리스트</h5>
          <span v-if="hospitals.length > 0" class="badge bg-white text-black">{{ hospitals.length }}개</span>
        </div>

        <!-- 오른쪽: 버튼 그룹 -->
        <div class="dropdown">
          <button class="btn dropdown-toggle w-100 d-flex align-items-center justify-content-between 
                    bg-white border rounded-pill px-4 fw-bold" type="button" data-bs-toggle="dropdown"
            aria-expanded="false" style="height: 42px; font-size: 15px; padding-right: 18px !important;">

            <div class="d-flex align-items-center gap-2">
              <!-- 현재 선택된 항목 표시 -->
              <template v-if="currentSort === 'time'">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m4.3 13.2L11 12.3V7h1.5v4.4l4.5 2.5z" />
                </svg>
                시간순
              </template>

              <template v-else>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M6.5 8.11c-.89 0-1.61-.72-1.61-1.61A1.61 1.61 0 0 1 6.5 4.89c.89 0 1.61.72 1.61 1.61A1.61 1.61 0 0 1 6.5 8.11M6.5 2C4 2 2 4 2 6.5c0 3.37 4.5 8.36 4.5 8.36S11 9.87 11 6.5C11 4 9 2 6.5 2m11 6.11a1.61 1.61 0 0 1-1.61-1.61a1.609 1.609 0 1 1 3.22 0a1.61 1.61 0 0 1-1.61 1.61m0-6.11C15 2 13 4 13 6.5c0 3.37 4.5 8.36 4.5 8.36S22 9.87 22 6.5C22 4 20 2 17.5 2m0 14c-1.27 0-2.4.8-2.82 2H9.32a3 3 0 0 0-3.82-1.83A3.003 3.003 0 0 0 3.66 20a3.017 3.017 0 0 0 3.84 1.83c.85-.3 1.5-.98 1.82-1.83h5.37c.55 1.56 2.27 2.38 3.81 1.83A3 3 0 0 0 20.35 18c-.43-1.2-1.57-2-2.85-2m0 4.5A1.5 1.5 0 0 1 16 19a1.5 1.5 0 0 1 1.5-1.5A1.5 1.5 0 0 1 19 19a1.5 1.5 0 0 1-1.5 1.5" />
                </svg>
                거리순
              </template>
            </div>
          </button>

          <!-- dropdown menu -->
          <ul class="dropdown-menu w-100 rounded-4 shadow-sm p-0 overflow-hidden" style="min-width: auto;">

            <!-- 거리순이 아닐 때만 거리순 표시 -->
            <li v-if="currentSort !== 'distance'">
              <button class="dropdown-item d-flex align-items-center gap-3 py-2 fw-bold" style="font-size: 15px;"
                @click="changeSort('distance')">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M6.5 8.11c-.89 0-1.61-.72-1.61-1.61A1.61 1.61 0 0 1 6.5 4.89c.89 0 1.61.72 1.61 1.61A1.61 1.61 0 0 1 6.5 8.11M6.5 2C4 2 2 4 2 6.5c0 3.37 4.5 8.36 4.5 8.36S11 9.87 11 6.5C11 4 9 2 6.5 2m11 6.11a1.61 1.61 0 0 1-1.61-1.61a1.609 1.609 0 1 1 3.22 0a1.61 1.61 0 0 1-1.61 1.61m0-6.11C15 2 13 4 13 6.5c0 3.37 4.5 8.36 4.5 8.36S22 9.87 22 6.5C22 4 20 2 17.5 2m0 14c-1.27 0-2.4.8-2.82 2H9.32a3 3 0 0 0-3.82-1.83A3.003 3.003 0 0 0 3.66 20a3.017 3.017 0 0 0 3.84 1.83c.85-.3 1.5-.98 1.82-1.83h5.37c.55 1.56 2.27 2.38 3.81 1.83A3 3 0 0 0 20.35 18c-.43-1.2-1.57-2-2.85-2m0 4.5A1.5 1.5 0 0 1 16 19a1.5 1.5 0 0 1 1.5-1.5A1.5 1.5 0 0 1 19 19a1.5 1.5 0 0 1-1.5 1.5" />
                </svg>
                거리순
              </button>
            </li>

            <!-- 시간순이 아닐 때만 시간순 표시 -->
            <li v-if="currentSort !== 'time'">
              <button class="dropdown-item d-flex align-items-center gap-3 py-2 fw-bold" style="font-size: 15px;"
                @click="changeSort('time')">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m4.3 13.2L11 12.3V7h1.5v4.4l4.5 2.5z" />
                </svg>
                시간순
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 리스트 스크롤 영역 :: start -->
      <div class="overflow-auto px-3 flex-grow-1" style="min-height: 0; max-height: 100%;">
        <!-- 카드 -->
        <div class="card shadow-sm mb-3" v-for="hospital in hospitals" :key="hospital.fid || hospital.id">
          <div class="card-body" @click="goToHospitalDetail(hospital.hpid)">
            <div class="d-flex justify-content-between align-items-start">
              <h6 class="card-title fw-bold mb-1">{{ hospital.name || '병원명 없음' }}</h6>
              <span v-if="hospital.type" class="badge bg-success-subtle text-success-emphasis rounded-pill">
                <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="15px" viewBox="0 0 24 24">
                  <path fill="#008A64"
                    d="M2 22V11h7V6h6v11h7v5H2M8 8V6h2v2H8m0 2v2h2v-2H8m6-4v2h2V6h-2m0 4v2h2v-2h-2m0 4v2h2v-2h-2" />
                </svg> {{ hospital.type }}
              </span>
            </div>

            <div v-if="hospital.dept_name" class="mb-2">
              <span
                v-for="(dept, index) in (hospital.dept_name ? hospital.dept_name.split(',').map(d => d.trim()) : [])"
                :key="index" class="badge rounded-pill me-1 mb-1"
                :class="[getDepartmentColor(dept).bg, getDepartmentColor(dept).text]"
                :style="getDepartmentColor(dept).style || ''">
                {{ dept }}
              </span>
            </div>

            <div class="text-muted small d-flex align-items-center mb-3">
              <span><i class="bi bi-clock me-1"></i> {{ hospital.etaMin }}분</span>
              <span class="mx-2">|</span>
              <span><i class="bi bi-geo-alt me-1"></i> {{ hospital.distanceKm }}km</span>
            </div>

            <div class="d-grid gap-2 d-sm-flex">
              <button class="btn btn-outline-primary w-100" v-if="hospital.tel" @click.stop="callHospital(hospital.tel)"
                style="pointer-events: auto; z-index: 10;">
                <i class="bi bi-telephone-fill"></i> 전화
              </button>
              <button class="btn btn-primary w-100"
                v-if="hospital.lat && hospital.lon && hospital.addr && hospital.name"
                @click.stop="requestNavi(hospital.lon, hospital.lat, hospital.name, hospital.addr, hospital.id)">
                <i class="bi bi-sign-turn-right-fill"></i> 길찾기
              </button>
            </div>
          </div>
        </div>

        <div v-if="hospitals.length === 0" class="text-center text-muted py-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
            style="display: block; margin: 0 auto 8px;">
            <path fill="currentColor"
              d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
          </svg>
          <p class="mb-1">주변에 병원 정보가 없습니다.</p>
          <small class="text-muted">진료과를 변경하거나 다시 시도해주세요.</small>
        </div>
      </div>
      <!-- 리스트 스크롤 영역 :: end -->
    </div>
  </div>

  <!-- 진료과 선택 모달 -->
  <div class="modal fade" id="departmentModal" tabindex="-1" aria-labelledby="departmentModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header">
          <h5 class="modal-title" id="departmentModalLabel">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              style="display: inline-block; vertical-align: middle; margin-right: 4px;">
              <path fill="currentColor" d="M19 14h-6v6h-2v-6H5v-2h6V6h2v6h6z" />
            </svg> 진료과 선택
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
        </div>

        <div class="modal-body">
          <div class="d-flex flex-wrap gap-2">
            <template v-for="opt in departmentOptions" :key="opt">
              <input class="btn-check" type="checkbox" :id="`dept-${opt}`" :value="opt" v-model="selectedDepartments" />
              <label class="btn btn-outline-secondary rounded-pill py-1 px-3" :for="`dept-${opt}`">{{ opt }}</label>
            </template>
          </div>

          <div v-if="selectedDepartments.length" class="mt-3 text-muted small">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              style="display: inline-block; vertical-align: middle; margin-right: 4px;">
              <path fill="currentColor"
                d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z" />
            </svg> {{ selectedDepartments.length }}개 진료과 선택됨
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">취소</button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              style="display: inline-block; vertical-align: middle; margin-right: 4px;">
              <path fill="currentColor"
                d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
            </svg> 검색
          </button>
        </div>
      </div>
    </div>
  </div>

</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue'
import { useRouter } from 'vue-router';
import proj4 from 'proj4';

// utils (경로는 프로젝트 상황에 맞게 유지)
import { initVworldMap, clearMarkers, addMarkerHospital } from '@/utils/vworldfunction';
import { calculateDistance } from '@/utils/api';
import kidLogo from '@/assets/kid_logo.png'

// -----------------------------------------------------------
// 1. 상수 및 설정
// -----------------------------------------------------------
const KATEC_PROJ4_STRING = '+proj=tmerc +lat_0=38 +lon_0=128 +k=0.9999 +x_0=400000 +y_0=600000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43';
proj4.defs('KATEC', KATEC_PROJ4_STRING);
const WGS84 = 'EPSG:4326';
const KATEC = 'KATEC';

const LIST_COLORS = {
  '달빛어린이병원': { open: '#ffb600', closed: '#999999' },
  '소아청소년과': { open: '#0988ff', closed: '#999999' },
  '약국': { open: '#00bd32', closed: '#999999' },
  'AED': { open: '#f4583c', closed: '#999999' }
};

// -----------------------------------------------------------
// 2. 상태 변수 (State)
// -----------------------------------------------------------
const router = useRouter();
const vmap = shallowRef(null); // ✨ 성능 최적화를 위해 shallowRef 사용
const currentListColor = ref('#5bd200');

// 데이터 관련
const hospitals = ref([]);
const userLocation = ref(null);
const currentListType = ref("병원");
const currentSort = ref("time");
const loadingHospitals = ref(false);
const searchAttempted = ref(false);
let moonlightZoomSet = false;
let searchTimer = null;

// 클러스터링(Vector) 관련 소스와 레이어
let openVectorSource = null;
let closedVectorSource = null;
let openClusterLayer = null;
let closedClusterLayer = null;
const styleCache = {}; // 스타일 캐시
const currentIconUrl = ref('/icons/children.svg'); // 현재 선택된 카테고리 아이콘

// 바텀시트 관련
const bottomSheet = ref(null);
const isDragging = ref(false);
const sheetHeightRatio = ref(0);
const dragStart = ref({ y: 0, ratio: 0 });
const MAX_SHEET_HEIGHT = window.innerHeight * 0.8;
const MIN_SHEET_HEIGHT = 220;

// -----------------------------------------------------------
// 3. 진료과 필터 설정
// -----------------------------------------------------------
const departmentOptions = [
  '내과', '외과', '정형외과', '신경외과', '마취통증의학과',
  '소아청소년과', '피부과', '영상의학과', '재활의학과', '가정의학과',
  '응급의학과', '성형외과', '안과', '한방내과', '산부인과'
];
const selectedDepartments = ref([]);

const departmentColors = {
  '내과': { bg: 'bg-primary-subtle', text: 'text-primary-emphasis', color: '#0d6efd' },
  '외과': { bg: 'bg-danger-subtle', text: 'text-danger-emphasis', color: '#dc3545' },
  '정형외과': { bg: 'bg-warning-subtle', text: 'text-warning-emphasis', color: '#ffc107' },
  '신경외과': { bg: 'bg-info-subtle', text: 'text-info-emphasis', color: '#0dcaf0' },
  '마취통증의학과': { bg: 'bg-secondary-subtle', text: 'text-secondary-emphasis', color: '#6c757d' },
  '소아청소년과': { bg: 'bg-success-subtle', text: 'text-success-emphasis', color: '#198754' },
  '피부과': { bg: 'bg-pink-subtle', text: 'text-pink-emphasis', color: '#d63384', style: 'background-color: #f7d6e6; color: #d63384;' },
  '영상의학과': { bg: 'bg-dark-subtle', text: 'text-dark-emphasis', color: '#212529' },
  '재활의학과': { bg: 'bg-teal-subtle', text: 'text-teal-emphasis', color: '#20c997', style: 'background-color: #d2f4ea; color: #0d6832;' },
  '가정의학과': { bg: 'bg-indigo-subtle', text: 'text-indigo-emphasis', color: '#6610f2', style: 'background-color: #e0cffc; color: #3d0a91;' },
  '응급의학과': { bg: 'bg-danger-subtle', text: 'text-danger-emphasis', color: '#dc3545', style: 'background-color: #f8d7da; color: #842029;' },
  '성형외과': { bg: 'bg-purple-subtle', text: 'text-purple-emphasis', color: '#6f42c1', style: 'background-color: #e2d9f3; color: #432874;' },
  '안과': { bg: 'bg-cyan-subtle', text: 'text-cyan-emphasis', color: '#0dcaf0', style: 'background-color: #cff4fc; color: #055160;' },
  '한방내과': { bg: 'bg-brown-subtle', text: 'text-brown-emphasis', color: '#795548', style: 'background-color: #efebe9; color: #3e2723;' },
  '산부인과': { bg: 'bg-pink-subtle', text: 'text-pink-emphasis', color: '#e91e63', style: 'background-color: #fce4ec; color: #880e4f;' }
};

function removeDepartment(dept) {
  selectedDepartments.value = selectedDepartments.value.filter(d => d !== dept);
}

function getDepartmentColor(deptName) {
  if (!deptName) return { bg: 'bg-secondary-subtle', text: 'text-secondary-emphasis', color: '#6c757d' };
  if (departmentColors[deptName]) return departmentColors[deptName];
  for (const [key, value] of Object.entries(departmentColors)) {
    if (deptName.includes(key) || key.includes(deptName)) return value;
  }
  return { bg: 'bg-secondary-subtle', text: 'text-secondary-emphasis', color: '#6c757d' };
}

// -----------------------------------------------------------
// 4. 스타일 및 클러스터 로직
// -----------------------------------------------------------

// 스타일 생성 함수 (라벨과 아이콘을 모두 여기서 처리)
const getClusterStyle = (feature, type) => {
  if (!vmap.value) return;

  const size = feature.get('features').length;
  const zoom = vmap.value.getView().getZoom();
  
  // 🟢 [클러스터링 모드] (줌 < 16 이고 데이터 2개 이상)
  if (zoom < 16 && size > 1) {
    const styleKey = `cluster-${type}-${size}-${currentListColor.value}`; // ✨ 색상도 캐시 키에 포함
    if (styleCache[styleKey]) return styleCache[styleKey];

    // ✨ type이 'open'일 때만 LIST_COLORS의 색상을 사용, 'closed'는 항상 회색
    const color = type === 'open' ? currentListColor.value : LIST_COLORS[currentListType.value]?.closed || '#999999';

    const style = new window.ol.style.Style({
      image: new window.ol.style.Circle({
        radius: 14,
        stroke: new window.ol.style.Stroke({ color: '#fff', width: 2 }),
        fill: new window.ol.style.Fill({ color: color }) // ✨ 동적 색상 적용
      }),
      text: new window.ol.style.Text({
        text: size.toString(),
        fill: new window.ol.style.Fill({ color: '#fff' }),
        font: 'bold 12px "Pretendard", sans-serif',
        offsetY: 1
      })
    });
    styleCache[styleKey] = style;
    return style;
  } 
  
  // 📍 [개별 마커 + 라벨 모드] (나머지 로직은 기존과 동일)
  else {
    // ... (기존 개별 마커 로직 유지)
    // 개별 마커 아이콘은 이미 currentIconUrl.value를 통해 동적으로 변경됨
    // ... 
    
    // 아이콘 스타일 캐싱 (아이콘 URL 기반으로 캐싱)
    const originalFeature = feature.get('features')[0];
    const name = originalFeature.get('name');
    const iconStyleKey = `pin-${type}-${currentIconUrl.value}`;
    if (!styleCache[iconStyleKey]) {
        let iconSrc = '/icons/grayLocation.svg'; // 기본 닫힘 아이콘
        
        if (type === 'open') {
          iconSrc = currentIconUrl.value; 
        }

        styleCache[iconStyleKey] = new window.ol.style.Icon({
          src: iconSrc,
          scale: 1.0,
          anchor: [0.5, 1]
        });
    }

    return new window.ol.style.Style({
      image: styleCache[iconStyleKey],
      text: new window.ol.style.Text({
        text: name,
        font: '600 13px "Pretendard", sans-serif',
        fill: new window.ol.style.Fill({ color: '#343a40' }),
        stroke: new window.ol.style.Stroke({ color: '#ffffff', width: 3 }),
        offsetY: -40,
        overflow: true
      }),
      zIndex: type === 'open' ? 10 : 5
    });
  }
};

// 클러스터 레이어 초기화
function initClusterLayers() {
  if (!vmap.value) return;

  openVectorSource = new window.ol.source.Vector();
  const openClusterSource = new window.ol.source.Cluster({
    distance: 45, 
    source: openVectorSource
  });

  closedVectorSource = new window.ol.source.Vector();
  const closedClusterSource = new window.ol.source.Cluster({
    distance: 45, 
    source: closedVectorSource
  });

  closedClusterLayer = new window.ol.layer.Vector({
    source: closedClusterSource,
    style: (feature) => getClusterStyle(feature, 'closed'),
    zIndex: 10
  });

  openClusterLayer = new window.ol.layer.Vector({
    source: openClusterSource,
    style: (feature) => getClusterStyle(feature, 'open'),
    zIndex: 20
  });

  // vmap.value 사용
  vmap.value.addLayer(closedClusterLayer);
  vmap.value.addLayer(openClusterLayer);

  vmap.value.on('click', handleMapClick);
  
  vmap.value.getView().on('change:resolution', () => {
    openClusterSource.refresh();
    closedClusterSource.refresh();
  });
}

function handleMapClick(evt) {
  if (!vmap.value) return;
  const feature = vmap.value.forEachFeatureAtPixel(evt.pixel, (f) => f);
  if (!feature) return;

  const features = feature.get('features');
  const zoom = vmap.value.getView().getZoom();

  if (features.length > 1 && zoom < 16) {
    const extent = window.ol.extent.createEmpty();
    features.forEach((f) => window.ol.extent.extend(extent, f.getGeometry().getExtent()));
    vmap.value.getView().fit(extent, { duration: 500, padding: [100, 100, 100, 100] });
  } else {
    const originalFeature = features[0];
    const hpid = originalFeature.get('hpid');
    if (hpid) goToHospitalDetail(hpid);
  }
}

// -----------------------------------------------------------
// 5. 데이터 조회 및 처리
// -----------------------------------------------------------

// 통합된 데이터 조회 함수
async function showLayerInView({ url, listType }) {
  if (!vmap.value) return;
  searchAttempted.value = true;
  
  // currentIconUrl, currentListType은 각 showXxx 함수에서 이미 설정했음

  try {
    // 1. 기존 데이터 삭제
    clearMarkers(); // 기존 오버레이(일반 마커) 제거
    if (openVectorSource) openVectorSource.clear();
    if (closedVectorSource) closedVectorSource.clear();
    
    // 🟢 사용자 마커 다시 그리기 (마커 제거 후 즉시 다시 그림)
    if (userLocation.value) {
      await refreshUserMarker();
    }
    
    // 스타일 캐시 초기화 (아이콘 변경 반영)
    for (const key in styleCache) delete styleCache[key];

    // 2. 데이터 가져오기
    const extent = vmap.value.getView().calculateExtent(vmap.value.getSize());
    const [minX, minY, maxX, maxY] = window.ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    const bbox = [minX, minY, maxX, maxY].join(',');
    const fullUrl = `${url}&bbox=${bbox},EPSG:4326`;
    
    const res = await fetch(fullUrl);
    const geojson = await res.json();

    // 필터링
    const filtered = selectedDepartments.value.length
      ? geojson.features.filter(f => {
        const props = f.properties || {};
        const deptNames = (props.dgid_id_name || '').split(',').map(d => d.trim());
        return selectedDepartments.value.some(sel => deptNames.some(dept => dept.includes(sel)));
      })
      : geojson.features;

    // 3. Feature 생성
    const openFeatures = [];
    const closedFeatures = [];

    filtered.forEach(f => {
      const [lon, lat] = f.geometry.coordinates;
      if (isNaN(lon) || isNaN(lat)) return;

      const props = f.properties;
      const isOpen = isHospitalOpen(props);
      const hpid = f.id?.split(".")[1] || props.hpid;
      const name = props?.duty_name || props?.hospital_name || props?.name || listType;

      const feature = new window.ol.Feature({
        geometry: new window.ol.geom.Point(window.ol.proj.fromLonLat([lon, lat])),
        hpid: hpid,
        name: name,
        open: isOpen
      });

      if (isOpen) openFeatures.push(feature);
      else closedFeatures.push(feature);
    });

    // 4. 데이터 주입
    if (openVectorSource) openVectorSource.addFeatures(openFeatures);
    if (closedVectorSource) closedVectorSource.addFeatures(closedFeatures);

    addToHospitalList(filtered, listType);
    console.log(`✅ ${listType} 로딩 완료`);

  } catch (err) {
    console.error(err);
  }
}

// 조회 버튼 함수들
function showMoonlight() {
  currentListType.value = "달빛어린이병원";
  currentIconUrl.value = "/icons/moonlight.svg";
  currentListColor.value = LIST_COLORS['달빛어린이병원'].open;
  
  // 스타일 캐시를 비워야 아이콘이 변경됨
  for (const key in styleCache) delete styleCache[key]; 
  
  if (!moonlightZoomSet && vmap.value) {
    vmap.value.getView().setZoom(14);
    moonlightZoomSet = true;
  }
  showLayerInView({
    url: "https://api.child119.com/geoserver/hospital/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hospital:moonlight_hospital&outputFormat=application/json",
    listType: "달빛어린이병원"
  });
}

function showPediatric() {
  currentListType.value = "소아청소년과";
  currentIconUrl.value = "/icons/children.svg";
  currentListColor.value = LIST_COLORS['소아청소년과'].open;

  // 스타일 캐시를 비워야 아이콘이 변경됨
  for (const key in styleCache) delete styleCache[key]; 
  
  showLayerInView({
    url: "https://api.child119.com/geoserver/hospital/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hospital%3Achildren_hospital&outputFormat=application%2Fjson&maxFeature=50",
    listType: "소아청소년과"
  });
}

function showPharmacy() {
  currentListType.value = "약국";
  currentIconUrl.value = "/icons/pharmacy.svg";
  currentListColor.value = LIST_COLORS['약국'].open;

  // 스타일 캐시를 비워야 아이콘이 변경됨
  for (const key in styleCache) delete styleCache[key]; 
  
  showLayerInView({
    url: "https://api.child119.com/geoserver/hospital/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hospital%3Apharmacy&outputFormat=application%2Fjson&maxFeature=50",
    listType: "약국"
  });
}

function showAED() {
  currentListType.value = "AED";
  currentIconUrl.value = "/icons/aed.svg";
  currentListColor.value = LIST_COLORS['AED'].open;

  // 스타일 캐시를 비워야 아이콘이 변경됨
  for (const key in styleCache) delete styleCache[key]; 

  showLayerInView({
    url: "https://api.child119.com/geoserver/hospital/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hospital%3Aaed&outputFormat=application%2Fjson&maxFeature=50",
    listType: "AED"
  });
}

function reSearchCurrentLayer() {
  switch (currentListType.value) {
    case '달빛어린이병원': showMoonlight(); break;
    case '소아청소년과': showPediatric(); break;
    case '약국': showPharmacy(); break;
    case 'AED': showAED(); break;
    default: break;
  }
}

// -----------------------------------------------------------
// 6. 유틸리티 및 기타 기능
// -----------------------------------------------------------

function isHospitalOpen(props) {
  const now = new Date();
  const day = now.getDay() === 0 ? 7 : now.getDay();
  const openKey = `duty_time${day}s`;
  const closeKey = `duty_time${day}c`;
  const openTime = String(props[openKey] || '').padStart(4, '0');
  const closeTime = String(props[closeKey] || '').padStart(4, '0');

  if (!openTime || !closeTime || openTime === 'null' || closeTime === 'null') return false;
  if (['0000', '0'].includes(openTime) && ['2400', '0000', '0'].includes(closeTime)) return true;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseInt(openTime.slice(0, 2)) * 60 + parseInt(openTime.slice(2));
  const closeMinutes = parseInt(closeTime.slice(0, 2)) * 60 + parseInt(closeTime.slice(2));

  if (openMinutes < closeMinutes) return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
  if (openMinutes > closeMinutes) return nowMinutes >= openMinutes || nowMinutes <= closeMinutes;
  return false;
}

function addToHospitalList(list, type) {
  let filteredList = list;
  if (selectedDepartments.value.length > 0) {
    filteredList = list.filter(item => {
      const props = item.properties || {};
      const deptNames = (props.dgid_id_name || '').split(',').map(d => d.trim());
      return selectedDepartments.value.some(sel => deptNames.some(dept => dept.includes(sel)));
    });
  }

  hospitals.value = filteredList.map((item) => {
    const props = item.properties || {};
    const fid = item.id || props.fid || null;
    const hpidFromFid = fid && fid.includes('.') ? fid.split('.')[1] : null;
    const [lon, lat] = item.geometry?.coordinates || [NaN, NaN];

    let distanceKm = null;
    let etaMin = null;
    if (userLocation.value && Number.isFinite(lat) && Number.isFinite(lon)) {
      const dist = calculateDistance(userLocation.value.lat, userLocation.value.lon, lat, lon);
      distanceKm = (dist / 1000).toFixed(1);
      etaMin = Math.max(1, Math.round((dist / 1000) / 0.4));
    }

    return {
      fid,
      id: hpidFromFid || props.hpid || fid,
      hpid: hpidFromFid || props.hpid || null,
      type,
      name: props.duty_name || props.hospital_name || props.name || props.dutyName || "이름 없음",
      addr: props.duty_addr || props.address || props.addr || props.dutyAddr || "주소 없음",
      tel: props.duty_tel1 || props.dutytel3 || props.hospital_tel || props.dutyTel1 || "",
      lat, lon,
      dept_name: props.dgid_id_name ?? '',
      distanceKm, etaMin,
    };
  });
}

function changeSort(type) {
  currentSort.value = type;
  if (type === "distance") {
    hospitals.value.sort((a, b) => Number(a.distanceKm ?? Infinity) - Number(b.distanceKm ?? Infinity));
  } else {
    hospitals.value.sort((a, b) => Number(a.etaMin ?? Infinity) - Number(b.etaMin ?? Infinity));
  }
}

function goToHospitalDetail(hpid) {
  if (!hpid) return;
  router.push({ name: "hospitalInformationDetail", params: { hpid } });
}

function callHospital(tel) {
  if (!tel) {
    alert('전화번호가 없습니다.');
    return;
  }
  window.location.href = `tel:${tel}`;
}

// -----------------------------------------------------------
// 7. 위치 및 길찾기 기능
// -----------------------------------------------------------

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
      error => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

async function requestNavi(endX, endY, name, addr, hpid) {
  try {
    let location = await getCurrentLocation(); // 최신 위치 확보
    const [start_x, start_y] = proj4(WGS84, KATEC, [location.lon, location.lat]);
    const [end_x, end_y] = proj4(WGS84, KATEC, [endX, endY]);
    const id = hpid && hpid.includes('.') ? hpid.split(".")[1] : hpid;

    if (window.AndroidBridge && typeof window.AndroidBridge.startNavigation === 'function') {
      window.AndroidBridge.startNavigation("내위치", Math.round(start_x), Math.round(start_y), name, Math.round(end_x), Math.round(end_y), addr, id);
    } else {
      alert(`[웹] 네비게이션 호출: ${name}`);
    }
  } catch (e) {
    console.error(e);
    alert("네비게이션 실행 실패");
  }
}

// 내 위치 업데이트 (지도 이동 포함)
async function updateUserLocation(zoom = 16) {
  try {
    const position = await getCurrentLocation();
    userLocation.value = { lat: position.lat, lon: position.lon };

    if (vmap.value) {
      const center = window.ol.proj.fromLonLat([position.lon, position.lat]);
      vmap.value.getView().setCenter(center);
      vmap.value.getView().setZoom(zoom);
      
      refreshUserMarker();
    }
  } catch (err) {
    console.error('위치 업데이트 실패:', err);
  }
}

/* 내 위치 새로고침 */
async function refreshLocation() {
  try {
    const position = await getCurrentLocation();
    userLocation.value = { lat: position.lat, lon: position.lon };

    if (vmap.value) {
      const center = window.ol.proj.fromLonLat([position.lon, position.lat]);
      vmap.value.getView().setCenter(center); 
      refreshUserMarker();
    }
    console.log(`화면 중심만 내 위치로 이동: ${userLocation.value.lat}, ${userLocation.value.lon}`);
  } catch (err) {
    console.error('refreshLocation 실패:', err);
    alert("위치 갱신 실패");
  }
}

async function refreshUserMarker() {
  try {
    if (!userLocation.value) return;
    const logoDataUrl = await toDataUrl(kidLogo);
    const iconUrl = createUserPinIcon(logoDataUrl);
    
    // 사용자 마커는 vworldfunction.js의 addMarkerHospital 사용 (Overlay 방식 유지해도 무방)
    addMarkerHospital(userLocation.value.lon, userLocation.value.lat, {
      name: '현재 위치',
      iconUrl,
      anchor: [0.5, 0.5]
    });
  } catch (err) {
    console.error(err);
  }
}

function createUserPinIcon(logoDataUrl, size = 70) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 80 80">
      <path d="M40 0C23 0 10 13 10 30c0 18 20 40 30 50c10-10 30-32 30-50C70 13 57 0 40 0z" fill="#464654" />
      <circle cx="40" cy="30" r="22" fill="#ffffff" />
      <clipPath id="clipLogo"><circle cx="40" cy="30" r="18" /></clipPath>
      <image href="${logoDataUrl}" xlink:href="${logoDataUrl}" x="22" y="12" width="36" height="36" clip-path="url(#clipLogo)" preserveAspectRatio="xMidYMid slice" />
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function toDataUrl(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// -----------------------------------------------------------
// 8. 바텀시트 및 감시자(Watchers)
// -----------------------------------------------------------

const sheetStyle = computed(() => ({
  transition: isDragging.value ? 'none' : 'transform 0.3s ease-out',
  transform: `translateY(${sheetY.value}px)`,
  height: `${MAX_SHEET_HEIGHT}px`,
  bottom: `0px`,
  top: 'auto'
}));

const sheetY = computed(() => (MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT) * (1 - sheetHeightRatio.value));

const onTouchStart = e => {
  if (e.target.closest('button') || e.target.closest('.btn') || e.target.closest('.card-body')) return;
  isDragging.value = true;
  dragStart.value = { y: e.touches[0].clientY, ratio: sheetHeightRatio.value };
};

const onTouchMove = e => {
  if (!isDragging.value) return;
  const dY = e.touches[0].clientY - dragStart.value.y;
  const dR = -dY / (MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT);
  sheetHeightRatio.value = Math.min(1, Math.max(0, dragStart.value.ratio + dR));
};

const onTouchEnd = () => {
  isDragging.value = false;
  sheetHeightRatio.value = sheetHeightRatio.value > 0.5 ? 1 : 0;
};

const toggleSheet = () => {
  sheetHeightRatio.value = sheetHeightRatio.value > 0.5 ? 0 : 1;
};

const debounceSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (vmap.value && searchAttempted.value) reSearchCurrentLayer();
  }, 500);
};

watch(selectedDepartments, (newVal, oldVal) => {
  if (newVal.length !== oldVal.length || newVal.some((v, i) => v !== oldVal[i])) {
    reSearchCurrentLayer();
  }
}, { deep: true });

// -----------------------------------------------------------
// 9. 라이프사이클 (Mounted / Unmounted)
// -----------------------------------------------------------

onMounted(async () => {
  await new Promise((resolve) => {
    const checkVworld = setInterval(() => {
      if (window.vw && window.vw.ol3 && window.ol) {
        clearInterval(checkVworld);
        resolve();
      }
    }, 100);
  });

  try {
    const defaultCenter = window.ol.proj.transform([126.978, 37.5665], 'EPSG:4326', 'EPSG:3857');
    
    // ✨ 중요: vmap.value에 할당
    vmap.value = initVworldMap({
      containerId: 'map_div',
      defaultCenter,
      defaultZoom: 15,
      autoFetch: false
    });

    if (!vmap.value) throw new Error('vmap 초기화 실패');

    // 기존 마커 제거 및 클러스터 초기화
    clearMarkers(); 
    initClusterLayers();

    // 위치 잡고 초기 검색
    await updateUserLocation(14); // 여기서 마커가 처음 그려짐
    showMoonlight();

    // 이벤트 리스너
    if (vmap.value) {
      const view = vmap.value.getView();
      view.on('change:center', debounceSearch);
      view.on('change:resolution', debounceSearch);
    }

  } catch (err) {
    console.error('초기화 실패:', err);
  }
});

onBeforeUnmount(() => {
  if (vmap.value) {
    vmap.value.setTarget(null);
    vmap.value = null;
  }
});
</script>
<style scoped>
/* 카드 기본/호버/클릭 */
.card {
  cursor: pointer;
  /* 핵심: 위쪽을 기준으로 확대 → 위로는 안 튐 */
  transform-origin: top center;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.25s ease,
    border-color 0.18s ease;
  background-color: #fff;
}

/* 호버: 아래쪽으로만 커짐 */
.card:hover {
  transform: scale(1.02);
  /* ↑ translateY(-) 제거 */
  background-color: #f0f6ff;
  border-color: #0d6efd;
  box-shadow: 0 6px 20px rgba(13, 110, 253, .15);
}

/* 클릭(눌림) */
.card:active {
  transform: scale(0.98);
  /* 위아래 이동 없이 눌림만 */
  background-color: #e2ebff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, .15);
}

/* 클릭(눌림) */
.top-button:focus {
  background-color: #0d6efd;
  box-shadow: 0 3px 10px rgba(0, 0, 0, .15);
}

/* 스크롤 영역: iOS/WebView 부드러운 스크롤 */
.sheet-scroll {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  /* 스크롤 제스처를 브라우저가 처리하도록 명시 */
  touch-action: pan-y;
}

/* 그립: 제스처는 우리가 처리 (스크롤로 해석되지 않도록) */
.sheet-grip {
  touch-action: none;
}

:deep(.marker-label) {
  font-family: 'Pretendard', sans-serif;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  pointer-events: auto;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
  transition: all 0.2s ease;
}

:deep(.marker-label:hover) {
  background: #0d6efd;
  color: #fff;
}

.dropdown-toggle::after {
  margin-left: 8px !important;
}
</style>