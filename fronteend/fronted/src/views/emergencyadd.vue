<template>
  <main class="bg-body-tertiary min-vh-100">
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
            <div class="mb-3">
              <label class="form-label fw-semibold">제목</label>
              <input
                type="text"
                class="form-control"
                v-model="form.title"
                placeholder="예) 고열, 화상 시 응급처치"
                required
              />
            </div>

            <!-- 해시태그 -->
            <div class="mb-3">
            <label class="form-label fw-semibold">해시태그</label>

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
            <div class="form-text">예: #열 #감기 #소아응급 등</div>
            </div>


            <!-- 유튜브 URL -->
            <div class="mb-3">
              <label class="form-label fw-semibold">유튜브 URL</label>
              <input
                type="url"
                class="form-control"
                v-model="form.url"
                placeholder="https://youtu.be/..."
                required
              />
              <div class="form-text">
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
          <div class="card-body p-3 p-md-4">
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
          <div class="card-body p-3 p-md-4">
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
          <div class="card-body p-3 p-md-4">
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
          <div class="card-body p-3 p-md-4">
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
        class="position-sticky bottom-0 bg-body-tertiary pt-2 pb-3"
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
              저장하기
            </button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { addEmergencyData } from '../firebase/emergency.js'

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
const thumbnail = computed(() => {
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
  const match = form.url.match(regex)
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : ''
})
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
    // 1. 제목 검증
    if (!form.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    
    // 2. URL 검증
    if (!form.url.trim()) {
      alert('동영상 URL을 입력해주세요.')
      return
    }
    
    // 3. 유튜브 ID 추출 (유튜브인 경우에만)
    const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
    const youtubeMatch = form.url.match(youtubeRegex)
    const youtubeId = youtubeMatch ? youtubeMatch[1] : ''
    
    // 4. 썸네일 URL (유튜브인 경우 자동 생성, 아니면 빈 문자열)
    const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : ''
    
    // 5. 최소 하나의 항목 검증
    const hasSymptom = form.symptomList.some(s => s.trim() !== '')
    const hasMethod = form.methodList.some(m => m.trim() !== '')
    const hasReason = form.reasonList.some(r => r.trim() !== '')
    
    if (!hasSymptom && !hasMethod && !hasReason) {
      alert('증상, 응급처치, 원인 중 최소 하나는 입력해주세요.')
      return
    }
    
    // 6. Firebase에 저장할 데이터
    const data = {
      title: form.title.trim(),
      youtubeUrl: form.url.trim(),
      youtubeId: youtubeId,
      thumbnailUrl: thumbnailUrl,
      hashtags: form.hashtags,
      symptomList: form.symptomList.filter(s => s.trim() !== ''),
      methodList: form.methodList.filter(m => m.trim() !== ''),
      reasonList: form.reasonList.filter(r => r.trim() !== ''),
      warning: form.warning.trim()
    }
    
    // 7. Firebase에 저장
    await addEmergencyData(data)
    alert('응급처치 정보가 저장되었습니다!')
    router.push('/emergency')
    
  } catch (error) {
    console.error('저장 실패:', error)
    alert('저장에 실패했습니다. 다시 시도해주세요.')
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

</style>
