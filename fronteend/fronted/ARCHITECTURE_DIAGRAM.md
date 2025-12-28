# 천산시 민방위 대피소 최적지 선정 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                 │
│                         Vue.js Web Application                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────┐    ┌──────────────┐    ┌──────────────────┐                │
│   │   Vue    │    │   Cesium.js  │    │   HTML/CSS/JS    │                │
│   │   3.5    │    │  (3D Map     │    │  (Bootstrap 5)   │                │
│   │          │    │Visualization)│    │  User Interface  │                │
│   └──────────┘    └──────────────┘    └──────────────────┘                │
│                                                                              │
│   - Pinia (State Management)                                                │
│   - Vue Router (SPA Routing)                                                │
│   - Axios (HTTP Client)                                                     │
│   - Cesium.js (3D Geospatial Visualization)                                │
│                                                                              │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               │ HTTPS/REST API
                               │
┌──────────────────────────────┴──────────────────────────────────────────────┐
│                            SERVICE LAYER                                     │
│                      Spring Boot Backend Server                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────────┐   ┌────────────┐   ┌────────────┐                        │
│   │    REST    │   │    REST    │   │    API     │                        │
│   │    API     │   │    API     │   │   Layer    │                        │
│   └────────────┘   └────────────┘   └────────────┘                        │
│                                                                              │
│   ✓ User Authentication (Spring Security)                                  │
│   ✓ Member Management (MemberController, MemberService)                    │
│   ✓ Post Management (PostApiController, PostService)                       │
│   ✓ Guestbook Management (GuestbookController, GuestbookService)          │
│   ✓ Business Logic Layer                                                   │
│   ✓ JPA/Hibernate ORM                                                      │
│                                                                              │
│   Port: 8081                                                                │
│   Framework: Spring Boot 4.0.0, Java 17                                    │
│                                                                              │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               │ JDBC/JPA
                               │
┌──────────────────────────────┴──────────────────────────────────────────────┐
│                             DATA LAYER                                       │
│                    PostGIS/PostgreSQL Database                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐                                                           │
│   │  PostgreSQL │                                                           │
│   │   PostGIS   │                                                           │
│   └─────────────┘                                                           │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │  Spatial Data Tables:                                       │          │
│   │  • gis_build_2km (건물 후보지 데이터)                          │          │
│   │  • randompop (인구 분포 데이터)                               │          │
│   │  • node_4km (네트워크 노드)                                   │          │
│   │  • link_4km (네트워크 링크)                                   │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │  Application Tables:                                        │          │
│   │  • member (회원 정보)                                         │          │
│   │  • post (게시글 데이터)                                       │          │
│   │  • guestbook (방명록 데이터)                                 │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │  Spatial Functions:                                         │          │
│   │  • ST_Centroid (중심점 계산)                                 │          │
│   │  • ST_DWithin (거리 기반 검색)                               │          │
│   │  • pgr_dijkstra (최단경로 알고리즘)                          │          │
│   │  • Network Analysis                                          │          │
│   │  • Spatial Indexing                                          │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                                                              │
│   Database: gisgraduation_version2 / ktdb_link                             │
│   Port: 5432                                                                │
│                                                                              │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               │ SQL/ExpoTIS/Queries
                               │
┌──────────────────────────────┴──────────────────────────────────────────────┐
│                      ANALYSIS & OPTIMIZATION LAYER                           │
│                         Python Analysis Engine                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────┐         │
│   │  Genetic Algorithm Optimization                              │         │
│   │  (codefinalgis.py)                                           │         │
│   └──────────────────────────────────────────────────────────────┘         │
│                                                                              │
│   • 건물 후보지 선정 알고리즘                                                 │
│   • Huff Model 기반 수용력 분석                                              │
│   • 네트워크 거리 기반 최적화                                                 │
│   • pgr_dijkstra를 통한 경로 분석                                           │
│   • 유전 알고리즘 (150개 대피소 최적 배치)                                    │
│   • ThreadPoolExecutor (병렬 처리)                                          │
│                                                                              │
│   Libraries:                                                                │
│   • psycopg2 (PostgreSQL Connector)                                        │
│   • concurrent.futures (Parallel Processing)                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      VISUALIZATION & GIS TOOLS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ArcGIS Pro                                                                │
│   • 공간 데이터 시각화                                                        │
│   • 최적 대피소 위치 지도화                                                    │
│   • 분석 결과 시각화                                                          │
│   • 데이터 전처리 및 공간 분석                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW SUMMARY                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. 데이터 수집 → PostGIS/PostgreSQL Database                                │
│     - 건물 데이터, 인구 데이터, 도로 네트워크                                   │
│                                                                              │
│  2. 공간 분석 → Python Genetic Algorithm                                     │
│     - PostGIS 공간 함수 활용 (pgr_dijkstra, ST_DWithin)                      │
│     - 최적 대피소 150개 선정                                                  │
│     - CSV 결과 저장                                                          │
│                                                                              │
│  3. 시각화 → ArcGIS Pro                                                      │
│     - 최적화 결과 지도 시각화                                                  │
│     - 공간 분석 결과 출력                                                      │
│                                                                              │
│  4. 웹 서비스 → Spring Boot + Vue.js                                         │
│     - Spring Boot: REST API 제공, DB 연동                                    │
│     - Vue.js + Cesium: 3D 지도 기반 대피소 위치 표시                          │
│     - 사용자 인증, 게시판, 방명록 기능                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        TECHNOLOGY STACK                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Frontend:   Vue 3.5, Cesium.js, Pinia, Vue Router, Axios, Bootstrap 5     │
│  Backend:    Spring Boot 4.0.0, Spring Security, JPA/Hibernate, Java 17    │
│  Database:   PostgreSQL 13+, PostGIS Extension                              │
│  Analysis:   Python 3.x, psycopg2, Genetic Algorithm                        │
│  GIS Tools:  ArcGIS Pro, Cesium.js                                          │
│  Protocols:  HTTPS, REST API, JDBC                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 시스템 특징

### 3계층 아키텍처 (Three-Tier Architecture)
1. **Presentation Layer**: Vue.js + Cesium.js 기반 3D 지도 시각화
2. **Service Layer**: Spring Boot REST API 서버
3. **Data Layer**: PostGIS/PostgreSQL 공간 데이터베이스

### 핵심 기능
- **공간 데이터 분석**: PostGIS 공간 함수를 활용한 네트워크 분석
- **최적화 알고리즘**: Python 유전 알고리즘으로 150개 최적 대피소 선정
- **3D 시각화**: Cesium.js 기반 3D 지도에서 대피소 위치 표시
- **사용자 관리**: Spring Security 기반 인증/인가
- **게시판/방명록**: 커뮤니티 기능 제공

### 데이터 흐름
ArcGIS Pro → PostgreSQL/PostGIS → Python Analysis → CSV Results →
Spring Boot API → Vue.js Frontend → Cesium 3D Visualization
