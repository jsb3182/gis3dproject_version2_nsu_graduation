<template>
  <div class="edu-page container-fluid px-3 py-3">
    <!-- 상단 탭 -->
    <div class="d-flex justify-content-center mb-3" v-if="isAdmin">
      <div></div>
      <button type="button" class="btn btn-success rounded-pill px-3 text-bold" @click="goToWrite">
        + 게시물 추가
      </button>
    </div>

    <!-- 검색 영역 -->
    <div class="mb-3"
          style="background-color: whitesmoke; border-radius: 10px;">
      <div class="input-group rounded-3 px-2">
        <input type="text" class="form-control border-0 p-2 text-plight " style="background-color: whitesmoke;"  v-model="keyword" />
        <span class="input-group-text bg-transparent border-0 p-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="#000" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"/>
          </svg>
        </span>
      </div>
    </div>

    <!-- 전체 개수 -->
    <p class="text-muted small mb-3 text-plight">
      전체 {{ filteredItems.length }}건이 등록되어 있습니다.
    </p>

    <!-- 목록 -->
    <div v-for="item in filteredItems" :key="item.id"
      class="edu-item border-top d-flex justify-content-between align-items-center">
      <div class="py-3 flex-grow-1" @click="goToDetail(item.id)" style="cursor: pointer;">
        <div class="text-bold edu-title">
          {{ item.title }}
        </div>
        <div class="text-muted small mt-2 text-plight">
          {{ formatDate(item.createdAt) }}
          <span class="mx-2">|</span>
          조회수 {{ item.viewCount || 0 }}
        </div>
      </div>

      <!-- ✅ 수정/삭제 버튼 -->
      <div class="ms-3 d-flex gap-2" v-if="isAdmin">
        <button type="button" class="btn btn-outline-secondary btn-sm rounded-pill" @click.stop="goToEdit(item.id)">
          수정
        </button>
        <button type="button" class="btn btn-outline-danger btn-sm rounded-pill" @click.stop="handleDelete(item.id)">
          삭제
        </button>
      </div>
    </div>
    <!-- 건의사항 버튼 (오른쪽 아래 고정) 바텀이랑 조정 width 조정했습니다 -->
    <button class="btn btn-primary rounded position-fixed text-medium"
      style="bottom: 100px; right: 20px; width: 150px; height: 56px; z-index: 100;" @click="goToSuggestions">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="#fff" d="M21 12.13c-.15.01-.29.06-.39.17l-1 1l2.05 2l1-1c.22-.21.22-.56 0-.77l-1.24-1.23a.56.56 0 0 0-.38-.17m-2 1.75L13 19.94V22h2.06l6.06-6.07M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7v-.89l8.24-8.22c.47-.49 1.12-.76 1.8-.76c.34 0 .68.06 1 .19V6c0-1.12-.92-2-2.04-2m0 4l-8 5l-8-5V6l8 5l8-5"/>
      </svg> 건의사항 추가
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// --------------------------------------------
// ✅ 기본 설정
// --------------------------------------------
const router = useRouter()
const keyword = ref('')
const items = ref([])
const loading = ref(true)
const isAdmin = ref(false) // 사용자 확인 변수
const currentUserUid = ref(null) //현제 uid 사용자 저장 변
// --------------------------------------------
// ✅ 페이지 이동 함수
// --------------------------------------------
const goToEdit = (id) => {
  router.push(`/AdminEmergencyEdit/${id}`)
}

const goToWrite = () => {
  router.push('/emergencyWrite')
}
//조회수 증가 함수 추가
const goToDetail = async (id) => {
  try{
    //조회수 증가
    await incrementViews(id)
  }catch (e) {
    console.error('조회수 증가 실패:', e)
  }
  //상세 페이지 이동
  router.push({name: 'emergencyorder', params: {id}})
}

const goToSuggestions = () =>{
  router.push('/emergencysuggestions') // 누르면 ㅣ동하는 메소드 건의사항 페이지로 이동합니다
}

// --------------------------------------------
// ✅ Firestore에서 데이터 불러오기
// --------------------------------------------
async function loadData() {
  try {
    const q = query(collection(db, 'emergencyData'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    items.value = snapshot.docs.map(doc => { //파이어베이스 헤시태그 추가
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || '(제목 없음)',
        viewCount: data.viewCount || 0,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        hashtags: data.hashtags || [],
      }
    })
  } catch (e) {
    console.error('데이터 불러오기 실패:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => { // 사용자 권환 확인 
  loadData()
  checkAdminStatus()
})
async function checkAdminStatus() { // 사용자 귄함 확인 매소
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserUid.value = user.uid

      // Firestore users 컬렉션에서 사용자 정보 가져오기
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const username = userData.username || ''

        // username에 'admin'이 포함되어 있는지 확인
        isAdmin.value = username.toLowerCase().includes('admin')
      }
    } else {
      isAdmin.value = false
      currentUserUid.value = null
    }
  })
}

// --------------------------------------------
// ✅ 삭제 기능
// --------------------------------------------
async function handleDelete(id) {
  const confirmDelete = confirm('정말로 이 게시물을 삭제하시겠습니까?')
  if (!confirmDelete) return

  try {
    await deleteDoc(doc(db, 'emergencyData', id))
    alert('게시물이 삭제되었습니다.')
    await loadData() // 목록 갱신
  } catch (e) {
    console.error('삭제 실패:', e)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// --------------------------------------------
// ✅ 검색 필터
// --------------------------------------------
const filteredItems = computed(() => {
  if (!keyword.value.trim()) return items.value // 검색어 없으면 전체 반환
  const q = keyword.value.trim().toLowerCase() // 검색어 소문자 변환
  
  return items.value.filter(v => {
    // 제목에서 검색
    const titleMatch = v.title.toLowerCase().includes(q)
    
    // 해시태그에서 검색
    const hashtagMatch = v.hashtags && v.hashtags.some(tag => 
      tag.toLowerCase().includes(q)
    )
    
    // 제목 또는 해시태그에 포함되면 true
    return titleMatch || hashtagMatch
  })
})
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


.edu-item:last-child {
  border-bottom: 1px solid #e9ecef;
}

.edu-title {
  font-size: 17px;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
