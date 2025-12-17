# Firestore 데이터베이스 구조

## 컬렉션 목록

### 1. users (사용자 정보)

```javascript
{
  uid: "",                            // Firebase Auth UID (문서 ID로 사용)
  email: "",                          // 이메일
  username: "",                       // 사용자 이름
  phone: "",                          // 전화번호
  role: "user",                       // 역할: "user" 또는 "admin"
  profileImage: "",                   // 프로필 이미지 URL
  isActive: true,                     // 계정 활성화 여부
  createdAt: Timestamp,               // 가입일 (2025년 12월 15일 PM 10시 2분 41초 UTC+9)
  updatedAt: Timestamp,               // 수정일 (2025년 12월 15일 PM 10시 3분 5초 UTC+9)
  lastLoginAt: Timestamp              // 마지막 로그인 (2025년 12월 15일 PM 10시 4분 8초 UTC+9)
}
```

**예시 데이터:**
```javascript
{
  uid: "abc123xyz",
  email: "user@example.com",
  username: "홍길동",
  phone: "010-1234-5678",
  role: "user",
  profileImage: "https://example.com/profile.jpg",
  isActive: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  lastLoginAt: Timestamp.now()
}
```

---

### 2. suggestions (건의사항 게시판)

```javascript
{
  id: "",                             // 자동생성 ID (문서 ID)
  title: "대피소 위치 추가 건의",      // 제목
  category: "shelter",                // 카테고리: "shelter", "facility", "system", "etc"
  content: "건의 내용",               // 내용
  authorUid: "",                      // 작성자 UID
  authorName: "작성자 이름",          // 작성자 이름
  authorEmail: "작성자 이메일",       // 작성자 이메일
  status: "pending",                  // 상태: "pending", "processing", "completed", "rejected"
  priority: "normal",                 // 우선순위: "low", "normal", "high", "urgent"
  images: [""],                       // 첨부 이미지 URL 배열
  location: {                         // 위치 정보 (객체)
    lat: 36.8151,
    lon: 127.1139,
    address: "천안시..."
  },
  views: 0,                           // 조회수 (숫자)
  likes: 0,                           // 좋아요 수 (숫자)
  adminResponse: "",                  // 관리자 답변
  respondedBy: "",                    // 답변한 관리자 UID
  respondedAt: Timestamp,             // 답변일
  createdAt: Timestamp,               // 작성일
  updatedAt: Timestamp                // 수정일
}
```

**예시 데이터:**
```javascript
{
  id: "suggestion_001",
  title: "천안역 근처 대피소 추가 요청",
  category: "shelter",
  content: "천안역 근처에 대피소가 부족합니다. 추가 설치를 건의합니다.",
  authorUid: "user123",
  authorName: "김철수",
  authorEmail: "kim@example.com",
  status: "pending",
  priority: "normal",
  images: ["https://example.com/image1.jpg"],
  location: {
    lat: 36.8151,
    lon: 127.1139,
    address: "천안시 동남구 삼룡동"
  },
  views: 15,
  likes: 3,
  adminResponse: "",
  respondedBy: "",
  respondedAt: null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
```

---

### 3. visitors (방문객 정보)

```javascript
{
  id: "",                             // 자동생성 ID (문서 ID)
  name: "이름",                       // 방문객 이름
  age: 11,                            // 나이 (숫자)
  gender: "female",                   // 성별: "male", "female"
  phone: "010-1111-2222",             // 연락처 (문자열)
  address: "천안시",                  // 주소
  visitDate: Timestamp,               // 방문일시 (2025년 12월 15일 PM 10시 10분 45초 UTC+9)
  visitPurpose: "방문목적",           // 방문 목적
  bloodType: "A+",                    // 혈액형 (선택)
  allergies: "없음",                  // 알레르기 정보 (선택)
  emergencyContact: "010-9999-8888",  // 비상 연락처 (선택)
  notes: "",                          // 추가 메모 (선택)
  createdBy: "",                      // 등록자 UID (관리자)
  createdAt: Timestamp,               // 등록일
  updatedAt: Timestamp                // 수정일
}
```

**예시 데이터:**
```javascript
{
  id: "visitor_001",
  name: "이영희",
  age: 11,
  gender: "female",
  phone: "010-1111-2222",
  address: "천안시 서북구 두정동",
  visitDate: Timestamp.now(),
  visitPurpose: "대피소 시설 견학",
  bloodType: "A+",
  allergies: "없음",
  emergencyContact: "010-9999-8888",
  notes: "보호자 동반",
  createdBy: "admin123",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
```

---

## 수정된 필드 정리

### suggestions 컬렉션 수정사항:
- ❌ `authoeEmail` → ✅ `authorEmail` (오타 수정)
- ❌ `adminReponse` → ✅ `adminResponse` (오타 수정)
- ❌ `repondedBy` → ✅ `respondedBy` (오타 수정)
- ✅ `views`: **문자열("")** → **숫자(0)**로 변경
- ✅ `likes`: **문자열("")** → **숫자(0)**로 변경
- ✅ `location`: **문자열** → **객체 { lat, lon, address }**로 변경
- ✅ `createdAt`, `updatedAt`, `respondedAt`: **문자열** → **Timestamp**로 변경

### visitors 컬렉션 수정사항:
- ❌ `viteDate` → ✅ `visitDate` (오타 수정)
- ✅ `phone`: **숫자(111)** → **문자열("010-1111-2222")**로 변경
- ✅ 누락 필드 추가: `bloodType`, `allergies`, `emergencyContact`, `notes`, `createdBy`, `createdAt`, `updatedAt`

---

## Firestore 콘솔에서 설정하기

### 1. 컬렉션 생성 순서

1. **users** 컬렉션 생성
   - 문서 ID: 자동 생성 또는 Firebase Auth UID 사용
   - 위 필드 추가

2. **suggestions** 컬렉션 생성
   - 문서 ID: 자동 생성
   - 위 필드 추가

3. **visitors** 컬렉션 생성
   - 문서 ID: 자동 생성
   - 위 필드 추가

### 2. 인덱스 생성

Firestore Console → Indexes 메뉴에서:

**suggestions 인덱스:**
- `status` (오름차순) + `createdAt` (내림차순)
- `category` (오름차순) + `createdAt` (내림차순)
- `authorUid` (오름차순) + `createdAt` (내림차순)

**visitors 인덱스:**
- `visitDate` (내림차순)
- `createdBy` (오름차순) + `visitDate` (내림차순)

---

## Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 헬퍼 함수
    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.username.matches('.*admin.*');
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // users 컬렉션
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // suggestions 컬렉션
    match /suggestions/{suggestionId} {
      allow read: if true;  // 모두 읽기 가능
      allow create: if isSignedIn();  // 로그인한 사용자만 작성
      allow update: if isOwner(resource.data.authorUid) || isAdmin();
      allow delete: if isOwner(resource.data.authorUid) || isAdmin();
    }

    // visitors 컬렉션
    match /visitors/{visitorId} {
      allow read: if true;  // 모두 읽기 가능
      allow write: if isAdmin();  // 관리자만 쓰기 가능
    }
  }
}
```

---

## 코드에서 사용하는 방법

### Firebase Collection 참조 추가

`src/firebase/index.js` 파일에 컬렉션 참조 추가:

```javascript
export const SUGGESTIONS_COLLECTION = db ? collection(db, "suggestions") : null;
export const VISITORS_COLLECTION = db ? collection(db, "visitors") : null;
```

### 예시: 건의사항 작성

```javascript
import { db } from '@/firebase/index';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function createSuggestion(data) {
  const docRef = await addDoc(collection(db, 'suggestions'), {
    title: data.title,
    category: data.category,
    content: data.content,
    authorUid: auth.currentUser.uid,
    authorName: data.authorName,
    authorEmail: auth.currentUser.email,
    status: 'pending',
    priority: 'normal',
    images: [],
    location: {
      lat: data.lat || null,
      lon: data.lon || null,
      address: data.address || ''
    },
    views: 0,
    likes: 0,
    adminResponse: '',
    respondedBy: '',
    respondedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return docRef.id;
}
```

---

## 주의사항

1. **Timestamp 타입 사용**: `createdAt`, `updatedAt` 등은 반드시 Firebase의 `serverTimestamp()` 사용
2. **숫자 타입**: `views`, `likes`, `age` 등은 문자열이 아닌 숫자로 저장
3. **객체 타입**: `location`은 문자열이 아닌 객체 `{ lat, lon, address }`로 저장
4. **배열 타입**: `images`는 빈 배열 `[]` 또는 URL 문자열 배열
5. **null 처리**: 값이 없을 때는 빈 문자열(`""`)보다 `null` 사용 권장

---

이 구조대로 Firestore를 설정하시면 됩니다! 🎯
