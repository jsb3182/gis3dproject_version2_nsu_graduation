<template>
  <div class="container-fluid py-5" style="padding-top: calc(var(--header-h, 56px) + 16px) !important; padding-bottom: calc(var(--footer-h, 56px) + 16px) !important;">
    
    <!-- 로딩 중 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">로딩 중...</span>
      </div>
    </div>
    
    <!-- 데이터 표시 -->
    <div v-else-if="item" class="container px-3">
      <!-- 제목 -->
      <h1 class="fs-4 fw-bold mb-3">{{ item.title }}</h1>
      
      <!-- 메타 정보 -->
      <div class="d-flex align-items-center text-muted small mb-4">
        <span>{{ item.date }}</span>
        <span class="mx-2">|</span>
        <span>조회수 {{ item.views }}</span>
      </div>
      
      <!-- 유튜브 동영상 -->
      <div v-if="item.videoUrl" class="ratio ratio-16x9 mb-4">
        <iframe 
          :src="getYoutubeEmbedUrl(item.videoUrl)"
          allowfullscreen
          class="rounded"
        ></iframe>
      </div>
      
      <!-- 설명 -->
      <div class="card border-0 bg-light mb-4">
        <div class="card-body">
          <p class="card-text" style="white-space: pre-wrap;">{{ item.description }}</p>
        </div>
      </div>
      
      <!-- 목록으로 버튼 -->
      <div class="d-grid">
        <button @click="goBack" class="btn btn-primary btn-lg">
          목록으로
        </button>
      </div>
    </div>
    
    <!-- 데이터 없음 -->
    <div v-else class="text-center py-5">
      <p class="text-muted">데이터를 찾을 수 없습니다.</p>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import { db } from '../firebase/index.js'
// import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()

const item = ref(null)
const loading = ref(true)

const id = computed(() => route.params.id)

onMounted(async () => {
  try {
    // TODO: 백엔드 API에서 데이터 불러오기 및 조회수 증가 처리
    console.log(`백엔드 API에서 ID가 ${id.value}인 데이터 불러오기`)
    item.value = {
      id: id.value,
      title: '임시 데이터 제목',
      date: new Date().toLocaleDateString(),
      views: 1,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: '이것은 백엔드 연동 전의 임시 데이터입니다.'
    };
    
  } catch (error) {
    console.error('데이터 로드 실패:', error)
  } finally {
    loading.value = false
  }
})

function getYoutubeEmbedUrl(url) {
  const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
  return `https://www.youtube.com/embed/${videoId}`
}

function goBack() {
  router.back()
}
</script>