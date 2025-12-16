# 백엔드 API 명세서

## 개요

Firebase 대신 Spring Boot 백엔드를 사용하는 REST API 명세입니다.

**Base URL**: `http://localhost:8080/api`

**인증 방식**: JWT (JSON Web Token)

---

## 1. 인증 API (Authentication)

### 1.1 회원가입

```
POST /api/auth/register
```

**요청 Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "홍길동",
  "phone": "010-1234-5678"
}
```

**응답 (성공):**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "홍길동",
    "role": "user",
    "createdAt": "2025-12-16T10:00:00"
  }
}
```

**응답 (실패):**
```json
{
  "success": false,
  "message": "이미 존재하는 이메일입니다."
}
```

---

### 1.2 로그인

```
POST /api/auth/login
```

**요청 Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답 (성공):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "홍길동",
    "role": "user",
    "profileImage": "",
    "lastLoginAt": "2025-12-16T10:00:00"
  }
}
```

**응답 (실패):**
```json
{
  "success": false,
  "message": "이메일 또는 비밀번호가 올바르지 않습니다."
}
```

---

### 1.3 로그아웃

```
POST /api/auth/logout
```

**요청 Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

---

### 1.4 현재 사용자 정보 조회

```
GET /api/auth/me
```

**요청 Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "홍길동",
  "phone": "010-1234-5678",
  "role": "user",
  "profileImage": "",
  "isActive": true,
  "createdAt": "2025-12-15T22:02:41",
  "updatedAt": "2025-12-15T22:03:05",
  "lastLoginAt": "2025-12-16T10:00:00"
}
```

---

## 2. 건의사항 API (Suggestions)

### 2.1 건의사항 목록 조회

```
GET /api/suggestions?status=pending&category=shelter&page=0&size=10
```

**Query Parameters:**
- `status` (선택): pending, processing, completed, rejected
- `category` (선택): shelter, facility, system, etc
- `page` (선택): 페이지 번호 (default: 0)
- `size` (선택): 페이지 크기 (default: 10)

**응답:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "천안역 근처 대피소 추가 요청",
      "category": "shelter",
      "content": "천안역 근처에 대피소가 부족합니다.",
      "authorUid": "user123",
      "authorName": "김철수",
      "authorEmail": "kim@example.com",
      "status": "pending",
      "priority": "normal",
      "images": ["https://example.com/image1.jpg"],
      "location": {
        "lat": 36.8151,
        "lon": 127.1139,
        "address": "천안시 동남구 삼룡동"
      },
      "views": 15,
      "likes": 3,
      "adminResponse": "",
      "respondedBy": "",
      "respondedAt": null,
      "createdAt": "2025-12-16T09:00:00",
      "updatedAt": "2025-12-16T09:00:00"
    }
  ],
  "totalElements": 25,
  "totalPages": 3,
  "size": 10,
  "number": 0
}
```

---

### 2.2 건의사항 상세 조회

```
GET /api/suggestions/{id}
```

**응답:**
```json
{
  "id": 1,
  "title": "천안역 근처 대피소 추가 요청",
  "category": "shelter",
  "content": "천안역 근처에 대피소가 부족합니다.",
  "authorUid": "user123",
  "authorName": "김철수",
  "authorEmail": "kim@example.com",
  "status": "pending",
  "priority": "normal",
  "images": ["https://example.com/image1.jpg"],
  "location": {
    "lat": 36.8151,
    "lon": 127.1139,
    "address": "천안시 동남구 삼룡동"
  },
  "views": 16,
  "likes": 3,
  "adminResponse": "",
  "respondedBy": "",
  "respondedAt": null,
  "createdAt": "2025-12-16T09:00:00",
  "updatedAt": "2025-12-16T09:00:00"
}
```

---

### 2.3 건의사항 작성

```
POST /api/suggestions
```

**요청 Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**요청 Body:**
```json
{
  "title": "천안역 근처 대피소 추가 요청",
  "category": "shelter",
  "content": "천안역 근처에 대피소가 부족합니다.",
  "priority": "normal",
  "images": ["https://example.com/image1.jpg"],
  "location": {
    "lat": 36.8151,
    "lon": 127.1139,
    "address": "천안시 동남구 삼룡동"
  }
}
```

**응답:**
```json
{
  "success": true,
  "message": "건의사항이 등록되었습니다.",
  "data": {
    "id": 1,
    "title": "천안역 근처 대피소 추가 요청",
    "status": "pending",
    "createdAt": "2025-12-16T10:00:00"
  }
}
```

---

### 2.4 건의사항 수정

```
PUT /api/suggestions/{id}
```

**요청 Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**요청 Body:**
```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "priority": "high"
}
```

**응답:**
```json
{
  "success": true,
  "message": "건의사항이 수정되었습니다.",
  "data": {
    "id": 1,
    "title": "수정된 제목",
    "updatedAt": "2025-12-16T10:30:00"
  }
}
```

---

### 2.5 건의사항 삭제

```
DELETE /api/suggestions/{id}
```

**요청 Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
{
  "success": true,
  "message": "건의사항이 삭제되었습니다."
}
```

---

### 2.6 관리자 답변 등록

```
POST /api/suggestions/{id}/respond
```

**요청 Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**요청 Body:**
```json
{
  "adminResponse": "검토하여 반영하겠습니다."
}
```

**응답:**
```json
{
  "success": true,
  "message": "답변이 등록되었습니다.",
  "data": {
    "id": 1,
    "adminResponse": "검토하여 반영하겠습니다.",
    "respondedBy": "admin_uid",
    "respondedAt": "2025-12-16T11:00:00",
    "status": "completed"
  }
}
```

---

## 3. 방문객 API (Visitors)

### 3.1 방문객 목록 조회

```
GET /api/visitors?page=0&size=10
```

**Query Parameters:**
- `page` (선택): 페이지 번호 (default: 0)
- `size` (선택): 페이지 크기 (default: 10)

**응답:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "이영희",
      "age": 11,
      "gender": "female",
      "phone": "010-1111-2222",
      "address": "천안시 서북구 두정동",
      "visitDate": "2025-12-16T10:10:45",
      "visitPurpose": "대피소 시설 견학",
      "bloodType": "A+",
      "allergies": "없음",
      "emergencyContact": "010-9999-8888",
      "notes": "보호자 동반",
      "createdBy": "admin123",
      "createdAt": "2025-12-16T10:10:45",
      "updatedAt": "2025-12-16T10:10:45"
    }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "size": 10,
  "number": 0
}
```

---

### 3.2 방문객 상세 조회

```
GET /api/visitors/{id}
```

**응답:**
```json
{
  "id": 1,
  "name": "이영희",
  "age": 11,
  "gender": "female",
  "phone": "010-1111-2222",
  "address": "천안시 서북구 두정동",
  "visitDate": "2025-12-16T10:10:45",
  "visitPurpose": "대피소 시설 견학",
  "bloodType": "A+",
  "allergies": "없음",
  "emergencyContact": "010-9999-8888",
  "notes": "보호자 동반",
  "createdBy": "admin123",
  "createdAt": "2025-12-16T10:10:45",
  "updatedAt": "2025-12-16T10:10:45"
}
```

---

### 3.3 방문객 등록

```
POST /api/visitors
```

**요청 Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**요청 Body:**
```json
{
  "name": "이영희",
  "age": 11,
  "gender": "female",
  "phone": "010-1111-2222",
  "address": "천안시 서북구 두정동",
  "visitPurpose": "대피소 시설 견학",
  "bloodType": "A+",
  "allergies": "없음",
  "emergencyContact": "010-9999-8888",
  "notes": "보호자 동반"
}
```

**응답:**
```json
{
  "success": true,
  "message": "방문객이 등록되었습니다.",
  "data": {
    "id": 1,
    "name": "이영희",
    "createdAt": "2025-12-16T10:10:45"
  }
}
```

---

### 3.4 방문객 정보 수정

```
PUT /api/visitors/{id}
```

**요청 Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**요청 Body:**
```json
{
  "name": "이영희",
  "phone": "010-1111-3333",
  "notes": "수정된 메모"
}
```

**응답:**
```json
{
  "success": true,
  "message": "방문객 정보가 수정되었습니다.",
  "data": {
    "id": 1,
    "updatedAt": "2025-12-16T11:00:00"
  }
}
```

---

### 3.5 방문객 정보 삭제

```
DELETE /api/visitors/{id}
```

**요청 Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
{
  "success": true,
  "message": "방문객 정보가 삭제되었습니다."
}
```

---

## 4. 데이터베이스 테이블 스키마 (PostgreSQL)

### 4.1 users 테이블

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user',
    profile_image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);
```

### 4.2 suggestions 테이블

```sql
CREATE TABLE suggestions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    content TEXT NOT NULL,
    author_uid BIGINT REFERENCES users(id),
    author_name VARCHAR(100),
    author_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    images JSONB,
    location JSONB,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    admin_response TEXT,
    responded_by BIGINT REFERENCES users(id),
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 visitors 테이블

```sql
CREATE TABLE visitors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER,
    gender VARCHAR(10),
    phone VARCHAR(20),
    address TEXT,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visit_purpose TEXT,
    blood_type VARCHAR(5),
    allergies TEXT,
    emergency_contact VARCHAR(20),
    notes TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. 에러 응답 형식

모든 API 에러는 다음 형식을 따릅니다:

```json
{
  "success": false,
  "message": "에러 메시지",
  "errorCode": "ERROR_CODE",
  "timestamp": "2025-12-16T10:00:00"
}
```

**HTTP 상태 코드:**
- `200 OK`: 성공
- `201 Created`: 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

---

## 6. Spring Boot Controller 예시

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "회원가입이 완료되었습니다.",
                "data", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
```

---

이 명세서를 참고하여 백엔드 API를 구현하시면 됩니다! 🚀
