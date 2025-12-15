<template>
  <div class="bg-gray min-vh-100 d-flex justify-content-center align-items-start py-4">
    <div class="card shadow-sm border-0 rounded-4 p-4 bg-white" style="width: 420px;">
      <!-- 상단 헤더 -->
      <div class="d-flex align-items-center mb-4">
        <button class="btn btn-link p-0 me-2 text-dark" @click="goBack">
          <i class="bi bi-arrow-left fs-5"></i>
        </button>
        <h5 class="mb-0 text-bold">경희의료원</h5>
      </div>

      <!-- 병원 정보 -->
      <div class="hospital-info">
        <div class="info-block mb-4">
          <h6 class="mb-2 text-medium">병원 종류</h6>
          <div class="box">
            {{ hospital.type }}
          </div>
        </div>

        <div class="info-block mb-4">
          <div class="mb-2 text-medium">주소</div>
          <div class="box">
            {{ hospital.address }}
          </div>
        </div>

        <div class="info-block mb-4">
          <div class="mb-2 text-medium">전화번호</div>
          <div class="box">
            {{ hospital.phone }}
          </div>
        </div>

        <div class="info-block">
          <div class="mb-2 text-medium">진료과목</div>

          <div class="departments d-flex flex-wrap gap-2 mb-4">
            <span
              v-for="(dept, i) in visibleDepartments"
              :key="i"
              class="badge rounded-pill text-black text-medium px-3 py-2 dept-badge"
            >
              {{ dept }}
            </span>
          </div>

          <div class="text-center">
            <button 
              v-if="hospital.departments.length > 6" 
              class="btn btn-sm btn-outline-primary rounded-pill px-3 text-medium"
              @click="toggleShowAll"
            >
              {{ showAll ? '접기' : '더보기' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const goBack = () => router.back();

const showAll = ref(false);
const hospital = ref({
    type: "의원",
  address: "서울특별시 동대문구 경희대로 23(회기동)",
  phone: "02-958-8114",
  departments: [
    "내과", "소아청소년과", "신경과", "정신건강의학과",
    "외과", "피부과", "심장혈관흉부외과", "정형외과",
    "신경외과", "성형외과", "산부인과", "이비인후과",
    "마취통증의학과", "영상의학과", "가정의학과"
  ]
});

const visibleDepartments = computed(() => {
  return showAll.value ? hospital.value.departments : hospital.value.departments.slice(0, 12);
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

.info-block {
  margin-bottom: 1.2rem;
}

.text-accent {
  color: #4a4aff;
}

.bg-white {
  background-color: #ffffff !important;
}
</style>
