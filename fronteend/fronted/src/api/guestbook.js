/**
 * ====================================
 * 백엔드 API 방명록 모듈
 * @file src/api/guestbook.js
 * @description 방명록(Guestbook) 관련 CRUD API 함수들을 정의합니다.
 * ====================================
 */
import apiClient from '@/api/index.js'; // 중앙 API 클라이언트 인스턴스 가져오기

/**
 * 특정 사용자의 방명록 목록을 조회합니다.
 * @param {number} targetId - 방명록 소유자의 사용자 ID
 * @returns {Promise<Array>} 방명록 항목 배열. 각 항목은 { id, content, writer, createdDate } 등을 포함.
 */
export const fetchGuestbookEntries = async (targetId) => {
  try {
    // GET /api/guestbook/target/{targetId}
    const response = await apiClient.get(`/api/guestbook/target/${targetId}`);
    return response.data || [];
  } catch (error) {
    console.error(`[API] targetId=${targetId} 방명록 조회 실패:`, error);
    throw error; // 에러를 호출한 쪽으로 전파하여 컴포넌트에서 처리하도록 함
  }
};

/**
 * 새로운 방명록 글을 작성합니다.
 * @param {number} targetId - 방명록 소유자의 사용자 ID
 * @param {string} content - 작성할 내용
 * @returns {Promise<object>} 생성된 방명록 항목
 */
export const addGuestbookEntry = async (targetId, content) => {
  try {
    // POST /api/guestbook
    const response = await apiClient.post('/api/guestbook', { targetId, content });
    return response.data;
  } catch (error) {
    console.error('[API] 방명록 작성 실패:', error);
    throw error;
  }
};

/**
 * 기존 방명록 글을 수정합니다.
 * @param {number} entryId - 수정할 방명록 항목의 ID
 * @param {string} content - 새로운 내용
 * @returns {Promise<object>} 수정된 방명록 항목
 */
export const updateGuestbookEntry = async (entryId, content) => {
  try {
    // PUT /api/guestbook/{entryId}
    const response = await apiClient.put(`/api/guestbook/${entryId}`, { content });
    return response.data;
  } catch (error) {
    console.error(`[API] entryId=${entryId} 방명록 수정 실패:`, error);
    throw error;
  }
};

/**
 * 방명록 글을 삭제합니다.
 * @param {number} entryId - 삭제할 방명록 항목의 ID
 * @returns {Promise<void>}
 */
export const deleteGuestbookEntry = async (entryId) => {
  try {
    // DELETE /api/guestbook/{entryId}
    await apiClient.delete(`/api/guestbook/${entryId}`);
  } catch (error) {
    console.error(`[API] entryId=${entryId} 방명록 삭제 실패:`, error);
    throw error;
  }
};
