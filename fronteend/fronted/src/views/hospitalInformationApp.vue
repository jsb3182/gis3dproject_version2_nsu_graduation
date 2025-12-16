<template>
  <div class="d-flex justify-content-center align-items-center position-relative mt-1"
    style="height: calc(100vh - 140px); ">

    <!-- 3D 지도 (CesiumJS) :: start -->
    <div id="cesiumContainer" class="position-fixed top-0 start-0 w-100"
      style="height:100dvh; z-index:0;"></div>
    <!-- 3D 지도 (CesiumJS) :: end -->

    <!-- 상단 조회 버튼 :: start -->
    <div class="position-fixed start-0 p-3" style="top: calc(var(--header-h) + 8px); z-index: 2;">
      <div class="pe-auto">
        <button type="button" class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button"
          data-bs-toggle="modal" data-bs-target="#departmentModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
            <path fill="currentColor" d="m17 21l1.8 1.77c.5.5 1.2.1 1.2-.49V18l2.8-3.4A1 1 0 0 0 22 13h-7c-.8 0-1.3 1-.8 1.6L17 18zm-5-10h8V3a2 2 0 0 0-2-2H4c-1.1 0-2 .9-2 2v12a2 2 0 0 0 2 2h9.42L12 15zm0-6h6v4h-6zm-2 10H4v-4h6zm0-6H4V5h6z"/>
          </svg> 제작한사람
        </button>
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button" title="달빛어린이병원"
          @click="showMoonlight()">
          🌙 사용한 데이터
        </button>
        <button class="btn-light border rounded-pill px-2 ms-1 shadow-sm text-bold top-button" title="약국"
          @click="showPharmacy()">
          <i class="bi bi-capsule"></i> 사용한 기술
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
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import geoService from '@/services/geoService'
import kidLogo from '@/assets/kid_logo.png'

// -----------------------------------------------------------
// 1. 상수 및 설정
// -----------------------------------------------------------
const VWORLD_API_KEY = '29A4D1FB-AD18-35A5-9E70-8676253EFB4C'; // V-World API 키
const CHEONAN_CENTER = { lon: 127.1139, lat: 36.8151, height: 15000 };

// -----------------------------------------------------------
// 2. 상태 변수 (State)
// -----------------------------------------------------------
const router = useRouter();
const viewer = shallowRef(null); // CesiumJS viewer

// 데이터 관련
const hospitals = ref([]);
const userLocation = ref(null);
const currentListType = ref("전체");
const currentSort = ref("distance");
const loading = ref(true);

// CesiumJS 엔티티 저장소
const shelterEntities = ref([]); // 모든 GeoServer 레이어의 엔티티
const userMarkerEntity = ref(null); // 사용자 위치 마커

// 바텀시트 관련
const bottomSheet = ref(null);
const isDragging = ref(false);
const sheetHeightRatio = ref(0);
const dragStart = ref({ y: 0, ratio: 0 });
const MAX_SHEET_HEIGHT = window.innerHeight * 0.8;
const MIN_SHEET_HEIGHT = 220;

// -----------------------------------------------------------
// 3. 진료과 필터 설정 (기존 로직 유지)
// -----------------------------------------------------------
const departmentOptions = [
  '내과', '외과', '정형외과', '신경외과', '마취통증의학과',
  '소아청소년과', '피부과', '영상의학과', '재활의학과', '가정의학과',
  '응급의학과', '성형외과', '안과', '한방내과', '산부인과'
];
const selectedDepartments = ref([]);

// ... (기존 departmentColors, removeDepartment, getDepartmentColor 함수 유지)
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
// 4. CesiumJS 초기화 및 3D 데이터 로드
// -----------------------------------------------------------

const initCesium = async () => {
  try {
    loading.value = true;
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZWJiMDRjNi05MDZlLTRiOWMtYTU5OC0yY2Q2MGM2NzE4ODMiLCJpZCI6MzY3MzEyLCJpYXQiOjE3NjUwODQwMTV9.Qwe6fyt1Ooat6PUTnulbjvQXSFAYmL0J3kPc83FG7gA';

    viewer.value = new Cesium.Viewer('cesiumContainer', {
      baseLayer: false,
      animation: false,
      timeline: false,
      fullscreenButton: true,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      infoBox: false,
      selectionIndicator: false,
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: Cesium.IonResource.fromAssetId(1)
      })
    });

    // VWorld 위성지도 (WMS)
    viewer.value.imageryLayers.addImageryProvider(
      new Cesium.WebMapServiceImageryProvider({
        url: 'http://api.vworld.kr/req/wms',
        layers: 'Satellite',
        parameters: {
          service: 'WMS', version: '1.3.0', request: 'GetMap',
          transparent: 'false', format: 'image/jpeg', key: VWORLD_API_KEY
        }
      })
    );

    // VWorld 하이브리드 (도로/지명)
    viewer.value.imageryLayers.addImageryProvider(
      new Cesium.WebMapServiceImageryProvider({
        url: 'http://api.vworld.kr/req/wms',
        layers: 'Hybrid',
        parameters: {
          service: 'WMS', version: '1.3.0', request: 'GetMap',
          transparent: 'true', format: 'image/png', key: VWORLD_API_KEY
        }
      })
    );

    goToCheonan();
    await loadAllLayers();
    registerClickHandler();

  } catch (error) {
    console.error('[Cesium] 초기화 실패:', error);
    alert('지도 불러오기에 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

const loadAllLayers = async () => {
  try {
    const layers = await geoService.getAllLayers();

    shelterEntities.value.forEach(entity => viewer.value.entities.remove(entity));
    shelterEntities.value = [];

    // 1. chspoint (대피소 포인트) - 빨간색 3D 원기둥
    if (layers.chspoint?.features) {
      layers.chspoint.features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
          const [lon, lat] = feature.geometry.coordinates;
          const entity = viewer.value.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
            cylinder: {
              length: 30, topRadius: 5, bottomRadius: 5,
              material: Cesium.Color.RED.withAlpha(0.7),
              outline: true, outlineColor: Cesium.Color.WHITE, outlineWidth: 2
            },
            label: {
              text: feature.properties.name || '대피소',
              font: '14px sans-serif',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK, outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -35),
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            properties: { featureData: feature, layerType: 'chspoint' }
          });
          shelterEntities.value.push(entity);
        }
      });
      console.log(`[Cesium] chspoint: ${layers.chspoint.features.length}개 로드`);
    }

    // 2. build (건물) - 파란색 3D
    if (layers.build?.features) {
      layers.build.features.forEach(feature => {
        const processPolygon = (coords) => {
          const entity = viewer.value.entities.add({
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(coords[0].flat()),
              material: Cesium.Color.BLUE.withAlpha(0.5),
              outline: true, outlineColor: Cesium.Color.BLUE, outlineWidth: 2,
              height: 0, extrudedHeight: 15
            },
            properties: { featureData: feature, layerType: 'build' }
          });
          shelterEntities.value.push(entity);
        };
        if (feature.geometry.type === 'Polygon') processPolygon(feature.geometry.coordinates);
        else if (feature.geometry.type === 'MultiPolygon') feature.geometry.coordinates.forEach(processPolygon);
      });
      console.log(`[Cesium] build: ${layers.build.features.length}개 로드`);
    }

    // 3. link (도로/링크) - 노란색 3D
    if (layers.link?.features) {
      layers.link.features.forEach(feature => {
        const processLine = (coords) => {
          const entity = viewer.value.entities.add({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray(coords.flat()),
              width: 5, material: Cesium.Color.YELLOW.withAlpha(0.8),
              clampToGround: false
            },
            properties: { featureData: feature, layerType: 'link' }
          });
          shelterEntities.value.push(entity);
        };
        if (feature.geometry.type === 'LineString') processLine(feature.geometry.coordinates);
        else if (feature.geometry.type === 'MultiLineString') feature.geometry.coordinates.forEach(processLine);
      });
      console.log(`[Cesium] link: ${layers.link.features.length}개 로드`);
    }

    // 4. node (노드) - 녹색
    if (layers.node?.features) {
      layers.node.features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
          const [lon, lat] = feature.geometry.coordinates;
          const entity = viewer.value.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
            point: {
              pixelSize: 8, color: Cesium.Color.GREEN,
              outlineColor: Cesium.Color.WHITE, outlineWidth: 1
            },
            properties: { featureData: feature, layerType: 'node' }
          });
          shelterEntities.value.push(entity);
        }
      });
      console.log(`[Cesium] node: ${layers.node.features.length}개 로드`);
    }

    // 5. chmergr (병합 레이어) - 보라색 3D
    if (layers.chmergr?.features) {
       layers.chmergr.features.forEach(feature => {
        const processPolygon = (coords) => {
            const entity = viewer.value.entities.add({
                polygon: {
                    hierarchy: Cesium.Cartesian3.fromDegreesArray(coords[0].flat()),
                    material: Cesium.Color.PURPLE.withAlpha(0.5),
                    outline: true, outlineColor: Cesium.Color.PURPLE, outlineWidth: 2,
                    height: 0, extrudedHeight: 10
                },
                properties: { featureData: feature, layerType: 'chmergr' }
            });
            shelterEntities.value.push(entity);
        };
        if (feature.geometry.type === 'Polygon') processPolygon(feature.geometry.coordinates);
        else if (feature.geometry.type === 'MultiPolygon') feature.geometry.coordinates.forEach(processPolygon);
        else if (feature.geometry.type === 'Point') {
             const [lon, lat] = feature.geometry.coordinates;
             const entity = viewer.value.entities.add({
                position: Cesium.Cartesian3.fromDegrees(lon, lat, 10),
                point: {
                    pixelSize: 12, color: Cesium.Color.PURPLE,
                    outlineColor: Cesium.Color.WHITE, outlineWidth: 2,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                },
                properties: { featureData: feature, layerType: 'chmergr' }
            });
            shelterEntities.value.push(entity);
        }
      });
      console.log(`[Cesium] chmergr: ${layers.chmergr.features.length}개 로드`);
    }

    // 6. thematicmerge (테마 병합) - 주황색
    if (layers.thematicmerge?.features) {
      layers.thematicmerge.features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
          const [lon, lat] = feature.geometry.coordinates;
          const entity = viewer.value.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
            point: {
              pixelSize: 10, color: Cesium.Color.ORANGE,
              outlineColor: Cesium.Color.WHITE, outlineWidth: 1
            },
            properties: { featureData: feature, layerType: 'thematicmerge' }
          });
          shelterEntities.value.push(entity);
        }
      });
      console.log(`[Cesium] thematicmerge: ${layers.thematicmerge.features.length}개 로드`);
    }

    console.log(`[Cesium] 총 ${shelterEntities.value.length}개의 데이터 로드 완료`);

  } catch (error) {
    console.error('[Cesium] 레이어 로드 실패:', error);
    alert('GeoServer 데이터를 불러오는데 실패했습니다. GeoServer가 실행 중인지 확인하세요.');
  }
};

const registerClickHandler = () => {
  viewer.value.screenSpaceEventHandler.setInputAction((click) => {
    const pickedObject = viewer.value.scene.pick(click.position);
    if (Cesium.defined(pickedObject) && pickedObject.id) {
      const entity = pickedObject.id;
      if (entity.properties && entity.properties.featureData) {
        const featureData = entity.properties.featureData.getValue();
        console.log('선택된 객체:', featureData);
        // TODO: 선택된 객체 정보 표시 (예: 바텀시트에 정보 표시)
        alert(`선택: ${featureData.properties.name || entity.properties.layerType}`);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

// -----------------------------------------------------------
// 5. 지도 제어 및 버튼 핸들러
// -----------------------------------------------------------
const goToCheonan = () => {
  if (!viewer.value) return;
  viewer.value.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(CHEONAN_CENTER.lon, CHEONAN_CENTER.lat, CHEONAN_CENTER.height),
    duration: 2
  });
};

const toggleLayerVisibility = (layerType, show) => {
    shelterEntities.value.forEach(entity => {
        if (entity.properties && entity.properties.layerType && entity.properties.layerType.getValue() === layerType) {
            entity.show = show;
        }
    });
};

const showMoonlight = () => {
    console.log("달빛어린이병원 버튼 클릭 (기능 재정의 필요)");
    // 예시: chspoint 레이어만 표시
    ['build', 'link', 'node', 'chmergr', 'thematicmerge'].forEach(type => toggleLayerVisibility(type, false));
    toggleLayerVisibility('chspoint', true);
    currentListType.value = "달빛어린이병원";
};
const showPediatric = () => {
    console.log("소아청소년과 버튼 클릭 (기능 재정의 필요)");
    // 예시: 모든 레이어 표시
     ['build', 'link', 'node', 'chmergr', 'thematicmerge', 'chspoint'].forEach(type => toggleLayerVisibility(type, true));
    currentListType.value = "소아청소년과";
};
const showPharmacy = () => { console.log("약국 버튼 클릭 (기능 재정의 필요)"); currentListType.value = "약국"; };
const showAED = () => { console.log("AED 버튼 클릭 (기능 재정의 필요)"); currentListType.value = "AED"; };


// -----------------------------------------------------------
// 6. 유틸리티 및 기타 기능 (기존 로직 일부 유지)
// -----------------------------------------------------------
function changeSort(type) {
  currentSort.value = type;
  // TODO: hospitals 리스트 정렬 로직 구현
}

function goToHospitalDetail(hpid) {
  if (!hpid) return;
  router.push({ name: "hospitalInformationDetail", params: { hpid } });
}

function callHospital(tel) {
  if (!tel) return alert('전화번호가 없습니다.');
  window.location.href = `tel:${tel}`;
}

// -----------------------------------------------------------
// 7. 위치 및 길찾기 기능 (기존 로직 유지)
// -----------------------------------------------------------
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      position => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
      error => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

async function updateUserLocation() {
  try {
    const position = await getCurrentLocation();
    userLocation.value = { lat: position.lat, lon: position.lon };

    if (viewer.value) {
      viewer.value.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(position.lon, position.lat, 5000),
        duration: 2.0,
      });
      updateUserLocationMarker(position.lon, position.lat);
    }
  } catch (err) {
    console.warn('위치 권한 거부 또는 실패, 기본 위치(천안시청) 사용');
    const defaultLocation = { lat: CHEONAN_CENTER.lat, lon: CHEONAN_CENTER.lon };
    userLocation.value = defaultLocation;
    if (viewer.value) {
      goToCheonan();
      updateUserLocationMarker(defaultLocation.lon, defaultLocation.lat);
    }
  }
}

function updateUserLocationMarker(lon, lat) {
  if (!viewer.value) return;
  if (userMarkerEntity.value) viewer.value.entities.remove(userMarkerEntity.value);
  userMarkerEntity.value = viewer.value.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
    billboard: {
      image: kidLogo, width: 50, height: 50,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text: '현재 위치', font: '14px sans-serif',
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK, outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      pixelOffset: new Cesium.Cartesian2(0, 10),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}

async function refreshLocation() {
  try {
    const position = await getCurrentLocation();
    userLocation.value = { lat: position.lat, lon: position.lon };
    if (viewer.value) {
      viewer.value.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(position.lon, position.lat, 3000),
        duration: 1.5,
      });
      updateUserLocationMarker(position.lon, position.lat);
    }
  } catch (err) {
    console.error('refreshLocation 실패:', err);
    alert("위치 갱신 실패");
  }
}

// ... (기존 네비게이션, 바텀시트 로직 유지)
async function requestNavi(endX, endY, name, addr, hpid) {
  // ...
}

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


// -----------------------------------------------------------
// 9. 라이프사이클 (Mounted / Unmounted)
// -----------------------------------------------------------
onMounted(async () => {
  await initCesium();
  await updateUserLocation();
});

onBeforeUnmount(() => {
  if (viewer.value) {
    viewer.value.destroy();
    viewer.value = null;
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

/* CesiumJS 컨테이너 스타일 */
#cesiumContainer {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

<style>
/* CesiumJS 위젯 숨기기 (전역 스타일) */
.cesium-viewer-bottom {
  display: none !important;
}
</style>