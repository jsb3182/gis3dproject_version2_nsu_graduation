// Firebase 설정과 인증을 가져옵니다
import { db, auth } from './index'
// Firestore 데이터베이스 작업에 필요한 함수들을 가져옵니다
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

/**
 * 건의사항을 Firebase Firestore에 저장하는 함수
 * @param {Object} suggestionData - 건의사항 데이터 객체
 * @param {string} suggestionData.title - 건의사항 제목
 * @param {string} suggestionData.content - 건의사항 내용
 * @param {string} suggestionData.adminMemo - 관리자가 남기는 메모 (선택)
 * @param {string} suggestionData.status - 건의사항 상태
 * @param {string} suggestionData.targetRole - 대상 역할
 * @returns {Promise<string>} 생성된 문서의 ID를 반환
 */
export async function addSuggestion(suggestionData) {
  try {
    // 현재 로그인한 사용자 정보를 가져옵니다
    const user = auth.currentUser
    
    // 로그인하지 않은 경우 에러를 발생시킵니다
    if (!user) {
      throw new Error('로그인이 필요합니다.')
    }

    // Firestore에 저장할 데이터 객체를 만듭니다
    const payload = {
      title: suggestionData.title || '', // 제목 (비어있으면 빈 문자열)
      content: suggestionData.content || '', // 내용 (비어있으면 빈 문자열)
      adminMemo: suggestionData.adminMemo || '', // 관리자 메모 (비어있으면 빈 문자열)
      status: suggestionData.status || '관리자가 읽은 상태', // 상태 (기본값: 관리자가 읽은 상태)
      targetRole: suggestionData.targetRole || '향상 admin 고정', // 대상 역할 (기본값: 향상 admin 고정)
      fromEmail: user.email || '담당용 이메일', // 작성자 이메일 (현재 로그인한 사용자)
      fromUid: user.uid || '제안가능한 작성자 uid', // 작성자 UID (현재 로그인한 사용자)
      createdAt: serverTimestamp(), // 생성 시간 (서버 시간 자동 설정)
      updatedAt: serverTimestamp() // 수정 시간 (서버 시간 자동 설정)
    }

    // Firestore의 'suggestions' 컬렉션에 데이터를 추가합니다
    const docRef = await addDoc(collection(db, 'suggestions'), payload)
    
    // 생성된 문서의 ID를 반환합니다
    return docRef.id
  } catch (error) {
    // 에러 발생 시 콘솔에 출력하고 다시 에러를 던집니다
    console.error('건의사항 저장 실패:', error)
    throw error
  }
}