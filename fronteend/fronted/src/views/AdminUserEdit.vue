<template>
  <!-- ✅ 다른 관리자 화면과 동일한 card + admin-main 레이아웃 -->
  <div class="card shadow-sm border-0 rounded-4">
    <main class="admin-main">
      <div class="container-fluid py-3 user-edit-container">

        <!-- 상단 헤더 -->
        <div class="mb-3 d-flex align-items-center gap-2">
          <button class="btn btn-link p-0 text-dark" @click="goBack">
            <i class="bi bi-arrow-left fs-5"></i>
          </button>
          <h4 class="text-bold mb-0">사용자 정보 수정</h4>
        </div>

        <!-- 사용자 기본 정보 -->
        <div class="card border-0 shadow-sm rounded-4 mb-3" v-if="user">
          <div class="card-body">
            <h5 class="text-medium mb-3">기본 정보</h5>

            <div class="mb-3">
              <label class="form-label text-medium text-muted">이메일 (읽기 전용)</label>
              <input type="email" class="form-control text-plight text-muted " v-model="user.email" disabled />
            </div>

            <div class="mb-3">
              <label class="form-label text-medium text-muted">이름</label>
              <input type="text" class="form-control text-plight text-muted" v-model="user.username" placeholder="사용자 이름" />
            </div>
          </div>
        </div>

        <!-- 자녀 정보 -->
        <div class="card border-0 shadow-sm rounded-4 mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="text-medium mb-0">자녀 정보</h5>
              <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill text-plight" @click="addKid">
                + 자녀 추가
              </button>
            </div>

            <div v-if="kids.length === 0" class="text-muted text-medium small">
              등록된 자녀 정보가 없습니다.
            </div>

            <div v-for="(k, idx) in kids" :key="k.id || idx" class="border rounded-3 p-2 mb-2">
              <div class="mb-2">
                <label class="form-label text-medium text-muted">이름</label>
                <input type="text" class="form-control text-plight text-muted" v-model="k.name" placeholder="자녀 이름" />
              </div>

              <div class="row g-2">
                <div class="col-12">
                  <label class="form-label text-medium text-muted">생년월일</label>
                  <div class="row g-2 text-plight text-muted">
                    <div class="col-4">
                      <select class="form-select form-select-sm" v-model.number="k.birthYear" required>
                        <option v-for="year in years" :key="year" :value="year">{{ year }}년</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <select class="form-select form-select-sm" v-model.number="k.birthMonth" required>
                        <option v-for="month in 12" :key="month" :value="month">{{ month }}월</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <select class="form-select form-select-sm" v-model.number="k.birthDay" required>
                        <option v-for="day in 31" :key="day" :value="day">{{ day }}일</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="col-12 mt-2">
                  <label class="form-label text-medium text-muted">나이 (자동)</label>
                  <input type="text" class="form-control text-plight text-muted"
                    :value="formatAge(k.birthYear, k.birthMonth, k.birthDay)" disabled />
                </div>
                <div class="col-6">
                  <label class="form-label text-medium text-muted">성별</label>
                  <select class="form-select form-select-sm text-plight text-muted" v-model="k.gender">
                    <option value="남">남</option>
                    <option value="여">여</option>
                  </select>
                </div>
              </div>

              <div class="mt-2 text-end">
                <button type="button" class="btn btn-outline-danger btn-sm rounded-pill text-plight" @click="removeKid(idx, k)">
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 하단 버튼 -->
        <div class="d-flex gap-2 mt-3">
          <button type="button" class="btn btn-outline-secondary flex-fill rounded-pill text-medium" @click="goBack">
            취소
          </button>
          <button type="button" class="btn btn-primary flex-fill rounded-pill text-medium" :disabled="saving" @click="saveAll">
            {{ saving ? '저장 중...' : '저장하기' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db } from '@/firebase'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'

const router = useRouter()
const route = useRoute()

const uid = route.params.uid

const user = ref(null)
const kids = ref([])
const saving = ref(false)
// 추가
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

const goBack = () => {
  router.back()
}

onMounted(async () => {
  await loadUser()
  await loadKids()
})

async function loadUser() {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    const data = snap.data()
    user.value = {
      uid,
      email: data.email || data.userEmail || '',
      username: data.username || data.name || ''
    }
  } else {
    alert('존재하지 않는 사용자입니다.')
    router.back()
  }
}

async function loadKids() {
  const q = query(
    collection(db, 'kidinformation'),
    where('parentUid', '==', uid)
  )
  const snap = await getDocs(q)
  kids.value = snap.docs.map(d => {
    const data = d.data()
    return {
      id: d.id,
      name: data.kid || '',
      birthYear: data.birthYear ?? null,
      birthMonth: data.birthMonth ?? null,  // 추가
      birthDay: data.birthDay ?? null,      // 추가
      gender: data.gender || '',
      heightCm: data.heightCm ?? null,
      weightKg: data.weightKg ?? null,
      bloodType: data.bloodType || '',
      allergy: data.allergy || '',
      medicalHistory: data.medicalHistory || '',
      medication: data.medication || '',
      _isNew: false,
      _isDeleted: false
    }
  })
}

function formatAge(birthYear) {
  if (!birthYear) return '-'
  const year = new Date().getFullYear()
  const age = year - birthYear
  if (age < 0 || age > 120) return '-'
  return `${age}세`
}

function addKid() {
  kids.value.push({
    id: null,
    name: '',
    birthYear: null,
    birthMonth: null,  // 추가
    birthDay: null,    // 추가
    gender: '',
    heightCm: null,
    weightKg: null,
    bloodType: '',
    allergy: '',
    medicalHistory: '',
    medication: '',
    _isNew: true,
    _isDeleted: false
  })
}

function removeKid(idx, kid) {
  if (kid._isNew) {
    kids.value.splice(idx, 1)
  } else {
    kids.value[idx]._isDeleted = true
  }
}

async function saveAll() {
  if (!user.value) return
  saving.value = true
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      username: user.value.username,
      updatedAt: serverTimestamp()
    })

    const batch = writeBatch(db)

    for (const k of kids.value) {
      const baseData = {
        parentUid: uid,
        kid: k.name,
        birthYear: k.birthYear,
        birthMonth: k.birthMonth,  // 추가
        birthDay: k.birthDay,      // 추가
        gender: k.gender,
        heightCm: k.heightCm,
        weightKg: k.weightKg,
        bloodType: k.bloodType,
        allergy: k.allergy,
        medicalHistory: k.medicalHistory,
        medication: k.medication,
        updatedAt: serverTimestamp()
      }

      if (k._isNew && !k._isDeleted) {
        const newRef = doc(collection(db, 'kidinformation'))
        batch.set(newRef, {
          ...baseData,
          createdAt: serverTimestamp()
        })
      } else if (!k._isNew && k._isDeleted) {
        const kidRef = doc(db, 'kidinformation', k.id)
        batch.delete(kidRef)
      } else if (!k._isNew && !k._isDeleted) {
        const kidRef = doc(db, 'kidinformation', k.id)
        batch.update(kidRef, baseData)
      }
    }

    await batch.commit()

    alert('사용자 정보가 저장되었습니다.')
    router.back()
  } catch (e) {
    console.error('사용자 정보 저장 실패:', e)
    alert('저장 중 오류가 발생했습니다.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* 다른 관리자 페이지와 폭/위치 맞추는 메인 영역 */
.admin-main {
  margin-left: 240px;
  /* 사이드바 너비와 동일 */
  padding-top: 1.5rem;
  padding-bottom: 2.5rem;
  padding-left: 0;
  padding-right: 0;
  min-height: 100vh;
  background-color: transparent;
}

/* 안쪽 컨테이너 살짝만 여백 */
.user-edit-container {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
</style>
