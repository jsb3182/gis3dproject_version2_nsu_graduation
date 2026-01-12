import apiClient from '@/api/index.js';

export const fetchDisasterList = async () => {
  try {
    const response = await apiClient.get('/api/disaster');
    return response.data || [];
  } catch (error) {
    console.error('[API] 재난 정보 목록 조회 실패:', error);
    throw error;
  }
};
