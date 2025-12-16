# GeoServer CORS 설정 방법

## 문제 증상
```
Access to XMLHttpRequest at 'http://localhost:8080/geoserver/wfs?...'
from origin 'http://localhost:5174' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 해결 방법

### 방법 1: GeoServer web.xml 수정 (권장)

1. **GeoServer 설치 폴더로 이동**
   ```
   C:\Program Files\GeoServer\webapps\geoserver\WEB-INF\web.xml
   ```
   (또는 설치 경로에 따라 다를 수 있음)

2. **web.xml 파일 열기** (관리자 권한 필요)

3. **`<web-app>` 태그 안에 다음 내용 추가** (맨 위쪽, `<display-name>` 아래):

```xml
<!-- CORS Filter -->
<filter>
  <filter-name>CorsFilter</filter-name>
  <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>
  <init-param>
    <param-name>cors.allowed.origins</param-name>
    <param-value>http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174</param-value>
  </init-param>
  <init-param>
    <param-name>cors.allowed.methods</param-name>
    <param-value>GET,POST,HEAD,OPTIONS,PUT,DELETE</param-value>
  </init-param>
  <init-param>
    <param-name>cors.allowed.headers</param-name>
    <param-value>Content-Type,X-Requested-With,accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers,Authorization</param-value>
  </init-param>
  <init-param>
    <param-name>cors.exposed.headers</param-name>
    <param-value>Access-Control-Allow-Origin,Access-Control-Allow-Credentials</param-value>
  </init-param>
  <init-param>
    <param-name>cors.support.credentials</param-name>
    <param-value>true</param-value>
  </init-param>
</filter>

<filter-mapping>
  <filter-name>CorsFilter</filter-name>
  <url-pattern>/*</url-pattern>
</filter-mapping>
```

4. **GeoServer 재시작**

### 방법 2: Vite 프록시 설정 (빠른 임시 해결책)

`vite.config.js` 파일 수정:

```javascript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    cesium()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/geoserver': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

그 다음 코드에서 URL 변경:
```javascript
// 기존
const GEOSERVER_URL = 'http://localhost:8080/geoserver/wfs';

// 변경 후
const GEOSERVER_URL = '/geoserver/wfs';
```

### 방법 3: Chrome에서 CORS 비활성화 (개발용만!)

**⚠️ 보안 위험! 개발 테스트용으로만 사용**

1. Chrome 바로가기 생성
2. 속성 > 대상 끝에 추가:
   ```
   --disable-web-security --user-data-dir="C:/ChromeDevSession"
   ```

## 테스트 방법

1. GeoServer CORS 설정 후 재시작
2. Vue 개발 서버 재시작 (`npm run dev`)
3. 브라우저에서 `http://localhost:5174/hospitalInformationApp` 접속
4. 브라우저 콘솔에서 CORS 에러가 사라졌는지 확인

## 위치 권한 오류 해결

**증상:**
```
GeolocationPositionError {code: 1, message: 'User denied Geolocation'}
```

**해결:**
1. 브라우저 주소창 왼쪽 자물쇠/정보 아이콘 클릭
2. "위치" 권한을 "허용"으로 변경
3. 페이지 새로고침

또는 기본 위치 사용 (천안시청):
- 위도: 36.8151
- 경도: 127.1139
