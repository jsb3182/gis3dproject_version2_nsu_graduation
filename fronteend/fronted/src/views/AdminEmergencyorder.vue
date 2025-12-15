<template>
  <div class="admin-layout d-flex min-vh-100">
    <main class="admin-main">
      <!-- 상단 타이틀 & 설명 -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 px-4 pt-3">
        <div>
          <h3 class="text-bold mb-1">관리자 대시보드</h3>
          <p class="text-medium mb-0 small">
            아이119 앱의 크롤링 설정, 응급 교육 콘텐츠, 자동화 로그, 건의사항을 한 곳에서 관리합니다.
          </p>
        </div>
      </div>

      <!-- 메인 카드 -->
      <div class="card shadow-sm border-0 rounded-4 mx-4 mb-4">
        <div class="card-body p-3 p-md-4">
          <!-- 로딩 상태 -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-danger" role="status">
              <span class="visually-hidden">로딩 중...</span>
            </div>
          </div>

          <!-- 데이터 있음 -->
          <div v-else-if="item">
            <!-- 제목 + 뒤로가기 -->
            <div class="d-flex align-items-center gap-2 mb-3">
              <button class="btn btn-link p-0 text-dark" @click="goBack">
                <i class="bi bi-arrow-left fs-5"></i>
              </button>
              <h1 class="fs-4 text-bold mb-0">{{ item.title }}</h1>
            </div>

            <!-- 메타 정보 -->
            <div class="d-flex align-items-center text-bold text-muted small mb-4">
              <span>{{ formatDate(item.createdAt) }}</span>
              <span class="mx-2">|</span>
              <span>조회수 {{ item.viewCount || 0 }}</span>
            </div>

            <!-- 유튜브 썸네일 (클릭 시 동영상) -->
            <div
              v-if="item.thumbnailUrl && !showVideo"
              class="mb-3 rounded-4 overflow-hidden position-relative"
              @click="showVideo = true"
              style="cursor: pointer;"
            >
              <img :src="item.thumbnailUrl" class="w-100 h-100 object-fit-cover" alt="썸네일" />
              <div class="position-absolute top-50 start-50 translate-middle play-btn">
                <i class="bi bi-play-circle-fill text-danger fs-1 shadow-lg"></i>
              </div>
            </div>

            <!-- 유튜브 동영상 -->
            <div
              v-if="item.youtubeUrl && showVideo"
              class="ratio ratio-16x9 mb-3 rounded-4 overflow-hidden"
            >
              <iframe :src="getYoutubeEmbedUrl(item.youtubeUrl)" allowfullscreen class="rounded"></iframe>
            </div>

            <!-- 일반 동영상 URL (유튜브가 아닌 경우) -->
            <div v-if="item.youtubeUrl && !item.youtubeId && !item.thumbnailUrl" class="mb-3 text-medium">
              <a :href="item.youtubeUrl" target="_blank" class="btn btn-danger w-100">
                <i class="bi bi-play-circle me-2"></i>동영상 보러 가기
              </a>
            </div>

            <!-- 본문 내용 카드 -->
            <div class="card border-0 shadow-sm rounded-4 mb-3">
              <div class="card-body p-3 p-md-4">
                <!-- 해시태그 -->
                <div v-if="item.hashtags && item.hashtags.length > 0" class="mb-4">
                  <span
                    v-for="(tag, idx) in item.hashtags"
                    :key="idx"
                    class="badge bg-danger-subtle text-bold text-danger me-2"
                  >
                    #{{ tag }}
                  </span>
                </div>

                <!-- 증상 -->
                <div v-if="item.symptomList && item.symptomList.length > 0" class="mb-4">
                  <h6 class="text-danger text-bold mb-2">증상</h6>
                  <ul class="text-black ps-3">
                    <li
                      v-for="(symptom, idx) in item.symptomList"
                      :key="idx"
                      class="mb-1 text-medium text-dark"
                    >
                      {{ symptom }}
                    </li>
                  </ul>
                </div>

                <!-- 응급처치 -->
                <div v-if="item.methodList && item.methodList.length > 0" class="mb-4">
                  <h6 class="text-danger text-bold mb-2">응급처치</h6>
                  <ol class="mb-0 ps-3 text-medium text-dark d-flex flex-column gap-2">
                    <li v-for="(method, idx) in item.methodList" :key="idx">
                      {{ method }}
                    </li>
                  </ol>
                </div>

                <!-- 원인 -->
                <div v-if="item.reasonList && item.reasonList.length > 0" class="mb-4">
                  <h6 class="text-danger text-bold mb-2">원인</h6>
                  <ul class="text-medium text-dark ps-3">
                    <li
                      v-for="(reason, idx) in item.reasonList"
                      :key="idx"
                      class="mb-1"
                    >
                      {{ reason }}
                    </li>
                  </ul>
                </div>

                <!-- 주의사항 -->
                <div v-if="item.warning" class="alert alert-warning text-black text-medium small mb-0">
                  <strong class="text-danger text-bold">주의:</strong> {{ item.warning }}
                </div>
              </div>
            </div>

            <!-- 목록으로 버튼 -->
            <div class="d-flex justify-content-end">
              <button @click="goBack" class="btn btn-outline-secondary">
                목록으로
              </button>
            </div>
          </div>

          <!-- 데이터 없음 -->
          <div v-else class="text-center py-5">
            <p class="text-muted mb-1">데이터를 찾을 수 없습니다.</p>
            <button class="btn btn-outline-secondary btn-sm mt-2" @click="goBack">
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
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
  try {
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
  return date
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .replace(/\. /g, '.')
    .replace(/\.$/, '')
}

function goBack() {
  router.back()
}
</script>

<style scoped>
/* 관리자 레이아웃 공통 (네가 마음에 들어했던 구조) */
.admin-layout {
  padding-top: 0;
}

.admin-main {
  margin-left: 240px;
  padding-top: 1.5rem;
  padding-bottom: 2.5rem;
  padding-left: 0;
  padding-right: 0;
  min-height: 100vh;
  background-color: transparent;
}

/* 기존 해시태그 색상 유지 */
.bg-danger-subtle {
  background-color: #fdecea !important;
}
</style>
