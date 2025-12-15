<template>
  <div class="admin-layout bg-light min-vh-100">
    <!-- 고정 헤더 -->
    <header class="navbar navbar-light bg-white shadow-sm fixed-top">
      <div class="container d-flex align-items-center justify-content-between">
        <!-- 좌측: 로고 + 홈 버튼 -->
        <div class="d-flex align-items-center">
          <button @click="goToHome" class="btn btn-link p-0 border-0">
            <img src="@/assets/kid_logo.png" alt="logo" class="me-2"
              style="width:50px;height:50px;vertical-align:middle;" />
          </button>
          <span class="fw-bold fs-5 text-dark">아이119 관리자</span>
        </div>

        <!-- 우측: 로그인/로그아웃 버튼 -->
        <button @click="logAction" class="btn text-bold"
          :class="{ 'btn-light': status === '로그아웃', 'btn-primary': status === '로그인' }">
          <span>{{ status }}</span>
        </button>
      </div>
    </header>

    <!-- 메인 영역 -->
    <main class="admin-main container">
      <!-- 상단 타이틀 & 설명 -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3">
        <div>
          <h3 class="fw-bold mb-1">관리자 대시보드</h3>
          <p class="text-muted mb-0 small">
            아이119 앱의 크롤링 설정, 사용자/콘텐츠 데이터, 통계, 건의사항을 한 곳에서 관리합니다.
          </p>
        </div>
      </div>

      <!-- 상단 탭 -->
      <ul class="nav nav-pills nav-fill admin-tabs mb-4">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'manage' }" @click="activeTab = 'manage'">
            관리
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'stats' }" @click="activeTab = 'stats'">
            사용자 통계
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'feedback' }" @click="activeTab = 'feedback'">
            건의사항
          </button>
        </li>
      </ul>

      <!-- ░░░ 관리 탭 ░░░ -->
      <section v-if="activeTab === 'manage'" class="d-flex flex-column gap-3">
        <!-- 크롤링 주기 설정 -->
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="fw-semibold mb-0">크롤링 주기 설정</h5>
            </div>
            <p class="small text-muted">
              외부 데이터(예: 응급 관련 뉴스, 콘텐츠)를 가져오는 크롤러의 실행 주기를 설정합니다.
            </p>

            <div class="d-flex flex-wrap align-items-center gap-3">
              <div class="d-flex flex-wrap gap-2">
                <button v-for="m in crawlingOptions" :key="m" type="button" class="btn btn-sm rounded-pill"
                  :class="crawlingInterval === m ? 'btn-primary' : 'btn-outline-primary'" @click="crawlingInterval = m">
                  {{ m }}분
                </button>
              </div>
              <div class="ms-auto">
                <button type="button" class="btn btn-success btn-sm rounded-pill" @click="saveCrawlingInterval">
                  저장
                </button>
              </div>
            </div>

            <p class="small text-muted mt-2 mb-0">
              현재 설정된 주기: <strong>{{ crawlingInterval }}분</strong>
              <span v-if="lastSavedCrawling" class="text-secondary">
                (마지막 저장: {{ lastSavedCrawling }})
              </span>
            </p>
          </div>
        </div>

        <!-- users + kidinformation 정보 -->
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-semibold mb-0">사용자 정보 (users + kidinformation)</h5>
              <span class="badge bg-secondary-subtle text-dark small">
                총 {{ usersWithKids.length }}명
              </span>
            </div>

            <div class="table-responsive">
              <thead class="table-light">
                <tr>
                  <th style="width: 6%;">No</th>
                  <th style="width: 22%;">이메일</th>
                  <th style="width: 16%;">이름</th>
                  <th style="width: 10%;">자녀 수</th>
                  <th>자녀 정보</th>
                  <th style="width: 10%;">관리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(u, idx) in usersWithKids" :key="u.uid">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.name }}</td>
                  <td>{{ u.kids.length }}</td>
                  <td>
                    <div class="small">
                      <div v-for="(k, kIdx) in u.kids" :key="k.id" class="text-muted">
                        • {{ k.name }} ({{ k.age }}세, {{ k.gender }})
                      </div>
                      <div v-if="u.kids.length === 0" class="text-muted">
                        등록된 자녀 정보 없음
                      </div>
                    </div>
                  </td>
                  <td>
                    <button type="button" class="btn btn-outline-primary btn-sm rounded-pill"
                      @click="goToUserEdit(u.uid)">
                      수정
                    </button>
                  </td>
                </tr>
              </tbody>

            </div>

            <p class="small text-muted mt-2 mb-0">
              ※ 실제 구현 시, Firestore의 <code>users</code> 컬렉션과
              <code>kidinformation</code> 컬렉션을 join해서 가져오면 됩니다.
            </p>
          </div>
        </div>

        <!-- emergencyData 테이블 정보 -->
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-semibold mb-0">응급 교육 콘텐츠 (emergencyData)</h5>
              <button type="button" class="btn btn-outline-primary btn-sm rounded-pill" @click="goToEmergencyList">
                콘텐츠 관리 화면으로 이동
              </button>
            </div>

            <div class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th style="width: 8%;">No</th>
                    <th>제목</th>
                    <th style="width: 18%;">등록일</th>
                    <th style="width: 14%;">조회수</th>
                    <th style="width: 14%;">해시태그</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(c, idx) in emergencyList" :key="c.id">
                    <td>{{ idx + 1 }}</td>
                    <td class="text-truncate" style="max-width: 260px;">
                      {{ c.title }}
                    </td>
                    <td>{{ formatDate(c.createdAt) }}</td>
                    <td>{{ c.viewCount.toLocaleString() }}</td>
                    <td>
                      <div class="small text-muted">
                        <span v-for="(tag, tIdx) in c.hashtags" :key="tIdx"
                          class="badge bg-light text-secondary border me-1">
                          #{{ tag }}
                        </span>
                        <span v-if="!c.hashtags || c.hashtags.length === 0" class="text-muted">
                          -
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p class="small text-muted mt-2 mb-0">
              ※ 이 목록은 관리자용 요약입니다. 상세 편집은 별도의 응급 콘텐츠 관리 화면에서 진행하세요.
            </p>
          </div>
        </div>
      </section>

      <!-- ░░░ 사용자 통계 탭 ░░░ -->
      <section v-else-if="activeTab === 'stats'" class="d-flex flex-column gap-3">
        <div class="row g-3">
          <div class="col-md-3 col-6">
            <div class="card shadow-sm border-0 rounded-4 text-center py-3">
              <div class="small text-muted">총 가입자 수</div>
              <div class="fs-4 fw-bold mt-1">{{ stats.totalUsers.toLocaleString() }}</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="card shadow-sm border-0 rounded-4 text-center py-3">
              <div class="small text-muted">금일 접속자 수</div>
              <div class="fs-4 fw-bold mt-1">{{ stats.todayActive.toLocaleString() }}</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="card shadow-sm border-0 rounded-4 text-center py-3">
              <div class="small text-muted">총 콘텐츠 수</div>
              <div class="fs-4 fw-bold mt-1">{{ stats.totalContents.toLocaleString() }}</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="card shadow-sm border-0 rounded-4 text-center py-3">
              <div class="small text-muted">총 조회수</div>
              <div class="fs-4 fw-bold mt-1">{{ stats.totalViews.toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <!-- 사용자 증감 현황 그래프 (심플 막대 그래프) -->
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="fw-semibold mb-0">사용자 증감 현황</h5>
              <span class="small text-muted">최근 7일 기준</span>
            </div>

            <div class="user-chart-wrapper">
              <div class="user-chart">
                <div v-for="(d, idx) in userGrowth" :key="idx" class="user-chart-bar">
                  <div class="bar-inner" :style="{ height: (d.count / maxUserGrowth * 100) + '%' }"></div>
                  <span class="bar-label">{{ d.label }}</span>
                  <span class="bar-value">{{ d.count }}</span>
                </div>
              </div>
            </div>

            <p class="small text-muted mt-2 mb-0">
              ※ 실제 구현 시, Firestore / Analytics에서 일자별 가입/탈퇴 데이터를 가져와서 그래프에 바인딩하면 됩니다.
            </p>
          </div>
        </div>
      </section>

      <!-- ░░░ 건의사항 탭 ░░░ -->
      <section v-else-if="activeTab === 'feedback'" class="d-flex flex-column gap-3">
        <!-- 서브 탭 (앱 / 응급처치) -->
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-semibold mb-0">사용자 건의사항</h5>
            </div>

            <div class="btn-group mb-3">
              <button type="button" class="btn btn-sm"
                :class="feedbackTab === 'app' ? 'btn-primary' : 'btn-outline-primary'" @click="feedbackTab = 'app'">
                앱 건의사항
              </button>
              <button type="button" class="btn btn-sm"
                :class="feedbackTab === 'emergency' ? 'btn-primary' : 'btn-outline-primary'"
                @click="feedbackTab = 'emergency'">
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
                      <th>내용</th>
                      <th style="width: 18%;">작성자</th>
                      <th style="width: 18%;">작성일</th>
                      <th style="width: 12%;">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(f, idx) in appFeedbacks" :key="f.id">
                      <td>{{ idx + 1 }}</td>
                      <td class="text-truncate" style="max-width: 280px;">
                        {{ f.title }}
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
                      <th>관련 콘텐츠</th> <!--보여지는 상태 컬럼 추가하기 -->
                      <th>내용</th>
                      <th style="width: 18%;">작성자</th>
                      <th style="width: 18%;">작성일</th>
                    </tr>
                  </thead>
                  <tbody> <!-- 추가한 코드 행응 선택하면 건의 사항의 아이디에 따라서 페이지가 이동하고 그걸 파이어베이스에 전달하여 호춣-->
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

          </div>
        </div>
      </section>
    </main>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// ✅ Firebase Auth
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/firebase'

// ✅ Firestore
import { db } from '@/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

const router = useRouter()

// ----------------------
// 로그인 버튼 상태
// ----------------------
const status = ref('로그인') // 기본값

// 현재 로그인 상태를 Firebase Auth에서 감지
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      status.value = '로그아웃'
    } else {
      status.value = '로그인'
    }
  })
})

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push('/login')   // App.vue에서 쓰는 로그인 라우트와 동일하게
}

const goToUserEdit = (uid) => {
  router.push(`/AdminUserEdit/${uid}`)
}

// 로그아웃 처리
const logout = async () => {
  try {
    await signOut(auth)
    alert('로그아웃 되었습니다.')
  } catch (err) {
    console.error('로그아웃 중 오류 발생:', err)
    alert('로그아웃 중 오류가 발생했습니다.')
  }
}

// 버튼 클릭 시 동작
const logAction = () => {
  if (status.value === '로그인') {
    goToLogin()
  } else {
    logout()
  }
}

// 기존에 있던 나머지 관리자 로직들 (탭, 통계, usersWithKids, emergencyList 등)

// 상단 탭 상태
const activeTab = ref('manage') // 'manage' | 'stats' | 'feedback'

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


// users + kidinformation 
const usersWithKids = ref([])   // 초기에는 빈 배열

function calcAge(birthYear) {
  if (!birthYear) return '-'
  const year = new Date().getFullYear()
  return year - birthYear
}

async function loadUsersWithKids() {
  try {
    // 1) users 전체 가져오기
    const usersSnap = await getDocs(collection(db, 'users'))

    // 2) kidinformation 전체 가져오기
    const kidsSnap = await getDocs(collection(db, 'kidinformation'))

    // 3) parentUid 기준으로 kids를 그룹화
    const kidsByParent = {}
    kidsSnap.forEach(docSnap => {
      const data = docSnap.data()
      const parentUid = data.parentUid
      if (!parentUid) return

      if (!kidsByParent[parentUid]) {
        kidsByParent[parentUid] = []
      }

      kidsByParent[parentUid].push({
        id: docSnap.id,
        name: data.kid || '(이름 없음)',                  // ✅ 아이 이름
        age: calcAge(data.birthYear),                    // ✅ 출생년→나이
        gender: data.gender || '-',                      // "F" / "M"
        heightCm: data.heightCm ?? null,
        weightKg: data.weightKg ?? null,
        bloodType: data.bloodType || '',
        allergy: data.allergy || '',
        medicalHistory: data.medicalHistory || '',
        medication: data.medication || '',
        raw: data
      })
    })

    // 4) users에 kids 매핑해서 최종 배열 만들기
    usersWithKids.value = usersSnap.docs.map(docSnap => {
      const u = docSnap.data()
      const uid = docSnap.id

      return {
        uid,
        email: u.email || u.userEmail || '(이메일 없음)',
        name: u.username || u.name || '(이름 없음)',
        kids: kidsByParent[uid] || []
      }
    })
  } catch (e) {
    console.error('users + kidinformation 조회 실패:', e)
  }
}
// query(collection(db, 'suggestions'), orderBy('createdAt', 'desc')): Firebase의 suggestions 컬렉션에서 데이터를 최신순으로 가져옵니다
// snapshot.docs.map(): 각 문서를 JavaScript 객체로 변환합니다
// data.createdAt.toDate(): Firebase Timestamp를 JavaScript Date 객체로 변환합니다
// emergencyFeedbacks.value에 저장하면 자동으로 화면에 반영됩니다
async function loadSuggestions() { //사용자가 작성한  건의사항 로딩하는 메소
  try {
    // Firebase의 suggestions 컬렉션에서 데이터 가져오기
    // 최신 순으로 정렬 (createdAt 내림차순)
    const q = query(
      collection(db, 'suggestions'),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)

    // 가져온 데이터를 emergencyFeedbacks 배열에 저장
    emergencyFeedbacks.value = snapshot.docs.map(docSnap => {
      const data = docSnap.data()
      return {
        id: docSnap.id, // 문서 ID
        emergencyTitle: data.title || '(제목 없음)', // 건의사항 제목
        content: data.content || '(내용 없음)', // 건의사항 내용
        writer: data.fromEmail || '(작성자 없음)', // 작성자 이메일
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), // 작성일
        status: data.status || '접수', // 상태
        adminMemo: data.adminMemo || '', // 관리자 메모
        targetRole: data.targetRole || '', // 대상 역할
        fromUid: data.fromUid || '' // 작성자 UID
      }
    })

    console.log('건의사항 로딩 완료:', emergencyFeedbacks.value.length + '건')
  } catch (e) {
    console.error('suggestions 조회 실패:', e)
    alert('건의사항을 불러오는 중 오류가 발생했습니다.')
  }
}

// ----------------------
// emergencyData (더미 데이터)
// ----------------------
const emergencyList = ref([
  {
    id: 'e1',
    title: '고열 시 응급처치',
    createdAt: new Date(),
    viewCount: 120,
    hashtags: ['열', '사람감기']
  },
  {
    id: 'e2',
    title: '화상 응급처치 기본',
    createdAt: new Date(),
    viewCount: 250,
    hashtags: ['화상', '응급처치']
  },
  {
    id: 'e3',
    title: '기도 막힘 대처법',
    createdAt: new Date(),
    viewCount: 80,
    hashtags: ['기도막힘', '소아응급']
  }
])

// ----------------------
// 사용자 통계 (더미 데이터)
// ----------------------
const stats = ref({
  totalUsers: 1234,
  todayActive: 87,
  totalContents: 25,
  totalViews: 9876
})

const userGrowth = ref([
  { label: '03-01', count: 3 },
  { label: '03-02', count: 5 },
  { label: '03-03', count: 2 },
  { label: '03-04', count: 7 },
  { label: '03-05', count: 4 },
  { label: '03-06', count: 6 },
  { label: '03-07', count: 5 }
])

const maxUserGrowth = computed(() =>
  Math.max(...userGrowth.value.map(d => d.count), 1)
)

// ----------------------
// 건의사항 (앱 / 응급처치 화면)
// ----------------------
const feedbackTab = ref('app') // 'app' | 'emergency'

const appFeedbacks = ref([
  {
    id: 'f1',
    title: '야간 모드가 있으면 좋겠습니다.',
    writer: 'user01@naver.com',
    createdAt: new Date(),
    status: '접수'
  },
  {
    id: 'f2',
    title: '메인 화면에 자주 쓰는 메뉴를 고정하고 싶어요.',
    writer: 'user02@gmail.com',
    createdAt: new Date(),
    status: '처리완료'
  }
])
// 응급처치 화면 건의사항: Firebase에서 실시간으로 가져옵니다
const emergencyFeedbacks = ref([])


// ----------------------
// 공통 함수
// ----------------------
function goToHome() {
  router.push('/') // 필요에 따라 관리자 홈 라우트로 수정
}
function goToSuggestionDetail(suggestionId) { //상세 페이지로 가는 메소드 라우트 설정 했습니다
  router.push(`/emergencysuggestionsdetail/${suggestionId}`)
}

function goToEmergencyList() {
  // 이미 구현해둔 응급교육 리스트 라우트로 이동
  router.push('/emergencyList') // 실제 라우트명에 맞게 수정
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
  // 다른 초기 로딩 함수들 있으면 같이 호출
  loadSuggestions() //건의사항 불러오기
})
</script>


<style scoped>
.admin-layout {
  padding-top: 72px;
  /* fixed-top 헤더 높이만큼 여백 */
}

.admin-main {
  padding-top: 1.5rem;
  padding-bottom: 2.5rem;
}

/* 상단 탭 */
.admin-tabs .nav-link {
  border-radius: 999px;
  font-weight: 600;
  color: #555;
}

.admin-tabs .nav-link.active {
  background-color: #0d6efd;
  color: #fff;
}

/* 사용자 증감 그래프 (심플 CSS 막대 그래프) */
.user-chart-wrapper {
  width: 100%;
  overflow-x: auto;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.user-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 160px;
  padding: 0 4px;
}

.user-chart-bar {
  flex: 1 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  font-size: 11px;
}

.user-chart-bar .bar-inner {
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, #0d6efd, #6ea8fe);
  transition: height 0.2s ease-out;
}

.user-chart-bar .bar-label {
  margin-top: 4px;
  color: #666;
}

.user-chart-bar .bar-value {
  margin-top: 2px;
  color: #333;
  font-weight: 600;
}

/* 배지 subtle 색상 (Bootstrap 5.3 없을 경우 대비) */
.bg-success-subtle {
  background-color: #d1e7dd !important;
}

.bg-warning-subtle {
  background-color: #fff3cd !important;
}

.bg-secondary-subtle {
  background-color: #e2e3e5 !important;
}
</style>
