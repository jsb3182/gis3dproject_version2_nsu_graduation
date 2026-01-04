import axios from 'axios'

// axios 기본 설정 사용
const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

const BACKEND_URL = '/api/guestbook'

/**
 * 특정 사용자의 방문록 목록 조회
 */
export const getGuestbooks = async (targetId) => {
  try {
    const response = await api.get(`${BACKEND_URL}/target/${targetId}`)
    return response.data
  } catch (error) {
    console.error('방문록 조회 실패:', error)
    throw error
  }
}

/**
 * 방문록 작성
 */
export const writeGuestbook = async (guestData) => {
  try {
    const response = await api.post(BACKEND_URL, guestData)
    return response.data
  } catch (error) {
    console.error('방문록 작성 실패:', error)
    throw error
  }
}

/**
 * 방문록 삭제 (백엔드 API가 있다면 사용)
 */
export const deleteGuestbook = async (id) => {
  try {
    const response = await api.delete(`${BACKEND_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error('방문록 삭제 실패:', error)
    throw error
  }
}
