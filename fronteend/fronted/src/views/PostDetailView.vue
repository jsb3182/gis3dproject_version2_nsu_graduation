<template>
  <div class="container-fluid px-2 py-4">
    <div class="row">
      <div class="col-12">
        <!-- 로딩 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
          <p class="mt-3 text-muted">게시글을 불러오는 중...</p>
        </div>

        <!-- 게시글 상세 -->
        <div v-else-if="post">
          <!-- 헤더 -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <button class="btn btn-outline-secondary" @click="goBack">
              <i class="bi bi-arrow-left"></i>
              목록으로
            </button>
            <div class="d-flex gap-2">
              <button
                class="btn btn-outline-primary"
                @click="goToEdit"
                v-if="canEdit"
              >
                <i class="bi bi-pencil"></i>
                수정
              </button>
              <button
                class="btn btn-outline-danger"
                @click="handleDelete"
                v-if="canEdit"
              >
                <i class="bi bi-trash"></i>
                삭제
              </button>
            </div>
          </div>

          <!-- 게시글 카드 -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white py-3">
              <h3 class="mb-3 fw-bold">{{ post.title }}</h3>
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
                  작성일: {{ formatDate(post.createdDate) }}
                </span>
                <span v-if="post.modifiedDate">
                  <i class="bi bi-pencil"></i>
                  수정일: {{ formatDate(post.modifiedDate) }}
                </span>
              </div>
            </div>
            <div class="card-body">
              <div class="post-content" v-html="formattedContent"></div>
            </div>
          </div>

          <!-- 댓글 섹션 -->
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="bi bi-chat-left-text"></i>
                댓글 <span class="badge bg-primary">{{ comments.length }}</span>
              </h5>
            </div>
            <div class="card-body">
              <!-- 댓글 작성 폼 -->
              <div class="mb-4">
                <div class="d-flex gap-2 align-items-start">
                  <div class="flex-grow-1">
                    <textarea
                      v-model="newComment"
                      class="form-control"
                      rows="3"
                      placeholder="댓글을 입력하세요..."
                      :disabled="!currentUser"
                    ></textarea>
                  </div>
                  <button
                    class="btn btn-primary"
                    @click="addComment"
                    :disabled="!newComment.trim() || !currentUser"
                  >
                    <i class="bi bi-send"></i>
                    등록
                  </button>
                </div>
                <div v-if="!currentUser" class="form-text text-danger mt-2">
                  댓글을 작성하려면 로그인이 필요합니다.
                </div>
              </div>

              <!-- 댓글 목록 -->
              <div v-if="comments.length > 0">
                <div
                  v-for="(comment, index) in sortedComments"
                  :key="index"
                  class="comment-item mb-3 p-3 border rounded"
                >
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-circle fs-4 text-secondary"></i>
                      <div>
                        <strong>{{ comment.username }}</strong>
                        <small class="text-muted ms-2">{{ formatDate(comment.createdAt) }}</small>
                      </div>
                    </div>
                    <button
                      v-if="currentUser && currentUser.id === comment.userId"
                      class="btn btn-sm btn-outline-danger"
                      @click="deleteComment(index)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                  <div class="comment-content" v-html="formatCommentContent(comment.content)"></div>
                </div>
              </div>

              <!-- 댓글 없음 -->
              <div v-else class="text-center text-muted py-4">
                <i class="bi bi-chat-left-dots display-4"></i>
                <p class="mt-2">첫 댓글을 작성해보세요!</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 게시글 없음 -->
        <div v-else class="text-center py-5">
          <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
          <p class="mt-3 text-muted">게시글을 찾을 수 없습니다.</p>
          <button class="btn btn-primary mt-3" @click="goBack">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPostById, deletePost } from '@/utils/postApi'
import { getStoredUser } from '@/api/auth'

const router = useRouter()
const route = useRoute()

const post = ref(null)
const loading = ref(false)
const currentUser = ref(null)

// 댓글 관련
const comments = ref([])
const newComment = ref('')

// 내용을 HTML로 변환 (줄바꿈 처리)
const formattedContent = computed(() => {
  if (!post.value) return ''
  return post.value.content.replace(/\n/g, '<br>')
})

// 수정/삭제 권한
const canEdit = computed(() => {
  if (!currentUser.value || !post.value) return false
  return currentUser.value.id === post.value.writerId
})

// 댓글 최신순 정렬
const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
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

// 게시글 불러오기
const loadPost = async () => {
  loading.value = true
  try {
    const postId = route.params.id
    const data = await getPostById(postId)

    if (data.deleteYn) {
      throw new Error('삭제된 게시글입니다.')
    }

    post.value = data
    console.log('✅ 게시글 조회 성공:', data)
  } catch (error) {
    console.error('❌ 게시글 조회 실패:', error)
    alert('게시글을 불러오는데 실패했습니다.')
    post.value = null
  } finally {
    loading.value = false
  }
}

// 수정 페이지로 이동
const goToEdit = () => {
  router.push(`/userboard/edit/${route.params.id}`)
}

// 삭제
const handleDelete = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) {
    return
  }

  try {
    await deletePost(route.params.id)
    console.log('✅ 게시글 삭제 성공')
    alert('게시글이 삭제되었습니다.')
    router.push('/userboard')
  } catch (error) {
    console.error('❌ 게시글 삭제 실패:', error)
    alert('게시글 삭제에 실패했습니다.')
  }
}

// 뒤로가기
const goBack = () => {
  router.push('/userboard')
}

// 댓글 내용 포맷팅 (줄바꿈 처리)
const formatCommentContent = (content) => {
  return content.replace(/\n/g, '<br>')
}

// 댓글 추가
const addComment = () => {
  if (!newComment.value.trim()) {
    alert('댓글 내용을 입력해주세요.')
    return
  }

  if (!currentUser.value) {
    alert('로그인이 필요합니다.')
    return
  }

  const comment = {
    userId: currentUser.value.id,
    username: currentUser.value.username,
    content: newComment.value,
    createdAt: new Date().toISOString()
  }

  comments.value.push(comment)
  newComment.value = ''

  // 로컬 스토리지에 댓글 저장 (임시)
  saveCommentsToStorage()

  console.log('✅ 댓글 추가 완료')
}

// 댓글 삭제
const deleteComment = (index) => {
  if (!confirm('댓글을 삭제하시겠습니까?')) {
    return
  }

  const actualIndex = comments.value.findIndex(c =>
    sortedComments.value[index] === c
  )

  if (actualIndex !== -1) {
    comments.value.splice(actualIndex, 1)
    saveCommentsToStorage()
    console.log('✅ 댓글 삭제 완료')
  }
}

// 로컬 스토리지에 댓글 저장 (임시, 백엔드 API 없음)
const saveCommentsToStorage = () => {
  const postId = route.params.id
  const key = `post_${postId}_comments`
  localStorage.setItem(key, JSON.stringify(comments.value))
}

// 로컬 스토리지에서 댓글 불러오기
const loadCommentsFromStorage = () => {
  const postId = route.params.id
  const key = `post_${postId}_comments`
  const stored = localStorage.getItem(key)

  if (stored) {
    try {
      comments.value = JSON.parse(stored)
      console.log('✅ 댓글 로드 완료:', comments.value.length, '개')
    } catch (e) {
      console.error('댓글 파싱 실패:', e)
      comments.value = []
    }
  }
}

// 초기화
onMounted(() => {
  currentUser.value = getStoredUser()
  console.log('✅ 현재 로그인 사용자:', currentUser.value)

  loadPost()
  loadCommentsFromStorage()
})
</script>

<style scoped>
.post-content {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
  min-height: 300px;
}

.card-header {
  border-bottom: 2px solid #e9ecef;
}

.card {
  border: none;
}

.comment-item {
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.comment-item:hover {
  background-color: #e9ecef;
  transform: translateX(2px);
}

.comment-content {
  margin-top: 0.5rem;
  line-height: 1.6;
  color: #495057;
}
</style>
