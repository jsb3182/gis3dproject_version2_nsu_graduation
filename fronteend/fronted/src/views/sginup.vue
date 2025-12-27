<template>
  <div class="signup-page">
    <h2>회원가입</h2>
    <form @submit.prvent="handleSingup">
    <input v-model="user.loginId" plasceholder="로그인 아이디" required />
    <input v-model="user.name" type="password" placeholder="비밀번호" required />
    <input v-model = "userLocation.gender">
    <select v-model="user.gender">
      <option value ="M">남성</option>
      <option value ="F">여성</option>
    </select>
    <input v-model="user.birthday" type="date" required />
    <button type="submit">가입하기</button>
    </form>
   </div>
</template>
<script setup>
  import {ref} from 'vue';
  import { memberApi } from '@/utils/api';
  import {userRouter} from 'vue-router';
  const router = useRouter();
  const user = ref ({
    loginId: '',
    password: '',
    name: '',
    gender: 'M',
    birthday: ''
  });
  const hendleSignup = async () => {
    try {
      await memberApi.signup(user.value);
      alert('회원가입이  오나료 되었습니다.');
      router.push('/login'); //가입후에 로그인 페이지로 이동하기
    }catch (error) {
      console.error('가입 에러:',error);
      alert('회원가입에 실패하였습니다.');
    }
  }
</script>