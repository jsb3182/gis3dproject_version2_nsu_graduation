/**
 * ====================================
 * 방문객 API 모듈
 * ====================================
 */

import { apiClient } from './auth';

/**
 * 방문객 목록 조회
 */
export async function getVisitors(params = {}) {
  try {
    const response = await apiClient.get('/visitors', { params });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('방문객 목록 조회 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '방문객 정보를 불러올 수 없습니다.'
    };
  }
}

/**
 * 방문객 상세 조회
 */
export async function getVisitor(id) {
  try {
    const response = await apiClient.get(`/visitors/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('방문객 상세 조회 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '방문객 정보를 불러올 수 없습니다.'
    };
  }
}

/**
 * 방문객 등록
 */
export async function createVisitor(data) {
  try {
    const response = await apiClient.post('/visitors', data);
    return {
      success: true,
      data: response.data,
      message: '방문객이 등록되었습니다.'
    };
  } catch (error) {
    console.error('방문객 등록 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '방문객 등록에 실패했습니다.'
    };
  }
}

/**
 * 방문객 정보 수정
 */
export async function updateVisitor(id, data) {
  try {
    const response = await apiClient.put(`/visitors/${id}`, data);
    return {
      success: true,
      data: response.data,
      message: '방문객 정보가 수정되었습니다.'
    };
  } catch (error) {
    console.error('방문객 정보 수정 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '방문객 정보 수정에 실패했습니다.'
    };
  }
}

/**
 * 방문객 정보 삭제
 */
export async function deleteVisitor(id) {
  try {
    await apiClient.delete(`/visitors/${id}`);
    return {
      success: true,
      message: '방문객 정보가 삭제되었습니다.'
    };
  } catch (error) {
    console.error('방문객 정보 삭제 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '방문객 정보 삭제에 실패했습니다.'
    };
  }
}
