<template>
  <div class="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light m-0 p-0">
    
    <div class="col-12 px-3" style="max-width: 400px;">
      
      <div class="card shadow border-0 rounded-4">
        <div class="card-body p-4 p-md-5">
          
          <h2 class="text-center mb-4 fw-bold text-primary">로그인</h2>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label class="form-label small fw-bold">아이디</label>
              <input
                type="text"
                class="form-control form-control-lg border-2"
                v-model="formData.loginId"
                required
                placeholder="아이디 입력"
              />
            </div>

            <div class="mb-4">
              <label class="form-label small fw-bold">비밀번호</label>
              <input
                type="password"
                class="form-control form-control-lg border-2"
                v-model="formData.password"
                required
                placeholder="비밀번호 입력"
              />
            </div>

            <div class="d-grid">
              <button
                type="submit"
                class="btn btn-primary btn-lg fw-bold py-3 shadow-sm"
                :disabled="loading"
              >
                {{ loading ? '로그인 중...' : '로그인' }}
              </button>
            </div>
          </form>

          <div class="mt-4 pt-3 border-top">
            <div class="d-flex justify-content-between small mb-3">
              <router-link to="/FindId" class="text-muted text-decoration-none">아이디 찾기</router-link>
              <router-link to="/FindPassword" class="text-muted text-decoration-none">비밀번호 찾기</router-link>
            </div>
            <p class="text-center small text-muted mb-0">
              계정이 없으신가요? 
              <router-link to="/signup" class="text-primary fw-bold text-decoration-none">회원가입</router-link>
            </p>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { memberApi } from '@/utils/api';

const router = useRouter();
const loading = ref(false);
const errorMessage = ref('');
const formData = ref({ loginId: '', password: '' });

async function handleLogin(){
  loading.value = true;
  try {
    await memberApi.login(formData.value.loginId, formData.value.password);
    //부분추가
    localStorage.setItem('user',JSON.stringify({loginId: formData.value.loginId}));
    router.push('/');
  }catch (error) {
    alert('로그인 정보가 틀렸습니다');
  }finally {
    loading.value = false;
  }
}
</script>