<template>
  <div class="container-fluid min-vh-100 d-flex flex-column justify-content-center py-5 px-4">
    <div class="row justify-content-center mb-4">
      <div class="col-12 col-md-10 c0l-lg-8 mx-auto"><!--화면에 꽉차게 만들기-->
        <div class="card shadow-sm border-0 bg-light">
          <div class="card-body text-center">
            <h2 class="card-title fw-bold mb-3">🚨 실시간 재난 문자 알림</h2>
            
            <div v-if="location.lat" class="alert alert-primary d-inline-block m-0 py-2 px-4 rounded-pill">
              <strong>현재 내 위치:</strong> 위도 {{ location.lat.toFixed(4) }} / 경도 {{ location.lng.toFixed(4) }}
            </div>
            <div v-else class="alert alert-secondary d-inline-block m-0 py-2 px-4 rounded-pill">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ statusMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6 mx-auto">
        
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">최신 재난 정보를 불러오고 있습니다...</p>
        </div>

        <div v-else-if="disasterList.length === 0" class="alert alert-info text-center shadow-sm" role="alert">
          현재 수신된 재난 문자가 없습니다.
        </div>

        <div v-else class="d-flex flex-column gap-3">
          <div 
            v-for="item in disasterList" 
            :key="item.SN" 
            class="card border-0 shadow-sm"
          >
            <div class="card-header d-flex justify-content-between align-items-center bg-white border-bottom-0 pt-3 pb-0">
              <span :class="getBadgeClass(item.EMRG_STEP_NM)">
                {{ item.EMRG_STEP_NM }}
              </span>
              <small class="text-muted">{{ item.CRT_DT }}</small>
            </div>

            <div class="card-body">
              <h5 class="card-title fw-bold text-dark mb-2">
                {{ item.RCPTN_RGN_NM }} 
                <span class="text-secondary fs-6 ms-2">({{ item.DST_SE_NM }})</span>
              </h5>
              <p class="card-text text-secondary lh-base">
                {{ item.MSG_CN }}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// 분리해둔 로직 파일들을 import (Clean Code)
import { getCurrentCoordinate } from '@/utils/geoUtils';
import { fetchDisasterList } from '@/api/disaster';

// 상태 관리 (Reactive Variables)
const location = ref({ lat: null, lng: null });
const disasterList = ref([]);
const isLoading = ref(true);
const statusMessage = ref("위치 정보를 불러오는 중입니다...");

// 초기화 로직
const initPage = async () => {
  try {
    // 1. 병렬 처리: 위치 정보와 재난 데이터를 동시에 요청하지 않고 순차적으로 처리하거나
    // 필요에 따라 동시에 처리할 수 있습니다. 여기서는 각각 처리합니다.
    
    // 위치 정보 획득 시도
    try {
      const coords = await getCurrentCoordinate();
      location.value = coords;
    } catch (geoError) {
      statusMessage.value = "위치 정보를 가져올 수 없습니다.";
      console.warn(geoError);
    }

    // 2. 재난 문자 데이터 가져오기
    const data = await fetchDisasterList();
    disasterList.value = data;

  } catch (error) {
    console.error("초기화 중 오류 발생:", error);
  } finally {
    isLoading.value = false; // 로딩 종료
  }
};

// 부트스트랩 뱃지 색상 결정 함수 (UI Logic)
const getBadgeClass = (stepName) => {
  const baseClass = "badge rounded-pill px-3 py-2 ";
  if (stepName === '위급재난') return baseClass + "bg-danger"; // 빨강
  if (stepName === '긴급재난') return baseClass + "bg-warning text-dark"; // 노랑
  if (stepName === '안전안내') return baseClass + "bg-success"; // 초록
  return baseClass + "bg-secondary"; // 회색
};

// 컴포넌트가 마운트되면 실행
onMounted(() => {
  initPage();
});
</script>