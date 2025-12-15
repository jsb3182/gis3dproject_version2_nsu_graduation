<!-- src/views/ForgotPasswordResult.vue -->
<template>
  <div class="min-vh-100 d-flex align-items-start justify-content-center bg-body-tertiary py-4">
    <div class="container" style="max-width: 420px;">

      <!-- 결과 카드 -->
      <div class="card shadow-sm mb-4">
        <div class="card-body p-4">
          <h2 class="h5 text-center  text-bold mb-3">비밀번호 찾기</h2>

          <p class="mb-0 text-center text-plight">
            비밀번호는 <span class="text-bold text-primary">{{ displayPw }}</span>입니다.
          </p>
        </div>
      </div>

      <!-- 버튼 -->
      <button type="button" class="btn btn-primary w-100 text-bold" @click="goLogin">
        로그인 창으로
      </button>

    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useRouter, useRoute } from "vue-router"

const router = useRouter()
const route = useRoute()

/**
 * 우선순위
 * 1) props.password
 * 2) URL 쿼리 ?pw=
 * 3) 기본 예시 "비밀번호를 찾을 수 없습니다"
 */
const props = defineProps({
  password: { type: String, default: "" },
  /** 마스킹 여부 (원하면 **** 형태로 표시) */
  mask: { type: Boolean, default: false },
})

// 라우터 쿼리에서 비밀번호 가져오기
const rawPw = computed(() => props.password || route.query.pw || "비밀번호를 찾을 수 없습니다")

const displayPw = computed(() => {
  if (!props.mask) return rawPw.value
  // 간단 마스킹: 앞 1글자 + 나머지 ****
  const s = rawPw.value.toString()
  return s.length > 1 ? s[0] + "*".repeat(s.length - 1) : "*"
})

function goLogin() {
  router.push('/login')
}
</script>

<!-- 커스텀 CSS 없음 -->