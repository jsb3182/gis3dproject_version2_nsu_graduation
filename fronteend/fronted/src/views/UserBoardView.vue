<template>
  <div class="container-fluid px-2 py-4">
    <div class="row">
      <div class="col-12">
        <!-- 헤더 -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold">
            <i class="bi bi-clipboard-fill text-primary"></i>
            게시판
          </h2>
          <button class="btn btn-primary" @click="goToWrite">
            <i class="bi bi-pencil-square"></i>
            글쓰기
          </button>
        </div>

        <!-- 로딩 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
          <p class="mt-3 text-muted">게시글을 불러오는 중...</p>
        </div>

        <!-- 게시글 목록 -->
        <div v-else-if="posts.length > 0" class="card shadow-sm">
          <div class="list-group list-group-flush">
            <div
              v-for="post in sortedPosts"
              :key="post.id"
              class="list-group-item list-group-item-action cursor-pointer post-item"
              @click="goToDetail(post.id)"
            >
              <div class="d-flex w-100 justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <h5 class="mb-2 fw-bold">{{ post.title }}</h5>
                  <p class="mb-2 text-muted text-truncate" style="max-width: 800px;">
                    {{ post.content }}
                  </p>
                  <div class="d-flex gap-3 text-muted small">
                    <span>
                      <i class="bi bi-person-circle"></i>
                      작성자 ID: {{ post.writerId }}
                    </span>
                    <span>
                      <i class="bi bi-eye"></i>
                      조회수: {{ post.viewCnt }}
                    </span>
                    <span>
                      <i class="bi bi-calendar"></i>
                      {{ formatDate(post.createdDate) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 게시글 없음 -->
        <div v-else class="text-center py-5">
          <i class="bi bi-inbox display-1 text-muted"></i>
          <p class="mt-3 text-muted">작성된 게시글이 없습니다.</p>
          <button class="btn btn-primary mt-3" @click="goToWrite">
            <i class="bi bi-pencil-square"></i>
            첫 게시글 작성하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllPosts } from '@/utils/postApi'
import { getStoredUser } from '@/api/auth'

const router = useRouter()
const posts = ref([])
const loading = ref(false)
const currentUser = ref(null)

// 최신순 정렬
const sortedPosts = computed(() => {
  return [...posts.value].sort((a, b) => {
    return new Date(b.createdDate) - new Date(a.createdDate)
  })
})

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 게시글 목록 불러오기
const fetchPosts = async () => {
  loading.value = true
  try {
    const data = await getAllPosts()
    // deleteYn이 false인 게시글만 표시
    posts.value = data.filter(post => !post.deleteYn)
    console.log('✅ 게시글 목록 조회 성공:', posts.value.length, '개')
  } catch (error) {
    console.error('❌ 게시글 목록 조회 실패:', error)
    alert('게시글을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 글쓰기 페이지로 이동
const goToWrite = () => {
  router.push('/userboard/write')
}

// 상세 페이지로 이동
const goToDetail = (id) => {
  router.push(`/userboard/${id}`)
}

// 초기 로드
onMounted(() => {
  currentUser.value = getStoredUser()
  console.log('✅ 현재 로그인 사용자:', currentUser.value)
  fetchPosts()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.post-item {
  transition: all 0.2s ease;
}

.post-item:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
  border-left: 4px solid #0d6efd;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
