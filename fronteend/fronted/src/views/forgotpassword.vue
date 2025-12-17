<!-- src/views/forgotpassword.vue -->
<template>
  <div class="min-vh-100 d-flex align-items-start justify-content-center bg-body-tertiary py-4">
    <div class="container-fluid px-3" style="max-width: 420px;">
      <!-- Brand: 전체 이미지를 사용 -->
      <div class="text-start mb-3">

      </div>

      <!-- Card -->
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h2 class="h5 text-center text-black text-bold mb-4" style="color: #0D6EFD;">비밀번호 찾기</h2>

          <form class="needs-validation" novalidate @submit.prevent="onSubmit" :class="{ 'was-validated': tried }">
            <!-- 이름 -->
            <div class="mb-3">
              <label class="form-label text-medium">이름</label>
              <input v-model.trim="form.name" type="text" class="form-control text-plight" placeholder="이름을 입력해주세요" required />
              <div class="invalid-feedback">이름을 입력해주세요.</div>
            </div>

            <!-- 연락처 -->
            <div class="mb-3">
              <label class="form-label text-medium">연락처</label>
              <div class="input-group">
                <span class="input-group-text">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#AAAABC" d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25c1.12.37 2.32.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02z"/></svg>
                </span>
                <input placeholder="전화번호를 입력해주세요" v-model.trim="form.phone" type="tel" class="form-control text-plight"
                  pattern="^0[0-9]{1,2}-?[0-9]{3,4}-?[0-9]{4}$" required />
                <div class="invalid-feedback">올바른 연락처 형식으로 입력해주세요.</div>
              </div>
            </div>

            <!-- 이메일 -->
            <div class="mb-5">
              <label class="form-label text-medium">이메일</label>
              <input v-model.trim="form.username" type="text" class="form-control text-plight" placeholder="이메일을 입력해주세요"
                required />
              <div class="invalid-feedback">아이디를 입력해주세요.</div>
            </div>

            <!-- 버튼 -->
            <div class="d-flex gap-2 mt-3">
              <button type="button" class="btn btn-outline-secondary flex-fill text-bold" @click="onBack">이전</button>
              <button type="submit" class="btn btn-primary flex-fill text-bold" :disabled="!canSubmit || isLoading" >
                <span v-if="isLoading" class="spinner-border spinner-border-sm " aria-hidden="true"></span>
                <span v-else>비밀번호 재설정</span>
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from "vue"
import { useRouter } from "vue-router"
import { db, auth } from "@/firebase/index"
import { collection, query, where, getDocs } from "firebase/firestore"
import { sendPasswordResetEmail } from "firebase/auth"

const router = useRouter()

const form = reactive({
  name: "",
  phone: "",
  username: "",
})

const tried = ref(false)
const isLoading = ref(false)

const canSubmit = computed(() =>
  form.name && form.phone && form.username
)

async function onSubmit() {
  tried.value = true
  if (!canSubmit.value) {
    alert('모든 항목을 입력해주세요.')
    return
  }

  isLoading.value = true

  try {
    // Firebase Firestore에서 이름, 연락처, 아이디(username)로 사용자 검색
    const userCollection = collection(db, 'users')

    // 연락처 정규화 (하이픈 제거)
    const normalizedPhone = form.phone.replace(/-/g, '')

    // username으로 쿼리
    const q = query(
      userCollection,
      where('username', '==', form.username)
    )

    const querySnapshot = await getDocs(q)

    // 일치하는 사용자 찾기
    let foundUser = null

    querySnapshot.forEach((doc) => {
      const userData = doc.data()
      // 이름과 연락처가 모두 일치하는지 확인
      const dbPhone = userData.phone.replace(/-/g, '')
      if (userData.name === form.name && dbPhone === normalizedPhone) {
        foundUser = userData
      }
    })

    if (foundUser) {
      // 사용자를 찾았을 때
      // Firebase Auth로 비밀번호 재설정 이메일 전송
      // foundUser의 이메일이 Firebase Auth 이메일과 동일하다고 가정
      const userEmail = foundUser.username // username이 이메일인 경우

      try {
        await sendPasswordResetEmail(auth, userEmail)

        // 성공 메시지
        alert(`비밀번호 재설정 이메일이 ${userEmail}(으)로 전송되었습니다.\n\n이메일을 확인하여 비밀번호를 재설정해주세요.`)

        // 로그인 페이지로 이동
        router.push('/login')
      } catch (emailError) {
        console.error('이메일 전송 오류:', emailError)

        if (emailError.code === 'auth/user-not-found') {
          alert('해당 이메일로 등록된 계정이 없습니다.')
        } else if (emailError.code === 'auth/invalid-email') {
          alert('유효하지 않은 이메일 주소입니다.')
        } else {
          alert('비밀번호 재설정 이메일 전송에 실패했습니다.\n다시 시도해주세요.')
        }
      }
    } else {
      alert('일치하는 회원 정보를 찾을 수 없습니다.\n입력한 정보를 다시 확인해주세요.')
    }

  } catch (error) {
    console.error('비밀번호 찾기 중 오류 발생:', error)
    alert('오류가 발생했습니다. 다시 시도해주세요.')
  } finally {
    isLoading.value = false
  }
}

function onBack() {
  router.back()
}
</script>

<!-- 커스텀 CSS 없음. 색상은 Bootstrap Primary를 그대로 사용합니다. -->