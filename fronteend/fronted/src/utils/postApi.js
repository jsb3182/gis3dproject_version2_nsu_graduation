import axios from 'axios'

const BACKEND_URL = 'http://localhost:8081/api/posts'

/**
 * 게시글 목록 조회
 */
export const getAllPosts = async () => {
  try {
    const response = await axios.get(BACKEND_URL)
    return response.data
  } catch (error) {
    console.error('게시글 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 게시글 상세 조회
 */
export const getPostById = async (id) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error('게시글 상세 조회 실패:', error)
    throw error
  }
}

/**
 * 게시글 작성
 */
export const createPost = async (postData) => {
  try {
    const response = await axios.post(BACKEND_URL, {
      title: postData.title,
      content: postData.content,
      writerId: postData.writerId
    })
    return response.data // 생성된 게시글 ID 반환
  } catch (error) {
    console.error('게시글 작성 실패:', error)
    throw error
  }
}

/**
 * 게시글 수정
 */
export const updatePost = async (id, postData) => {
  try {
    const response = await axios.put(`${BACKEND_URL}/${id}`, {
      title: postData.title,
      content: postData.content,
      writerId: postData.writerId
    })
    return response.data
  } catch (error) {
    console.error('게시글 수정 실패:', error)
    throw error
  }
}

/**
 * 게시글 삭제
 */
export const deletePost = async (id) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error('게시글 삭제 실패:', error)
    throw error
  }
}
