<!-- src/FindIdResultView.vue -->
<template>
  <div class="min-vh-100 d-flex align-items-start justify-content-center bg-body-tertiary py-4">
    <div class="container" style="max-width: 420px;">


      <!-- 결과 카드 -->
      <div class="card shadow-sm mb-4">
        <div class="card-body p-4">
          <h2 class="h5 text-center mb-3 text-bold">아이디 찾기</h2>

          <p class="mb-0 text-center text-plight">
            아이디는
            <a href="#" class="link-primary text-decoration-none" @click.prevent>
              {{ foundId }}
            </a>
            입니다.
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
import { computed } from "vue";
import { useRouter } from 'vue-router'
/**
 * foundId는 다음 우선순위로 채웁니다.
 * 1) props로 전달된 foundId
 * 2) 라우터 쿼리값 (?id=)
 * 3) 기본 예시 문자열
 */
const router = useRouter()    
const props = defineProps({
  foundId: { type: String, default: "" },
});

// 라우터 사용 안 한다면 아래는 자동으로 기본값만 사용됩니다.
let queryId = "";
try {
  const url = new URL(window.location.href);
  queryId = url.searchParams.get("id") || "";
} catch {}

const foundId = computed(() => props.foundId || queryId || "aaaa@Aaa");
function goLogin() {
  // TODO: 라우터 사용 시 router.push('/login') 로 교체
  alert("로그인 페이지로 이동");
  router.push('/login');
}
</script>

<!-- 커스텀 CSS 없음 -->
