import axios from 'axios';
// axios 기본설정 
const api = axios.create({
  baseURL: 'http://localhost:8081',//백엔드 주소 설정
   headers:{
    'Content-Type': 'application/json', // JSON 형식의 데이터 전송을 위해 필요
   },
    withCredentials: true, //세션 쿠키를 사용한 로그인을 위해 필요
});
//회원 관련 API
export const memberApi = {
  // 회원가입: JSON 객체 전송
  signup: (userData) => api.post('/api/members/signup', userData),

  // 로그인: 시큐리티 설정에 따라 방식을 맞춰야 함
  login: (loginId, password) => {
    // 스프링 시큐리티 기본 폼 로그인을 사용한다면 URLSearchParams가 정석입니다.
    const params = new URLSearchParams();
    params.append('loginId', loginId); // 시큐리티 기본 설정은 'loginId'일 수 있음 세큐리티에서 아이디 를 기대하기 때문에
    params.append('password', password);

    return api.post('/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }
};
//게시판 관련 API
export const postApi = {
  //목록 조회
  getPosts: () => api.get('/api/posts'),
  //글쓰기
  writePost: (postData) => api.post('/api/posts', postData),
  //상세보기
  getPostDetail: (id) => api.get(`/api/posts/${id}`),
};
//방문록 관련 api
export const guestbookApi = {
  //특정 사용자의 방문록 조회
  getGuestbooks: (targetId) => api.get(`/api/guestbooks/${targetId}`),
  //방문록 작성
  writeGuestbook: (guestData) => api.post('/api/guestbooks', guestData),
};
export default api;