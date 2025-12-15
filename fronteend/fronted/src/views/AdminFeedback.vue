<template>
  <div class="card shadow-sm border-0 rounded-4">
    <main class="admin-main">
      
      <!-- 상단 타이틀 & 설명 -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 px-4 pt-3">
        <div>
          <h3 class="text-bold mb-1">관리자 대시보드</h3>
          <p class="text-medium mb-0 small">
            아이119 앱의 크롤링 설정, 사용자/콘텐츠 데이터, 자동화 로그, 건의사항을 한 곳에서 관리합니다.
          </p>
        </div>
      </div>

      <!-- 건의사항 카드 -->
      <div class="card shadow-sm border-0 rounded-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="text-bold mb-0">응급처치 화면 건의사항</h5>
          </div>

          <!-- 건의사항 총 수 -->
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-secondary-subtle text-medium text-dark small">
              총 {{ emergencyFeedbacks.length }}건
            </span>
          </div>

          <!-- 로딩 중 -->
          <div v-if="loading" class="text-center py-4 small text-medium text-muted">
            건의사항을 불러오는 중입니다...
          </div>

          <!-- 건의사항 없음 -->
          <div
            v-else-if="!loading && emergencyFeedbacks.length === 0"
            class="text-medium text-muted small py-3 text-center"
          >
            아직 응급처치 화면 건의사항이 없습니다.
          </div>

          <!-- 건의사항 목록 -->
          <div v-else class="table-responsive">
            <table class="table table-sm align-middle mb-0">
              <thead class="table-light text-bold">
                <tr>
                  <th style="width: 8%;">No</th>
                  <th>관련 콘텐츠</th>
                  <th>내용</th>
                  <th style="width: 18%;">작성자</th>
                  <th style="width: 18%;">작성일</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(f, idx) in emergencyFeedbacks" 
                  :key="f.id"
                  @click="goToSuggestionDetail(f.id)"
                  style="cursor: pointer;"
                >
                  <td class="text-plight">{{ idx + 1 }}</td>
                  <td class="text-truncate text-plight" style="max-width: 240px;">
                    {{ f.emergencyTitle }}
                  </td>
                  <td class="text-truncate text-plight" style="max-width: 280px;">
                    {{ f.content }}
                  </td>
                  <td class="text-plight">{{ f.writer }}</td>
                  <td class="text-plight">{{ formatDate(f.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

const router = useRouter()

// 🔹 Firestore에서 불러온 건의사항 리스트
const emergencyFeedbacks = ref([])
const loading = ref(true)

// 날짜 포맷
function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 상세 페이지 이동
function goToSuggestionDetail(id) {
  router.push(`/AdminEmergencysuggestionsdetail/${id}`)
}

// 🔹 Firestore에서 suggestions 컬렉션 불러오기
async function loadSuggestions() {
  try {
    loading.value = true

    // createdAt 기준 최신순 정렬
    const q = query(
      collection(db, 'suggestions'),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)

    emergencyFeedbacks.value = snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        emergencyTitle: data.title || '(제목 없음)',
        content: data.content || '(내용 없음)',
        writer: data.fromEmail || '(이메일 없음)',
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        // 필요하면 여기서 status, adminMemo 등도 들고갈 수 있음
        status: data.status || '',
        targetRole: data.targetRole || '',
        adminMemo: data.adminMemo || ''
      }
    })
  } catch (e) {
    console.error('suggestions 로딩 실패:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSuggestions()
})
</script>

<style scoped>
.admin-layout {
  padding-top: 72px;
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

.bg-success-subtle { background-color: #d1e7dd !important; }
.bg-warning-subtle { background-color: #fff3cd !important; }
.bg-secondary-subtle { background-color: #e2e3e5 !important; }
.bg-danger-subtle { background-color: #f8d7da !important; }
</style>
