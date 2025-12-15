<template>
  <div class="d-flex justify-content-center" style="padding-bottom: 100px;">
    <!-- ✅ 카드 -->
    <div class="card shadow-sm w-100" style="max-width: 100vw;">
      <!-- ✅ 안내 팝업 -->
      <div
        v-if="showPopup"
        class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50"
        style="z-index: 9999;"
      >
        <div class="bg-white rounded-4 shadow p-5 position-relative" style="width: 90%; max-width: 420px;">
          <button
            type="button"
            class="btn-close position-absolute top-0 start-0 m-3"
            aria-label="Close"
            @click="cancelPopup"
          ></button>

          <h5 class="text-center fw-bold mb-4 mt-2">안내</h5>
          <p class="text-medium text-center mb-3 guide-text">
            챗봇은 사용자가 입력한 증상 정보를 기반으로 가까운 병원과 참고용 응급처치 정보를 안내합니다.
          </p>

          <ul class="small text-light-emphasis mb-4 guide-text">
            <li>증상의 정도에 따라 안내되는 결과가 달라질 수 있습니다.</li>
            <li>이용 시점과 실제 병원 방문 시점의 상태 변화에 따라 결과가 달라질 수 있습니다.</li>
            <li>의식 저하, 심한 출혈, 호흡곤란 등 응급상황일 경우 즉시 119에 연락하세요.</li>
            <li>본 서비스는 참고용으로 제공되며, 의료 전문가의 진단을 대체하지 않습니다.</li>
            <li>최종 판단과 책임은 사용자 본인에게 있습니다. 계속 진행하시겠습니까?</li>
          </ul>

          <div class="mt-5">
            <button
              class="btn w-100 py-2 text-medium"
              style="background-color: #0D6EFD; color: white;"
              @click="confirmPopup"
            >
              확인
            </button>
          </div>
        </div>
      </div>

      <!-- ✅ 아이 정보 -->
      <div v-if="isLoggedIn && selectedKid" class="p-3 bg-light text-medium">
        <p class="mb-2">🧒 선택된 아이: <b>{{ selectedKid.kid }}</b></p>
        <p class="mb-1">혈액형: {{ selectedKid.bloodType }}</p>
        <p class="mb-1">알레르기: {{ selectedKid.allergy || '없음' }}</p>
        <p class="mb-0">복용약: {{ selectedKid.medication || '없음' }}</p>
        <p class="mb-0">병력: {{ selectedKid.medicalHistory || '없음' }}</p>
      </div>

      <div v-else-if="isLoggedIn && !selectedKid" class="p-3 bg-light text-medium">
        <p class="mb-0">내 아이 정보를 불러오는 중...</p>
      </div>

      <div v-else class="p-3 bg-light text-medium">
        <p class="mb-0">로그인되어 있지 않습니다. 기본 AI 대화로 진행합니다.</p>
      </div>

      <!-- ✅ 메시지 영역 -->
      <div
        class="card-body overflow-auto"
        ref="messagesContainer"
        style="height: calc(100vh - 300px); padding-bottom: 50px;"
      >
        <div v-for="(msg, i) in messages" :key="i" class="mb-3">
          <!-- 사용자 메시지 -->
          <div v-if="msg.type === 'user'" class="text-end">
            <span class="d-inline-block bg-primary text-white text-plight px-3 py-2 rounded-4">
              {{ msg.text }}
            </span>
          </div>

          <!-- AI 메시지 -->
          <div v-else class="text-start">
            <span
              class="d-inline-block bg-light text-dark text-plight px-3 py-2 rounded-4"
              style="white-space: pre-line; word-break: keep-all;"
            >
              {{ msg.text }}
            </span>

            
            <!-- ✅ 아이 선택 버튼 표시 -->
            <div v-if="msg.showKidButtons" class="mt-2">
              <button
                v-for="kid in kidList"
                :key="kid.kid"
                class="btn btn-outline-primary rounded-pill me-2 mb-2 text-medium"
                @click="selectKid(kid)"
              >
                🧒 {{ kid.kid }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ 입력 폼 (푸터 바로 위에 고정) -->
    <div
      class="d-flex align-items-center p-3 border-top bg-white shadow"
      style="position: fixed; bottom: 80px; left: 0; width: 100%; z-index: 1000;"
    >
      <form class="d-flex align-items-center w-100" @submit.prevent="sendMessage">
        <input
          v-model="input"
          type="text"
          class="form-control rounded-pill text-medium px-3"
          placeholder="메시지를 입력하세요..."
          style="flex: 1;"
        />
        <button
          type="button"
          class="btn btn-outline-secondary ms-2 rounded-circle"
          @click="toggleVoiceRecognition"
          style="width: 45px; height: 45px;"
        >
          <i :class="isListening ? 'bi bi-mic-mute-fill' : 'bi bi-mic-fill'"></i>
        </button>

        <button
          class="btn btn-primary rounded-pill text-medium ms-2 px-4"
          type="submit"
        >
          전송
        </button>
      </form>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const router = useRouter();
const input = ref("");
const messages = ref([]);
const messagesContainer = ref(null);
const isLoggedIn = ref(false);
const selectedKid = ref(null);
const kidList = ref([]);
let socket = null;
let recognition = null;
const isListening = ref(false);
const synth = window.speechSynthesis;
const userLocation = ref({ lat: null, lon: null });
const showPopup = ref(false);

// ✅ 팝업
const cancelPopup = () => { showPopup.value = false; router.push("/"); };
const confirmPopup = () => { showPopup.value = false; };

// ✅ 아이 선택 버튼 클릭
const selectKid = (kid) => {
  selectedKid.value = kid;
  messages.value.push({ text: `🧒 ${kid.kid} 어린이를 선택했습니다.`, type: "ai" });

  nextTick(() => {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  });
};


// ✅ 아이 상세 정보 로드
const loadKidDetail = async (kid) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const res = await axios.get("https://child119-251868777139.asia-northeast3.run.app/api/kids/detail", {
    params: { parentUid: user.uid, kidName: kid.kid },
  });
   selectedKid.value = res.data.kidInfo;
};

// ✅ WebSocket 연결
const initWebSocket = () => {
  socket = new WebSocket("wss://child119-251868777139.asia-northeast3.run.app/ws/chat");

  socket.onopen = () => console.log("✅ WebSocket 연결 완료");

  socket.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    // AI 일반 메시지
    if (data.aiText) {
      messages.value.push({ text: data.aiText, type: "ai" });
      speakText(data.aiText);
    }
    await nextTick();
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  };
};

// ✅ 메시지 전송
const sendMessage = async () => {
  const text = input.value.trim();
  if (!text) return;
  messages.value.push({ text, type: "user" });
  input.value = "";

  if (socket && socket.readyState === WebSocket.OPEN) {
    const auth = getAuth();
    const user = auth.currentUser;
    
    const payload = {
      message: text,
      kidInfo: selectedKid.value ? {
        parentUid: user ? user.uid : null,
        kid: selectedKid.value.kid,
        birthYear: selectedKid.value.birthYear,
        birthMonth: selectedKid.value.birthMonth,
        birthDay: selectedKid.value.birthDay
      } : null,
      lat: userLocation.value.lat,
      lon: userLocation.value.lon,
    };
    socket.send(JSON.stringify(payload));
  }
};
// ✅ 위치 가져오기
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("위치 서비스를 지원하지 않습니다."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

// ✅ onMounted
onMounted(async () => {
  showPopup.value = true;
  const auth = getAuth();
  const user = await new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, (u) => { stop(); resolve(u); });
  });

  initWebSocket();

  if (user) {
    isLoggedIn.value = true;
    try {
      const res = await axios.get("https://child119-251868777139.asia-northeast3.run.app/api/kids/list", {
        params: { parentUid: user.uid },
      });
      kidList.value = res.data;

      if (kidList.value.length === 0) {
        messages.value.push({ text: "👶 등록된 아이가 없습니다. 기본 모드로 진행합니다.", type: "ai" });
      } else if (kidList.value.length === 1) {
        selectedKid.value = kidList.value[0];
        messages.value.push({ text: `🧒 ${selectedKid.value.kid} 어린이를 자동 선택했습니다.`, type: "ai" });
        await loadKidDetail(selectedKid.value);
      } else {
        messages.value.push({
          text: `👋 안녕하세요! ${user.email}님.\n등록된 아이가 여러 명이네요.\n어떤 아이의 정보를 사용할까요?`,
          type: "ai",
          showKidButtons: true,
        });
      }
    } catch {
      messages.value.push({ text: "⚠️ 아이 정보를 불러오지 못했습니다.", type: "ai" });
    }
  }

  try {
    userLocation.value = await getUserLocation();
  } catch (e) {
    console.warn("위치 실패:", e.message);
  }
});

// ✅ 음성 관련
const toggleVoiceRecognition = () => {
  if (isListening.value) stopVoiceRecognition();
  else startVoiceRecognition();
};

const startVoiceRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  recognition = new SpeechRecognition();
  recognition.lang = "ko-KR";
  recognition.onstart = () => (isListening.value = true);
  recognition.onresult = (e) => {
    input.value = e.results[e.results.length - 1][0].transcript.trim();
    sendMessage();
  };
  recognition.onend = () => (isListening.value = false);
  recognition.start();
};

const stopVoiceRecognition = () => {
  if (recognition) {
    recognition.stop();
    recognition = null;
    isListening.value = false;
  }
};

const speakText = (text) => {
  if (!text || synth.speaking) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  synth.speak(utter);
};

onBeforeUnmount(() => {
  if (socket && socket.readyState === WebSocket.OPEN) socket.close();
  stopVoiceRecognition();
});
</script>

<style scoped>
.guide-text {
  white-space: pre-line;
  word-break: keep-all;
  line-height: 1.6;
}
</style>
