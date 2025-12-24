<template>
  <div class="admin-layout d-flex min-vh-100">
    <!-- 메인 영역 -->
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

        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-semibold mb-0">사용자 건의사항</h5>
            </div>

            <div class="btn-group mb-3">
              <button
                type="button"
                class="btn btn-sm"
                :class="feedbackTab === 'app' ? 'btn-primary' : 'btn-outline-primary'"
                @click="feedbackTab = 'app'"
              >
                앱 건의사항
              </button>
              <button
                type="button"
                class="btn btn-sm"
                :class="feedbackTab === 'emergency' ? 'btn-primary' : 'btn-outline-primary'"
                @click="feedbackTab = 'emergency'"
              >
                응급처치 화면 건의사항
              </button>
            </div>

            <!-- 앱 건의사항 -->
            <div v-if="feedbackTab === 'app'">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-secondary-subtle text-dark small">
                  총 {{ appFeedbacks.length }}건
                </span>
              </div>

              <div v-if="appFeedbacks.length === 0" class="text-muted small py-3 text-center">
                아직 앱 건의사항이 없습니다.
              </div>

              <div v-else class="table-responsive">
                <table class="table table-sm align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 8%;">No</th>
                      <th>제목</th>
                      <th style="width: 18%;">작성자</th>
                      <th style="width: 18%;">작성일</th>
                      <th style="width: 12%;">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(f, idx) in emergencyFeedbacks" :key="f.id" @click="goToSuggestionDetail(f.id)"
                      style="cursor: pointer;">
                      <td>{{ idx + 1 }}</td>
                      <td class="text-truncate" style="max-width: 200px;">
                        {{ f.emergencyTitle }}
                      </td>
                      <td class="text-truncate" style="max-width: 260px;">
                        {{ f.content }}
                      </td>
                      <td>{{ f.writer }}</td>
                      <td>{{ formatDate(f.createdAt) }}</td>
                      <td>
                        <span class="badge rounded-pill px-3"
                          :class="f.status === '처리완료' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'">
                          {{ f.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 응급처치 화면 건의사항 -->
            <div v-else>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-secondary-subtle text-dark small">
                  총 {{ emergencyFeedbacks.length }}건
                </span>
              </div>

              <div v-if="emergencyFeedbacks.length === 0" class="text-muted small py-3 text-center">
                아직 응급처치 화면 건의사항이 없습니다.
              </div>

              <div v-else class="table-responsive">
                <table class="table table-sm align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 8%;">No</th>
                      <th>관련 콘텐츠</th>
                      <th>내용</th>
                      <th style="width: 18%;">작성자</th>
                      <th style="width: 18%;">작성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(f, idx) in emergencyFeedbacks" :key="f.id"  @click="goToSuggestionDetail(f.id)" style="cursor: pointer;">
                      <td>{{ idx + 1 }}</td>
                      <td class="text-truncate" style="max-width: 200px;">
                        {{ f.emergencyTitle }}
                      </td>
                      <td class="text-truncate" style="max-width: 260px;">
                        {{ f.content }}
                      </td>
                      <td>{{ f.writer }}</td>
                      <td>{{ formatDate(f.createdAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      <!-- ✅ 자녀 상세정보 모달 -->
      <div v-if="kidModalUser" class="kid-modal-backdrop" @click.self="closeKidModal">
        <div class="kid-modal card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="fw-semibold mb-0">
                {{ kidModalUser.name }} 님의 자녀 정보
              </h5>
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary rounded-pill"
                @click="closeKidModal"
              >
                닫기
              </button>
            </div>

            <div v-if="kidModalUser.kids.length === 0" class="text-muted small">
              등록된 자녀 정보가 없습니다.
            </div>

            <div v-else class="d-flex flex-column gap-2">
              <div
                v-for="(k, idx) in kidModalUser.kids"
                :key="k.id || idx"
                class="border rounded-3 p-2"
              >
                <div class="fw-semibold mb-1">
                  {{ idx + 1 }}. {{ k.name || '(이름 없음)' }}
                </div>
                <div class="small text-muted">
                  나이: {{ k.age }}세 / 성별: {{ k.gender || '-' }}
                </div>
                <div class="small text-muted mt-1">
                  키: {{ k.heightCm ?? '-' }}cm /
                  몸무게: {{ k.weightKg ?? '-' }}kg /
                  혈액형: {{ k.bloodType || '-' }}
                </div>
                <div class="small text-muted mt-1">
                  알레르기: {{ k.allergy || '-' }}<br />
                  기저질환: {{ k.medicalHistory || '-' }}<br />
                  복용약: {{ k.medication || '-' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'

// ✅ Firebase Auth
// import { onAuthStateChanged, signOut } from 'firebase/auth'
// import { auth } from '@/firebase'

// ✅ Firestore
// import { db } from '@/firebase'
// import {
//   collection,
//   getDocs,
//   doc,
//   orderBy,
//   deleteDoc,
//   query,
//   where,
//   writeBatch
// } from 'firebase/firestore'

const router = useRouter()
const kidModalUser = ref(null)

const openKidModal = (user) => {
  kidModalUser.value = user
}

const closeKidModal = () => {
  kidModalUser.value = null
}

const goToAdminEmergencyEdit = (id) => {
  router.push(`/AdminEmergencyEdit/${id}`)
}
const deleteEmergency = async (item) => {
  const ok = confirm(`정말로 "${item.title}" 콘텐츠를 삭제하시겠습니까?`)
  if (!ok) return

  try {
    // await deleteDoc(doc(db, 'emergencyData', item.id))
    console.log("TODO: 백엔드 API로 콘텐츠 삭제", item.id)
    alert('콘텐츠가 삭제되었습니다.')
    await loadEmergencyList()
  } catch (e) {
    console.error('응급 교육 콘텐츠 삭제 실패:', e)
    alert('삭제 중 오류가 발생했습니다. ')
  }
}


const goToUserEdit = (uid) => {
  router.push(`/AdminUserEdit/${uid}`)
}
const goToEmergencyDetail = (id) => {
  router.push({ name: 'AdminEmergencyorder', params: { id } })
}


const deleteUser = async (user) => {
  const ok = confirm(`정말로 ${user.email} 사용자를 삭제하시겠습니까?\n(자녀 정보도 함께 삭제됩니다.)`)
  if (!ok) return

  try {
    // const batch = writeBatch(db)

    // const userRef = doc(db, 'users', user.uid)
    // batch.delete(userRef)

    // const kidQ = query(
    //   collection(db, 'kidinformation'),
    //   where('parentUid', '==', user.uid)
    // )
    // const kidSnap = await getDocs(kidQ)
    // kidSnap.forEach(d => {
    //   batch.delete(d.ref)
    // })

    // await batch.commit()
    console.log("TODO: 백엔드 API로 사용자와 자녀 정보 삭제", user.uid)
    alert('사용자와 자녀 정보가 삭제되었습니다.')
    await loadUsersWithKids()
  } catch (e) {
    console.error('사용자 삭제 실패:', e)
    alert('삭제 중 오류가 발생했습니다. ')
  }
}

// ----------------------
// 상단 탭 상태
// ----------------------
const activeTab = ref('manage') // 'manage' | 'automation' | 'feedback'

// ----------------------
// 크롤링 주기 설정
// ----------------------
const crawlingOptions = [5, 10, 15, 30, 60]
const crawlingInterval = ref(10)
const lastSavedCrawling = ref('')

function saveCrawlingInterval() {
  // TODO: Firestore나 서버에 설정값 저장
  lastSavedCrawling.value = new Date().toLocaleString('ko-KR')
  alert(`크롤링 주기가 ${crawlingInterval.value}분으로 저장되었습니다.`)
}

// ----------------------
// users + kidinformation
// ----------------------
const usersWithKids = ref([])

function calcAge(birthYear) {
  if (!birthYear) return '-'
  const year = new Date().getFullYear()
  return year - birthYear
}

async function loadUsersWithKids() {
  try {
    console.log("TODO: 백엔드 API로 사용자 및 자녀 정보 로드")
    usersWithKids.value = [];
  } catch (e) {
    console.error('users + kidinformation 조회 실패:', e)
  }
}
async function loadSuggestions() { //사용자가 작성한  건의사항 로딩하는 메소
  try {
    console.log("TODO: 백엔드 API로 건의사항 로드")
    emergencyFeedbacks.value = [];
  } catch (e) {
    console.error('suggestions 조회 실패:', e)
    alert('건의사항을 불러오는 중 오류가 발생했습니다.')
  }
}
// ----------------------
// emergencyData
// ----------------------
const emergencyList = ref([])

async function loadEmergencyList() {
  try {
    console.log("TODO: 백엔드 API로 응급처치 목록 로드")
    emergencyList.value = [];
  } catch (e) {
    console.error('emergencyData 로딩 실패:', e)
  }
}

// ----------------------
// 건의사항
// ----------------------
const feedbackTab = ref('app')

const appFeedbacks = ref([])

const emergencyFeedbacks = ref([])

// ----------------------
// 자동화 실행 + 로그 (FastAPI SSE)
// ----------------------
const AUTOMATION_BASE_URL =
  'https://child119messageauto-251868777139.asia-northeast3.run.app'

  console.log('AUTOMATION_BASE_URL =>', AUTOMATION_BASE_URL)
const automationStatus = ref('idle') // 'idle' | 'running' | 'done' | 'error'
const automationJobId = ref(null)
const automationLogs = ref([])
let automationEventSource = null

const automationStatusText = computed(() => {
  switch (automationStatus.value) {
    case 'running':
      return '실행 중'
    case 'done':
      return '완료'
    case 'error':
      return '오류'
    default:
      return '대기 중'
  }
})

const automationStatusBadgeClass = computed(() => {
  switch (automationStatus.value) {
    case 'running':
      return 'bg-warning-subtle text-warning'
    case 'done':
      return 'bg-success-subtle text-success'
    case 'error':
      return 'bg-danger-subtle text-danger'
    default:
      return 'bg-secondary-subtle text-muted'
  }
})

function clearAutomationLogs() {
  automationLogs.value = []
}

async function startAutomation() {
  if (automationStatus.value === 'running') return

  automationLogs.value = []
  automationStatus.value = 'running'
  automationJobId.value = null

  if (automationEventSource) {
    automationEventSource.close()
    automationEventSource = null
  }

  try {
    const res = await fetch(`${AUTOMATION_BASE_URL}/run`, {
      method: 'POST'
    })
    if (!res.ok) {
      throw new Error(`실행 요청 실패 (status: ${res.status})`)
    }
    const data = await res.json()
    automationJobId.value = data.jobId
    connectAutomationLogStream()
  } catch (e) {
    console.error('자동화 실행 요청 실패:', e)
    automationStatus.value = 'error'
    automationLogs.value.push(`❌ 실행 요청 실패: ${e.message}`)
  }
}

function connectAutomationLogStream() {
  if (!automationJobId.value) return

  if (automationEventSource) {
    automationEventSource.close()
  }

  automationEventSource = new EventSource(
    `${AUTOMATION_BASE_URL}/logs/${automationJobId.value}`
  )

  automationEventSource.onmessage = (event) => {
    automationLogs.value.push(event.data + '\n')
  }

  automationEventSource.onerror = () => {
    // 서버가 닫히면 여기로 한 번 들어온 뒤 연결 종료
    if (automationEventSource) {
      automationEventSource.close()
      automationEventSource = null
    }
    if (automationStatus.value === 'running') {
      // 상태를 강제로 완료로 전환 (서버 쪽에서 done 처리 후 스트림 종료했다고 가정)
      automationStatus.value = 'done'
    }
  }
}

onBeforeUnmount(() => {
  if (automationEventSource) {
    automationEventSource.close()
  }
})

// ----------------------
// 공통 함수
// ----------------------
function goToAdminEmergency() {
  router.push('/AdminEmergency')
}
function goToSuggestionDetail(suggestionId) { //상세 페이지로 가는 메소드 라우트 설정 했습니다
  router.push(`/AdminEmergencysuggestionsdetail/${suggestionId}`)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(() => {
  loadUsersWithKids()
  loadEmergencyList()
  loadSuggestions()
})
</script>

<style scoped>
.admin-layout {
  padding-top: 72px;
}

.admin-main {
  padding-top: 1.5rem;
  padding-bottom: 2.5rem;
}

/* 메인 영역: 사이드바 너비만큼 밀기, 좌우 여백 제거 */
.admin-main {
  margin-left: 240px; /* 사이드바 width와 일치해야 함 */
  padding-top: 1.5rem;
  padding-bottom: 2.5rem;
  padding-left: 0;  /* 왼쪽 여백 없는 상태로 시작 */
  padding-right: 0; /* 오른쪽 여백 없음 (필요하면 수정) */
  min-height: 100vh;
  background-color: transparent;
}

.admin-layout {
  padding-top: 0; /* 필요 시 헤더 높이에 맞춰 조정 */
}

/* 자동화 로그 박스 */
.automation-log-box {
  background-color: #111;
  color: #e9ecef;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  height: 260px;
  overflow-y: auto;
  border: 1px solid #343a40;
}

/* 사용자 증감 그래프 스타일은 삭제함 (stats 탭 제거) */

/* 배지 subtle 색상 */
.bg-success-subtle {
  background-color: #d1e7dd !important;
}
.bg-warning-subtle {
  background-color: #fff3cd !important;
}
.bg-secondary-subtle {
  background-color: #e2e3e5 !important;
}
.bg-danger-subtle {
  background-color: #f8d7da !important;
}

/* 자녀 모달 */
.kid-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.kid-modal {
  max-width: 480px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}
</style>
