<template>
  <div class="container-fluid px-2 py-4">
    <div class="row">
      <div class="col-12">
        <!-- 헤더 -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold">
            <i class="bi bi-journal-text text-primary"></i>
            방문록
          </h2>
          <button class="btn btn-primary" @click="showWriteModal = true" v-if="currentUser">
            <i class="bi bi-pencil-square"></i>
            방문록 작성
          </button>
        </div>

        <!-- 로딩 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
          <p class="mt-3 text-muted">방문록을 불러오는 중...</p>
        </div>

        <!-- 방문록 목록 -->
        <div v-else-if="guestbooks.length > 0" class="row g-3">
          <div
            v-for="guestbook in sortedGuestbooks"
            :key="guestbook.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <div class="card shadow-sm h-100 guestbook-card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 class="card-title mb-1 fw-bold">
                      <i class="bi bi-person-circle text-primary"></i>
                      작성자 ID: {{ guestbook.writerId }}
                    </h5>
                    <small class="text-muted">
                      <i class="bi bi-calendar"></i>
                      {{ formatDate(guestbook.createdDate) }}
                    </small>
                  </div>
                  <button
                    v-if="canDelete(guestbook)"
                    class="btn btn-sm btn-outline-danger"
                    @click="handleDelete(guestbook.id)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <p class="card-text guestbook-content" v-html="formatContent(guestbook.content)"></p>
              </div>
            </div>
          </div>
        </div>

        <!-- 방문록 없음 -->
        <div v-else class="text-center py-5">
          <i class="bi bi-inbox display-1 text-muted"></i>
          <p class="mt-3 text-muted">작성된 방문록이 없습니다.</p>
          <button class="btn btn-primary mt-3" @click="showWriteModal = true" v-if="currentUser">
            <i class="bi bi-pencil-square"></i>
            첫 방문록 작성하기
          </button>
        </div>
      </div>
    </div>

    <!-- 방문록 작성 모달 -->
    <div v-if="showWriteModal" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-pencil-square text-primary"></i>
              방문록 작성
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label fw-bold">작성자</label>
                <input
                  type="text"
                  class="form-control"
                  :value="currentUser ? currentUser.username : ''"
                  readonly
                  disabled
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">내용 <span class="text-danger">*</span></label>
                <textarea
                  class="form-control"
                  v-model="formData.content"
                  rows="5"
                  placeholder="방문록 내용을 입력하세요..."
                  required
                ></textarea>
                <div class="form-text">{{ formData.content.length }} 글자</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">취소</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="handleSubmit"
              :disabled="submitting || !formData.content.trim()"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              작성하기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getGuestbooks, writeGuestbook, deleteGuestbook } from '@/utils/guestbookApi'
import { getStoredUser } from '@/api/auth'

const guestbooks = ref([])
const loading = ref(false)
const currentUser = ref(null)
const showWriteModal = ref(false)
const submitting = ref(false)

const formData = ref({
  content: '',
  targetId: null,
  writerId: null
})

// 최신순 정렬
const sortedGuestbooks = computed(() => {
  return [...guestbooks.value].sort((a, b) => {
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

// 내용 포맷팅 (줄바꿈 처리)
const formatContent = (content) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

// 삭제 권한 확인
const canDelete = (guestbook) => {
  if (!currentUser.value) return false
  // 작성자 본인만 삭제 가능
  return currentUser.value.id === guestbook.writerId
}

// 방문록 목록 불러오기
const fetchGuestbooks = async () => {
  if (!currentUser.value) {
    console.log('로그인 정보 없음')
    loading.value = false
    return
  }

  loading.value = true
  try {
    // 현재 로그인한 사용자의 방문록 조회
    const targetId = currentUser.value.id
    console.log('방문록 조회 시작, targetId:', targetId)

    const data = await getGuestbooks(targetId)
    guestbooks.value = Array.isArray(data) ? data : []
    console.log('✅ 방문록 목록 조회 성공:', guestbooks.value.length, '개')
  } catch (error) {
    console.error('❌ 방문록 목록 조회 실패:', error)
    guestbooks.value = []
    // alert('방문록을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 방문록 작성
const handleSubmit = async () => {
  if (!formData.value.content.trim()) {
    alert('내용을 입력해주세요.')
    return
  }

  if (!currentUser.value) {
    alert('로그인이 필요합니다.')
    return
  }

  submitting.value = true

  try {
    const guestData = {
      content: formData.value.content,
      targetId: currentUser.value.id, // 로그인한 사용자의 방명록에 작성
      writerId: currentUser.value.id
    }

    await writeGuestbook(guestData)
    console.log('✅ 방문록 작성 성공')
    alert('방문록이 작성되었습니다.')

    closeModal()
    fetchGuestbooks()
  } catch (error) {
    console.error('❌ 방문록 작성 실패:', error)
    alert('방문록 작성에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

// 방문록 삭제
const handleDelete = async (id) => {
  if (!confirm('방문록을 삭제하시겠습니까?')) {
    return
  }

  try {
    await deleteGuestbook(id)
    console.log('✅ 방문록 삭제 성공')
    alert('방문록이 삭제되었습니다.')
    fetchGuestbooks()
  } catch (error) {
    console.error('❌ 방문록 삭제 실패:', error)
    alert('방문록 삭제에 실패했습니다.')
  }
}

// 모달 닫기
const closeModal = () => {
  showWriteModal.value = false
  formData.value.content = ''
}

// 초기 로드
onMounted(() => {
  currentUser.value = getStoredUser()
  console.log('✅ 현재 로그인 사용자:', currentUser.value)

  if (!currentUser.value) {
    console.log('⚠️ 로그인 정보 없음 - 빈 페이지 표시')
    loading.value = false
    return
  }

  fetchGuestbooks()
})
</script>

<style scoped>
.guestbook-card {
  transition: all 0.2s ease;
  border: none;
}

.guestbook-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.guestbook-content {
  color: #495057;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.modal {
  display: block;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
