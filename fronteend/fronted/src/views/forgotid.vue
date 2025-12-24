<template>
  <div class="min-vh-100 d-flex align-items-start justify-content-center bg-body-tertiary py-4 ">
    <div class="container" style="max-width: 420px;">
      <!-- Card -->
        <div class="text-center mb-3">
            </div>
      <div class="card shadow-sm">
        <div class="card-body p-4 ">
          <h2 class="h5 text-center text-black text-bold mb-4">아이디 찾기</h2>

          <form class="needs-validation" novalidate @submit.prevent="onSubmit" :class="{'was-validated': tried}">
            <!-- 이름 -->
            <div class="mb-3">
              <label class="form-label text-medium">이름</label>
              <input
                v-model.trim="form.name"
                type="text"
                class="form-control text-plight"
                placeholder="이름을 입력해주세요"
                required
              />
              <div class="invalid-feedback">이름을 입력해주세요.</div>
            </div>

            <!-- 연락번호 -->
            <div class="mb-5">
              <label class="form-label text-medium">전화 번호</label>
              <div class="input-group">
                <span class="input-group-text">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#AAAABC" d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25c1.12.37 2.32.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02z"/></svg>
                </span>
                <input
                  v-model.trim="form.phone"
                  type="tel"
                  class="form-control text-plight"
                  placeholder="전화번호를 입력해주세요"
                  pattern="^0[0-9]{1,2}-?[0-9]{3,4}-?[0-9]{4}$"
                  required
                />
                <div class="invalid-feedback">올바른 연락처 형식으로 입력해주세요.</div>
              </div>
            </div>

            <!-- 버튼 -->
            <div class="d-flex gap-2 mt-3">
              <button type="button" class="btn btn-outline-secondary flex-fill  text-bold" @click="onBack">이전</button>
              <button type="submit" class="btn btn-primary flex-fill text-bold" :disabled="!canSubmit || isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm " aria-hidden="true"></span>
                <span v-else>아이디 찾기</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from "vue";
import { useRouter } from "vue-router"; // 1. vue-router import
// import { db } from "@/firebase"; // 2. Firebase db 인스턴스 import
// import { collection, query, where, getDocs } from "firebase/firestore"; // 3. Firestore 함수 import

const router = useRouter();

const form = reactive({
  name: "",
  phone: "",
});

const tried = ref(false);
const loading = ref(false); // 로딩 상태 추가

// '인증번호' 필드를 사용하지 않으므로 canSubmit에서 제거했습니다.
const canSubmit = computed(() => form.name && form.phone);

async function onSubmit() { // 4. async 함수로 변경
  tried.value = true;
  if (!canSubmit.value) return;

  loading.value = true; // 로딩 시작

  try {
    // TODO: 백엔드 API로 아이디 찾기 요청
    console.log("백엔드 API로 아이디 찾기 요청:", form);
    const foundId = "backend_user_id"; // 임시 아이디

    router.push({ name: 'FindId', query: { id: foundId } });
    
  } catch (error) {
    console.error("아이디 찾기 중 오류 발생:", error);
    alert("오류가 발생했습니다. 다시 시도해주세요.");
  } finally {
    loading.value = false; // 로딩 종료
  }
}

function onBack() {
  history.back();
}
</script>
