<template>
  <div class="col-11 col-md-8 col-lg-6 shadow-lg rounded-4 bg-white p-4 p-md-5" style="max-width: 600px;">
    <h2 class="text-center mb-4 fw-bold text-primary">회원가입</h2>
    <form @submit.prevent="handleSignup">
      <div class="mb-3">
        <label class="form-label small fw-bold">아이디</label>
        <input v-model="form.loginId" type="text" class="form-control form-control-lg border-2" required placeholder="사용할 아이디 입력">
      </div>
      <div class="mb-3">
        <label class="form-label small fw-bold">비밀번호</label>
        <input v-model="form.password" type="password" class="form-control form-control-lg border-2" required placeholder="비밀번호 입력">
      </div>
      <div class="mb-3">
        <label class="form-label small fw-bold">이름</label>
        <input v-model="form.name" type="text" class="form-control form-control-lg border-2" required placeholder="실명 입력">
      </div>
      <div class="row mb-3">
        <div class="col-6">
          <label class="form-label small fw-bold">성별</label>
          <select v-model="form.gender" class="form-select form-select-lg border-2">
            <option value="M">남성 (M)</option>
            <option value="F">여성 (F)</option>
          </select>
        </div>
        <div class="col-6">
          <label class="form-label small fw-bold">생년월일</label>
          <input v-model="form.birthday" type="date" class="form-control form-control-lg border-2" required>
        </div>
      </div>
      <div class="d-grid mt-4">
        <button type="submit" class="btn btn-primary btn-lg fw-bold py-3">가입하기</button>
      </div>
    </form>
    <p class="text-center mt-4 small text-muted">
      이미 계정이 있으신가요? <router-link to="/login" class="text-primary fw-bold text-decoration-none">로그인</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { memberApi } from '@/utils/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const form = ref({ loginId: '', password: '', name: '', gender: 'M', birthday: '' });

const handleSignup = async () => {
  try {
    await memberApi.signup(form.value);
    alert('회원가입을 축하드립니다!');
    router.push('/login');
  } catch (e) { alert('가입 실패: 정보를 확인해주세요.'); }
};
</script>