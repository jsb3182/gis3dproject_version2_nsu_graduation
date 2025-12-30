# 천안시 민방위 대피소 최적지 선정 시스템

> **유전 알고리즘 기반 대피소 최적 배치 및 3D WebGIS 시각화 시스템**

<div align="center">

[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()
[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0-green.svg)](https://spring.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13%2B-blue.svg)](https://www.postgresql.org/)
[![Cesium](https://img.shields.io/badge/Cesium.js-Latest-blue.svg)](https://cesium.com/)

</div>

---

## 프로젝트 정보

**지도교수**: 남서울대학교 드론공간정보공학과 유수홍 교수님

**개발팀**: 남서울대학교 캡스톤 디자인 2025년 6조
- 팀장: 정성범
- 팀원: 봉승아, 최민수, 김유민

⚠️ **무단 사용 금지** - 본 프로젝트의 모든 코드 및 산출물은 저작권으로 보호됩니다.

---

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시스템 아키텍처](#시스템-아키텍처)
- [설치 및 실행](#설치-및-실행)
- [환경 변수 설정](#환경-변수-설정)
- [프로젝트 구조](#프로젝트-구조)
- [주요 페이지](#주요-페이지)
- [스크린샷](#스크린샷)

---

## 프로젝트 개요

천안시 민방위 대피소의 최적 위치를 선정하고, 3D WebGIS 기반으로 시각화하는 풀스택 웹 애플리케이션입니다.

### 핵심 가치
- **공간 최적화**: Python 유전 알고리즘으로 150개 대피소의 최적 배치 계산
- **3D 시각화**: Cesium.js 기반 3D 지도에서 실시간 대피소 위치 확인
- **네트워크 분석**: PostGIS의 pgRouting을 활용한 최단 경로 분석
- **사용자 참여**: 게시판, 방명록을 통한 시민 의견 수렴

---

## 주요 기능

### 1. 3D 대피소 시각화 (GIS Analysis)
- **Cesium.js** 기반 3D 지도 렌더링
- 대피소, 건물, 도로, 지적도 레이어 표시
- 실시간 사용자 위치 추적
- 클릭 시 대피소 상세 정보 표시
### 2. 사용자 인증 시스템
- **Spring Security** 기반 JWT 인증
- 회원가입, 로그인, 아이디/비밀번호 찾기
- 로그인 상태 유지 및 자동 로그아웃
### 3. 커뮤니티 기능
- **게시판** (Userboard): 공지사항, 자유게시판
- **방명록** (UserGuestbook): 방문자 메시지
- **마이페이지**: 회원 정보 수정, 내 게시글 관리

### 4. AI 챗봇 (개발 중)
- 대피소 관련 질의응답 지원

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| **Vue.js** | 3.5.25 | 프론트엔드 프레임워크 (Composition API) |
| **Vite** | 7.2.4 | 빌드 도구 및 개발 서버 |
| **Cesium.js** | Latest | 3D 지도 시각화 |
| **Bootstrap** | 5.3.8 | UI 컴포넌트 및 반응형 디자인 |
| **Pinia** | 3.0.4 | 상태 관리 |
| **Vue Router** | 4.6.4 | SPA 라우팅 |
| **Axios** | 1.13.2 | HTTP 클라이언트 |
| **Proj4** | 2.20.2 | 좌표계 변환 |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| **Spring Boot** | 4.0.0 | 백엔드 프레임워크 |
| **Spring Security** | - | 인증/인가 |
| **JPA/Hibernate** | - | ORM |
| **Java** | 17 | 프로그래밍 언어 |

### Database & GIS
| 기술 | 버전 | 용도 |
|------|------|------|
| **PostgreSQL** | 13+ | 관계형 데이터베이스 |
| **PostGIS** | - | 공간 데이터 확장 |
| **pgRouting** | - | 네트워크 분석 |

### Analysis
| 기술 | 용도 |
|------|------|
| **Python 3.x** | 유전 알고리즘 구현 |
| **psycopg2** | PostgreSQL 연결 |
| **ArcGIS Pro** | 공간 데이터 전처리 및 시각화 |

### External APIs
- **GeoServer WFS**: 병원 데이터 실시간 로딩
- **VWorld API**: 2D 베이스맵
- **Cesium Ion**: 3D 지형 및 이미지

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                  Vue.js 3.5 + Cesium.js                      │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐       │
│  │ HomeView │  │ GISAnalysis│ │ Userboard/Guestbook │       │
│  │ (VWorld) │  │ (Cesium)  │  │   (Community)       │       │
│  └──────────┘  └──────────┘  └─────────────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST API (Axios)
┌────────────────────────┴────────────────────────────────────┐
│                     SERVICE LAYER                            │
│                Spring Boot 4.0.0 (Port 8080)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Member  │  │   Post   │  │ Guestbook│                  │
│  │Controller│  │Controller│  │Controller│                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│       │              │              │                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Service  │  │ Service  │  │ Service  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└────────────────────────┬────────────────────────────────────┘
                         │ JPA/Hibernate
┌────────────────────────┴────────────────────────────────────┐
│                      DATA LAYER                              │
│              PostgreSQL 13+ with PostGIS                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │ Spatial Tables:                                  │       │
│  │ • hospital (대피소 데이터)                         │       │
│  │ • gis_build_2km (건물 후보지)                     │       │
│  │ • node_4km, link_4km (도로 네트워크)              │       │
│  │                                                  │       │
│  │ Application Tables:                              │       │
│  │ • member (회원)                                  │       │
│  │ • post (게시글)                                  │       │
│  │ • guestbook (방명록)                             │       │
│  └──────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │ psycopg2
┌────────────────────────┴────────────────────────────────────┐
│              ANALYSIS & OPTIMIZATION LAYER                   │
│                  Python Genetic Algorithm                    │
│  • Huff Model 기반 수용력 분석                                │
│  • pgr_dijkstra 최단 경로 계산                               │
│  • 150개 최적 대피소 선정                                     │
└─────────────────────────────────────────────────────────────┘

## 설치 및 실행

### 사전 요구사항
- **Node.js**: v20.19.0 이상 또는 v22.12.0 이상
- **npm**: 최신 버전
- **Java**: JDK 17
- **PostgreSQL**: 13 이상 (PostGIS 확장 필수)

### 1. 저장소 클론
```bash
git clone https://github.com/your-repo/cheonan-shelter-system.git
cd cheonan-shelter-system/fronteend/fronted
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.example`을 복사하여 `.env` 파일을 생성합니다:
```bash
cp .env.example .env
```

`.env` 파일을 열어 실제 API 키를 입력합니다:
```env
VITE_CESIUM_ION_TOKEN=your_actual_cesium_ion_token_here
```

> Cesium Ion 토큰은 [https://ion.cesium.com/tokens](https://ion.cesium.com/tokens)에서 발급받을 수 있습니다.

### 4. 개발 서버 실행
```bash
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### 5. 프로덕션 빌드
```bash
npm run build
npm run preview
```

---

## 환경 변수 설정

본 프로젝트는 보안을 위해 API 키를 환경 변수로 관리합니다.

### `.env` 파일 생성
```env
# Cesium Ion API Token
VITE_CESIUM_ION_TOKEN=your_cesium_ion_token_here
```

### 백엔드 API 서버 설정
[app.config.js](./app.config.js)에서 환경별 API 서버 URL을 설정합니다:

```javascript
export const requestConfig = {
  baseUrl: isProduction
    ? "https://www.child119.com"      // 배포 환경
    : "http://localhost:8080",        // 개발 환경
};
```

---

## 프로젝트 구조

```
fronted/
├── src/
│   ├── api/                    # API 모듈
│   │   ├── auth.js            # 인증 API
│   │   ├── post.js            # 게시글 API
│   │   ├── guestbook.js       # 방명록 API
│   │   └── index.js           # Axios 인스턴스
│   ├── assets/                # 정적 자산
│   ├── components/            # 공통 컴포넌트
│   │   └── CesiumMap.vue      # Cesium 3D 지도 컴포넌트
│   ├── composables/           # Vue 컴포저블
│   │   ├── useCesium.js       # Cesium 로직
│   │   └── useBottomSheet.js  # 바텀시트 UI
│   ├── router/                # Vue Router 설정
│   │   └── index.js
│   ├── services/              # 비즈니스 로직
│   │   └── geoService.js      # GeoServer 연동
│   ├── stores/                # Pinia 스토어
│   │   ├── app.js
│   │   └── post.js
│   ├── utils/                 # 유틸리티 함수
│   │   ├── cesiumUtils.js     # Cesium 유틸
│   │   ├── tmapfunction.js    # Tmap API
│   │   ├── vworldfunction.js  # VWorld API
│   │   └── userService.js     # 사용자 상태 관리
│   ├── views/                 # 페이지 컴포넌트
│   │   ├── HomeView.vue       # 홈 (응급실 지도)
│   │   ├── GISAnalysis.vue    # 3D 대피소 지도
│   │   ├── login.vue          # 로그인
│   │   ├── sginup.vue         # 회원가입
│   │   ├── mypage.vue         # 마이페이지
│   │   ├── Userboard.vue      # 게시판
│   │   ├── UserGuestbook.vue  # 방명록
│   │   └── aichat.vue         # AI 챗봇
│   ├── App.vue                # 루트 컴포넌트
│   └── main.js                # 앱 진입점
├── .env.example               # 환경 변수 예제
├── .gitignore
├── app.config.js              # 앱 설정
├── package.json
├── vite.config.js             # Vite 설정
└── README.md
```

---

## 주요 페이지

| 페이지 | 라우트 | 설명 | 인증 필요 |
|--------|--------|------|----------|
| **홈** | `/` | 응급실 실시간 병상 정보 (VWorld 2D 지도) | ✗ |
| **3D 대피소 지도** | `/GISAnalysis` | Cesium 기반 대피소 3D 시각화 | ✗ |
| **로그인** | `/login` | 사용자 로그인 | ✗ |
| **회원가입** | `/signup` | 신규 회원 가입 | ✗ |
| **마이페이지** | `/mypage` | 회원 정보 수정 | ✓ |
| **게시판** | `/Userboard` | 공지사항, 자유게시판 | ✓ |
| **방명록** | `/UserGuestbook` | 방문자 메시지 작성 | ✓ |
| **AI 챗봇** | `/aichat` | 대피소 질의응답 | ✗ |

---

## 스크린샷

### 제작중인 화면
<img width="967" height="792" alt="image" src="https://github.com/user-attachments/assets/b6a23e01-06d1-45bd-9e6e-75acbcea3144" />

### 시스템 아키텍처
<img width="768" height="553" alt="image" src="https://github.com/user-attachments/assets/15f13d65-c699-479c-88e7-cb5c55d60238" />

---

## 라이선스

본 프로젝트는 **Proprietary License**로 보호됩니다. 무단 사용, 복제, 배포를 금지합니다.

---

## 문의

프로젝트 관련 문의는 팀장 정성범에게 연락해주세요.
