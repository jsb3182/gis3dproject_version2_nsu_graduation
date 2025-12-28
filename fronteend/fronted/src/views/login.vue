<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body p-5">
            <h2 class="text-center mb-4 fw-bold">로그인</h2>

            <!-- 에러 메시지 -->
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>

            <!-- 성공 메시지 -->
            <div v-if="successMessage" class="alert alert-success" role="alert">
              {{ successMessage }}
            </div>

            <!-- 로그인 폼 -->
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">이메일</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="formData.email"
                  required
                  placeholder="example@email.com"
                />
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">비밀번호</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="formData.password"
                  required
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              <div class="d-grid gap-2">
                <button
                  type="submit"
                  class="btn btn-primary btn-lg"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ loading ? '로그인 중...' : '로그인' }}
                </button>
              </div>
            </form>

            <div class="text-center mt-3">
              <p class="text-muted">
                계정이 없으신가요?
                <router-link to="/register" class="text-primary">회원가입</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/api/auth';

const router = useRouter();

const formData = ref({
  email: '',
  password: ''
});

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const result = await login(formData.value.email, formData.value.password);

    if (result.success) {
      successMessage.value = '로그인 성공!';

      // 1초 후 홈으로 이동
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else {
      errorMessage.value = result.message || '로그인에 실패했습니다.';
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    errorMessage.value = '로그인 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.card {
  border: none;
  border-radius: 15px;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  background-color: #0d6efd;
  border: none;
  border-radius: 8px;
  font-weight: 600;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}
</style>
