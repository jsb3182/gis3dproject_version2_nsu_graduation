<template>
  <main class="min-vh-100">
    <div class="container-fluid px-0">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">로딩 중...</span>
        </div>
      </div>


      <!-- 데이터 표시 -->
      <div v-else-if="item" class="container-fluid px-0">
        <!-- 제목 -->
        <div class="d-flex align-items-center mb-3 text-bold gap-3">
          <button class="btn btn-link p-0 text-dark" @click="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="#000" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z"/>
            </svg>
          </button>
          <h1 class="fs-4 text-bold mb-0">{{ item.title }}</h1>
        </div>

        <!-- 메타 정보 -->
        <div class="d-flex align-items-center text-muted small mb-4 text-plight">
          <span>{{ formatDate(item.createdAt) }}</span>
          <span class="mx-2">|</span>
          <span>조회수 {{ item.viewCount || 0 }}</span><!--수-->
        </div>

        <!-- 유튜브 썸네일 이미지 (클릭 시 동영상으로) --> <!--수-->
        <div v-if="item.thumbnailUrl && !showVideo" class="mb-3 rounded-4 overflow-hidden position-relative"
          @click="showVideo = true" style="cursor: pointer;">
          <img :src="item.thumbnailUrl" class="w-100 h-100 object-fit-cover" alt="썸네일" /> <!--수정-->
          <div class="position-absolute top-50 start-50 translate-middle play-btn"><!--수정부분 svg 삭-->
            <i class="bi bi-play-circle-fill text-danger fs-1 shadow-lg"></i>
          </div>
        </div>

        <!-- 유튜브 동영상 (썸네일 클릭 후 표시) --><!--유튜브 영역 표시-->
        <div v-if="item.youtubeUrl && showVideo" class="ratio ratio-16x9 mb-3 rounded-4 overflow-hidden">
          <iframe :src="getYoutubeEmbedUrl(item.youtubeUrl)" allowfullscreen class="rounded"></iframe>
        </div>

        <!-- 일반 동영상 URL (유튜브가 아닌 경우) -->
        <div v-if="item.youtubeUrl && !item.youtubeId && !item.thumbnailUrl" class="mb-3">
          <a :href="item.youtubeUrl" target="_blank" class="btn btn-danger w-100">
            <i class="bi bi-play-circle me-2"></i>동영상 보러 가기
          </a>
        </div>
        <!-- 본문 카드 -->
        <div class="card border-0 shadow-sm rounded-4 text-plight mb-3">
          <div class="card-body p-3 p-md-4">

            <!-- 해시태그 -->
            <div v-if="item.hashtags && item.hashtags.length > 0" class="mb-4"><!--교체-->
              <span v-for="(tag, idx) in item.hashtags" :key="idx" class="badge bg-danger-subtle text-danger me-2">
                #{{ tag }}
              </span>
            </div>

            <!-- 증상 교체-->
            <div v-if="item.symptomList && item.symptomList.length > 0" class="mb-4">
              <h6 class="text-bold mb-2">증상</h6>
              <ul class="text-black ps-3">
                <li v-for="(symptom, idx) in item.symptomList" :key="idx" class="mb-1">
                  {{ symptom }}
                </li>
              </ul>
            </div>

            <!-- 응급처치 -->
            <div v-if="item.methodList && item.methodList.length > 0" class="mb-4">
              <h6 class="text-bold mb-2">응급처치</h6>
              <ol class="mb-0 ps-3 text-black d-flex flex-column gap-2">
                <li v-for="(method, idx) in item.methodList" :key="idx">
                  {{ method }}
                </li>
              </ol>
            </div>
            <!-- 원인 -->
            <div v-if="item.reasonList && item.reasonList.length > 0" class="mb-4">
              <h6 class="text-bold mb-2">원인</h6>
              <ul class="text-black ps-3">
                <li v-for="(reason, idx) in item.reasonList" :key="idx" class="mb-1">
                  {{ reason }}
                </li>
              </ul>
            </div>

            <!-- 주의사항 -->
            <div v-if="item.warning" class="alert alert-warning text-black small mb-0">
              <strong class="text-danger fw-bold">주의:</strong> {{ item.warning }}
            </div>
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
      <div v-else class="text-center text-bold py-5">
        <p class="text-muted">데이터를 찾을 수 없습니다.</p>
      </div>
    </div><!--닫는태-->
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getEmergencyData, incrementViews } from '../firebase/emergency.js'

const route = useRoute()
const router = useRouter()

const item = ref(null)
const loading = ref(true)
const showVideo = ref(false)

const id = computed(() => route.params.id)

onMounted(async () => {
  try {//조회수 카운팅이 겨처서 두번 되는거 수정함 11.12
    // emergency.js의 함수 사용
    item.value = await getEmergencyData(id.value)
  } catch (error) {
    console.error('데이터 로드 실패:', error)
  } finally {
    loading.value = false
  }
})

function getYoutubeEmbedUrl(url) {
  if (!url) return ''
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
  const match = url.match(regex)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.bg-danger-subtle {
  background-color: #fdecea !important;
}
</style>