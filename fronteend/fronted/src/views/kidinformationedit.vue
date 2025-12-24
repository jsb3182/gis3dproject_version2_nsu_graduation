<template>
  <main class="min-vh-100">
    <div class="container-fluid py-4 px-0">
      <!-- 상단 헤더 -->
      <div class="d-flex align-items-center mb-3">
        <button class="btn btn-link p-0 me-2 text-dark" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="#000" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z" />
          </svg>
        </button>
        <img :src="getKidImage(form.gender)" alt="avatar" class="rounded-circle me-2"
          style="width:36px;height:36px;object-fit:cover;" />
        <h5 class="mb-0 text-bold">아이 정보 수정</h5>
      </div>

      <!-- 카드 래핑 (회색 배경 위 흰 카드 느낌) -->
      <form @submit.prevent="save">
        <!-- 이름 -->
        <div class="mb-3">
          <label class="form-label text-medium">이름</label>
          <input v-model.trim="form.name" type="text" class="form-control text-plight" placeholder="김서아" />
        </div>
        <!-- 생년월일 -->
        <div class="mb-3">
          <label class="form-label text-medium">생년월일</label>
          <div class="row g-2">
            <div class="col-4">
              <select v-model.number="form.birthYear" class="form-select text-plight" required>
                <option value="">년도</option>
                <option v-for="year in years" :key="year" :value="year">{{ year }}년</option>
              </select>
            </div>
            <div class="col-4">
              <select v-model.number="form.birthMonth" class="form-select text-plight" required>
                <option value="">월</option>
                <option v-for="month in 12" :key="month" :value="month">{{ month }}월</option>
              </select>
            </div>
            <div class="col-4">
              <select v-model.number="form.birthDay" class="form-select text-plight" required>
                <option value="">일</option>
                <option v-for="day in 31" :key="day" :value="day">{{ day }}일</option>
              </select>
            </div>
          </div>
        </div>


        <!-- 혈액형 -->
        <div class="mb-3">
          <label class="form-label text-medium">혈액형</label>
          <input v-model.trim="form.blood" type="text" class="form-control  text-plight" placeholder="O형" />
        </div>

        <!-- 복용 중인 약 (멀티라인) -->
        <div class="mb-3">
          <label class="form-label text-medium">복용 중인 약</label>
          <textarea v-model.trim="form.meds" class="form-control text-plight" rows="2"
            placeholder="OOO 알러지약 아침마다 복용"></textarea>
        </div>

        <!-- 키(cm) -->
        <div class="mb-3">
          <label class="form-label text-medium">키(cm)</label>
          <input v-model.number="form.height" type="number" class="form-control text-plight" placeholder="95" />
        </div>

        <!-- 몸무게(kg) -->
        <div class="mb-3">
          <label class="form-label text-medium">몸무게(kg)</label>
          <input v-model.number="form.weight" type="number" class="form-control text-plight" placeholder="14" />
        </div>

        <!-- 기저질환 및 병력 -->
        <div class="mb-3">
          <label class="form-label text-medium">기저질환 및 병력</label>
          <textarea v-model.trim="form.history" class="form-control  text-plight" rows="2"
            placeholder="12개월 때 열성 경련 경험 있음"></textarea>
        </div>

        <!-- 알레르기 -->
        <div class="mb-3">
          <label class="form-label text-medium">알레르기</label>
          <input v-model.trim="form.allergy" type="text" class="form-control  text-plight" placeholder="땅콩, 감귤류 알레르기" />
        </div>

        <!-- 성별 -->
        <div class="mb-4">
          <label class="form-label d-block text-medium">성별</label>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="genderM" value="M" v-model="form.gender" />
            <label class="form-check-label text-plight" for="genderM">남</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="genderF" value="F" v-model="form.gender" />
            <label class="form-check-label text-plight" for="genderF">여</label>
          </div>
        </div>

        <!-- 로딩 중 표시 -->
        <div v-if="loading" class="text-center py-3">
          <div class="spinner-border text-primary text-medium" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
        </div>

        <button v-else class="btn btn-primary w-100 mb-2 text-medium" type="submit" :disabled="saving">
          {{ saving ? '저장 중...' : '저장하기' }}
        </button>

        <!-- 삭제 버튼 (빨간색) -->
        <button v-if="!loading" class="btn btn-outline-danger w-100 text-medium mb-5" type="button" @click="deleteKid">
          <i class="bi bi-trash me-1"></i> 삭제하기
        </button>




      </form>
    </div>
  </main>
</template>
<style scoped>
.form-control,
.form-select {
  box-shadow: none !important;
}

.form-control:focus,
.form-select:focus {
  box-shadow: none !important;
}
</style>


<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import { getKid, updateKid, removeKid } from '@/firebase/kid.js'
import kidboyImg from '@/assets/kidboy.png'
import kidgirlImg from '@/assets/kidgirl.png'
import kidDefaultImg from '@/assets/kid1.jpg'

const route = useRoute()
const router = useRouter()
const kidId = route.params.id

const form = reactive({
  name: '',
  birthYear: '',
  birthMonth: '',  // 추가
  birthDay: '',    // 추가
  blood: '',
  meds: '',
  height: '',
  weight: '',
  history: '',
  allergy: '',
  gender: '',
})

const loading = ref(true)
const saving = ref(false)
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

onMounted(async () => {
  try {
    // TODO: 백엔드 API에서 아이 정보를 불러오도록 수정
    console.log(`백엔드 API에서 ID가 ${kidId}인 아이 정보 불러오기`);
    // const kidData = await getKid(kidId)
    // form.name = kidData.kid || ''
    // form.birthYear = kidData.birthYear || ''
    // form.birthMonth = kidData.birthMonth || ''
    // form.birthDay = kidData.birthDay || ''
    // form.blood = kidData.bloodType || ''
    // form.meds = kidData.medication || ''
    // form.height = kidData.heightCm || ''
    // form.weight = kidData.weightKg || ''
    // form.history = kidData.medicalHistory || ''
    // form.allergy = kidData.allergy || ''
    // form.gender = kidData.gender || ''
    loading.value = false
  } catch (error) {
    console.error('아이 정보 불러오기 실패:', error)
    alert('아이 정보를 불러올 수 없습니다.')
    router.push('/MyKids')
  }
})

const getKidImage = (gender) => {
  if (gender === 'M') return kidboyImg
  if (gender === 'F') return kidgirlImg
  return kidDefaultImg
}
async function save() {
  if (!form.name || !form.birthYear || !form.birthMonth || !form.birthDay || !form.blood || !form.gender) {
    alert('필수 항목을 입력해주세요.')
    return
  }

  saving.value = true
  try {
    // TODO: 백엔드 API로 아이 정보 수정
    console.log(`백엔드 API로 ID가 ${kidId}인 아이 정보 수정`, form);
    // await updateKid(kidId, form)
    alert('아이 정보가 수정되었습니다! (백엔드 연동 필요)')
    router.push('/MyKids')
  } catch (error) {
    console.error('아이 정보 수정 실패:', error)
    alert('정보 수정에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

async function deleteKid() {
  if (!confirm('정말로 이 아이의 정보를 삭제하시겠습니까?')) {
    return
  }

  try {
    // TODO: 백엔드 API로 아이 정보 삭제
    console.log(`백엔드 API로 ID가 ${kidId}인 아이 정보 삭제`);
    // await removeKid(kidId)
    alert('아이 정보가 삭제되었습니다. (백엔드 연동 필요)')
    router.push('/MyKids')
  } catch (error) {
    console.error('아이 정보 삭제 실패:', error)
    alert('정보 삭제에 실패했습니다.')
  }
}

function goBack() {
  router.back()
}
</script>