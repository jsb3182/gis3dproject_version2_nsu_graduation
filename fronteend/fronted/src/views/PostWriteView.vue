<template>
  <div class="container-fluid px-2 py-4">
    <div class="row">
      <div class="col-12">
        <!-- 헤더 -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold">
            <i class="bi bi-pencil-square text-primary"></i>
            {{ isEditMode ? '게시글 수정' : '게시글 작성' }}
          </h2>
          <button class="btn btn-outline-secondary" @click="goBack">
            <i class="bi bi-arrow-left"></i>
            목록으로
          </button>
        </div>

        <!-- 작성 폼 -->
        <div class="card shadow-sm">
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <!-- 제목 -->
              <div class="mb-3">
                <label for="title" class="form-label fw-bold">
                  제목 <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="title"
                  v-model="formData.title"
                  placeholder="제목을 입력하세요"
                  required
                  maxlength="200"
                />
                <div class="form-text">
                  {{ formData.title.length }} / 200
                </div>
              </div>

              <!-- 내용 -->
              <div class="mb-3">
                <label for="content" class="form-label fw-bold">
                  내용 <span class="text-danger">*</span>
                </label>
                <textarea
                  class="form-control"
                  id="content"
                  v-model="formData.content"
                  rows="15"
                  placeholder="내용을 입력하세요"
                  required
                ></textarea>
                <div class="form-text">
                  {{ formData.content.length }} 글자
                </div>
              </div>

              <!-- 작성자 정보 (읽기 전용) -->
              <div class="mb-4">
                <label class="form-label fw-bold">
                  작성자
                </label>
                <input
                  type="text"
                  class="form-control"
                  :value="currentUser ? `${currentUser.username} (ID: ${currentUser.id})` : '로그인 정보 없음'"
                  readonly
                  disabled
                />
                <div class="form-text text-muted">
                  로그인한 사용자 정보가 자동으로 입력됩니다.
                </div>
              </div>

              <!-- 버튼 -->
              <div class="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="goBack"
                >
                  취소
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="submitting"
                >
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditMode ? '수정하기' : '작성하기' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createPost, updatePost, getPostById } from '@/utils/postApi'
import { getStoredUser } from '@/api/auth'

const router = useRouter()
const route = useRoute()

const isEditMode = ref(false)
const submitting = ref(false)
const currentUser = ref(null)

const formData = ref({
  title: '',
  content: '',
  writerId: null
})

// 게시글 작성
const handleCreate = async () => {
  try {
    const postId = await createPost(formData.value)
    console.log('✅ 게시글 작성 성공, ID:', postId)
    alert('게시글이 작성되었습니다.')
    router.push(`/userboard/${postId}`)
  } catch (error) {
    console.error('❌ 게시글 작성 실패:', error)
    alert('게시글 작성에 실패했습니다.')
  }
}

// 게시글 수정
const handleUpdate = async () => {
  try {
    const postId = route.params.id
    await updatePost(postId, formData.value)
    console.log('✅ 게시글 수정 성공')
    alert('게시글이 수정되었습니다.')
    router.push(`/userboard/${postId}`)
  } catch (error) {
    console.error('❌ 게시글 수정 실패:', error)
    alert('게시글 수정에 실패했습니다.')
  }
}

// 폼 제출
const handleSubmit = async () => {
  if (!formData.value.title.trim()) {
    alert('제목을 입력해주세요.')
    return
  }
  if (!formData.value.content.trim()) {
    alert('내용을 입력해주세요.')
    return
  }

  // 로그인한 사용자 ID 자동 설정
  if (!formData.value.writerId && currentUser.value) {
    formData.value.writerId = currentUser.value.id
  }

  if (!formData.value.writerId) {
    alert('로그인 정보를 확인할 수 없습니다.')
    return
  }

  submitting.value = true

  try {
    if (isEditMode.value) {
      await handleUpdate()
    } else {
      await handleCreate()
    }
  } finally {
    submitting.value = false
  }
}

// 뒤로가기
const goBack = () => {
  router.back()
}

// 수정 모드인 경우 기존 게시글 불러오기
const loadPost = async () => {
  const postId = route.params.id
  try {
    const post = await getPostById(postId)
    formData.value = {
      title: post.title,
      content: post.content,
      writerId: post.writerId
    }
    console.log('✅ 게시글 로드 성공')
  } catch (error) {
    console.error('❌ 게시글 로드 실패:', error)
    alert('게시글을 불러오는데 실패했습니다.')
    router.push('/userboard')
  }
}

// 초기화
onMounted(() => {
  // 로그인 사용자 정보 가져오기
  currentUser.value = getStoredUser()
  console.log('✅ 현재 로그인 사용자:', currentUser.value)

  if (!currentUser.value) {
    alert('로그인이 필요합니다.')
    router.push('/login')
    return
  }

  // URL에 id가 있으면 수정 모드
  if (route.params.id) {
    isEditMode.value = true
    loadPost()
  }
})
</script>

<style scoped>
.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

textarea.form-control {
  resize: vertical;
  min-height: 300px;
}
</style>
