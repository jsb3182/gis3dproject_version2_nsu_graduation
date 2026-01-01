# 민방위 대피소 시스템 설정 가이드

## 개요

HomeView.vue에 구현된 민방위 대피소 찾기 시스템입니다.

- **데이터 소스**: data.go.kr 행정안전부 민방위대피소 오픈API
- **기술 스택**: Vue 3 + Cesium.js + Spring Boot + PostGIS
- **베이스맵**: 브이월드(Vworld) WMTS

## 1. API 키 발급

### 1.1 Data.go.kr API 키

1. https://www.data.go.kr/ 접속
2. 회원가입/로그인
3. "행정안전부_민방위대피소" 검색
4. 활용신청 후 승인 (보통 즉시 승인)
5. 마이페이지 > 일반 인증키(Encoding) 복사

### 1.2 Vworld API 키

1. https://www.vworld.kr/dev/v4dv_2ddataguide2_s001.do 접속
2. 회원가입/로그인
3. 오픈 API > 인증키 발급
4. 인증키 복사

## 2. 환경 변수 설정

### 2.1 프론트엔드 (.env)

```bash
cd fronteend/fronted
cp .env.example .env
```

`.env` 파일 수정:
```bash
VITE_CESIUM_ION_TOKEN=your_cesium_ion_token_here
VITE_VWORLD_KEY=your_vworld_key_here
VITE_API_URL=http://localhost:8081/api
```

### 2.2 백엔드 (.env)

```bash
cd backend/gisgraduation_version2_backend
cp .env.example .env
```

`.env` 파일 수정:
```bash
DATA_GO_KR_KEY=your_data_go_kr_key_here
```

## 3. 데이터베이스 설정

### 3.1 PostGIS 확장 활성화

PostgreSQL에 접속하여:

```sql
-- gisgraduation_version2 데이터베이스에 PostGIS 확장 추가
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 3.2 테이블 생성

백엔드를 실행하면 JPA가 자동으로 테이블을 생성합니다 (`ddl-auto=update`).

또는 수동으로 실행:
```bash
psql -U postgres -d gisgraduation_version2 -f backend/gisgraduation_version2_backend/src/main/resources/schema/shelter.sql
```

## 4. 백엔드 실행

```bash
cd backend/gisgraduation_version2_backend

# Maven 빌드
mvn clean install

# Spring Boot 실행
mvn spring-boot:run
```

서버가 `http://localhost:8081`에서 실행됩니다.

## 5. 프론트엔드 실행

```bash
cd fronteend/fronted

# 의존성 설치 (처음 한번만)
npm install

# 개발 서버 실행
npm run dev
```

서버가 `http://localhost:5173`에서 실행됩니다.

## 6. 대피소 데이터 초기화

### 6.1 API를 통한 데이터 로드

백엔드가 실행 중일 때, 다음 API를 호출하여 data.go.kr에서 대피소 데이터를 가져옵니다:

```bash
curl -X POST http://localhost:8081/api/shelters/refresh
```

또는 브라우저 콘솔에서:
```javascript
fetch('http://localhost:8081/api/shelters/refresh', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

## 7. 사용 방법

1. 브라우저에서 `http://localhost:5173` 접속
2. HomeView로 이동
3. "내 위치 찾기" 버튼 클릭 (위치 권한 허용 필요)
4. 검색 반경 선택 (1km, 2km, 3km, 5km)
5. "대피소 검색" 버튼 클릭
6. 지도에 표시된 마커 또는 하단 목록에서 대피소 선택

## 8. API 엔드포인트

### 8.1 주변 대피소 검색
```
GET /api/shelters/nearby?lat={위도}&lon={경도}&radius={반경km}
```

**응답 예시:**
```json
[
  {
    "type": "Feature",
    "id": 1,
    "geometry": {
      "type": "Point",
      "coordinates": [127.0276, 37.4979]
    },
    "properties": {
      "name": "서울시청 대피소",
      "address": "서울특별시 중구 세종대로 110",
      "capacity": 500,
      "area": 1200.5,
      "tel": "02-1234-5678",
      "fcltyManageOrg": "서울시청"
    },
    "distance": 150
  }
]
```

### 8.2 데이터 새로고침
```
POST /api/shelters/refresh
```

### 8.3 저장된 대피소 개수
```
GET /api/shelters/count
```

## 9. 주요 파일 위치

### 프론트엔드
- `fronteend/fronted/src/views/HomeView.vue` - 메인 컴포넌트
- `fronteend/fronted/.env` - 환경 변수

### 백엔드
- `backend/.../domain/shelter/ShelterController.java` - REST API 컨트롤러
- `backend/.../domain/shelter/ShelterService.java` - 비즈니스 로직
- `backend/.../domain/shelter/DataGoKrApiService.java` - 외부 API 연동
- `backend/.../domain/shelter/Shelter.java` - JPA Entity
- `backend/.../resources/application.properties` - 백엔드 설정

## 10. 문제 해결

### 10.1 PostGIS 오류
```
ERROR: type "geometry" does not exist
```
→ PostGIS 확장이 활성화되지 않았습니다. 섹션 3.1 참조

### 10.2 CORS 오류
```
Access to fetch at 'http://localhost:8081/api/shelters/nearby' blocked by CORS
```
→ `vite.config.js`의 proxy 설정 확인
→ `SecurityConfig.java`의 CORS 설정 확인

### 10.3 Vworld 타일이 안 보임
```
Failed to load resource: the server responded with a status of 401
```
→ VITE_VWORLD_KEY가 올바른지 확인
→ Vworld API 키가 활성화되었는지 확인

### 10.4 대피소 데이터가 없음
```
[]
```
→ `/api/shelters/refresh` API를 먼저 호출하여 데이터 로드 필요

## 11. 보안 주의사항

- `.env` 파일은 **절대 Git에 커밋하지 마세요**
- `.gitignore`에 `.env`가 포함되어 있는지 확인
- API 키는 환경 변수로만 관리
- 프로덕션 배포 시 환경 변수를 서버 환경에 설정

## 12. 라이선스 및 출처

- **데이터 출처**: 공공데이터포털 (data.go.kr) - 행정안전부 민방위대피소
- **베이스맵**: 브이월드 (VWorld)
- **3D 지구**: Cesium Ion
