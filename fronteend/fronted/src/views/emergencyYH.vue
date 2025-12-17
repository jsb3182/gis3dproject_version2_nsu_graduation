<template>
  <div class="edu-page container-fluid px-3 py-3">
    <!-- 상단 탭 -->
    <div class="d-flex justify-content-center mb-3">
      <div></div>
      <button
        type="button"
        class="btn btn-success rounded-pill px-3 fw-semibold"
        @click="goToWrite"
      >
        + 게시물 추가
      </button>
    </div>

    <!-- 검색 영역 -->
    <div class="mb-3">
      <div class="input-group edu-search rounded-3 px-2">
        <input
          type="text"
          class="form-control border-0 shadow-none p-2"
          placeholder="검색어를 입력하세요."
          v-model="keyword"
        />
        <span class="input-group-text bg-transparent border-0 p-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
          >
            <path
              fill="#00b894"
              d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5
                 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L19 20.49
                 20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5
                 11.99 14 9.5 14"
            />
          </svg>
        </span>
      </div>
    </div>

    <!-- 전체 개수 -->
    <p class="text-muted small mb-3">
      전체 {{ filteredItems.length }}건이 등록되어 있습니다.
    </p>

    <!-- 목록 -->
    <div
  v-for="item in filteredItems"
  :key="item.id"
  class="edu-item border-top d-flex justify-content-between align-items-center"
>
  <div class="py-3 flex-grow-1">
    <div class="fw-semibold edu-title">
      {{ item.title }}
    </div>
    <div class="text-muted small mt-2">
      {{ formatDate(item.createdAt) }}
      <span class="mx-2">|</span>
      조회수 {{ item.viewCount || 0 }}
    </div>
  </div>

  <!-- ✅ 수정 버튼 -->
  <div class="ms-3">
    <button
      type="button"
      class="btn btn-outline-secondary btn-sm rounded-pill"
      @click="goToEdit(item.id)"
    >
      수정
    </button>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

// --------------------------------------------
// ✅ 기본 설정
// --------------------------------------------
const router = useRouter()
const keyword = ref('')
const items = ref([])
const loading = ref(true)

// 수정화면으로 이동
const goToEdit = (id) => {
  router.push(`/emergencyEdit/${id}`)
}


// 게시물 작성 페이지로 이동
const goToWrite = () => {
  router.push('/emergencyWrite')
}

// --------------------------------------------
// ✅ Firestore에서 데이터 불러오기
// --------------------------------------------
onMounted(async () => {
  try {
    const q = query(collection(db, 'emergencyData'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    items.value = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || '(제목 없음)',
        viewCount: data.viewCount || 0,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
      }
    })
  } catch (e) {
    console.error('데이터 불러오기 실패:', e)
  } finally {
    loading.value = false
  }
})

// --------------------------------------------
// ✅ 검색 필터
// --------------------------------------------
const filteredItems = computed(() => {
  if (!keyword.value.trim()) return items.value
  const q = keyword.value.trim().toLowerCase()
  return items.value.filter(v => v.title.toLowerCase().includes(q))
})

// --------------------------------------------
// ✅ 날짜 포맷 함수
// --------------------------------------------
function formatDate(date) {
  if (!date) return ''
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
</script>

<style scoped>
.edu-page {
  padding-top: calc(var(--header-h, 56px) + 8px);
  padding-bottom: calc(var(--footer-h, 56px) + 8px);
  min-height: calc(100vh - var(--header-h, 56px) - var(--footer-h, 56px));
  background-color: #ffffff;
}

.edu-search {
  background-color: #f5f5f5;
}

.edu-list {
  background-color: #ffffff;
}

.edu-item {
  cursor: pointer;
}

.edu-item:last-child {
  border-bottom: 1px solid #e9ecef;
}

.edu-title {
  font-size: 17px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
