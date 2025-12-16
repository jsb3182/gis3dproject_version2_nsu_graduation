/**
 * ====================================
 * 백엔드 API 인증 모듈
 * (Firebase 대체용)
 * ====================================
 */

import axios from 'axios';

// 백엔드 API URL (환경변수 또는 설정 파일에서 관리)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터: 모든 요청에 JWT 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 로그아웃 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 인증 실패
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * ====================================
 * 인증 API 함수
 * ====================================
 */

/**
 * 회원가입
 */
export async function register(userData) {
  try {
    const response = await apiClient.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      username: userData.username,
      phone: userData.phone
    });

    return {
      success: true,
      data: response.data,
      message: '회원가입이 완료되었습니다.'
    };
  } catch (error) {
    console.error('회원가입 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '회원가입에 실패했습니다.'
    };
  }
}

/**
 * 로그인
 */
export async function login(email, password) {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });

    // JWT 토큰 저장
    const { token, user } = response.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));

    console.log('✅ 로그인 성공:', user.email);

    return {
      success: true,
      user: user,
      token: token
    };
  } catch (error) {
    console.error('로그인 실패:', error);
    return {
      success: false,
      message: error.response?.data?.message || '로그인에 실패했습니다.'
    };
  }
}

/**
 * 로그아웃
 */
export async function logout() {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('로그아웃 API 호출 실패:', error);
  } finally {
    // 토큰 삭제 (백엔드 응답 여부와 상관없이)
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    console.log('✅ 로그아웃 완료');
  }
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser() {
  try {
    const response = await apiClient.get('/auth/me');
    const user = response.data;

    // 로컬 스토리지 업데이트
    localStorage.setItem('currentUser', JSON.stringify(user));

    return {
      success: true,
      user: user
    };
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    return {
      success: false,
      message: '사용자 정보를 가져올 수 없습니다.'
    };
  }
}

/**
 * 로그인 상태 확인
 */
export function isAuthenticated() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('currentUser');
  return !!(token && user);
}

/**
 * 현재 사용자 정보 가져오기 (로컬 스토리지)
 */
export function getStoredUser() {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('사용자 정보 파싱 실패:', e);
      return null;
    }
  }
  return null;
}

/**
 * 관리자 여부 확인
 */
export function isAdmin() {
  const user = getStoredUser();
  if (!user) return false;

  // username에 'admin' 포함 여부로 판단
  return user.username?.toLowerCase().includes('admin') || user.role === 'admin';
}

/**
 * ====================================
 * Export Axios 인스턴스 (다른 API 모듈에서 사용)
 * ====================================
 */
export { apiClient };
