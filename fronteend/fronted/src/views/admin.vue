<template>
  <div class="container py-5" style="padding-top: calc(var(--header-h, 56px) + 30px) !important;">
    <h1 class="h3 fw-bold mb-4">응급처치 데이터 관리</h1>
    
    <!-- 추가 폼 -->
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h2 class="h5 mb-0">새 데이터 추가</h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="addData">
          <div class="mb-3">
            <label class="form-label">제목</label>
            <input v-model="newData.title" type="text" class="form-control" placeholder="제목을 입력하세요" required />
          </div>
          
          <div class="mb-3">
            <label class="form-label">날짜</label>
            <input v-model="newData.date" type="text" class="form-control" placeholder="2025.06.20" required />
          </div>
          
          <div class="mb-3">
            <label class="form-label">유튜브 URL</label>
            <input v-model="newData.videoUrl" type="url" class="form-control" placeholder="https://www.youtube.com/watch?v=xxxxx" required />
          </div>
          
          <div class="mb-3">
            <label class="form-label">설명</label>
            <textarea v-model="newData.description" class="form-control" rows="4" placeholder="응급처치 설명을 입력하세요" required></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary">추가</button>
        </form>
      </div>
    </div>
    
    <!-- 데이터 목록 -->
    <h2 class="h5 fw-bold mb-3">등록된 데이터 ({{ items.length }}건)</h2>
    
    <div class="row g-3">
      <div v-for="item in items" :key="item.id" class="col-12">
        <div class="card">
          <div class="card-body">
            
            <!-- 보기 모드 -->
            <div v-if="editingId !== item.id">
              <h3 class="h6 fw-bold">{{ item.title }}</h3>
              <p class="text-muted small mb-2">{{ item.date }} | 조회수: {{ item.views }}</p>
              <p class="small text-truncate mb-2">{{ item.videoUrl }}</p>
              <p class="small mb-3">{{ item.description.substring(0, 100) }}...</p>
              
              <div class="btn-group btn-group-sm">
                <button @click="startEdit(item)" class="btn btn-outline-warning">수정</button>
                <button @click="deleteData(item.id)" class="btn btn-outline-danger">삭제</button>
              </div>
            </div>
            
            <!-- 수정 모드 -->
            <div v-else>
              <div class="mb-2">
                <input v-model="editData.title" class="form-control form-control-sm mb-2" placeholder="제목" />
              </div>
              <div class="mb-2">
                <input v-model="editData.date" class="form-control form-control-sm mb-2" placeholder="날짜" />
              </div>
              <div class="mb-2">
                <input v-model="editData.videoUrl" class="form-control form-control-sm mb-2" placeholder="유튜브 URL" />
              </div>
              <div class="mb-2">
                <textarea v-model="editData.description" class="form-control form-control-sm mb-2" rows="3" placeholder="설명"></textarea>
              </div>
              
              <div class="btn-group btn-group-sm">
                <button @click="saveEdit(item.id)" class="btn btn-success">저장</button>
                <button @click="cancelEdit" class="btn btn-secondary">취소</button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase/index.js'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore'

const items = ref([])
const newData = ref({
  title: '',
  date: '',
  videoUrl: '',
  description: '',
  views: 0
})

const editingId = ref(null)
const editData = ref({})

async function loadData() {
  const q = query(collection(db, 'emergencyData'), orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  items.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

async function addData() {
  try {
    await addDoc(collection(db, 'emergencyData'), {
      ...newData.value,
      createdAt: new Date().toISOString()
    })
    alert('추가되었습니다.')
    newData.value = { title: '', date: '', videoUrl: '', description: '', views: 0 }
    loadData()
  } catch (error) {
    console.error('추가 실패:', error)
    alert('추가 실패')
  }
}

function startEdit(item) {
  editingId.value = item.id
  editData.value = { ...item }
}

async function saveEdit(id) {
  try {
    await updateDoc(doc(db, 'emergencyData', id), editData.value)
    alert('수정되었습니다.')
    editingId.value = null
    loadData()
  } catch (error) {
    console.error('수정 실패:', error)
    alert('수정 실패')
  }
}

function cancelEdit() {
  editingId.value = null
  editData.value = {}
}

async function deleteData(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return
  
  try {
    await deleteDoc(doc(db, 'emergencyData', id))
    alert('삭제되었습니다.')
    loadData()
  } catch (error) {
    console.error('삭제 실패:', error)
    alert('삭제 실패')
  }
}

onMounted(() => {
  loadData()
})
</script>