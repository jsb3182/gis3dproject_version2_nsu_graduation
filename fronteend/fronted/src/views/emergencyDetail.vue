<template>
  <div class="bg-gray min-vh-100 d-flex justify-content-center align-items-start py-4">
    <div v-if="hospitalData" class="card shadow-sm border-0 rounded-4 p-4 bg-white" style="width: 420px;">
      <!-- 상단 헤더 -->
      <div class="d-flex align-items-center mb-3 gap-2">
        <button class="btn btn-link p-0 me-2 text-dark d-flex" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="#000" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z" />
          </svg>
        </button>
        <div class="mb-0 text-bold fs-5 d-flex">{{ hospitalData.dutyName }}</div>
      </div>

      <!-- 병원 정보 -->
      <div class="hospital-info">


        <div class="d-flex justify-content-start align-items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="#000"
              d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7" />
          </svg>
          <div class="d-flex text-plight">
            {{ hospitalData.dutyAddr }}
          </div>
        </div>

        <div class="d-flex justify-content-start align-items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="#000"
              d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25c1.12.37 2.32.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02z" />
          </svg>
          <div class=" text-plight">
            {{ hospitalData.dutyTel3 }}
          </div>
        </div>

        <div class="d-flex flex-column justify-content-start mb-2">
          <div class="d-flex fs-7 text-bold ">소아 응급실 현황</div>
          <div class="d-flex align-items-center gap-2 ms-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="#000"
                d="M19 7h-8v7H3V5H1v15h2v-3h18v3h2v-9a4 4 0 0 0-4-4M7 13a3 3 0 0 0 3-3a3 3 0 0 0-3-3a3 3 0 0 0-3 3a3 3 0 0 0 3 3" />
            </svg>
            <div class="text-bold badge rounded-pill bg-success d-flex" v-if="realTimeData">
              {{ realTimeData.bed_avail }} / {{ realTimeData.bed_total }}
            </div>
          </div>
        </div>

        <div class="d-flex flex-column justify-content-start">
          <div class="d-felx text-bold fs-7 mb-2">진료 시간</div>
          <table class="table table-striped table-bordered text-plight ms-2">
            <tbody>
              <tr>
                <th>월</th>
                <td>{{ formatTime(hospitalData.dutyTime1s) }} - {{ formatTime(hospitalData.dutyTime1c) }}</td>
              </tr>
              <tr>
                <th>화</th>
                <td>{{ formatTime(hospitalData.dutyTime2s) }} - {{ formatTime(hospitalData.dutyTime2c) }}</td>
              </tr>
              <tr>
                <th>수</th>
                <td>{{ formatTime(hospitalData.dutyTime3s) }} - {{ formatTime(hospitalData.dutyTime3c) }}</td>
              </tr>
              <tr>
                <th>목</th>
                <td>{{ formatTime(hospitalData.dutyTime4s) }} - {{ formatTime(hospitalData.dutyTime4c) }}</td>
              </tr>
              <tr>
                <th>금</th>
                <td>{{ formatTime(hospitalData.dutyTime5s) }} - {{ formatTime(hospitalData.dutyTime5c) }}</td>
              </tr>
              <tr>
                <th>토</th>
                <td>{{ formatTime(hospitalData.dutyTime6s) }} - {{ formatTime(hospitalData.dutyTime6c) }}</td>
              </tr>
              <tr>
                <th>일</th>
                <td>{{ formatTime(hospitalData.dutyTime7s) }} - {{ formatTime(hospitalData.dutyTime7c) }}</td>
              </tr>
            </tbody>
          </table>
        </div>


        <div class="info-block">
          <div class="mb-2 text-bold">진료과목</div>

          <div class="departments d-flex flex-wrap gap-2 mb-4">
            <span v-for="(dept, i) in visibleDepartments" :key="i"
              class="badge rounded-pill text-black text-plight px-3 py-2 dept-badge">
              {{ dept }}
            </span>
          </div>

          <div class="text-center pb-5">
            <button v-if="departments.length > 12"
              class="btn btn-sm btn-outline-primary rounded-pill px-3  text-bold" @click="toggleShowAll"><svg
                xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 24 24">
                <path fill="#0D6EFD" d="M1 3h22L12 22" />
              </svg>
              {{ showAll ? '접기' : '더보기' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
// api 연결
import { getEmergencyHospitalByHPID, getEmergencyFormWFSByFilter } from '@/utils/api'


const router = useRouter();
const goBack = () => router.back();

onMounted(async () => {
  getHospitalData(hpid)
  getRealTimeData(hpid)
});


let hospitalData = ref(null)
let realTimeData = ref(null)

// hpid
// ex) emergency.A1100001 -> A1100001 
const props = defineProps({
  hpid: String
})
const parts = props.hpid.split('.');
const hpid = parts[1]

// 공공 데이터 불러오기
async function getHospitalData(hpid) {
  console.log(hpid)
  try{
    const res = await getEmergencyHospitalByHPID(hpid)
    if( res && res.length > 0 ) {
      hospitalData.value = res[0]
    }
    console.log(hospitalData.value)
  } catch(err) {
    console.error(`병원 정보 조회 실패 -> ${err}`)
  }
}

// geoserver 데이터
async function getRealTimeData(hpid) {
  try{
    realTimeData.value = await getEmergencyFormWFSByFilter(hpid);
    console.log(realTimeData.value)
  } catch (err) {
    console.error(`WFS실행 오류 -> ${err}`)
  }

}


// 시간 포맷팅 헬퍼 함수
const formatTime = (time) => {
    if (!time) return '정보 없음';
    const timeStr = String(time).padStart(4, '0');
    return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
};

const showAll = ref(false);

// 원본 진료과목 배열 생성 (dgidIdName 분리)
const departments = computed(() => {
    if (hospitalData.value && typeof hospitalData.value.dgidIdName === 'string') {
        return hospitalData.value.dgidIdName.split(',');
    }
    return [];
});
 
// '더보기/접기' 로직 적용 (12개로 제한)
const visibleDepartments = computed(() => {
    // showAll 상태에 따라 전체 또는 일부(12개) 반환
    return showAll.value ? departments.value : departments.value.slice(0, 12);
});

const toggleShowAll = () => {
    showAll.value = !showAll.value;
};


</script>

<style scoped>
.bg-gray {
  background-color: rgba(170, 170, 188, 0.1);
  min-height: 100vh;
}

.box {
  display: flex;
  align-items: center;
  background-color: rgba(170, 170, 188, 0.05);
  width: 100%;
  padding: 0.6rem 0.8rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(170, 170, 188, 0.4);
  color: #333;
  font-size: 0.95rem;
}

.dept-badge {
  background-color: rgba(170, 170, 188, 0.15);
  border: 1px solid rgba(170, 170, 188, 0.4);
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.dept-badge:hover {
  background-color: rgba(170, 170, 188, 0.3);
  transform: scale(1.05);
}



.text-accent {
  color: #0D6EFD;
}

.bg-white {
  background-color: #ffffff !important;
}
</style>
