<template>
  <main class="min-vh-100">
    <div class="container-fluid px-0">
      <!-- 상단 헤더: 뒤로가기 버튼과 제목 -->
      <div class="d-flex align-items-center mb-4 gap-2">
        <!-- 뒤로가기 버튼 -->
        <button 
          class="btn btn-link p-0 text-decoration-none" 
          style="color: #0D6EFD;" 
          @click="goBack"
        >
          <!-- 왼쪽 화살표 아이콘 -->
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="#000" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z"/>
          </svg>
        </button>
        <!-- 페이지 제목 -->
        <h5 class="mb-0 text-bold" >
          건의사항 작성
        </h5>
      </div>

      <!-- 폼 시작: 제출 시 handleSubmit 함수 실행 -->
      <form @submit.prevent="handleSubmit">
        
        <!-- 제목 입력 카드 -->
        <div class="card border-0 shadow-sm rounded-4 mb-3">
          <div class="card-body p-4">
            <!-- 라벨 -->
            <label class="form-label text-medium mb-3" >
              제목
            </label>
            <!-- 입력 필드 -->
            <input
              type="text"
              class="form-control border-2 text-plight "
              v-model="form.title"
              placeholder="건의사항 제목을 입력하세요"
              required
            />
          </div>
        </div>

        <!-- 내용 입력 카드 -->
        <div class="card border-0 shadow-sm rounded-4 mb-4">
          <div class="card-body p-4">
            <!-- 라벨 -->
            <label class="form-label text-medium mb-3" >
              내용
            </label>
            <!-- 텍스트 영역 -->
            <textarea
              class="form-control border-2 text-plight"
              rows="8"
              v-model="form.content"
              placeholder="건의사항 내용을 자세히 작성해주세요"
              required
            ></textarea>
            <!-- 안내 문구 -->
            <div 
              class="form-text mt-2" 
              style="font-family: 'Pretendard', sans-serif;"
            >
              관리자에게 전달됩니다. 구체적으로 작성해주세요.
            </div>
          </div>
        </div>

        <!-- 하단 버튼 영역: 화면 하단에 고정 -->
        <div
          class="position-sticky bottom-0 pt-2 pb-3"
          style="z-index: 1; margin-bottom: var(--footer-h, 70px);"
        >
          <!-- 버튼 그룹: 취소와 저장 버튼 -->
          <div class="d-flex gap-2">
            <!-- 취소 버튼 -->
            <button
              type="button"
              class="btn btn-outline-secondary flex-fill rounded-pill"
              style="font-family: 'Pretendard', sans-serif; border-color: #6c757d;"
              @click="goBack"
            >
              취소
            </button>
            <!-- 저장 버튼 -->
            <button
              type="submit"
              class="btn flex-fill rounded-pill"
              style="font-family: 'Pretendard', sans-serif; background-color: #0D6EFD; color: white; border: none;"
            >
              저장하기
            </button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
// Vue의 반응형 데이터를 위한 reactive 함수 가져오기
import { reactive } from 'vue'
// 페이지 이동을 위한 라우터 가져오기
import { useRouter } from 'vue-router'
// Firebase 건의사항 저장 함수 가져오기
import { addSuggestion } from '@/firebase/suggetions'

// 라우터 인스턴스 생성
const router = useRouter()

// 폼 데이터: 제목과 내용을 저장
const form = reactive({
  title: '', // 제목 (빈 문자열로 초기화)
  content: '' // 내용 (빈 문자열로 초기화)
})

/**
 * 뒤로가기 함수
 * 이전 페이지로 돌아갑니다
 */
function goBack() {
  router.back()
}

/**
 * 폼 제출 함수
 * 사용자가 입력한 건의사항을 Firebase에 저장합니다
 */
async function handleSubmit() {
  try {
    // addSuggestion 함수를 호출하여 Firebase에 데이터 저장
    await addSuggestion({
      title: form.title, // 제목
      content: form.content, // 내용
      adminMemo: '관리자가 남기는 메모지', // 관리자 메모 (기본값)
      status: '관리자가 읽은 상태', // 상태 (기본값)
      targetRole: '향상 admin 고정' // 대상 역할 (기본값)
    })

    // 저장 성공 시 알림 표시
    alert('건의사항이 성공적으로 제출되었습니다.')
    
    // 응급 페이지로 이동
    router.push('/emergency')
  } catch (error) {
    // 에러 발생 시 콘솔에 출력하고 알림 표시
    console.error('건의사항 저장 중 오류:', error)
    alert('건의사항 저장에 실패했습니다. 다시 시도해주세요.')
  }
}
</script>

<style scoped>
/* Pretendard 폰트 임포트 */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

/* 전역 폰트 설정 */
* {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>