<template>
  <!-- ✅ 다른 관리자 화면과 동일한 card + admin-main 레이아웃 -->
  <div class="card shadow-sm border-0 rounded-4">
    <main class="admin-main">
      <div class="admin-edu container-fluid py-3">
        <!-- 헤더 -->
        <div class="d-flex align-items-center justify-content-between mb-3">
              <button class="btn btn-link p-0 text-dark" @click="goBack">
                <i class="bi bi-arrow-left fs-5"></i>
              </button>
          <div>
            <h4 class="text-bold mb-1">응급 교육 콘텐츠</h4>
            <div class="text-medium text-muted small">총 {{ filteredItems.length }}건</div>
          </div>

          <!-- 우측 퀵 액션 -->
          <div class="d-flex align-items-center gap-2">
            <button
              v-if="isAdmin"
              type="button"
              class="btn btn-success rounded-pill text-bold"
              @click="goToWrite"
            >
              + 새 게시물
            </button>
          </div>
        </div>

        <!-- 컨트롤바 -->
        <div class="card shadow-sm border-0 rounded-4 mb-3">
          <div class="card-body d-flex flex-wrap align-items-center gap-3">

            <!-- 검색 -->
            <div class="flex-grow-1" style="min-width: 200px;">
              <div class="input-group rounded-3 bg-light px-2">
                <input 
                  type="text" 
                  class="form-control border-0 bg-light p-2 text-plight" 
                  placeholder="검색어를 입력하세요"
                  v-model="keyword"
                />
                <span class="input-group-text bg-light border-0">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#666" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3"/>
                  </svg>
                </span>
              </div>
            </div>

            <!-- 옵션들 -->
            <div class="ms-auto d-flex flex-wrap align-items-center gap-2">

              <!-- 정렬 기준 -->
              <select v-model="sortKey" class="form-select form-select-sm w-auto text-plight">
                <option value="createdAt">작성일</option>
                <option value="title">제목</option>
                <option value="viewCount">조회수</option>
              </select>

              <!-- 정렬 방향 -->
              <button
                class="btn btn-light btn-sm"
                @click="toggleSortDir"
                :title="sortDir === 'desc' ? '내림차순' : '오름차순'"
              >
                <i v-if="sortDir==='desc'" class="bi bi-sort-down"></i>
                <i v-else class="bi bi-sort-up"></i>
              </button>

              <!-- 페이지 크기 -->
              <select v-model.number="pageSize" class="form-select form-select-sm w-auto text-plight">
                <option :value="10">10개</option>
                <option :value="20">20개</option>
                <option :value="50">50개</option>
              </select>

              <!-- 일괄 삭제 -->
              <button
                v-if="isAdmin"
                class="btn btn-outline-danger btn-sm text-plight"
                :disabled="selectedIds.size===0"
                @click="bulkDelete"
              >
                <i class="bi bi-trash me-1"></i>삭제 ({{ selectedIds.size }})
              </button>
            </div>

          </div>
        </div>


        <!-- 로딩 스켈레톤 -->
        <div v-if="loading" class="card shadow-sm border-0 rounded-4">
          <div class="list-group list-group-flush">
            <div v-for="i in 6" :key="i" class="list-group-item py-3">
              <div class="placeholder-glow">
                <span class="placeholder col-7"></span>
                <span class="placeholder col-4 ms-2"></span>
                <div class="mt-2">
                  <span class="placeholder col-2"></span>
                  <span class="placeholder col-1 ms-2"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="pagedItems.length === 0" class="card shadow-sm border-0 rounded-4">
          <div class="card-body py-5 text-center text-medium text-muted">
            <i class="bi bi-journal-text fs-1 d-block mb-2"></i>
            검색 결과가 없습니다.
          </div>
        </div>

        <!-- 목록 -->
        <div v-else class="card shadow-sm border-0 rounded-4">
          <div class="table-responsive">
            <table class="table align-middle mb-0 admin-table">
              <thead class="table-light text-bold">
                <tr>
                  <th style="width:40px;">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :checked="allVisibleChecked"
                      @change="toggleCheckAll($event.target.checked)"
                    />
                  </th>
                  <th>제목</th>
                  <th class="text-nowrap" style="width:140px;">작성일</th>
                  <th class="text-nowrap" style="width:120px;">조회수</th>
                  <th class="text-end" style="width:160px;">관리</th>
                </tr>
              </thead>
              <tbody class="text-plight">
                <tr v-for="item in pagedItems" :key="item.id">
                  <td>
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :checked="selectedIds.has(item.id)"
                      @change="toggleSelect(item.id, $event.target.checked)"
                    />
                  </td>

                  <td>
                    <button
                      class="btn btn-link p-0 text-start fw-semibold title-link"
                      @click="goToDetail(item.id)"
                    >
                      {{ item.title }}
                    </button>
                    <div v-if="item.hashtags && item.hashtags.length" class="mt-1 small">
                      <span
                        v-for="(tag, i) in item.hashtags"
                        :key="i"
                        class="badge bg-light text-secondary border me-1"
                      >
                        #{{ tag }}
                      </span>
                    </div>
                    <div v-else class="text-muted small mt-1">태그 없음</div>
                  </td>

                  <td class="text-muted small">{{ formatDate(item.createdAt) }}</td>
                  <td class="text-muted small">{{ (item.viewCount || 0).toLocaleString() }}</td>

                  <td class="text-end">
                    <div class="d-inline-flex gap-2">
                      <button
                        class="btn btn-outline-primary btn-sm rounded-1 w-100 text-center"
                        @click="goToEdit(item.id)"
                      >
                        수정
                      </button>
                      <button
                        class="btn btn-outline-dark btn-sm rounded-1 w-100 text-center"
                        @click="handleDelete(item.id)"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 페이지네이션 -->
          <div class="card-footer d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="text-bold text-muted small">
              표시: {{ startIdx + 1 }}–{{ endIdx }} / 총 {{ filteredItems.length }}
            </div>
            <div class="d-flex align-items-center gap-1">
              <button class="btn btn-light btn-sm" :disabled="page===1" @click="page--">
                <i class="bi bi-chevron-left"></i>
              </button>
              <span class="px-2 text-bold">{{ page }} / {{ totalPages }}</span>
              <button class="btn btn-light btn-sm" :disabled="page===totalPages" @click="page++">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from '@/firebase'
import { collection, getDocs, orderBy, query, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const router = useRouter()
const keyword = ref('')
const items = ref([])
const loading = ref(true)

const isAdmin = ref(false)
const currentUserUid = ref(null)

/* 정렬/페이지/선택 상태 */
const sortKey = ref('createdAt')        // 'createdAt' | 'title' | 'viewCount'
const sortDir = ref('desc')             // 'asc' | 'desc'
const page = ref(1)
const pageSize = ref(10)
const selectedIds = ref(new Set())

/* 이동 */
const goToEdit = (id) => router.push(`/AdminEmergencyEdit/${id}`)
const goToWrite = () => router.push('/AdminEmergencyWrite')
const goToDetail = (id) => router.push({ name: 'AdminEmergencyorder', params: { id } })


/* 데이터 */
async function loadData () {
  try {
    const q = query(collection(db, 'emergencyData'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    items.value = snapshot.docs.map(d => {
      const v = d.data()
      return {
        id: d.id,
        title: v.title || '(제목 없음)',
        viewCount: v.viewCount || 0,
        createdAt: v.createdAt ? v.createdAt.toDate() : null,
        hashtags: v.hashtags || []   // ✅ 추가
      }
    })
  } catch (e) {
    console.error('데이터 불러오기 실패:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  checkAdminStatus()
})

async function checkAdminStatus () {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserUid.value = user.uid
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)
      isAdmin.value = !!(userDoc.exists() && (userDoc.data().username || '').toLowerCase().includes('admin'))
    } else {
      isAdmin.value = false
      currentUserUid.value = null
    }
  })
}

/* 삭제 */
async function handleDelete (id) {
  if (!isAdmin.value) return alert('권한이 없습니다.')
  if (!confirm('정말로 이 게시물을 삭제하시겠습니까?')) return

  try {
    await deleteDoc(doc(db, 'emergencyData', id))
    items.value = items.value.filter(v => v.id !== id)
    selectedIds.value.delete(id)
    alert('게시물이 삭제되었습니다.')
  } catch (e) {
    console.error('삭제 실패:', e)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

async function bulkDelete () {
  if (!isAdmin.value) return alert('권한이 없습니다.')
  if (selectedIds.value.size === 0) return
  if (!confirm(`선택한 ${selectedIds.value.size}개 항목을 삭제하시겠습니까?`)) return

  try {
    const ids = Array.from(selectedIds.value)
    await Promise.all(ids.map(id => deleteDoc(doc(db, 'emergencyData', id))))
    items.value = items.value.filter(v => !selectedIds.value.has(v.id))
    selectedIds.value.clear()
    alert('삭제되었습니다.')
  } catch (e) {
    console.error('일괄 삭제 실패:', e)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

/* 검색/정렬/페이지 */
const filteredItems = computed(() => {
  const q = keyword.value.trim().toLowerCase()
   // ✅ 제목 + 해시태그 검색 포함
  let list = q
    ? items.value.filter(v => {
        const titleMatch = (v.title || '').toLowerCase().includes(q)
        const hashtagMatch = v.hashtags && v.hashtags.some(tag => tag.toLowerCase().includes(q))
        return titleMatch || hashtagMatch
      })
    : items.value.slice()
  list.sort((a, b) => {
    const dir = sortDir.value === 'asc' ? 1 : -1
    const ak = sortKey.value === 'title' ? (a.title || '') :
               sortKey.value === 'viewCount' ? (a.viewCount || 0) :
               (a.createdAt ? a.createdAt.getTime() : 0)
    const bk = sortKey.value === 'title' ? (b.title || '') :
               sortKey.value === 'viewCount' ? (b.viewCount || 0) :
               (b.createdAt ? b.createdAt.getTime() : 0)
    if (ak < bk) return -1 * dir
    if (ak > bk) return 1 * dir
    return 0
  })
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))
const startIdx = computed(() => (page.value - 1) * pageSize.value)
const endIdx = computed(() => Math.min(filteredItems.value.length, startIdx.value + pageSize.value))
const pagedItems = computed(() => filteredItems.value.slice(startIdx.value, endIdx.value))

function toggleSortDir () { sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc' }
function gotoFirstPage () { page.value = 1 }

/* 선택 */
const allVisibleChecked = computed(() => pagedItems.value.length > 0 && pagedItems.value.every(v => selectedIds.value.has(v.id)))
function toggleCheckAll (checked) {
  if (checked) pagedItems.value.forEach(v => selectedIds.value.add(v.id))
  else pagedItems.value.forEach(v => selectedIds.value.delete(v.id))
}
function toggleSelect (id, checked) {
  if (checked) selectedIds.value.add(id)
  else selectedIds.value.delete(id)
}

/* 내보내기 */
function exportCsv () {
  const rows = [['id', 'title', 'viewCount', 'createdAt']]
  filteredItems.value.forEach(v => rows.push([
    v.id,
    (v.title || '').replaceAll('"', '""'),
    String(v.viewCount || 0),
    v.createdAt ? v.createdAt.toISOString() : ''
  ]))
  const csv = rows.map(r => r.map(x => `"${x}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'emergency_contents.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/* 날짜 포맷 */
function formatDate (date) {
  if (!date) return ''
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const goBack = () => router.back()

</script>

<style scoped>
/* 관리자 메인 영역: 다른 관리자 페이지와 동일 */
.admin-main {
  margin-left: 240px;          /* 사이드바 너비 */
  padding-top: 1.5rem;
  padding-bottom: 2.5rem;
  padding-left: 0;
  padding-right: 0;
  min-height: 100vh;
  background-color: transparent;
}

/* 페이지 프레임 */
.admin-edu {
  /* 헤더/푸터 여백 강하게 주던 거 제거해서 리스트/상세랑 높이 느낌 맞춤 */
  padding-top: 0;
  padding-bottom: 0;
  background: #fff;
}

/* 검색 인풋 */
.admin-search {
  min-width: 260px;
  background: #f5f7fb;
  border: 1px solid #e6e9ef;
  border-radius: 10px;
}

/* 테이블 */
.admin-table th { font-size: 12px; letter-spacing: .2px; color: #6b7280; }
.title-link { color: #0d6efd; }
.title-link:hover { text-decoration: underline; }

/* 모바일 대응 */
@media (max-width: 576px) {
  .admin-table td { padding-top: .9rem; padding-bottom: .9rem; }
}

/* 스켈레톤 */
.placeholder { display: inline-block; background-color: #e9ecef; border-radius: .25rem; }
.placeholder.col-7 { width: 60%; height: 16px; }
.placeholder.col-4 { width: 35%; height: 16px; }
.placeholder.col-2 { width: 20%; height: 14px; }
.placeholder.col-1 { width: 10%; height: 14px; }
</style>

