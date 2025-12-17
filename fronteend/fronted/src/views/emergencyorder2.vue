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
import { db } from '../firebase/index.js'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()

const item = ref(null)
const loading = ref(true)

const id = computed(() => route.params.id)

onMounted(async () => {
  try {
    const docRef = doc(db, 'emergencyData', id.value)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      item.value = { id: docSnap.id, ...docSnap.data() }
      
      // 조회수 증가
      await updateDoc(docRef, {
        views: increment(1)
      })
    }
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