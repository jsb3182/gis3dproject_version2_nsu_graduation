/**
 * ====================================
 * 건의사항 API 모듈
 * ====================================
 */

import { apiClient } from './auth';

/**
 * 건의사항 목록 조회
 */
export async function getSuggestions(params = {}) {
  try {
    const response = await apiClient.get('/suggestions', { params });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('건의사항 목록 조회 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '건의사항을 불러올 수 없습니다.'
    };
  }
}

/**
 * 건의사항 상세 조회
 */
export async function getSuggestion(id) {
  try {
    const response = await apiClient.get(`/suggestions/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('건의사항 상세 조회 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '건의사항을 불러올 수 없습니다.'
    };
  }
}

/**
 * 건의사항 작성
 */
export async function createSuggestion(data) {
  try {
    const response = await apiClient.post('/suggestions', data);
    return {
      success: true,
      data: response.data,
      message: '건의사항이 등록되었습니다.'
    };
  } catch (error) {
    console.error('건의사항 작성 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '건의사항 등록에 실패했습니다.'
    };
  }
}

/**
 * 건의사항 수정
 */
export async function updateSuggestion(id, data) {
  try {
    const response = await apiClient.put(`/suggestions/${id}`, data);
    return {
      success: true,
      data: response.data,
      message: '건의사항이 수정되었습니다.'
    };
  } catch (error) {
    console.error('건의사항 수정 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '건의사항 수정에 실패했습니다.'
    };
  }
}

/**
 * 건의사항 삭제
 */
export async function deleteSuggestion(id) {
  try {
    await apiClient.delete(`/suggestions/${id}`);
    return {
      success: true,
      message: '건의사항이 삭제되었습니다.'
    };
  } catch (error) {
    console.error('건의사항 삭제 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '건의사항 삭제에 실패했습니다.'
    };
  }
}

/**
 * 관리자 답변 등록
 */
export async function respondToSuggestion(id, response) {
  try {
    const result = await apiClient.post(`/suggestions/${id}/respond`, {
      adminResponse: response
    });
    return {
      success: true,
      data: result.data,
      message: '답변이 등록되었습니다.'
    };
  } catch (error) {
    console.error('답변 등록 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '답변 등록에 실패했습니다.'
    };
  }
}
