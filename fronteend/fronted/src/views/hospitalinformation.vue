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
        <button type="button" class="btn btn-light border rounded-pill px-3 shadow-sm text-bold" data-bs-toggle="modal"
          data-bs-target="#departmentModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M18 14h2v-3h3V9h-3V6h-2v3h-3v2h3zM10 4c0-.6.4-1 1-1h1V1h-1c-1.7 0-3 1.3-3 3v1H4v2h11V5h-5zm-1 8H7c0-1.1.9-2 2-2zm3.5 7c.83 0 1.5-.67 1.5-1.5S13.33 16 12.5 16s-1.5.67-1.5 1.5s.67 1.5 1.5 1.5M5 22h14c1.1 0 2-.9 2-2v-9H3v9c0 1.1.9 2 2 2" />
          </svg> 진료과
        </button>
        <button class="btn-light border rounded-pill px-3 shadow-sm text-bold" title="달빛어린이병원" @click="showMoonlight()">
          🌙 달빛어린이병원
        </button>
        <button class="btn-light border rounded-pill px-3 shadow-sm text-bold" title="소아과" @click="showPediatric()">
          🧒 소아청소년과
        </button>
        <button class="btn-light border rounded-pill px-3 shadow-sm text-bold" title="약국" @click="showPharmacy()">
          <i class="bi bi-capsule"></i> 약국
        </button>
        <button class="btn-light border rounded-pill px-3 shadow-sm text-bold" title="AED" @click="showAED()">
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

      <!-- 경로 결과 정보 (경로 탐색 후 표시) -->
      <div v-if="isRouteMode" class="p-3 border-bottom bg-primary bg-gradient text-white flex-shrink-0">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="fw-bold mb-0 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              style="display: inline-block; vertical-align: middle; margin-right: 4px;">
              <path fill="currentColor"
                d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7" />
            </svg>{{ selectedHospital?.properties?.hospital_name || '경로 안내' }}
          </h6>
          <button type="button" class="btn-close btn-close-white" @click="exitRouteMode" aria-label="닫기"></button>
        </div>

        <!-- 경로 상세 정보 -->
        <div class="bg-white text-dark rounded p-3">
          <div class="row g-2 small">
            <div class="col-6">
              <div class="text-muted mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                  <path fill="currentColor"
                    d="M10 18v-2h4v2zm-3 4v-2h10v2zm9-15.65L12.35 3H18m1 0h-7l-2 2H6l2 2L4 16v2h16v-2l-4-9z" />
                </svg>총 거리
              </div>
              <div class="fw-bold fs-6">{{ routeDetails.distance }}</div>
            </div>
            <div class="col-6">
              <div class="text-muted mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                  <path fill="currentColor"
                    d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m4.2 14.2L11 13V7h1.5v5.2l4.5 2.7z" />
                </svg>소요 시간
              </div>
              <div class="fw-bold fs-6">{{ routeDetails.time }}</div>
            </div>
            <div class="col-6" v-if="transportType === 'car' && routeDetails.fare">
              <div class="text-muted mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                  <path fill="currentColor"
                    d="M20 8h-3V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10h2v2h2v-2h12v2h2v-2h2V10c0-1.1-.9-2-2-2M9 6h6v2H9zm11 12H4v-6h16z" />
                </svg>통행 요금
              </div>
              <div class="fw-bold fs-6">{{ routeDetails.fare }}</div>
            </div>
            <div class="col-6" v-if="transportType === 'car' && routeDetails.taxiFare">
              <div class="text-muted mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                  <path fill="currentColor"
                    d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8zM6.85 6h10.29l1.08 3.11H5.77zM19 16H5v-4.66l.12-.34h13.77l.11.34z" />
                </svg>예상 택시 요금
              </div>
              <div class="fw-bold fs-6">{{ routeDetails.taxiFare }}</div>
            </div>
            <div class="col-6" v-if="transportType === 'walk' && routeDetails.walkTime">
              <div class="text-muted mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                  <path fill="currentColor"
                    d="M14.12 10H19V8.2h-3.62l-2.94-3.12C12.08 4.71 11.63 4.5 11.15 4.5c-.22 0-.42.03-.62.09l-3.94 1.88c-.46.22-.79.66-.79 1.17v4.18c0 .53.71 1.04 1.27 1.04c.55 0 1-.45 1-1V8.91l1.83-.88l-1.62 7.88l-2.98-.83c-.41-.11-.82-.07-1.18.11L2 16.25c-.48.23-.78.72-.78 1.25c0 .75.61 1.36 1.36 1.36c.21 0 .41-.05.59-.13L5.1 17.5l3.08.86c.5.14 1 .04 1.42-.25l2.12-1.51l.69 3.4c.1.5.55.86 1.05.86c.07 0 .13-.01.19-.02c.57-.12.94-.67.82-1.24l-.89-4.38zM13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2" />
                </svg>도보 시간
              </div>
              <div class="fw-bold fs-6">{{ routeDetails.walkTime }}</div>
            </div>
          </div>
        </div>
      </div>
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
      <div class="d-flex justify-content-between align-items-center mb-3 ms-2 me-2 flex-shrink-0">
        <!-- 왼쪽 -->
        <div class="d-flex align-items-center gap-2">
          <h5 class="fw-bold mb-0">병원 리스트</h5>
          <span v-if="hospitals.length > 0" class="badge bg-white text-black">{{ hospitals.length }}개</span>
        </div>

        <!-- 오른쪽: 버튼 그룹 -->
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-light border rounded-pill px-3 text-bold" @click="sortByDistance">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path fill="#525252" stroke="#525252" stroke-linejoin="round" stroke-width="4"
                d="m24 42l-9-13h18zm0-36l-9 13h18z" />
            </svg>
            <span class="fw-bold">거리순</span>
          </button>

          <button type="button" class="btn btn-light border rounded-pill px-3 text-bold" @click="sortByTime">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7z" />
            </svg>
            시간순
          </button>
        </div>
      </div>

      <!-- 리스트 스크롤 영역 -->
      <div class="overflow-auto px-3 flex-grow-1" style="min-height: 0; max-height: 100%;">
        <!-- 병원 목록 -->
        <div class="card shadow-sm mb-3" v-for="hospital in hospitals" :key="hospital.id">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h6 class="card-title fw-bold mb-1">{{ hospital.name || '병원명 없음' }}</h6>
              <span v-if="hospital.type"
                class="badge bg-success-subtle text-success-emphasis rounded-pill">
                <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="15px" viewBox="0 0 24 24">
                  <path fill="#008A64"
                    d="M2 22V11h7V6h6v11h7v5H2M8 8V6h2v2H8m0 2v2h2v-2H8m6-4v2h2V6h-2m0 4v2h2v-2h-2m0 4v2h2v-2h-2" />
                </svg> {{ hospital.type }}
              </span>
            </div>

            <div class="mb-2" v-if="hospital.dept_name">
              <span v-for="(dept, index) in hospital.dept_name.split(',').map(d => d.trim())" :key="index"
                class="badge rounded-pill me-1 mb-1"
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
              <button class="btn btn-outline-primary w-100" v-if="hospital.tel"
                @click.stop="callHospital(hospital.tel)" style="pointer-events: auto; z-index: 10;">
                <i class="bi bi-telephone-fill"></i> 전화
              </button>
              <button class="btn btn-primary w-100" @click.stop="openRouteModal(hospital)"
                style="pointer-events: auto; z-index: 10;">
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

  <!-- 경로 안내 옵션 모달 -->
  <div class="modal fade" id="routeModal" tabindex="-1" aria-labelledby="routeModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title" id="routeModalLabel">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              style="display: inline-block; vertical-align: middle; margin-right: 8px;">
              <path fill="currentColor"
                d="M17.5 4C15 4 13 6 13 8.5c0 2.89 4.5 9.5 4.5 9.5S22 11.39 22 8.5C22 6 20 4 17.5 4m0 7c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2M3 9c-1.11 0-2 .89-2 2v7c0 1.11.89 2 2 2h1v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1h5v-2H3zm7 3H3v-2h7z" />
            </svg>경로 안내
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="closeRouteModal" aria-label="닫기"></button>
        </div>

        <div class="modal-body">
          <div v-if="selectedHospital" class="alert alert-light border mb-3">
            <div class="fw-bold text-dark mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                <path fill="currentColor"
                  d="M2 22V11h7V6h6v11h7v5H2M8 8V6h2v2H8m0 2v2h2v-2H8m6-4v2h2V6h-2m0 4v2h2v-2h-2m0 4v2h2v-2h-2" />
              </svg>{{ selectedHospital.properties.hospital_name }}
            </div>
            <small class="text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                <path fill="currentColor"
                  d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7" />
              </svg>{{ selectedHospital.distanceKm }}km
            </small>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">이동 수단 선택</label>
            <div class="btn-group w-100" role="group">
              <input type="radio" class="btn-check" name="transportType" id="transport-car" value="car"
                v-model="transportType" checked>
              <label class="btn btn-outline-primary" for="transport-car">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                  style="display: block; margin: 0 auto 4px;">
                  <path fill="currentColor"
                    d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m-11 0A1.5 1.5 0 0 1 5 14.5A1.5 1.5 0 0 1 6.5 13A1.5 1.5 0 0 1 8 14.5A1.5 1.5 0 0 1 6.5 16M18.92 6c-.2-.58-.76-1-1.42-1h-11c-.66 0-1.21.42-1.42 1L3 12v8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-8z" />
                </svg>
                <small>자동차</small>
              </label>

              <input type="radio" class="btn-check" name="transportType" id="transport-walk" value="walk"
                v-model="transportType">
              <label class="btn btn-outline-primary" for="transport-walk">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                  style="display: block; margin: 0 auto 4px;">
                  <path fill="currentColor"
                    d="M14.12 10H19V8.2h-3.62l-2.94-3.12C12.08 4.71 11.63 4.5 11.15 4.5c-.22 0-.42.03-.62.09l-3.94 1.88c-.46.22-.79.66-.79 1.17v4.18c0 .53.71 1.04 1.27 1.04c.55 0 1-.45 1-1V8.91l1.83-.88l-1.62 7.88l-2.98-.83c-.41-.11-.82-.07-1.18.11L2 16.25c-.48.23-.78.72-.78 1.25c0 .75.61 1.36 1.36 1.36c.21 0 .41-.05.59-.13L5.1 17.5l3.08.86c.5.14 1 .04 1.42-.25l2.12-1.51l.69 3.4c.1.5.55.86 1.05.86c.07 0 .13-.01.19-.02c.57-.12.94-.67.82-1.24l-.89-4.38zM13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2" />
                </svg>
                <small>도보</small>
              </label>

              <input type="radio" class="btn-check" name="transportType" id="transport-transit" value="transit"
                v-model="transportType">
              <label class="btn btn-outline-primary" for="transport-transit">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                  style="display: block; margin: 0 auto 4px;">
                  <path fill="currentColor"
                    d="M18 11H6V6h12m-1.5 11a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m-9 0A1.5 1.5 0 0 1 6 15.5A1.5 1.5 0 0 1 7.5 14A1.5 1.5 0 0 1 9 15.5A1.5 1.5 0 0 1 7.5 17M12 2c-4 0-8 .5-8 4v10c0 1.5 1.5 3 3 3l-1 1v1h2l2-2h4l2 2h2v-1l-1-1c1.5 0 3-1.5 3-3V6c0-3.5-4-4-8-4" />
                </svg>
                <small>대중교통</small>
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="closeRouteModal">취소</button>
          <button type="button" class="btn btn-primary" @click="findRoute">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              style="display: inline-block; vertical-align: middle; margin-right: 4px;">
              <path fill="currentColor"
                d="M14.19 14.19c-1.14.59-3.11.51-4.24-.62c-1.14-1.13-1.21-3.1-.62-4.24l-2.86-2.86a10 10 0 0 0-2.81 6.98c0 6.2 6.19 10.18 6.19 10.18s6.19-3.98 6.19-10.18c0-1.2-.23-2.34-.66-3.41zM12 12a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2m-3.41-7.83l1.42 1.41L8.59 7L7.17 5.59zM12 4V1l-4 4l4 4V6a4 4 0 0 1 4 4c0 .85-.25 1.64-.68 2.3l1.46 1.46A6 6 0 0 0 18 10a6 6 0 0 0-6-6" />
            </svg>경로 탐색
          </button>
        </div>
      </div>
    </div>
  </div>

</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import axios from 'axios'

// TMAP API 키
const TMAP_APP_KEY = "pAs3duhDpE5cYgopfzzDmw8anJPaBak8HAdTerg8"

/* 진료과 필터 상태 */
const departmentOptions = [
  '내과', '외과', '정형외과', '신경외과', '마취통증의학과',
  '소아청소년과', '피부과', '영상의학과', '재활의학과', '가정의학과',
  '응급의학과', '성형외과', '안과', '한방내과', '산부인과'
]
const selectedDepartments = ref([])
function removeDepartment(dept) {
  selectedDepartments.value = selectedDepartments.value.filter(d => d !== dept)
}

/* 진료과별 색상 매핑 */
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
}

/* 진료과 색상 가져오기 */
function getDepartmentColor(deptName) {
  if (!deptName) return { bg: 'bg-secondary-subtle', text: 'text-secondary-emphasis', color: '#6c757d' }

  // 정확히 일치하는 진료과 찾기
  if (departmentColors[deptName]) {
    return departmentColors[deptName]
  }

  // 부분 일치하는 진료과 찾기 (예: "소아청소년과"가 "소아"를 포함하면)
  for (const [key, value] of Object.entries(departmentColors)) {
    if (deptName.includes(key) || key.includes(deptName)) {
      return value
    }
  }
  // 기본 색상
  return { bg: 'bg-secondary-subtle', text: 'text-secondary-emphasis', color: '#6c757d' }
}

/* 병원 데이터 상태 */
const hospitals = ref([])
const userLocation = ref(null)
//const searchRadius = ref(5) // 기본 5km 반경

/* 지도 상태 */
const map = ref(null)

/* 경로 탐색 상태 */
const isRouteMode = ref(false)
const selectedHospital = ref(null)
const transportType = ref('car') // car, walk, transit
const searchOption = ref('2') // 교통최적+최소시간
const trafficInfo = ref('N')
const routeDetails = ref({
  distance: '',
  time: '',
  fare: '',
  taxiFare: '',
  walkTime: '' // 도보 시간
})

// 경로 탐색 결과물 (마커, 라인)
const resultMarkerArr = ref([])
const resultdrawArr = ref([])
// ✅ 추가: 출발/도착 라벨도 추적해서 지움
const resultInfoWindowArr = ref([])

/* 바텀시트 드래그 */
const bottomSheet = ref(null)
const isDragging = ref(false)
const sheetHeightRatio = ref(0)
const dragStart = ref({ y: 0, ratio: 0 })

const MAX_SHEET_HEIGHT = window.innerHeight * 0.7
const MIN_SHEET_HEIGHT = 180

const sheetY = computed(() =>
  (MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT) * (1 - sheetHeightRatio.value)
)

const sheetStyle = computed(() => ({
  transition: isDragging.value ? 'none' : 'transform 0.3s ease-out',
  transform: `translateY(${sheetY.value}px)`,
  height: `${MAX_SHEET_HEIGHT}px`,
  bottom: `0px`,
  top: 'auto'
}))

/** 상단 버튼 요소 별로 함수 호출 */
/** 상단 버튼 요소별로 GeoServer Layer 조회 후 마커 표시 */
async function showLayerInView({ url, iconUrl, nameKey, addrKey, listType }) {
  if (!map.value) {
    alert("지도가 아직 준비되지 않았습니다.")
    return
  }

  try {
    // 1️⃣ 현재 지도 화면의 bbox 구하기
    const bounds = map.value.getBounds()
    const sw = bounds._sw
    const ne = bounds._ne
    const bbox = [sw.lng(), sw.lat(), ne.lng(), ne.lat()].join(',')

    // 2️⃣ GeoServer 요청
    const fullUrl = `${url}&bbox=${bbox},EPSG:4326`
    console.log(`조회 URL: ${fullUrl}`)

    const res = await fetch(fullUrl)
    const geojson = await res.json()

    // 3️⃣ 마커 초기화
    clearMarkers()

    // 4️⃣ 마커 표시
    geojson.features.forEach(f => {
      const [lon, lat] = f.geometry.coordinates
      const props = f.properties

      const marker = new Tmapv3.Marker({
        position: new Tmapv3.LatLng(lat, lon),
        icon: iconUrl,
        map: map.value
      })

      const info = new Tmapv3.InfoWindow({
        position: new Tmapv3.LatLng(lat, lon),
        content: `
          <div class="p-2 bg-white border rounded-2 shadow-sm" style="min-width:160px;">
            <strong>${props[nameKey] || "이름 없음"}</strong><br>
            <small>${props[addrKey] || "주소 없음"}</small>
          </div>`,
        type: 2,
        map: null
      })

      marker.addListener("click", () => {
        markers.forEach(m => m.info?.setMap(null))
        info.setMap(map.value)
      })

      marker.info = info
      markers.push(marker)
    })

    // 5️⃣ 바텀시트 리스트 데이터 업데이트
    addToHospitalList(geojson.features, listType)
    console.log("GeoServer 응답 샘플:", geojson.features[0])

    console.log(`✅ ${listType} ${geojson.features.length}개 표시 완료`)
  } catch (err) {
    console.error(`${listType} 조회 실패:`, err)
    alert(`${listType} 데이터를 불러오는 중 오류가 발생했습니다.`)
  }
}

// ✅ 달빛어린이병원 조회 (GeoServer)
function showMoonlight() {
  showLayerInView({
    url: "https://api.child119.com/geoserver/hospital/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hospital:moonlight_hospital&outputFormat=application/json",
    iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjZmZmYjAwIiBkPSJtMTcuNzUgNC4wOWwtMi41MyAxLjk0bC45MSAzLjA2bC0yLjYzLTEuODFsLTIuNjMgMS44MWwuOTEtMy4wNmwtMi41My0xLjk0TDEyLjQ0IDRsMS4wNi0zbDEuMDYgM3ptMy41IDYuOTFsLTEuNjQgMS4yNWwuNTkgMS45OGwtMS43LTEuMTdsLTEuNyAxLjE3bC41OS0xLjk4TDE1Ljc1IDExbDIuMDYtLjA1TDE4LjUgOWwuNjkgMS45NXptLTIuMjggNC45NWMuODMtLjA4IDEuNzIgMS4xIDEuMTkgMS44NWMtLjMyLjQ1LS42Ni44Ny0xLjA4IDEuMjdDMTUuMTcgMjMgOC44NCAyMyA0Ljk0IDE5LjA3Yy0zLjkxLTMuOS0zLjkxLTEwLjI0IDAtMTQuMTRjLjQtLjQuODItLjc2IDEuMjctMS4wOGMuNzUtLjUzIDEuOTMuMzYgMS44NSAxLjE5Yy0uMjcgMi44Ni42OSA1LjgzIDIuODkgOC4wMmE5Ljk2IDkuOTYgMCAwIDAgOC4wMiAyLjg5bS0xLjY0IDIuMDJhMTIuMDggMTIuMDggMCAwIDEtNy44LTMuNDdjLTIuMTctMi4xOS0zLjMzLTUtMy40OS03LjgyYy0yLjgxIDMuMTQtMi43IDcuOTYuMzEgMTAuOThjMy4wMiAzLjAxIDcuODQgMy4xMiAxMC45OC4zMSIvPjwvc3ZnPg==",
    nameKey: "duty_name",
    addrKey: "duty_addr",
    listType: "달빛어린이병원"
  })
}

// ✅ 소아청소년과 조회 (GeoServer)
function showPediatric() {
  showLayerInView({
    url: "https://api.child119.com/geoserver/hospital/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hospital%3Achildren_hospital&outputFormat=application%2Fjson&maxFeature=50",
    iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjMjQyZWZkIiBkPSJNMTIgMmEzIDMgMCAwIDEgMyAzYTMgMyAwIDAgMS0zIDNhMyAzIDAgMCAxLTMtM2EzIDMgMCAwIDEgMy0zbTAgN2MxLjYzIDAgMy4xMi4zNSA0LjUgMS4wNWMxLjM0LjcxIDIgMS41NiAyIDIuNTZ2NS43N2MwIDEuMTItLjg2IDIuMDYtMi42MSAyLjgxVjE5YzAtLjk1LS44Ni0xLjYyLTIuNTgtMi4wM2MtLjU2LS4xMy0xLS4xOS0xLjMxLS4xOWMtLjg3IDAtMS43LjE3LTIuNDYuNTJjLS43Ny4zNC0xLjIzLjc4LTEuMzggMS4zMWMxLjM0LjUzIDIuNjIuOCAzLjg0LjhsMS0uMXYyLjYzTDEyIDIyYTkuNyA5LjcgMCAwIDEtMy44OS0uODFjLTEuNzUtLjc1LTIuNjEtMS42OS0yLjYxLTIuODF2LTUuNzdjMC0xIC42Ni0xLjg1IDItMi41NlE5LjU3IDkgMTIgOW0wIDJhMiAyIDAgMCAwLTIgMmEyIDIgMCAwIDAgMiAyYTIgMiAwIDAgMCAyLTJhMiAyIDAgMCAwLTItMiIvPjwvc3ZnPg==",
    nameKey: "duty_name",
    addrKey: "duty_addr",
    listType: "소아청소년과"
  })
}

// 🕐 약국 조회 (API 뜯어야함)
async function showPharmacy() {
}

// ⚡ AED 조회 (공공데이터 API - 1000건씩만 추출)
async function showAED() {
  if (!map.value) {
    alert("지도가 아직 준비되지 않았습니다.")
    return
  }
  const key = "d43280d93d2b4881c7d82ace3929e20b5f2dfba72a77687d8ae7347d9f247d99"
  const pageNo = 1
  const numOfRows = 1000  // 필요에 따라 조정
  const url = `https://apis.data.go.kr/B552657/AEDInfoInqireService/getAedLcinfoInqire?serviceKey=${key}&pageNo=${pageNo}&numOfRows=${numOfRows}`

  try {
    const res = await fetch(url)
    const text = await res.text()
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, "application/xml")
    const items = xml.getElementsByTagName("item")

    clearMarkers()

    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      const latText = it.getElementsByTagName("wgs84Lat")[0]?.textContent
      const lonText = it.getElementsByTagName("wgs84Lon")[0]?.textContent
      const lat = latText ? parseFloat(latText) : NaN
      const lon = lonText ? parseFloat(lonText) : NaN
      const place = it.getElementsByTagName("buildPlace")[0]?.textContent || ""
      const addr = it.getElementsByTagName("placeDetail")[0]?.textContent || ""

      if (!isNaN(lat) && !isNaN(lon)) {
        const marker = new Tmapv3.Marker({
          position: new Tmapv3.LatLng(lat, lon),
          icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjZjAwIiBkPSJNMTYuNSAyLjgzYy0xLjc0IDAtMy40MS44MS00LjUgMi4wN2MtMS4wOS0xLjI2LTIuNzYtMi4wNy00LjUtMi4wN2MtMy4wOCAwLTUuNSAyLjQxLTUuNSA1LjVjMCAzLjc3IDMuNCA2Ljg2IDguNTUgMTEuNTNMMTIgMjEuMTdsMS40NS0xLjMxQzE4LjYgMTUuMTkgMjIgMTIuMSAyMiA4LjMzYzAtMy4wOS0yLjQyLTUuNS01LjUtNS41bS00LjUgMTV2LTRIOWwzLTd2NGgzIi8+PC9zdmc+",
          map: map.value
        })

        const info = new Tmapv3.InfoWindow({
          position: new Tmapv3.LatLng(lat, lon),
          content: `<div><strong>${place}</strong><br>${addr}</div>`,
          type: 2,
          map: null
        })

        marker.addListener("click", () => {
          markers.forEach(m => m.info?.setMap(null))
          info.setMap(map.value)
        })
        marker.info = info
        markers.push(marker)
      }
    }

    console.log(`✅ AED 위치정보 ${items.length}건 표시 완료`)

  } catch (err) {
    console.error("AED 위치정보 API 호출 실패:", err)
    alert("AED 정보를 불러올 수 없습니다.")
  }
}

/**
 * API 응답을 hospitals 배열로 통일시켜주는 함수
 */
function addToHospitalList(list, type) {
  hospitals.value = list.map((item) => {
    const props = item.properties || {}
    const [lon, lat] = item.geometry?.coordinates || [NaN, NaN]

    return {
      id: props.hpid || props.id || Math.random().toString(36).substring(2, 9),
      hpid: props.hpid || null,
      type, // 예: "소아청소년과"
      name:
        props.duty_name || props.hospital_name || props.name || props.dutyName || "이름 없음",
      addr:
        props.duty_addr || props.address || props.addr || props.dutyAddr || "주소 없음",
      tel:
        props.duty_tel1 || props.dutytel3 || props.hospital_tel || props.dutyTel1 || "",
      lat,
      lon,
      distanceKm: userLocation.value
        ? (calcDistance(userLocation.value.lat, userLocation.value.lon, lat, lon) / 1000).toFixed(1)
        : null,
      etaMin: userLocation.value
        ? ((calcDistance(userLocation.value.lat, userLocation.value.lon, lat, lon) / 80).toFixed(0))
        : null
    }
  })

  console.log(`✅ ${type} ${hospitals.value.length}개 표시 완료`)
  console.log("리스트 데이터 확인:", JSON.parse(JSON.stringify(hospitals.value)))
}

/* 두 지점 간 거리 계산 (Haversine 공식) - 미터 단위 */
const calcDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3 // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

 let markers = []

function clearMarkers() {
  markers.forEach(m => {
    if (m && m.setMap) m.setMap(null)
    if (m.info) m.info.setMap(null)
  })
  markers = []
}

/* 지도에 병원 마커 추가 */
const addHospitalMarkers = (hospitalList) => {
  if (!map.value) return
  clearMarkers()
  const bounds = new window.Tmapv3.LatLngBounds()

  hospitalList.forEach(hospital => {
    const position = new window.Tmapv3.LatLng(
      hospital.coordinates[1],
      hospital.coordinates[0]
    )
    bounds.extend(position)

    const marker = new window.Tmapv3.Marker({ position: position, map: map.value })

    // 마커 클릭 시 경로 안내 모달 표시
    window.Tmapv3.event.addListener(marker, 'click', () => {
      openRouteModal(hospital)
    })

    marker.__hospital = hospital
    markers.push(marker)
  })

  if (hospitalList.length) map.value.fitBounds(bounds)
}

/* 거리순 정렬 */
const distanceAsc = ref(true)
function sortByDistance() {
  const arr = hospitals.value
  arr.sort((a, b) => {
    const A = a.distance ?? Infinity
    const B = b.distance ?? Infinity
    return distanceAsc.value ? A - B : B - A
  })
  distanceAsc.value = !distanceAsc.value
}

/* 병원 전화 걸기 */
function callHospital(tel) {
  if (!tel) {
    alert('전화번호가 없습니다.')
    return
  }
  window.location.href = `tel:${tel}`
}

/* 길찾기 모달 열기 */
function openRouteModal(hospital) {
  selectedHospital.value = hospital

  // Bootstrap 5 Modal API 사용
  const modalEl = document.getElementById('routeModal')
  if (modalEl) {
    // Bootstrap이 로드되어 있는지 확인
    if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Modal) {
      const modal = new window.bootstrap.Modal(modalEl)
      modal.show()
    } else {
      // Bootstrap이 없으면 직접 모달 표시 (fallback)
      modalEl.classList.add('show')
      modalEl.style.display = 'block'
      document.body.classList.add('modal-open')

      // 백드롭 추가
      const backdrop = document.createElement('div')
      backdrop.className = 'modal-backdrop fade show'
      backdrop.id = 'route-modal-backdrop'
      document.body.appendChild(backdrop)
    }
  }
}

/* 길찾기 모달 닫기 */
function closeRouteModal() {
  const modalEl = document.getElementById('routeModal')
  if (modalEl) {
    if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Modal) {
      const modal = window.bootstrap.Modal.getInstance(modalEl)
      if (modal) modal.hide()
    } else {
      modalEl.classList.remove('show')
      modalEl.style.display = 'none'
      document.body.classList.remove('modal-open')
      const backdrop = document.getElementById('route-modal-backdrop')
      if (backdrop) backdrop.remove()
    }
  }
}

/* 경로 탐색 실행 */
async function findRoute() {
  if (!map.value || !userLocation.value || !selectedHospital.value) {
    alert('위치 정보를 확인할 수 없습니다.')
    return
  }

  // 모달 닫기
  closeRouteModal()

  // 기존 병원 마커 숨기기
  clearMarkers()

  // 기존 경로 정보 초기화
  clearRouteData()

  const headers = {
    "appKey": TMAP_APP_KEY,
    "Content-Type": "application/json"
  }

  try {
    let resultData, props

    // 이동 수단에 따라 다른 API 호출
    if (transportType.value === 'car') {
      // 자동차 경로
      const data = {
        "startX": String(userLocation.value.lon),
        "startY": String(userLocation.value.lat),
        "endX": String(selectedHospital.value.coordinates[0]),
        "endY": String(selectedHospital.value.coordinates[1]),
        "reqCoordType": "WGS84GEO",
        "resCoordType": "WGS84GEO",
        "searchOption": searchOption.value,
        "trafficInfo": trafficInfo.value
      }

      const response = await axios.post(
        "https://apis.openapi.sk.com/tmap/routes?version=1&format=json",
        data,
        { headers: headers }
      )

      resultData = response.data.features
      props = resultData[0].properties

      routeDetails.value = {
        distance: `${(props.totalDistance / 1000).toFixed(1)}km`,
        time: `${(props.totalTime / 60).toFixed(0)}분`,
        fare: `${props.totalFare}원`,
        taxiFare: `${props.taxiFare}원`,
        walkTime: ''
      }
    } else if (transportType.value === 'walk') {
      // 도보 경로
      const data = {
        "startX": String(userLocation.value.lon),
        "startY": String(userLocation.value.lat),
        "endX": String(selectedHospital.value.coordinates[0]),
        "endY": String(selectedHospital.value.coordinates[1]),
        "reqCoordType": "WGS84GEO",
        "resCoordType": "WGS84GEO",
        "startName": "출발지",
        "endName": selectedHospital.value.properties.hospital_name || "도착지"
      }

      const response = await axios.post(
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
        data,
        { headers: headers }
      )

      resultData = response.data.features
      props = resultData[0].properties

      routeDetails.value = {
        distance: `${(props.totalDistance / 1000).toFixed(1)}km`,
        time: `${(props.totalTime / 60).toFixed(0)}분`,
        fare: '',
        taxiFare: '',
        walkTime: `${(props.totalTime / 60).toFixed(0)}분`
      }
    } else if (transportType.value === 'transit') {
      // 대중교통 경로 (간단한 직선 거리로 대체 - TMAP 대중교통 API는 별도 상품)
      alert('대중교통 경로는 현재 지원하지 않습니다. 도보 또는 자동차를 선택해주세요.')
      return
    }

    isRouteMode.value = true

    // 경로 및 마커 그리기 - 파란색 라인
    for (const i in resultData) {
      const geometry = resultData[i].geometry
      const properties = resultData[i].properties

      if (geometry.type === "LineString") {
        const drawInfoArr = []
        for (const coord of geometry.coordinates) {
          drawInfoArr.push(new window.Tmapv3.LatLng(coord[1], coord[0]))
        }
        drawLine(drawInfoArr) // 파란색 라인으로 그리기
      } else {
        // 출발지(S)와 도착지(E) 마커만 표시
        if (properties.pointType === "S" || properties.pointType === "E") {
          const [lng, lat] = geometry.coordinates
          const position = new window.Tmapv3.LatLng(lat, lng)

          const label = properties.pointType === "S" ? "출발" : "도착"
          const color = properties.pointType === "S" ? "#0d6efd" : "#dc3545"

          const marker = new window.Tmapv3.Marker({
            position: position,
            map: map.value,
            title: label
          })

          // 커스텀 라벨 추가
          const infoWindow = new window.Tmapv3.InfoWindow({
            position: position,
            content: `<div style="padding:5px 10px;background:${color};color:white;border-radius:5px;font-weight:bold;font-size:12px;">${label}</div>`,
            type: 2,
            map: map.value,
            offset: new window.Tmapv3.Point(0, -10)
          })

          resultMarkerArr.value.push(marker)
          // ✅ 추가: 라벨도 기록
          resultInfoWindowArr.value.push(infoWindow)

        }
      }
    }

    // 바텀시트 올리기
    sheetHeightRatio.value = 0.5

  } catch (error) {
    console.error("경로 탐색 API 오류:", error)
    alert("경로 탐색에 실패했습니다.")
    if (error.response) {
      console.error("응답 데이터:", error.response.data)
    }
  }
}

/* 경로 라인 그리기 - 깔끔한 파란색 */
function drawLine(arrPoint) {
  if (!window.Tmapv3) return

  // 파란색 경로 라인
  const polyline_ = new window.Tmapv3.Polyline({
    path: arrPoint,
    strokeColor: "#0d6efd", // Bootstrap primary 파란색
    strokeWeight: 6,
    map: map.value
  })
  resultdrawArr.value.push(polyline_)
}

/* 경로 데이터 초기화 */
function clearRouteData() {
  resultMarkerArr.value.forEach(marker => marker.setMap(null))
  resultMarkerArr.value = []

  resultdrawArr.value.forEach(line => line.setMap(null))
  resultdrawArr.value = []

  resultInfoWindowArr.value.forEach(iw => iw.setMap(null))
  resultInfoWindowArr.value = []

}

/* 경로 모드 종료 */
function exitRouteMode() {
  isRouteMode.value = false
  selectedHospital.value = null
  clearRouteData()
}

/* 경로 정보 토글 */
function toggleRouteInfo() {
  isRouteInfoExpanded.value = !isRouteInfoExpanded.value
}

// 내 위치 마커와 정보창을 저장하는 변수
const currentLocationMarker = ref(null)
const currentLocationInfoWindow = ref(null)

/* 내 위치 새로고침 */
function refreshLocation() {
  if (!map.value) {
    alert('지도를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
    return
  }

  if (!navigator.geolocation) {
    alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.')
    return
  }

  // 위치 정보 옵션 설정
  const geoOptions = {
    enableHighAccuracy: true,  // 높은 정확도 요청
    timeout: 10000,            // 10초 타임아웃
    maximumAge: 0              // 캐시된 위치 사용 안함
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      console.log('위치 정보 새로고침 성공:', { lat, lon })

      const currentPos = new window.Tmapv3.LatLng(lat, lon)
      userLocation.value = { lat, lon }

      // 기존 내 위치 마커와 정보창 제거
      if (currentLocationMarker.value) {
        currentLocationMarker.value.setMap(null)
      }
      if (currentLocationInfoWindow.value) {
        currentLocationInfoWindow.value.setMap(null)
      }

      // 새로운 내 위치 마커 생성
      currentLocationMarker.value = new window.Tmapv3.Marker({
        position: currentPos,
        map: map.value
      })

      currentLocationInfoWindow.value = new window.Tmapv3.InfoWindow({
        position: currentPos,
        content: "<div class='p-1 bg-white border rounded-2'>현재 위치</div>",
        offset: new window.Tmapv3.Point(0, -30),
        type: 2,
        map: map.value
      })

      // 지도 중심 이동
      map.value.setCenter(currentPos)
      map.value.setZoom(17)
    },
    err => {
      console.error('Geolocation 오류 코드:', err.code, '메시지:', err.message)
      let errorMsg = '현재 위치를 가져올 수 없습니다.\n'

      switch (err.code) {
        case 1: // PERMISSION_DENIED
          errorMsg += '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
          break
        case 2: // POSITION_UNAVAILABLE
          errorMsg += '위치 정보를 사용할 수 없습니다.'
          break
        case 3: // TIMEOUT
          errorMsg += '위치 정보 요청 시간이 초과되었습니다.'
          break
        default:
          errorMsg += 'HTTPS 환경인지 확인해주세요.'
      }

      alert(errorMsg)
    },
    geoOptions
  )
}

/* 지도 초기화 */
const initTmap = () => {
  const el = document.getElementById('map_div')
  if (!el) return
  map.value = new window.Tmapv3.Map('map_div', {
    center: new window.Tmapv3.LatLng(37.5662952, 126.9779451),
    width: '100%',
    height: '100%',
    zoom: 16
  })

  if (navigator.geolocation) {
    // 위치 정보 옵션 설정
    const geoOptions = {
      enableHighAccuracy: true,  // 높은 정확도 요청
      timeout: 10000,            // 10초 타임아웃
      maximumAge: 0              // 캐시된 위치 사용 안함
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        console.log('위치 정보 가져오기 성공:', { lat, lon })
        const currentPos = new window.Tmapv3.LatLng(lat, lon)
        userLocation.value = { lat, lon }

        // 내 위치 마커와 정보창 생성 및 저장
        currentLocationMarker.value = new window.Tmapv3.Marker({ position: currentPos, map: map.value })
        currentLocationInfoWindow.value = new window.Tmapv3.InfoWindow({
          position: currentPos,
          content: "<div class='p-1 bg-white border rounded-2'>현재 위치</div>",
          offset: new window.Tmapv3.Point(0, -30),
          type: 2,
          map: map.value
        })

        map.value.setCenter(currentPos)
        map.value.setZoom(17)
      },
      err => {
        console.error('Geolocation 오류 코드:', err.code, '메시지:', err.message)
        let errorMsg = '현재 위치를 가져올 수 없습니다.\n'

        switch (err.code) {
          case 1: // PERMISSION_DENIED
            errorMsg += '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
            break
          case 2: // POSITION_UNAVAILABLE
            errorMsg += '위치 정보를 사용할 수 없습니다.'
            break
          case 3: // TIMEOUT
            errorMsg += '위치 정보 요청 시간이 초과되었습니다.'
            break
          default:
            errorMsg += 'HTTPS 환경인지 확인해주세요.'
        }

        alert(errorMsg)
        console.log('기본 위치(서울시청)로 설정합니다.')
        userLocation.value = { lat: 37.5662952, lon: 126.9779451 }
      },
      geoOptions
    )
  } else {
    alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.')
    userLocation.value = { lat: 37.5662952, lon: 126.9779451 }
  }
}

/* 바텀시트 제스처 */
const onTouchStart = e => {
  const target = e.target
  if (target.closest('button') || target.closest('.btn') || target.closest('.card-body')) {
    return
  }

  isDragging.value = true
  dragStart.value = { y: e.touches[0].clientY, ratio: sheetHeightRatio.value }
  e.preventDefault()
}

const onTouchMove = e => {
  if (!isDragging.value) return
  const target = e.target
  if (target.closest('button') || target.closest('.btn')) {
    return
  }

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

/* Tmap 스크립트 로더 */
function loadTmapScript() {
  return new Promise((resolve, reject) => {
    if (window.Tmapv3) return resolve()
    const exist = document.querySelector('script[data-tmap="v3"]')
    if (exist) {
      exist.addEventListener('load', resolve)
      exist.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.src = `https://apis.openapi.sk.com/tmap/vectorjs?version=1&appKey=${TMAP_APP_KEY}`
    script.dataset.tmap = 'v3'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}
function waitTmapReady(retry = 10) {
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (window.Tmapv3 && typeof window.Tmapv3.Map === 'function') return resolve()
      if (retry-- <= 0) return reject(new Error('Tmapv3 초기화 지연'))
      setTimeout(tick, 100)
    }
    tick()
  })
}

onMounted(() => {
  sheetHeightRatio.value = 0
  loadTmapScript().then(waitTmapReady).then(initTmap).catch(e => {
    console.error('Tmap 로딩 실패:', e)
    alert('지도를 불러오지 못했습니다. 네트워크/Tmap 콘솔 설정을 확인해주세요.')
  })
})

onBeforeUnmount(() => {
  clearMarkers()
  clearRouteData()
  if (map.value) map.value.destroy()
})


</script>

<!-- 커스텀 CSS 없음: Bootstrap/Icons 유틸만 사용 -->