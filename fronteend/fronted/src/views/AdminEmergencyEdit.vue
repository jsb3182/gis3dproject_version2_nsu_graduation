<template>
  <!-- ✅ 다른 관리자 화면과 폭/레이아웃 통일 -->
  <div class="card shadow-sm border-0 rounded-4">
    <main class="admin-main">
      <div class="container-fluid py-4 px-3">

        <!-- 상단 헤더 -->
        <div class="d-flex align-items-center mb-3 gap-2">
          <button class="btn btn-link p-0 text-dark" @click="goBack">
            <i class="bi bi-arrow-left fs-5"></i>
          </button>
          <h5 class="mb-0 text-bold">
            응급 교육 콘텐츠 수정
          </h5>
        </div>

        <!-- 폼 시작 -->
        <form @submit.prevent="handleSubmit">
          <!-- 기본 정보 카드 -->
          <div class="card border-0 shadow-sm rounded-4 mb-3">
            <div class="card-body p-3 p-md-4">
              <!-- 제목 -->
              <div class="mb-3 text-medium">
                <label class="form-label text-bold">제목</label>
                <input
                  type="text"
                  class="form-control text-muted"
                  v-model="form.title"
                  placeholder="예) 고열, 화상 시 응급처치"
                  required
                />
              </div>

              <!-- 해시태그 -->
              <div class="mb-3 text-medium">
                <label class="form-label text-bold">해시태그</label>

                <div class="d-flex flex-wrap gap-2 mb-2">
                  <span
                    v-for="(tag, idx) in form.hashtags"
                    :key="idx"
                    class="badge bg-danger-subtle text-danger text-bold px-3 py-2 rounded-pill d-flex align-items-center gap-1"
                  >
                    #{{ tag }}
                    <i
                      class="bi bi-x-lg small"
                      style="cursor:pointer;"
                      @click="removeTag(idx)"
                    ></i>
                  </span>
                </div>

                <div class="input-group input-group-sm text-medium">
                  <span class="input-group-text bg-body-secondary border-0">#</span>
                  <input
                    type="text"
                    class="form-control"
                    v-model="newTag"
                    placeholder="태그를 입력 후 + 버튼 클릭"
                    @keyup.enter="addTag"
                  />
                  <button type="button" class="btn btn-outline-danger" @click="addTag">
                    +
                  </button>
                </div>
                <div class="form-text text-plight">예: #열 #감기 #소아응급 등</div>
              </div>

              <!-- 유튜브 URL -->
              <div class="mb-3 text-medium">
                <label class="form-label text-bold">유튜브 URL</label>
                <input
                  type="url"
                  class="form-control"
                  v-model="form.url"
                  placeholder="https://youtu.be/..."
                  required
                />
                <div class="form-text text-plight">
                  유튜브 링크를 입력하면 자동으로 썸네일을 가져옵니다.
                </div>
              </div>

              <!-- 썸네일 미리보기 -->
              <div v-if="thumbnail" class="mt-3">
                <label class="form-label text-bold d-block">썸네일 미리보기</label>
                <div class="rounded-4 overflow-hidden" style="max-height: 220px;">
                  <img :src="thumbnail" alt="thumbnail preview" class="w-100 object-fit-cover" />
                </div>
              </div>
            </div>
          </div>

          <!-- 증상 -->
          <div class="card border-0 shadow-sm rounded-4 mb-3">
            <div class="card-body p-3 p-md-4 text-plight">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="text-danger text-bold mb-0">증상</h6>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger rounded-pill"
                  @click="addItem('symptomList')"
                >
                  + 항목 추가
                </button>
              </div>

              <div class="d-flex flex-column gap-2">
                <div
                  v-for="(s, idx) in form.symptomList"
                  :key="`symptom-${idx}`"
                  class="input-group input-group-sm"
                >
                  <span class="input-group-text bg-body-secondary border-0">
                    {{ idx + 1 }}
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.symptomList[idx]"
                    placeholder="증상 내용을 입력하세요"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="removeItem('symptomList', idx)"
                    v-if="form.symptomList.length > 1"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 응급처치 -->
          <div class="card border-0 shadow-sm rounded-4 mb-3">
            <div class="card-body p-3 p-md-4 text-plight">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="text-danger text-bold mb-0">응급처치</h6>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger rounded-pill"
                  @click="addItem('methodList')"
                >
                  + 항목 추가
                </button>
              </div>

              <div class="d-flex flex-column gap-2">
                <div
                  v-for="(m, idx) in form.methodList"
                  :key="`method-${idx}`"
                  class="input-group input-group-sm"
                >
                  <span class="input-group-text bg-body-secondary border-0">
                    {{ idx + 1 }}
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.methodList[idx]"
                    placeholder="응급처치 내용을 입력하세요"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="removeItem('methodList', idx)"
                    v-if="form.methodList.length > 1"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 원인 -->
          <div class="card border-0 shadow-sm rounded-4 mb-3">
            <div class="card-body p-3 p-md-4 text-plight">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="text-danger text-bold mb-0">원인</h6>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger rounded-pill"
                  @click="addItem('reasonList')"
                >
                  + 항목 추가
                </button>
              </div>

              <div class="d-flex flex-column gap-2">
                <div
                  v-for="(r, idx) in form.reasonList"
                  :key="`reason-${idx}`"
                  class="input-group input-group-sm"
                >
                  <span class="input-group-text bg-body-secondary border-0">
                    {{ idx + 1 }}
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.reasonList[idx]"
                    placeholder="원인을 입력하세요"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="removeItem('reasonList', idx)"
                    v-if="form.reasonList.length > 1"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 주의 문구 -->
          <div class="card border-0 shadow-sm rounded-4 mb-4">
            <div class="card-body p-3 p-md-4 text-plight">
              <h6 class="text-danger text-bold mb-2">주의 문구</h6>
              <textarea
                class="form-control"
                rows="3"
                v-model="form.warning"
                placeholder="예) 이 내용은 안내용입니다. 증상이 심하거나 아이의 경우 반드시 의료진의 진료를 받으세요."
              ></textarea>
            </div>
          </div>

          <!-- 하단 버튼 -->
          <div
            class="position-sticky bottom-0 pt-2 pb-3 text-medium"
            style="z-index: 1; margin-bottom: var(--footer-h, 70px);"
          >
            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-outline-secondary flex-fill rounded-pill"
                @click="goBack"
              >
                취소
              </button>
              <button
                type="submit"
                class="btn btn-danger flex-fill rounded-pill"
              >
                수정하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
// 그대로 사용 (변경 없음)
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db } from '@/firebase'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

const router = useRouter()
const route = useRoute()
const docId = route.params.id

const form = reactive({
  title: '',
  url: '',
  hashtags: [],
  symptomList: [''],
  methodList: [''],
  reasonList: [''],
  warning: ''
})

const newTag = ref('')
const isSubmitting = ref(false)

onMounted(async () => {
  try {
    const refDoc = doc(db, 'emergencyData', docId)
    const snap = await getDoc(refDoc)

    if (!snap.exists()) {
      alert('해당 문서를 찾을 수 없습니다.')
      router.back()
      return
    }

    const data = snap.data()

    form.title = data.title || ''
    form.url = data.youtubeUrl || data.url || ''
    form.hashtags = Array.isArray(data.hashtags) ? data.hashtags : []
    form.symptomList =
      Array.isArray(data.symptomList) && data.symptomList.length ? data.symptomList : ['']
    form.methodList =
      Array.isArray(data.methodList) && data.methodList.length ? data.methodList : ['']
    form.reasonList =
      Array.isArray(data.reasonList) && data.reasonList.length ? data.reasonList : ['']
    form.warning = data.warning || ''
  } catch (e) {
    console.error('문서 불러오기 실패:', e)
    alert('데이터를 불러오는 중 오류가 발생했습니다.')
    router.back()
  }
})

function extractYoutubeId(url) {
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
  const match = url.match(regex)
  return match ? match[1] : ''
}

const thumbnail = computed(() => getYoutubeThumbnail(form.url))

function getYoutubeThumbnail(url) {
  const id = extractYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : ''
}

function addItem(key) {
  form[key].push('')
}

function removeItem(key, index) {
  form[key].splice(index, 1)
}

function goBack() {
  router.back()
}

async function handleSubmit() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const youtubeId = extractYoutubeId(form.url)
    if (!youtubeId) {
      alert('올바른 유튜브 URL을 입력해주세요.')
      isSubmitting.value = false
      return
    }

    const thumbnailUrl = getYoutubeThumbnail(form.url)

    const refDoc = doc(db, 'emergencyData', docId)

    await updateDoc(refDoc, {
      title: form.title,
      youtubeUrl: form.url,
      youtubeId,
      thumbnailUrl,
      hashtags: form.hashtags,
      symptomList: form.symptomList,
      methodList: form.methodList,
      reasonList: form.reasonList,
      warning: form.warning,
      updatedAt: serverTimestamp()
    })

    alert('응급 교육 콘텐츠가 수정되었습니다.')
    router.push('/AdminEmergency')
  } catch (e) {
    console.error('응급 교육 콘텐츠 수정 실패:', e)
    alert('수정 중 오류가 발생했습니다. 콘솔을 확인해주세요.')
  } finally {
    isSubmitting.value = false
  }
}

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !form.hashtags.includes(tag)) {
    form.hashtags.push(tag)
  }
  newTag.value = ''
}

function removeTag(index) {
  form.hashtags.splice(index, 1)
}
</script>

<style scoped>
.object-fit-cover {
  object-fit: cover;
}

.badge.bg-danger-subtle {
  background-color: #fdecea !important;
}

/* ✅ 관리자 메인 레이아웃: 다른 관리자 화면과 동일하게 폭/위치 통일 */
.admin-main {
  margin-left: 240px;      /* 사이드바 너비와 동일 */
  padding-top: 1.5rem;
  padding-bottom: 2.5rem;
  padding-left: 0;
  padding-right: 0;
  min-height: 100vh;
  background-color: transparent;
}
</style>
