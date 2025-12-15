<template>
  <div>
    <!-- 본문 래퍼: 헤더/푸터 높이만큼 패딩 확보 -->
    <main class="container-fluid py-4 px-0">
      <!-- 스크롤 영역: 헤더/푸터 제외 높이 계산 -->
      <div class="overflow-auto" :style="scrollBoxStyle" style="padding-bottom:84px;">
        <!-- 타이틀 -->
        <h5 class="text-bold mb-3" style="padding-left: 0; padding-right: 0;">내 아이</h5>

        <!-- 로딩 중 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary text-medium" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
          <p class="mt-3 text-medium">아이 정보를 불러오는 중...</p>
        </div>

        <!-- 아이 목록이 없을 때 -->
        <div v-else-if="kids.length === 0" class="text-center py-5">
          <i class="bi bi-people fs-1 text-muted d-block mb-3"></i>
          <p class="text-medium">등록된 아이가 없습니다.</p>
          <p class="text-dark text-plight">아래 버튼을 눌러 아이 정보를 추가해주세요.</p>
        </div>

        <!-- 아이 카드(아코디언 형태) -->
        <div v-else class="card shadow-sm mb-3" style="margin-left: 0; margin-right: 0; border-radius: 0;" v-for="(kid, i) in kids" :key="kid.id">
          <div class="card-body p-3">
            <!-- 상단 요약행 -->
            <div class="d-flex align-items-center">
              <img
                :src="getKidImage(kid.gender)"
                alt="avatar"
                class="rounded-circle me-2"
                style="width:36px;height:36px;object-fit:cover;"
              />
              <div class="flex-grow-1 text-medium">{{ kid.label }}</div>
            

              <button class="btn btn-link px-2" @click="editKid(i)" aria-label="수정">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button class="btn btn-link px-2" @click="toggle(i)" :aria-expanded="kid.open" :aria-controls="'kid'+i">
                <i class="bi" :class="kid.open ? 'bi-caret-up-fill' : 'bi-caret-down-fill'"></i>
              </button>
            </div>

            <!-- 상세 -->
            <div :id="'kid'+i" v-show="kid.open" class="mt-3">
              <dl class="row mb-0">
                <dt class="col-4 text-medium">이름</dt>
                <dd class="col-8 text-black text-plight mb-2">{{ kid.name }}</dd>

                <dt class="col-4 text-medium">출생년도</dt>
                <dd class="col-8 text-black text-plight mb-2">{{ kid.birthYear }}</dd>

                <dt class="col-4 text-medium">혈액형</dt>
                <dd class="col-8 text-black text-plight mb-2">{{ kid.blood }}</dd>

                <dt class="col-4 text-medium">특이 체질</dt>
                <dd class="col-8 text-black text-plight mb-2">{{ kid.trait || '-' }}</dd>

                <dt class="col-4 text-medium">복용 중인 약</dt>
                <dd class="col-8 text-black text-plight mb-2">{{ kid.meds || '-' }}</dd>

                <dt class="col-4 text-medium">키(cm)</dt>
                <dd class="col-8 text-black text-plight mb-2">{{ kid.height }}</dd>

                <dt class="col-4 text-medium">몸무게(kg)</dt>
                <dd class="col-8 text-black text-plight mb-2">{{ kid.weight }}</dd>

                <dt class="col-4 text-medium">알레르기</dt>
                <dd class="col-8 text-black text-plight mb-2">{{ kid.allergy || '-' }}</dd>

                <dt class="col-4 text-medium">성별</dt>
                <dd class="col-8">
                  <span v-if="kid.gender==='F'" class="text-black text-plight"><i class="bi bi-gender-female text-danger me-1"></i>여</span>
                  <span v-else-if="kid.gender==='M'" class="text-black text-plight"><i class="bi bi-gender-male text-primary me-1"></i>남</span>
                  <span v-else>-</span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <!-- 추가 버튼 -->
        <button class="btn btn-primary text-medium w-100 mb-3" @click="addKid">내 아이 +</button>
      </div>
    </main>

   
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from 'vue-router'
import { watchMyKids } from '@/firebase/kid.js'
import kidboyImg from '@/assets/kidboy.png'
import kidgirlImg from '@/assets/kidgirl.png'
import kidDefaultImg from '@/assets/kid1.jpg'

const router = useRouter()
const kids = ref([])
const loading = ref(true)
let unsubscribe = null

// 성별에 따른 이미지 선택 함수
const getKidImage = (gender) => {
  if (gender === 'M') return kidboyImg
  if (gender === 'F') return kidgirlImg
  return kidDefaultImg
}

/* 본문 스크롤 영역 높이 계산: 헤더/푸터 고정값을 제외 */
const scrollBoxStyle = computed(() => ({
  height: "calc(100vh - 64px - 84px)",
}))

onMounted(async () => {
  try {
    // Firestore에서 실시간으로 내 아이 목록 구독
    unsubscribe = await watchMyKids((rows) => {
      kids.value = rows.map(kid => ({
        id: kid.id,
        label: kid.kid || "아이",  // kid 필드 사용
        name: kid.kid || "",  // kid 필드 사용
        birthYear: kid.birthYear || "",
        blood: kid.bloodType || "",  // bloodType 필드 사용
        trait: kid.medicalHistory || "",  // medicalHistory 필드 사용
        meds: kid.medication || "",  // medication 필드 사용
        height: kid.heightCm || 0,  // heightCm 필드 사용
        weight: kid.weightKg || 0,  // weightKg 필드 사용
        allergy: kid.allergy || "",
        gender: kid.gender || "",
        open: false
      }))
      loading.value = false
    })
  } catch (error) {
    console.error('아이 목록 불러오기 실패:', error)
    if (error.message === '로그인이 필요합니다.') {
      alert('로그인이 필요합니다.')
      router.push('/login')
    }
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
})

function toggle(i) {
  kids.value[i].open = !kids.value[i].open
}

function editKid(i) {
  const kidId = kids.value[i].id
  router.push(`/kidinformationedit/${kidId}`)
}

function addKid() {
  router.push("/AddKid")
}
</script>
