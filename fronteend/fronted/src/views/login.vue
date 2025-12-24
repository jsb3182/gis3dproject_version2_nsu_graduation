<template>
  <div class="min-vh-100 d-flex align-items-start justify-content-center bg-body-tertiary py-4">
    <!-- 고정 폭 컨테이너 (반응형 X) -->
    <div class="container" style="max-width: 420px;">
      <!-- Brand: 전체 이미지를 쓰는 경우 -->
      <div class="text-center mb-3">
        <!-- 전체 로고(아이콘+텍스트)가 하나의 이미지인 경우 -->
        <!-- src/assets/logo.png 파일 준비되어 있으면 아래 경로 그대로 사용 -->
      </div>

      <div class="card shadow-sm">
        <div class="card-body p-4 ">
          <h2 class="h5 text-center text-dark text-bold mb-4">로그인</h2>

          <form class="needs-validation" novalidate @submit.prevent="onSubmit" :class="{ 'was-validated': tried }">
            <!-- 아이디 -->
            <div class="mb-3">
              <label class="text-medium form-label">아이디</label>
              <input v-model.trim="form.username" type="text" class="form-control text-plight" placeholder="아이디를 입력해주세요" required />
              <div class="invalid-feedback ">아이디를 입력해주세요.</div>
            </div>

            <!-- 비밀번호 -->
            <div class="mb-5">
              <label class="text-medium form-label">비밀번호</label>
              <div class="input-group">
                <span class="input-group-text">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20 " height="20" viewBox="0 0 24 24">
		              <path fill="#AAAABC" d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
	                </svg>
                </span>
                <input v-model="form.password" type="password" class="form-control text-plight" placeholder="비밀번호를 입력해주세요"
                  required />
                <div class="invalid-feedback">비밀번호를 입력해주세요.</div>
              </div>
            </div>

            <!-- 로그인 버튼 -->
            <button type="submit" class="btn btn-primary w-100 text-bold" :disabled="!canSubmit || isLoading" >
              {{ isLoading ? '로그인 중...' : '로그인' }}
            </button>
          </form>

          <!-- 하단 링크: 아이디 찾기 | 비밀번호 찾기 | 회원가입 -->
          <div class="d-flex align-items-center justify-content-center gap-3 mt-4 small">
            <a href="#" class="link-secondary text-decoration-none text-nowrap text-medium" @click.prevent="goFindId">아이디
              찾기</a>
            <span class="text-body-secondary">|</span>
            <a href="#" class="link-secondary text-decoration-none text-nowrap text-medium" @click.prevent="goFindPw">비밀번호
              찾기</a>
            <span class="text-body-secondary">|</span>
            <a href="#" class="link-secondary text-decoration-none text-nowrap text-medium"
              @click.prevent="goSignup">회원가입</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
// import { auth, db } from '@/firebase/index'
// import { signInWithEmailAndPassword } from 'firebase/auth'
// import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { setUser } from '@/utils/userService.js'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
})

const tried = ref(false)
const isLoading = ref(false)

const canSubmit = computed(() => form.username && form.password)

async function onSubmit() {
  tried.value = true

  // 아이디와 비밀번호 입력하지 않으면 alert창 띄우기
  if (!form.username || !form.password) {
    alert('아이디와 비밀번호를 입력해주세요.')
    return
  }

  isLoading.value = true;
  try {
    // TODO: 백엔드 API로 로그인 처리
    console.log("백엔드 로그인 시도:", form);

    // 임시 로직: 사용자 정보를 로컬 스토리지에 저장하고 홈으로 이동
    const isAdmin = form.username.includes('admin');
    const tempUser = {
      uid: `temp_${Date.now()}`,
      name: isAdmin ? '관리자' : '일반사용자',
      username: form.username,
      email: `${form.username}@example.com`,
      phone: '010-1234-5678',
      role: isAdmin ? 'admin' : 'user'
    };
    setUser(tempUser);

    alert('로그인에 성공했습니다! (백엔드 연동 필요)');

    if (isAdmin) {
      router.push('/AdminHome');
    } else {
      router.push('/');
    }

  } catch (error) {
    console.error('로그인 오류:', error)
    alert('아이디, 비밀번호를 다시 확인해주세요.')
  } finally {
    isLoading.value = false
  }
}

function goFindId() {
  router.push('/forgotid')
}

function goFindPw() {
  router.push('/forgotpassword')
}

function goSignup() {
  router.push('/sginup')
}
</script>