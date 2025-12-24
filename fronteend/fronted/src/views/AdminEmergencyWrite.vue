<template>
  <!-- ✅ 관리자 레이아웃 카드로 감싸기 -->
  <div class="card shadow-sm border-0 rounded-4">
    <main class="admin-main">
      <div class="container-fluid py-4 px-3">

        <!-- 상단 헤더 -->
        <div class="d-flex align-items-center mb-3 gap-2">
          <button class="btn btn-link p-0 text-dark" @click="goBack">
            <i class="bi bi-arrow-left fs-5"></i>
          </button>
          <h5 class="mb-0 text-bold">
            응급 교육 콘텐츠 등록
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
                  class="form-control"
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
                    class="badge bg-danger-subtle text-danger fw-semibold px-3 py-2 rounded-pill d-flex align-items-center gap-1"
                  >
                    #{{ tag }}
                    <i
                      class="bi bi-x-lg small"
                      style="cursor:pointer;"
                      @click="removeTag(idx)"
                    ></i>
                  </span>
                </div>

                <div class="input-group input-group-sm">
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
                <label class="form-label fw-semibold d-block">썸네일 미리보기</label>
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
            class="position-sticky bottom-0 pt-2 pb-3"
            style="z-index: 1; margin-bottom: var(--footer-h, 70px);"
          >
            <div class="d-flex gap-2 text-bold">
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
                저장하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
// import { db } from '@/firebase'
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const router = useRouter()

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

// 유튜브 썸네일
const thumbnail = computed(() => getYoutubeThumbnail(form.url))

function getYoutubeThumbnail(url) {
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
  const match = url.match(regex)
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : ''
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
  try {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
    const match = form.url.match(regex)
    const youtubeId = match ? match[1] : null

    if (!youtubeId) {
      alert('유효한 유튜브 URL을 입력해주세요.')
      return
    }

    const payload = {
      title: form.title,
      youtubeUrl: form.url,
      youtubeId,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      hashtags: form.hashtags,
      symptomList: form.symptomList,
      methodList: form.methodList,
      reasonList: form.reasonList,
      warning: form.warning,
      viewCount: 0,
      // createdAt: serverTimestamp(),
      // updatedAt: serverTimestamp(),
    }

    // await addDoc(collection(db, 'emergencyData'), payload)
    console.log("TODO: 백엔드 API로 콘텐츠 등록", payload)

    alert('응급 교육 콘텐츠가 등록되었습니다.')
    router.push('/AdminEmergency')
  } catch (error) {
    console.error('저장 중 오류 발생:', error)
    alert('저장 실패: 콘솔을 확인하세요.')
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

/* ✅ 관리자 공통 메인 폭 */
.admin-main {
  margin-left: 240px;          /* 사이드바 너비 */
  padding-top: 1.5rem;
  padding-bottom: 2.5rem;
  padding-left: 0;
  padding-right: 0;
  min-height: 100vh;
  background-color: transparent;
}
</style>
이렇게 쓰면,  
- `AdminEmergency` 목록에서 “+ 새 게시물” 눌렀을 때  
- 가로 폭/위치가 리스트, 상세, 자동화화면이랑 딱 맞아서  
전환할 때 어색함 거의 없어질 거야 👍
