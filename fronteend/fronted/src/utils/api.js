import axios from 'axios';
// axios 기본설정 
const api = axios.create({
  baseURL: 'https://localhost:80801',//백엔드 주소 설정
   headers:{
    'Content-Type': 'application/json', // JSON 형식의 데이터 전송을 위해 필요
   },
    withCredentials: true, //세션 쿠키를 사용한 로그인을 위해 필요
});
//회원 관련 API
export const memberApi = {
  //회원가입 (POST /api/members/sinup)
  signup: (userData) => api.post('/api/members/signup', userData),
  //로그인 포스트 로그인 스프링 세큐리티 기본 경로
  login:(credentials) => {
    //시큐리티는 기본적으로  x-www-form-urlencoded 방식을 사용함amfh FromData로 보냄
    const formData = new FormData();
    formData.append('loginId', credentials.loginId);
    formData.append('password', credentials.password);
    return api.post('/login', formData, {
      headers: {'Content-Type' : 'multipart/form-data'}
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