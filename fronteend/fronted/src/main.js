import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { getUser, setUser, clearUser } from './utils/userService.js'
import { getStoredUser } from '@/api/auth'

const app = createApp(App)

// ✅ 백엔드 API 방식: localStorage에서 사용자 정보 로드
const currentUser = getStoredUser()

if (currentUser) {
  setUser(currentUser)
  app.config.globalProperties.$currentUser = currentUser
} else {
  clearUser()
  app.config.globalProperties.$currentUser = null
}

// ✅ 전역에서 현재 사용자 정보 접근 가능하게 함
app.config.globalProperties.$currentUser = getUser()

// ✅ 브라우저 탭/컴포넌트 간 변경 반영
window.addEventListener('user-changed', (e) => {
  app.config.globalProperties.$currentUser = e.detail
})

// ✅ storage 이벤트도 처리 (다른 탭에서 변경 시)
window.addEventListener('storage', () => {
  app.config.globalProperties.$currentUser = getUser()
})

app.use(createPinia())
app.use(router)

app.mount('#app')
