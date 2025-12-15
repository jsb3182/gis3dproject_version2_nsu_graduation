import { createRouter, createWebHistory } from "vue-router";
//import HomeView from '../views/HomeView.vue'
import { auth,db } from "../firebase/index";
import { doc, getDoc } from "firebase/firestore";  // ✅ Firestore에서 유저정보 읽기

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeViewApp.vue"),
    },
    {
      path: "/mypage",
      name: "mypage",
      component: () => import("../views/mypage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/login.vue"),
    },
    {
      path: "/aichat",
      name: "aichat",
      component: () => import("../views/aichat.vue"),
    },
    {
      path: "/emergencyorder/:id",
      name: "emergencyorder",
      component: () => import("../views/emergencyorder.vue"),
    },
    {
      path: "/forgotid",
      name: "forgotid",
      component: () => import("../views/forgotid.vue"),
    },
    {
      path: "/forgotpassword",
      name: "forgotpassword",
      component: () => import("../views/forgotpassword.vue"),
    },
    {
      path: "/sginup",
      name: "sginup",
      component: () => import("../views/sginup.vue"),
    },
    {
      path: "/MyKids",
      name: "MyKids",
      component: () => import("../views/MyKids.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/AddKid",
      name: "AddKid",
      component: () => import("../views/AddKid.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/kidinformationedit/:id",
      name: "kidinformationedit",
      component: () => import("../views/kidinformationedit.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/hospitalinformation",
      name: "hospitalinformation",
      component: () => import("../views/hospitalinformation.vue"),
    },
    {
      path: "/emergency",
      name: "emergency",
      component: () => import("../views/emergency.vue"),
    },
    {
      path: "/FindId",
      name: "FindId",
      component: () => import("../views/FindId.vue"),
    },
    {
      path: "/FindPassword",
      name: "FindPassword",
      component: () => import("../views/FindPassword.vue"),
    },
    {
      path: "/hospitalDetail",
      name: "hospitalDetail",
      component: () => import("../views/hospitalDetail.vue"),
    },
    {
      path: "/emergencyDetail/:hpid",
      name: "emergencyDetail",
      component: () => import("../views/emergencyDetail.vue"),
      props: true,
    },
    {
      path: "/emergencyDetailApp/:hpid",
      name: "emergencyDetailApp",
      component: () => import("../views/emergencyDetailApp.vue"),
      props: true,
    },
    {
      path: "/test",
      name: "test",
      component: () => import("../views/test.vue"),
    },

    {
      path: "/HomeViewTest",
      name: "HomeViewTest",
      component: () => import("../views/HomeViewTest.vue"),
    },
    // app 버전 라우팅 ----------------

    {
      path: "/emergencyYH",
      name: "emergencyYH",
      component: () => import("../views/emergencyYH.vue"),
    },
    {
      path: "/hospitalInformationApp",
      name: "hospitalInformationApp",
      component: () => import("../views/hospitalInformationApp.vue"),
    },
    {
      path: "/hospitalInformationCesium",
      name: "hospitalInformationCesium",
      component: () => import("../views/hospitalInformationCesium.vue"),
    },
     {
      path: "/AdminEmergencyWrite",
      name: "AdminEmergencyWrite",
      component: () => import("../views/AdminEmergencyWrite.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },   // ✅ 관리자만 접근 가능
    },
    {
      path: "/AdminEmergencyEdit/:id",
      name: "AdminEmergencyEdit",
      component: () => import("../views/AdminEmergencyEdit.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },  // ✅ 관리자만 접근 가능
    },
    {
      path: "/emergencyadd",
      name: "emergencyadd",
      component: () => import("../views/emergencyadd.vue"),
    },
    {
      path: "/AdminHome",
      name: "AdminHome",
      component: () => import("../views/AdminHome.vue"),
       meta: { requiresAuth: true, requiresAdmin: true },   // 관리자만 접근 가능
    },
    {
      path: "/AdminUserEdit/:uid",
      name: "AdminUserEdit",
      component: () => import("../views/AdminUserEdit.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },   // ✅ 관리자만 접근 가능
    },
    {
      path: "/emergencysuggestions", //사용자 제안 폼 화면
      name: "emergencysuggestions",
      component: () => import("../views/emergencysuggestions.vue"),
    },
    {
      path: "/AdminHomejsb", //성범 연습장
      name: "AdminHomejsb",
      component: () => import("../views/AdminHomejsb.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },   // ✅ 관리자만 접근 가능
    },
    {
      path: "/AdminEmergencysuggestionsdetail/:id", //응급제안사항 상세화면 페이지
      name: "AdminEmergencysuggestionsdetail",
      component: () => import("../views/AdminEmergencysuggestionsdetail.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },   // ✅ 추가
    },
    {
      path: "/hospitalInformationDetail/:hpid", //병의원 디테일뷰
      name: "hospitalInformationDetail",
      component: () => import("../views/hospitalInformationDetail.vue"),
      props: true
    },
    {
      path: "/AdminEmergency", 
      name: "AdminEmergency",
      component: () => import("../views/AdminEmergency.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },   // ✅ 추가
    },
     {
      path: "/AdminEmergencyorder/:id", //파라미터 아이디 추가
      name: "AdminEmergencyorder",
      component: () => import("../views/AdminEmergencyorder.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },   // ✅ 추가
      
    },
    {
      path: "/AdminManageUser",
      name: "AdminManageUser",
      component: () => import("../views/AdminManageUser.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/AdminManageContents",
      name: "AdminManageContents",
      component: () => import("../views/AdminManageContents.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/AdminAutomation",
      name: "AdminAutomation",
      component: () => import("../views/AdminAutomation.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/AdminFeedback",
      name: "AdminFeedback",
      component: () => import("../views/AdminFeedback.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

// ✅ 관리자 여부 확인 함수 (username에 'admin' 포함인지 확인)
async function isAdminUser(firebaseUser) {
  if (!firebaseUser) return false;

  try {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) return false;

    const data = userDoc.data();
    const username = data.username || "";

    // Firestore rules에서처럼 username에 'admin' 포함 여부로 판단
    return username.includes("admin");
  } catch (e) {
    console.error("관리자 권한 확인 중 오류:", e);
    return false;
  }
}

// 🔐 전역 라우터 가드
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

  const currentUser = auth.currentUser;

  // 1) 로그인 필수인데 로그인 안 되어 있을 때
  if (requiresAuth && !currentUser) {
    alert("로그인이 필요합니다.");
    return next("/login");
  }

  // 2) 관리자 전용 페이지 접근 시
  if (requiresAdmin) {
    // 로그인은 되어 있겠지만 혹시 모르니 한 번 더
    if (!currentUser) {
      alert("관리자 페이지입니다. 로그인 후 이용해주세요.");
      return next("/login");
    }

    const admin = await isAdminUser(currentUser);

    if (!admin) {
      alert("관리자만 접근할 수 있는 페이지입니다.");
      return next("/"); // 일반 홈으로 돌려보내기
    }
  }

  // 3) 문제 없으면 통과
  return next();
});

export default router;