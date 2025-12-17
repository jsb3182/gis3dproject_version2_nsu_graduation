<<<<<<< HEAD
# fronted

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
=======
# 천안시 민방위 대피소 선정을 위한 공간분석

## 프로젝트 정보

**지도교수**: 남서울대학교 드론공간정보공학과 유수홍 교수님

**개발팀**: 남서울대학교 캡스톤 디자인 2025년 6조
- 팀장: 정성범
- 팀원: 봉승아, 최민수, 김유민

**저작권**: 무단 사용을 금지합니다.

---

Vue 3 + Vite 기반 WebGIS 프론트엔드 풀스택 애플리케이션입니다.

## 기술 스택

### 프론트엔드
- Vue 3.5.18 (Composition API)
- Vue Router 4.5.1
- Pinia 3.0.3
- Vite 7.0.6
- Bootstrap 5.3.8
- CesiumJS 1.136.0
- Axios 1.13.1

### 백엔드 & 데이터
- Firebase 12.4.0 (인증 및 배포)
- PostgreSQL
- QGIS
- GeoServer WFS

## 설치 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. API 키 설정

프로젝트를 실행하기 전에 다음 API 키들을 설정해야 합니다:

#### Firebase 설정

`src/firebase/index.js` 파일에서 Firebase 설정을 주석 해제하고 본인의 API 키로 교체하세요:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

Firebase Console에서 새 프로젝트를 생성하고 위 정보를 얻을 수 있습니다:
https://console.firebase.google.com/

#### Tmap API 키 설정

`index.html` 파일에서 Tmap API 키를 설정하세요:

```html
<!-- 주석 해제 후 YOUR_TMAP_API_KEY를 본인의 키로 교체 -->
<script src="https://apis.openapi.sk.com/tmap/vectorjs?version=1&appKey=YOUR_TMAP_API_KEY"></script>
```

Tmap API 키는 다음 링크에서 발급받을 수 있습니다:
https://openapi.sk.com/

#### VWorld API 키 설정

`index.html` 파일에서 VWorld API 키를 설정하세요:

```html
<!-- 주석 해제 후 YOUR_VWORLD_API_KEY를 본인의 키로 교체 -->
<script type="text/javascript" src="https://map.vworld.kr/js/vworldMapInit.js.do?version=2.0&apiKey=YOUR_VWORLD_API_KEY"></script>
```

VWorld API 키는 다음 링크에서 발급받을 수 있습니다:
https://www.vworld.kr/dev/v4dv_2ddataguide2_s001.do

### 3. 백엔드 서버 설정

`app.config.js` 파일에서 백엔드 서버 주소를 확인/수정하세요:

```javascript
export const requestConfig = {
  baseUrl: "http://localhost:8080",          // 개발용
  baseUrlDocker: "http://localhost:8080",    // 개발용
};
```

## 실행 방법

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:5173 에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

### 프로덕션 미리보기

```bash
npm run preview
```

## 주요 기능

### 3D WebGIS 기반 대피소 시각화
- CesiumJS를 활용한 3D 지도 시각화
- 천안시 민방위 대피소 위치 표시
- **NEW**: `/hospitalInformationCesium` - 3D 대피소 뷰어
  - 대피소, 건물, 도로 데이터 3D 시각화
  - 실시간 거리 계산 및 정렬
  - 사용자 위치 기반 네비게이션
  - 로컬 GeoServer 연동

### 위치 기반 대피소 검색
- 사용자 현재 위치 기반 주변 대피소 검색
- VWorld API를 활용한 지도 표시

### GeoServer WFS 연동
- 로컬 GeoServer (http://localhost:8080/geoserver) 연동
- 공간 데이터 실시간 조회
- PostgreSQL/PostGIS 기반 데이터 관리
- 6개 레이어 지원: build, chmergr, chspoint, link, node, thematicmerge
- EPSG:5174 → WGS84 좌표 변환

### Firebase 인증
- 사용자 로그인/로그아웃
- Firestore 기반 사용자 정보 관리

## 프로젝트 구조

```
fronted/
├── public/              # 정적 파일
├── src/
│   ├── assets/         # 이미지, CSS 등
│   ├── components/     # Vue 컴포넌트
│   ├── firebase/       # Firebase 설정
│   ├── pages/          # 페이지 컴포넌트
│   ├── router/         # Vue Router 설정
│   ├── stores/         # Pinia 스토어
│   ├── utils/          # 유틸리티 함수
│   ├── views/          # 뷰 컴포넌트
│   ├── App.vue         # 루트 컴포넌트
│   └── main.js         # 앱 진입점
├── app.config.js       # 앱 설정
├── firebase.json       # Firebase 호스팅 설정
├── index.html          # HTML 템플릿
├── jsconfig.json       # JavaScript 설정
├── package.json        # 프로젝트 의존성
└── vite.config.js      # Vite 설정
```
>>>>>>> origin/develop
