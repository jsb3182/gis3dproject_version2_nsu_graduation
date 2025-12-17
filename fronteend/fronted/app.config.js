const isProduction = import.meta.env.MODE === "production"; // Vite 기준

export const requestConfig = {
  // 백엔드 API 서버 (Spring, Express 등)
  baseUrl: isProduction
    ? "https://www.child119.com" // 배포용
    : "http://localhost:8080",          // 개발용

  // Docker 기반 AI 모델 서버 (Flask 등)
  baseUrlDocker: isProduction
    ? "https://www.child119.com" // 배포용
    : "http://localhost:8080",          // 개발용

};
