import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated, isAdmin } from "@/api/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/login.vue"),
      meta: { isAuthRoute: true },
    },
    {
      path: "/signup",
      name: "signup",
      // 이미지 확인 결과: sginup.vue (오타 상태 그대로 연결)
      component: () => import("../views/signup.vue"),
      meta: { isAuthRoute: true },
    },
    {
      path: "/forgotid",
      name: "forgotid",
      component: () => import("../views/forgotid.vue"),
      meta: { isAuthRoute: true },
    },
    {
      path: "/forgotpassword",
      name: "forgotpassword",
      component: () => import("../views/forgotpassword.vue"),
      meta: { isAuthRoute: true },
    },
    {
      path: "/FindId",
      name: "FindId",
      component: () => import("../views/FindId.vue"),
      meta: { isAuthRoute: true },
    },
    {
      path: "/FindPassword",
      name: "FindPassword",
      component: () => import("../views/FindPassword.vue"),
      meta: { isAuthRoute: true },
    },
    // --- 사용자 서비스 ---
    {
      path: "/mypage",
      name: "mypage",
      component: () => import("../views/mypage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/aichat",
      name: "aichat",
      component: () => import("../views/aichat.vue"),
    },
    {
      path: "/GISAnalysis",
      name: "GISAnalysis",
      component: () => import("../views/GISAnalysis.vue"),
    },
    {
      path: "/userboard",
      name: "userboard",
      component: () => import("../views/UserBoardView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/userboard/write",
      name: "userboard-write",
      component: () => import("../views/PostWriteView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/userboard/edit/:id",
      name: "userboard-edit",
      component: () => import("../views/PostWriteView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/userboard/:id",
      name: "userboard-detail",
      component: () => import("../views/PostDetailView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/UserGuestbook",
      name: "UserGuestbook",
      component: () => import("../views/UserGuestbook.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/guestbook",
      name: "guestbook",
      component: () => import("../views/GuestbookView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/MyKids",
      name: "MyKids",
      component: () => import("../views/MyKids.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// 🔐 전역 라우터 가드
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

  if (requiresAuth && !isAuthenticated()) {
    alert("로그인이 필요합니다.");
    return next("/login");
  }

  if (requiresAdmin) {
    if (!isAuthenticated()) {
      alert("관리자 페이지입니다. 로그인 후 이용해주세요.");
      return next("/login");
    }
    if (!isAdmin()) {
      alert("관리자만 접근할 수 있는 페이지입니다.");
      return next("/");
    }
  }
  return next();
});

export default router;