/**
 * ====================================
 * 백엔드 API 게시판 모듈
 * @file src/api/post.js
 * @description 게시판(Post) 관련 CRUD API 함수들을 정의합니다.
 * ====================================
 */
import apiClient from '@/api/index.js'; // 중앙 API 클라이언트 인스턴스 가져오기

/**
 * 모든 게시글 목록을 조회합니다.
 * @returns {Promise<Array>} 게시글 목록 배열
 */
export const fetchPosts = async () => {
  try {
    // GET /api/posts
    const response = await apiClient.get('/api/posts');
    return response.data || [];
  } catch (error) {
    console.error('[API] 게시글 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 특정 ID의 게시글을 상세 조회합니다. (조회수 증가 로직은 백엔드에서 처리)
 * @param {number} postId - 조회할 게시글의 ID
 * @returns {Promise<object>} 게시글 상세 정보 객체
 */
export const fetchPostById = async (postId) => {
  try {
    // GET /api/posts/{postId}
    const response = await apiClient.get(`/api/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`[API] postId=${postId} 게시글 상세 조회 실패:`, error);
    throw error;
  }
};

/**
 * 새로운 게시글을 생성합니다.
 * @param {{ title: string, content: string }} postData - { 제목, 내용 }
 * @returns {Promise<object>} 생성된 게시글 정보 객체
 */
export const createPost = async (postData) => {
  try {
    // POST /api/posts
    const response = await apiClient.post('/api/posts', postData);
    return response.data;
  } catch (error) {
    console.error('[API] 게시글 생성 실패:', error);
    throw error;
  }
};

/**
 * 기존 게시글을 수정합니다.
 * @param {number} postId - 수정할 게시글의 ID
 * @param {{ title: string, content: string }} postData - { 새로운 제목, 새로운 내용 }
 * @returns {Promise<object>} 수정된 게시글 정보 객체
 */
export const updatePost = async (postId, postData) => {
  try {
    // PUT /api/posts/{postId}
    const response = await apiClient.put(`/api/posts/${postId}`, postData);
    return response.data;
  } catch (error) {
    console.error(`[API] postId=${postId} 게시글 수정 실패:`, error);
    throw error;
  }
};

/**
 * 게시글을 삭제합니다.
 * @param {number} postId - 삭제할 게시글의 ID
 * @returns {Promise<void>}
 */
export const deletePost = async (postId) => {
  try {
    // DELETE /api/posts/{postId}
    await apiClient.delete(`/api/posts/${postId}`);
  } catch (error) {
    console.error(`[API] postId=${postId} 게시글 삭제 실패:`, error);
    throw error;
  }
};
