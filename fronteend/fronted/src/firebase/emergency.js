// src/firebase/emergency.js
import {
  collection, query, orderBy,
  getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc,
  serverTimestamp, increment
} from "firebase/firestore"
import { db } from "./index"

const COLLECTION_NAME = "emergencyData"

// 모든 응급처치 데이터 가져오기
export async function getAllEmergencyData() {
  try {
    const colRef = collection(db, COLLECTION_NAME)
    const q = query(colRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('응급처치 데이터 불러오기 실패:', error)
    throw error
  }
}

// 한 개 조회
export async function getEmergencyData(id) {
  const ref = doc(db, COLLECTION_NAME, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error("데이터 없음")
  return { id: snap.id, ...snap.data() }
}

// 조회수 증가
export async function incrementViews(id){
  const ref = doc(db, COLLECTION_NAME, id)
  await updateDoc(ref, {
    viewCount: increment(1)
  })
}
// 새 응급처치 데이터 추가
export async function addEmergencyData(payload) {
  try {
    const colRef = collection(db, COLLECTION_NAME)
    const data = {
      title: payload.title || "",
      methodList: payload.methodList || [],
      reasonList: payload.reasonList || [],
      symptomList: payload.symptomList || [],
      warning: payload.warning || "",
      youtubeId: payload.youtubeId || "",
      youtubeUrl: payload.youtubeUrl || "",
      thumbnailUrl: payload.thumbnailUrl || "",
      hashtags: payload.hashtags || [],
      viewCountNumber: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(colRef, data)
    return docRef.id
  } catch (error) {
    console.error('응급처치 데이터 추가 실패:', error)
    throw error
  }
}

// 수정
export async function updateEmergencyData(id, payload) {
  const ref = doc(db, COLLECTION_NAME, id)
  await updateDoc(ref, {
    title: payload.title || "",
    methodList: payload.methodList || [],
    reasonList: payload.reasonList || [],
    symptomList: payload.symptomList || [],
    warning: payload.warning || "",
    youtubeId: payload.youtubeId || "",
    youtubeUrl: payload.youtubeUrl || "",
    thumbnailUrl: payload.thumbnailUrl || "",
    hashtags: payload.hashtags || [],
    updatedAt: serverTimestamp()
  })
}

// 삭제
export async function removeEmergencyData(id) {
  await deleteDoc(doc(db, COLLECTION_NAME, id))
}