import './assets/main.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { getUser, setUser, clearUser } from './utils/userService.js'
import { auth, db } from './firebase/index'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // ← 모달 동작 핵심(JS + Popper 번들)

const app = createApp(App)

// Firebase Auth 상태와 localStorage 동기화
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    // Firebase에 로그인된 사용자가 있으면 Firestore에서 정보 가져와서 localStorage 업데이트
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid)
      const userDoc = await getDoc(userDocRef)

      let userData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || '사용자',
        username: firebaseUser.email,
        email: firebaseUser.email,
        phone: ''
      }

      if (userDoc.exists()) {
        const firestoreData = userDoc.data()
        userData = {
          uid: firestoreData.uid || firebaseUser.uid,
          name: firestoreData.name || firebaseUser.displayName || '사용자',
          username: firestoreData.username || firebaseUser.email,
          email: firebaseUser.email,
          phone: firestoreData.phone || ''
        }
      }

      setUser(userData)
      app.config.globalProperties.$currentUser = userData
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error)
    }
  } else {
    // Firebase에 로그인된 사용자가 없으면 localStorage 클리어
    clearUser()
    app.config.globalProperties.$currentUser = null
  }
})

// 전역에서 현재 사용자 정보 접근 가능하게 함
app.config.globalProperties.$currentUser = getUser()

// 브라우저 탭/컴포넌트 간 변경 반영
window.addEventListener('user-changed', (e) => {
  app.config.globalProperties.$currentUser = e.detail
})

// storage 이벤트도 처리 (다른 탭에서 변경 시)
window.addEventListener('storage', () => {
  app.config.globalProperties.$currentUser = getUser()
})

app.use(createPinia())
app.use(router)

app.mount('#app')
