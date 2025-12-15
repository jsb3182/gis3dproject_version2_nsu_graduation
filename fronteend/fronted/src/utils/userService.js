// userService.js - localStorage 기반 사용자 정보 관리

/**
 * 로컬스토리지에서 사용자 정보 가져오기
 * @returns {Object|null} 사용자 정보 객체 또는 null
 */
export function getUser() {
  const raw = localStorage.getItem('user')
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

/**
 * 로컬스토리지에 사용자 정보 저장 및 변경 이벤트 발행
 * @param {Object} user - 저장할 사용자 정보
 */
export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
  window.dispatchEvent(new CustomEvent('user-changed', { detail: user }))
}

/**
 * 로컬스토리지에서 사용자 정보 삭제 및 변경 이벤트 발행
 */
export function clearUser() {
  localStorage.removeItem('user')
  window.dispatchEvent(new CustomEvent('user-changed', { detail: null }))
}
