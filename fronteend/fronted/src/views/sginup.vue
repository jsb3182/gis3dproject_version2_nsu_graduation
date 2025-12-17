<template>
  <div class="min-vh-100 d-flex align-items-start align-items-lg-center justify-content-center bg-body-tertiary py-4">
    <div class="container" style="max-width: 420px;">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-10 col-lg-8">
          <div class="text-center mb-3">
            </div>
          <div class="card shadow-sm">

            <div class="card-body p-4">
              <h2 class="h5 text-center text-bold mb-4">회원가입</h2>

              <form class="needs-validation" novalidate @submit.prevent="onSubmit" :class="{'was-validated': tried}">
                <!-- 이름 -->
                <div class="mb-3">
                  <label class="form-label text-medium">이름</label>
                  <input
                    v-model.trim="form.userName"
                    type="text"
                    class="form-control text-plight"
                    placeholder="이름을 입력하세요"
                    required
                  />
                  <div class="invalid-feedback">이름을 입력해주세요.</div>
                </div>

                <!-- 연락처 -->
                <div class="mb-3">
                  <label class="form-label text-medium">연락처</label>
                  <input
                    v-model.trim="form.userPhoneNum"
                    type="tel"
                    class="form-control text-plight"
                    placeholder="전화번호를 입력하세요"
                    pattern="^0[0-9]{1,2}-?[0-9]{3,4}-?[0-9]{4}$"
                    required
                  />
                  <div class="invalid-feedback">올바른 연락처 형식으로 입력해주세요.</div>
                </div>

                <!-- 아이디 -->
                <div class="mb-3">
                  <label class="form-label text-medium">아이디</label>
                  <input
                    v-model.trim="form.userId"
                    type="text"
                    class="form-control text-plight"
                    placeholder="아이디를 입력해주세요"
                    minlength="4"
                    required
                  />
                  <div class="invalid-feedback">아이디(4자 이상)를 입력해주세요.</div>
                </div>

                <!-- 이메일 -->
                <div class="mb-3">
                  <label class="form-label text-medium">이메일</label>
                  <input
                    v-model.trim="form.userEmail"
                    type="email"
                    class="form-control text-plight"
                    placeholder="이메일을 입력해주세요"
                    required
                  />
                  <div class="invalid-feedback">올바른 이메일을 입력해주세요.</div>
                </div>

                <!-- 비밀번호 -->
                <div class="mb-3">
                  <label class="form-labe text-medium">비밀번호</label>
                  <input
                    v-model="form.userPw"
                    type="password"
                    class="form-control text-plight"
                    placeholder="비밀번호를 입력해주세요"
                    minlength="8"
                    required
                  />
                  <div class="form-text text-plight mx-2 ">영문/숫자/특수문자 조합 8자 이상 권장</div>
                  <div class="invalid-feedback">비밀번호(8자 이상)를 입력해주세요.</div>
                </div>

                <!-- 비밀번호 확인 -->
                <div class="mb-4">
                  <label class="form-label text-medium">비밀번호 확인</label>
                  <input
                    v-model="form.userPwCheck"
                    type="password"
                    class="form-control text-plight"
                    placeholder="비밀번호를 다시 입력해주세요"
                    :class="{'is-invalid': tried && !passwordsMatch}"
                    required
                  />
                  <div class="invalid-feedback">비밀번호가 일치하지 않습니다.</div>
                </div>

                <!-- 체크박스 -->
                <div class="form-check mb-2 mx-2"  style="font-size: 13px;">
                  <input class="form-check-input" type="checkbox" id="terms" v-model="form.agreeTerms" required />
                  <label class="form-check-label text-plight " for="terms">이용약관 및 개인정보처리방침에 동의합니다.</label>
                </div>

                <div class="form-check mb-5 mx-2"  style="font-size: 13px;">
                  <input class="form-check-input" type="checkbox" id="marketing" v-model="form.agreeMarketing" />
                  <label class="form-check-label text-plight" for="marketing" >마케팅 정보 수신에 동의합니다. (선택)</label>
                </div>

                <!-- 버튼 -->
                <div class="d-flex gap-2 mt-4">
                  <button type="button" class="btn btn-outline-secondary flex-fill text-bold" @click="onBack">이전</button>
                  <button type="submit" class="btn btn-primary flex-fill text-bold" :disabled="!canSubmit || isLoading" style="background-color: #0D6EFD; border-color: #0D6EFD;">
                    {{ isLoading ? '처리중...' : '가입완료' }}
                  </button>
                </div>
              </form>

              <div class=" text-plight text-center mt-4 small text-body-secondary">
                이미 계정이 있으신가요?
                <a href="#" class="link-primary text-decoration-none text-bold" @click.prevent="goLogin">로그인</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { auth, db } from '../firebase/index.js'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, collection } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { setUser } from '../utils/userService.js'

const router = useRouter()

// ✅ form 데이터 (camelCase)
const form = reactive({
  userName: '',
  userPhoneNum: '',
  userId: '',
  userEmail: '',
  userPw: '',
  userPwCheck: '',
  agreeTerms: false,
  agreeMarketing: false,
})

const tried = ref(false)
const isLoading = ref(false)
const USER_COLLECTION = collection(db, 'users')

const passwordsMatch = computed(() => form.userPw && form.userPw === form.userPwCheck)

const canSubmit = computed(() =>
  form.userName &&
  form.userPhoneNum &&
  form.userId &&
  form.userEmail &&
  form.userPw &&
  form.userPwCheck &&
  passwordsMatch.value &&
  form.agreeTerms
)

async function onSubmit() {
  tried.value = true
  if (!canSubmit.value) {
    alert('모든 필수 항목을 올바르게 입력해주세요.')
    return
  }

  isLoading.value = true
  try {
    // 1️⃣ Firebase Auth에 사용자 생성 (이때 자동 로그인 상태가 됨)
    const credential = await createUserWithEmailAndPassword(auth, form.userEmail, form.userPw)
    const user = credential.user

    // 2️⃣ Firestore에 정보 저장 (camelCase로 통일)
    const userDoc = doc(USER_COLLECTION, user.uid)
    await setDoc(userDoc, {
      uid: user.uid,
      username: form.userId,
      name: form.userName,
      phone: form.userPhoneNum,
      email: form.userEmail,
      agreeTerms: form.agreeTerms,
      agreeMarketing: form.agreeMarketing,
      createdAt: new Date().toISOString(),
    })

    // 3️⃣ 로컬스토리지에 사용자 정보 저장 -> 새로고침해도 유지, 헤더에서 읽도록 사용
    const localUser = {
      uid: user.uid,
      name: form.userName,
      username: form.userId,
      email: form.userEmail,
      phone: form.userPhoneNum
    }
    setUser(localUser)

    // 4️⃣ 홈으로 이동 (자동 로그인 상태 유지)
    alert('회원가입이 완료되었습니다!')
    router.push('/')

  } catch (err) {
    console.error('회원가입 오류:', err)
    switch (err.code) {
      case 'auth/invalid-email':
        alert('이메일을 바르게 입력해주세요.')
        break
      case 'auth/weak-password':
        alert('비밀번호가 너무 쉬워요. 8자 이상으로 설정해주세요.')
        break
      case 'auth/email-already-in-use':
        alert('이미 등록된 이메일입니다.')
        break
      default:
        alert('회원가입에 실패했습니다. 다시 시도해주세요.')
        break
    }
  } finally {
    isLoading.value = false
  }
}

function onBack() {
  router.back()
}

function goLogin() {
  router.push('/login')
}
</script>
// ...existing code...