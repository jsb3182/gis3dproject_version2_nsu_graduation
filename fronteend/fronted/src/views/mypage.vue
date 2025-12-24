<!-- src/views/SettingsPage.vue -->
<template>
  <main class="min-vh-100 bg-body-tertiary">
    <!-- 헤더: 좌측 뒤로가기 + 프로필 -->
    <header class="sticky-top bg-white border-bottom">
      <div class="container-fluid px-3 py-2">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-link p-0 me-1" @click="$router.back()" aria-label="뒤로">
            <i class="bi bi-arrow-left fs-4"></i>
          </button>

          <div class="d-flex align-items-center gap-3">
            <!-- 아바타 -->
            <div class="rounded-circle border bg-light" style="width:40px;height:40px;"></div>
            <div class="lh-sm">
              <div class="fw-semibold">{{ user ? (user.name || user.username || '게스트') : '게스트' }}</div>
              <div class="text-secondary small">내 정보 · 주소 관리</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 본문 -->
    <section class="container-fluid px-0">
      <!-- 1. 일반 섹션 -->
      <div class="bg-white border-top border-bottom mb-2">
        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>로그인</span>
            <span v-if="!user" @click="goToLogin" class="text-primary" role="button">로그인하기</span>
            <span v-else @click="logout" class="text-danger" role="button">로그아웃</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>내아이정보</span>
            <i @click="goTokid" class="bi bi-chevron-right text-secondary" role="button"></i>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>화면 테마 · 진동</span>
            <i class="bi bi-chevron-right text-secondary"></i>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>연락처 관리</span>
            <i class="bi bi-chevron-right text-secondary"></i>
          </li>
        </ul>
      </div>

      <!-- 섹션 타이틀 -->
      <div class="px-3 pt-3 pb-1 text-secondary fw-bold small">인증 및 보안</div>
      <div class="bg-white border-top border-bottom mb-2">
        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>인증서</span>
            <i class="bi bi-chevron-right text-secondary"></i>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>비밀번호 · 보안</span>
            <i class="bi bi-chevron-right text-secondary"></i>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>토스로 로그인한 서비스</span>
            <i class="bi bi-chevron-right text-secondary"></i>
          </li>
        </ul>
      </div>

      <div class="px-3 pt-3 pb-1 text-secondary fw-bold small">자산 및 증명서</div>
      <div class="bg-white border-top border-bottom mb-2">
        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>불러온 자산 (마이데이터) 관리</span>
            <i class="bi bi-chevron-right text-secondary"></i>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>증명서 발급</span>
            <i class="bi bi-chevron-right text-secondary"></i>
          </li>
        </ul>
      </div>

      <div class="pb-4"></div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { getUser, clearUser } from '../utils/userService.js'
// import { auth } from '../firebase/index'
// import { signOut } from 'firebase/auth'

const router = useRouter()
const user = ref(getUser())

function onUserChanged(e) {
  user.value = e.detail ?? getUser()
}

onMounted(() => {
  window.addEventListener('user-changed', onUserChanged)
  window.addEventListener('storage', onUserChanged)
})

onBeforeUnmount(() => {
  window.removeEventListener('user-changed', onUserChanged)
  window.removeEventListener('storage', onUserChanged)
})

function goToLogin() {
  router.push('/login')
}

function goTokid() {
  router.push('/MyKids')
}

async function logout() {
  try {
    // TODO: 백엔드 API 로그아웃 호출
    // await signOut(auth)
    
    // localStorage에서 사용자 정보 삭제
    clearUser()
    user.value = null
    alert('로그아웃되었습니다.')
    router.push('/')
  } catch (error) {
    console.error('로그아웃 오류:', error)
    alert('로그아웃 중 오류가 발생했습니다.')
  }
}
</script>

<!-- 커스텀 CSS 없음: Bootstrap/Bootstrap Icons만 사용 -->
