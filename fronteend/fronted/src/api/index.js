/**
 * ====================================
 * 백엔드 API 통신을 위한 중앙 Axios 인스턴스
 * @file src/api/index.js
 * @description 모든 API 모듈에서 재사용될 공통 Axios 인스턴스를 설정하고 내보냅니다.
 * ====================================
 */
import axios from 'axios';
import { requestConfig } from '../../app.config.js';

/**
 * @description 백엔드 API와 통신하기 위한 Axios 인스턴스.
 * - baseURL: app.config.js에서 정의된 기본 URL을 사용합니다.
 * - interceptors: 모든 요청에 인증 토큰(JWT)을 자동으로 추가하고, 인증 오류(401) 발생 시 자동으로 로그아웃 처리합니다.
 */
const apiClient = axios.create({
  baseURL: requestConfig.baseUrl, // 'http://localhost:8080'
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // 만약 세션/쿠키 기반 인증을 사용한다면 이 옵션이 필요할 수 있습니다.
});

// 요청 인터셉터: 모든 요청 헤더에 JWT 토큰을 추가합니다.
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

// 응답 인터셉터: 401 Unauthorized 오류 발생 시 자동으로 로그아웃 처리합니다.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('인증 토큰이 만료되었거나 유효하지 않습니다. 로그아웃 처리합니다.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      // 로그인 페이지로 리디렉션. 현재 위치가 로그인 페이지가 아닐 경우에만 실행.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
