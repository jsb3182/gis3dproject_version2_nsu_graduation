import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// 'firebase/firestore'에서 getFirestore를 가져옵니다.
import { getFirestore, collection } from "firebase/firestore";

// TODO: Firebase 설정 - 본인의 Firebase 프로젝트 설정으로 교체하세요
// 현재 설정은 유효하지 않은 프로젝트입니다. 새 프로젝트를 만들어주세요.
const firebaseConfig = {
  apiKey: "AIzaSyBKC1moRB8vIb4edkxovAvzAqSAOlgG-0g",
  authDomain: "gisfinal-81e5d.firebaseapp.com",
  projectId: "gisfinal-81e5d",
  storageBucket: "gisfinal-81e5d.firebasestorage.app",
  messagingSenderId: "768490234663",
  appId: "1:768490234663:web:fc4b9a7cd309e4f9b23f02",
  measurementId: "G-DHT2SKNJE8"
};

// Initialize Firebase with error handling
let app = null;
let auth = null;
let db = null;
let USER_COLLECTION = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  USER_COLLECTION = collection(db, "users");
  console.log("✅ Firebase 초기화 성공");
} catch (error) {
  console.warn("⚠️ Firebase 초기화 실패:", error.message);
  console.warn("Firebase 인증 없이 앱이 실행됩니다. 로그인 기능은 사용할 수 없습니다.");

  // 임시 빈 객체 생성 (앱이 크래시되지 않도록)
  auth = {
    currentUser: null,
    onAuthStateChanged: () => {},
    signOut: () => Promise.resolve()
  };

  db = null;
  USER_COLLECTION = null;
}

export { auth, db, USER_COLLECTION };