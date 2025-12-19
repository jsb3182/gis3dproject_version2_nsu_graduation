<template>
  <div id="app" class="d-flex flex-column min-vh-100" :class="{ 'admin-full-width': isAdminRoute }">
    <!-- ===============================
         📌 Header (상단 고정 네비게이션)
         =============================== -->
    <header v-if="!isAdminRoute" class="navbar navbar-light bg-white shadow-sm fixed-top">
      <div class="container d-flex align-items-center justify-content-between">
        <!-- 좌측: 로고 + 홈 버튼 -->
        <div class="d-flex align-items-center">
          <button @click="goToHome" class="btn btn-link p-0 border-0">
            <img src="@/assets/nsu2.svg" alt="logo" class="me-2"
              style="width:50px;height:50px;vertical-align:middle;" />
          </button>
          <span class="fw-bold fs-5 text-dark">남서울 대학교 캡스톤 디자인</span>
        </div>

        <!-- 우측: 마이페이지 버튼 (햄버거 메뉴 아이콘) -->
        <button @click="logAction" class="btn text-bold"
          :class="{ 'btn-light': status === '로그아웃', 'btn-primary': status === '로그인' }">
          <span>{{ status }}</span>
        </button>
      </div>
    </header>


    <!-- 👇 관리자용 헤더 -->
    <header v-else class="navbar navbar-light bg-white shadow-sm fixed-top">
      <div class="d-flex align-items-center justify-content-between w-100 px-4">
        <!-- 좌측: 로고 + 텍스트 -->
        <div class="d-flex align-items-center" style="cursor: pointer;" @click="goToAdminHome">
          <img src="@/assets/kid_logo.png" alt="logo" class="me-2"
            style="width:50px;height:50px;vertical-align:middle;" />
          <span class="fw-bold fs-5 text-dark">아이119 관리자</span>
        </div>

        <!-- 우측: 로그인/로그아웃 버튼 (같은 로직 재사용) -->
        <button @click="logAction" class="btn text-bold"
          :class="{ 'btn-light': status === '로그아웃', 'btn-primary': status === '로그인' }">
          <span>{{ status }}</span>
        </button>
      </div>
    </header>


    <aside v-if="isAdminRoute" class="admin-aside bg-light border-end shadow-sm p-3">
      <h5 class="fw-bold mb-4 text-center">관리자 메뉴</h5>

      <ul class="nav flex-column text-bold">
        <li class="nav-item mb-2">
          <button class="nav-link btn-aside text-start w-100 d-flex align-items-center gap-2"
            :class="{ 'text-bold text-primary': isActive('/AdminHome') }" @click="goTo('/AdminHome')"
            style="color: black;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="m16 2l5 5v14.008a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 21.008V2.992C3 2.444 3.445 2 3.993 2zm-4 9.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5M7.527 17h8.946a4.5 4.5 0 0 0-8.946 0" />
            </svg>
            사용자 정보
          </button>
        </li>

        <li class="nav-item mb-2">
          <button class="nav-link btn-aside text-start w-100 d-flex align-items-center gap-2"
            :class="{ 'text-bold text-primary': isActive('/AdminManageContents') }"
            @click="goTo('/AdminManageContents')" style="color: black;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 64 64">
              <path fill="currentColor"
                d="M27.83 32.711v-.01c.605-.236 1.004-.757 1.004-1.741c0-1.401-.911-2.036-2.304-2.036c-.666 0-1.269.02-1.916.092v6.786h1.322V33.12h.686c.174 0 .215.092.266.286l.627 2.395h1.381l-.83-2.774c-.041-.172-.092-.275-.236-.316m-1.157-.646h-.737v-2.067q.324-.03.644-.031c.79 0 .953.471.953 1.074c0 .717-.255 1.024-.86 1.024m10.253.749h1.795v-1.096h-1.795v-1.637h1.99v-1.106h-3.309v6.827h3.39v-1.076h-2.071zm-26.44 0h1.793v-1.096h-1.793v-1.637h1.987v-1.106H9.165v6.827h3.391v-1.076h-2.069zm10.972 0h1.795v-1.096h-1.795v-1.637h1.989v-1.106h-3.309v6.827h3.39v-1.076h-2.07zm-5.235-1.25l-1.342-2.589h-1.239v6.827h1.291v-4.411l1.291 2.589l1.28-2.599h.041v4.421h1.239v-6.827h-1.239zm16.116 1.545h.93v.245c0 .708-.102 1.506-.982 1.506c-1.147 0-1.177-1.627-1.177-2.466c0-.831.083-2.406 1.219-2.406c.532 0 .788.296 1.084.664l.728-.973c-.524-.52-1.066-.819-1.793-.819c-1.935 0-2.623 1.843-2.623 3.541c0 1.68.626 3.512 2.521 3.512c1.852 0 2.222-1.608 2.222-3.092v-.797h-2.13zm20.1 2.693h1.312v-2.61l1.731-4.218h-1.343l-1.034 3.111l-1.035-3.111h-1.414l1.784 4.289zm-12.355 0h1.291v-4.216h.031l2.192 4.216h1.157v-6.827h-1.28v4.042h-.019l-2.091-4.043h-1.28z" />
              <path fill="currentColor"
                d="M55.653.826H8.298C4.232.826.425 4.641.425 8.706v47.342c0 4.067 3.822 7.901 7.89 7.901h47.34c4.066 0 7.895-3.814 7.895-7.88V8.712c0-4.065-3.829-7.885-7.897-7.885zm1.611 39.984h-16.85v16.833H23.565V40.81H6.71V23.965h16.855V7.132h16.849v16.833h16.85z" />
              <path fill="currentColor"
                d="M48.464 35.914c.839.001 1.495-.389 1.947-.942l-.676-.963c-.338.45-.643.788-1.199.788c-1.065 0-1.251-1.483-1.251-2.404c0-1.229.287-2.406 1.221-2.406c.503 0 .78.337 1.075.789l.79-.933c-.525-.623-1.047-.983-1.845-.983c-1.895 0-2.623 1.781-2.623 3.533c0 1.853.676 3.521 2.561 3.521" />
            </svg>
            응급처치 콘텐츠 관리
          </button>
        </li>

        <li class="nav-item mb-2">
          <button class="nav-link btn-aside text-start w-100 text-bold d-flex align-items-center gap-2"
            :class="{ 'text-bold text-primary': isActive('/AdminAutomation') }" @click="goTo('/AdminAutomation')"
            style="color: black;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1">
                <animate id="SVG7WybndBt" fill="freeze" attributeName="x" begin="0;SVGo3aOUHlJ.end" dur="0.2s"
                  values="1;13" />
                <animate id="SVGVoKldbWM" fill="freeze" attributeName="y" begin="SVGFpk9ncYc.end" dur="0.2s"
                  values="1;13" />
                <animate id="SVGKsXgPbui" fill="freeze" attributeName="x" begin="SVGaI8owdNK.end" dur="0.2s"
                  values="13;1" />
                <animate id="SVG7JzAfdGT" fill="freeze" attributeName="y" begin="SVG28A4To9L.end" dur="0.2s"
                  values="13;1" />
              </rect>
              <rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1">
                <animate id="SVGUiS2jeZq" fill="freeze" attributeName="y" begin="SVG7WybndBt.end" dur="0.2s"
                  values="13;1" />
                <animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s"
                  values="1;13" />
                <animate id="SVGOIboFeLf" fill="freeze" attributeName="y" begin="SVGKsXgPbui.end" dur="0.2s"
                  values="1;13" />
                <animate id="SVG14lAaeuv" fill="freeze" attributeName="x" begin="SVG7JzAfdGT.end" dur="0.2s"
                  values="13;1" />
              </rect>
              <rect width="10" height="10" x="13" y="13" fill="currentColor" rx="1">
                <animate id="SVGFpk9ncYc" fill="freeze" attributeName="x" begin="SVGUiS2jeZq.end" dur="0.2s"
                  values="13;1" />
                <animate id="SVGaI8owdNK" fill="freeze" attributeName="y" begin="SVGU0vu2GEM.end" dur="0.2s"
                  values="13;1" />
                <animate id="SVG28A4To9L" fill="freeze" attributeName="x" begin="SVGOIboFeLf.end" dur="0.2s"
                  values="1;13" />
                <animate id="SVGo3aOUHlJ" fill="freeze" attributeName="y" begin="SVG14lAaeuv.end" dur="0.2s"
                  values="1;13" />
              </rect>
            </svg>
            자동화 로그
          </button>
        </li>

        <li class="nav-item mb-2">
          <button class="nav-link btn-aside text-start w-100 d-flex align-items-center gap-2"
            :class="{ 'text-bold text-primary': isActive('/AdminFeedback') }" @click="goTo('/AdminFeedback')"
            style="color: black;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 12 12">
              <path fill="currentColor"
                d="M.75 0h10.5c.412 0 .75.338.75.75v7.47c0 .412-.338.75-.75.75H5.655l-2.768 2.768a.371.371 0 0 1-.637-.263V8.97H.75A.75.75 0 0 1 0 8.22V.75C0 .338.338 0 .75 0M3 5.5a1 1 0 1 0 0-2a1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2a1 1 0 0 0 0 2m4-1a1 1 0 1 0-2 0a1 1 0 0 0 2 0" />
            </svg>
            건의사항
          </button>
        </li>
      </ul>
    </aside>

    <!-- ===============================
         🧭 Main (헤더/푸터 사이 컨텐츠 영역)
         =============================== -->
    <main id="main" class="flex-grow-1">
      <!-- RouterView는 각 페이지(View) 컴포넌트를 표시 -->
      <!-- 관리자 페이지는 전체 너비, 일반 페이지는 container 적용 -->
      <div :class="isAdminRoute ? 'w-100 px-0' : 'container py-3'">
        <RouterView />
      </div>
    </main>

    <!-- ===============================
         🦶 Footer (하단 고정 네비게이션)
         =============================== -->
    <nav v-if="!isAdminRoute" class="navbar bg-white border-top fixed-bottom">
      <ul class="nav nav-fill w-100 align-items-stretch  m-0 flex-nowrap">
        <!-- 각 버튼은 라우터 경로에 따라 아이콘/페이지 전환 -->
        <li class="nav-item">
          <button @click="goToHome"
            class="nav-link d-flex flex-column align-items-center justify-content-center py-2 text-gray"
            :class="{ 'bg-light': $route.path === '/' }">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3L4 9v12h16V9zm-2 7h4v9h-4zm6 0h2v3h-2zm-.67-2H8.67L12 5.5zM8 10v3H6v-3zm-2 5h2v4H6zm10 4v-4h2v4z"/></svg>
            <small class="mt-1 text-nowrap text-medium">주변 대피소</small>
          </button>
        </li>

        <li class="nav-item border-start">
          <button @click="hospitalinformation"
            class="nav-link d-flex flex-column align-items-center justify-content-center py-2 text-gray"
            :class="{ 'bg-light': $route.path === '/hospitalInformationApp' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" aria-label="공간분석">
  <!-- Grid -->
  <path fill="currentColor" d="M4 4h16v16H4z" opacity=".15"/>
  <path fill="currentColor" d="M4 4h16v2H4zm0 5h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" opacity=".35"/>
  <path fill="currentColor" d="M4 4h2v16H4zm5 0h2v16H9zm5 0h2v16h-2zm5 0h2v16h-2z" opacity=".25"/>

  <!-- Buffer circle (더 뒤로 보이게) -->
  <path fill="currentColor" d="M16 14a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9" opacity=".08"/>

  <!-- Pin (앞으로 강조) -->
  <path
    d="M16 13.8c-1.8 0-3.2 1.46-3.2 3.25c0 2.45 3.2 5.75 3.2 5.75s3.2-3.3 3.2-5.75c0-1.79-1.4-3.25-3.2-3.25m0 4.5a1.3 1.3 0 1 1 0-2.6a1.3 1.3 0 0 1 0 2.6z"
    fill="currentColor"
    stroke="#ffffff"
    stroke-width="1.2"
  />
</svg>

            <small class="mt-1 text-nowrap text-medium">공간분석</small>
          </button>
        </li>

        <li class="nav-item border-start">
          <button @click="aichat"
            class="nav-link d-flex flex-column align-items-center justify-content-center py-2 text-gray"
            :class="{ 'bg-light': $route.path === '/aichat' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M19 8h1v1h-1zm1-3h-1v2h1V6h.5c.28 0 .5-.22.5-.5v-2c0-.28-.22-.5-.5-.5H18v1h2zm-3-2h-1v4h1zm-3.5 12.5a2 2 0 1 0 4 0c0-1.11-.89-2-2-2s-2 .9-2 2M17 8h-1v1h1zm5 6h-1c0-1.5-.47-2.87-1.26-4h-2.77c1.22.91 2.03 2.36 2.03 4v2h2v1h-2v3H5v-3H3v-1h2v-2c0-2.76 2.24-5 5-5h4c.34 0 .68.04 1 .1V7.08c-.33-.05-.66-.08-1-.08h-1V5.73A2 2 0 1 0 10 4c0 .74.4 1.39 1 1.73V7h-1c-3.87 0-7 3.13-7 7H2c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h1v1a2 2 0 0 0 2 2h14c1.11 0 2-.89 2-2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1m-13.5-.5c-1.1 0-2 .9-2 2s.9 2 2 2s2-.89 2-2s-.89-2-2-2" />
            </svg>
            <small class="mt-1 text-nowrap text-medium">AI 챗봇</small>
          </button>
        </li>

        <li class="nav-item border-start">
          <button @click="emergency"
            class="nav-link d-flex flex-column align-items-center justify-content-center py-2 text-gray"
            :class="{ 'bg-light': $route.path === '/emergency' }">
           <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="currentColor" d="M12.04 2.5L9.53 5h5zM4 7v13h16V7zm8-7l5 5h3a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3zM7 18v-4h5v4zm7-1v-7h4v7zm-8-5V9h5v3z"/></svg>
            <small class="mt-1 text-nowrap text-medium">사용자 게시판</small>
          </button>
        </li>

        <li class="nav-item border-start">
          <button @click="MyKids"
            class="nav-link d-flex flex-column align-items-center justify-content-center py-2 text-gray"
            :class="{ 'bg-light': $route.path === '/MyKids' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M13.07 10.41a5 5 0 0 0 0-5.82A3.4 3.4 0 0 1 15 4a3.5 3.5 0 0 1 0 7a3.4 3.4 0 0 1-1.93-.59M5.5 7.5A3.5 3.5 0 1 1 9 11a3.5 3.5 0 0 1-3.5-3.5m2 0A1.5 1.5 0 1 0 9 6a1.5 1.5 0 0 0-1.5 1.5M16 17v2H2v-2s0-4 7-4s7 4 7 4m-2 0c-.14-.78-1.33-2-5-2s-4.93 1.31-5 2m11.95-4A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4Z" />
            </svg>
            <small class="mt-1 text-nowrap text-medium">방문록</small>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router'
export default {
  name: 'App',
  components: { RouterView },

  computed: {
    isAdminRoute() {
      return this.$route.path.startsWith('/Admin')
    }
  },

  methods: {
    mypage() { this.$router.push('/mypage') },
    hospitalinformation() { this.$router.push('/GISAnalysis') },
    aichat() { this.$router.push('/aichat') },
    emergency() { this.$router.push('/Userboard') },
    MyKids() { this.$router.push('/UserGuestbook') },
    goToHome() { this.$router.push('/') },
    goToLogin() { this.$router.push('/login') },
    goToAdminHome() { this.$router.push('/AdminHome') },

    goTo(path) {
      this.$router.push(path)
    },

    isActive(path) {
      return this.$route.path === path
    },

    async logout() {
      try {
        await signOut(auth)
        alert('로그아웃 되었습니다.')
        this.$router.push('/login')
      } catch (err) {
        console.error('로그아웃 중 오류 발생:', err)
      }
    },

    logAction() {
      if (this.status === '로그인') this.goToLogin()
      else this.logout()
    }
  },

  setup() {
    const status = ref('로그인')

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        status.value = user ? '로그아웃' : '로그인'
      })
    })

    return { status }
  }
}


</script>

<style>
/* ✅ 부트스트랩 및 아이콘 불러오기 */
@import "bootstrap/dist/css/bootstrap.min.css";
@import "bootstrap-icons/font/bootstrap-icons.css";

.admin-full-width {
  max-width: 100% !important;
}

.admin-full-width header .container,
.admin-full-width main>div {
  max-width: 100% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.admin-aside {
  width: 240px;
  position: fixed;
  top: 10px;
  left: 0;
  bottom: 0;
  padding-top: 72px;
  /* 상단 네비(고정 헤더)가 있으면 높이 맞춤. 없으면 0으로 바꿔도 됨 */
  z-index: 200;
}

.btn-aside {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.75rem;
  border: none;
  background: transparent;
  color: #333;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.12s, color 0.12s, transform 0.12s;
}

/* hover */
.btn-aside:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
}

/* active */
.btn-aside.active {
  background-color: #0d6efd;
  color: #fff;
  box-shadow: 0 1px 3px rgba(13, 110, 253, 0.12);
}

@font-face {
  font-family: 'Pretendard';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Light.woff2') format('woff2');
  font-weight: 300;
  font-display: swap;
}


@font-face {
  font-family: 'Pretendard';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Medium.woff2') format('woff2');
  font-weight: 500;
  font-display: swap;
}


@font-face {
  font-family: 'Pretendard';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}


.text-plight {
  font-family: 'Pretendard';
  font-weight: 300;
}

.text-medium {
  font-family: 'Pretendard';
  font-weight: 500;
}

.text-bold {
  font-family: 'Pretendard';
  font-weight: 700;
}

.text-gray {
  color: #00000090 !important;
}

.nav-link.bg-light {
  color: #0D6EFD !important;
}

.btn {
  font-family: 'Pretendard' !important;
  font-weight: 500 !important;
}

.btn-primary {
  background-color: #0D6EFD;
  color: #ffff;

}

.btn-gray {
  background-color: #00000090;
  color: #ffff;
}

.badge {
  font-family: 'Pretendard' !important;
  font-weight: 500 !important;
}

/* ✅ 헤더/푸터 높이 지정 (화면 계산용) */
:root {
  --header-h: 64px;
  --footer-h: 56px;
}

/* ✅ 전체 화면 높이 확보 (모바일 대응 포함) */
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* ✅ 메인 콘텐츠 영역
   - 헤더/푸터 높이만큼 패딩을 주어 겹침 방지
   - 남은 높이를 계산하여 스크롤 영역 확보 */
#main {
  min-height: calc(100dvh - var(--header-h) - var(--footer-h));
  /* 남는 세로공간 계산 */
  padding-top: var(--header-h);
  /* 헤더에 가리지 않게 */
}

/* ✅ 헤더가 항상 다른 요소보다 위에 표시되도록 z-index 지정 */
header.navbar.fixed-top {
  z-index: 1030;
}
</style>
