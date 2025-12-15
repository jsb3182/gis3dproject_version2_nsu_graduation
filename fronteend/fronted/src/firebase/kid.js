// src/firebase/kid.js
import {
  collection, query, where, orderBy,
  onSnapshot, addDoc, doc, getDoc, updateDoc, deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./index";

// 현재 로그인 사용자 UID 얻기 (Promise)
export function getCurrentUid() {
  return new Promise((resolve, reject) => {
    const stop = onAuthStateChanged(auth, (user) => {
      stop();
      if (!user) return reject(new Error("로그인이 필요합니다."));
      resolve(user.uid);
    });
  });
}

// 내 아이 목록 구독 (실시간)
export async function watchMyKids(callback) {
  const uid = await getCurrentUid();
  const colRef = collection(db, "kidinformation");
  const q = query(
    colRef,
    where("parentUid", "==", uid)
  );
  const stop = onSnapshot(q, (snap) => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // 클라이언트에서 createdAt 기준으로 정렬 (최신순)
    rows.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    callback(rows);
  });
  return stop; // 구독 해제 함수 반환
}

// 한 명 조회
export async function getKid(id) {
  const ref = doc(db, "kidinformation", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("데이터 없음");
  return { id: snap.id, ...snap.data() };
}

// 추가
export async function addKid(payload) {
  const uid = await getCurrentUid();
  const colRef = collection(db, "kidinformation");
  const data = {
    kid: payload.name,  // name → kid
    birthYear: Number(payload.birthYear || 0),
    birthMonth: Number(payload.birthMonth || 0),  // 추가 필요!
    birthDay: Number(payload.birthDay || 0),      // 추가 필요!
    bloodType: payload.blood || "",  // blood → bloodType
    medication: payload.meds || "",  // meds → medication
    heightCm: Number(payload.height || 0),  // height → heightCm
    weightKg: Number(payload.weight || 0),  // weight → weightKg
    medicalHistory: payload.history || "",  // history → medicalHistory
    allergy: payload.allergy || "",
    gender: payload.gender || "",
    parentUid: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(colRef, data);
  return docRef.id;
}

// 수정
export async function updateKid(id, payload) {
  const ref = doc(db, "kidinformation", id);
  await updateDoc(ref, {
    kid: payload.name,  // name → kid
    birthYear: Number(payload.birthYear || 0),
    bloodType: payload.blood || "",  // blood → bloodType
    birthMonth: Number(payload.birthMonth || 0),  // 추가
    birthDay: Number(payload.birthDay || 0),      // 추가
    medication: payload.meds || "",  // meds → medication
    heightCm: Number(payload.height || 0),  // height → heightCm
    weightKg: Number(payload.weight || 0),  // weight → weightKg
    medicalHistory: payload.history || "",  // history → medicalHistory
    allergy: payload.allergy || "",
    gender: payload.gender || "",
    updatedAt: serverTimestamp(),
  });
}

// 삭제(선택)
export async function removeKid(id) {
  await deleteDoc(doc(db, "kidinformation", id));
}
