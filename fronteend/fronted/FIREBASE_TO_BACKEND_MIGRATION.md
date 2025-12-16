# Firebase → 백엔드 API 마이그레이션 가이드

## 개요

Firebase 인증/Firestore 대신 **Spring Boot 백엔드 + PostgreSQL**을 사용하도록 변경하는 가이드입니다.

---

## ✅ 완료된 작업

### 1. API 모듈 생성

- ✅ `src/api/auth.js` - 인증 API (로그인, 회원가입, 로그아웃)
- ✅ `src/api/suggestions.js` - 건의사항 API
- ✅ `src/api/visitors.js` - 방문객 API

### 2. 환경변수 설정

- ✅ `.env.development` - 개발 환경 (localhost:8080)
- ✅ `.env.production` - 프로덕션 환경

### 3. 로그인 페이지

- ✅ `src/views/LoginBackend.vue` - 백엔드 API 사용 로그인

### 4. 백엔드 API 명세서

- ✅ `BACKEND_API_SPEC.md` - REST API 전체 명세

---

## 🔧 사용 방법

### 1. 백엔드 API 호출 예시

#### 로그인
```javascript
import { login } from '@/api/auth'

const result = await login('user@example.com', 'password123')

if (result.success) {
  // 로그인 성공
  console.log('사용자:', result.user)
  console.log('토큰:', result.token)
} else {
  // 로그인 실패
  console.error(result.message)
}
```

#### 건의사항 작성
```javascript
import { createSuggestion } from '@/api/suggestions'

const result = await createSuggestion({
  title: '천안역 근처 대피소 추가 요청',
  category: 'shelter',
  content: '천안역 근처에 대피소가 부족합니다.',
  priority: 'normal',
  location: {
    lat: 36.8151,
    lon: 127.1139,
    address: '천안시 동남구'
  }
})

if (result.success) {
  alert('건의사항이 등록되었습니다.')
}
```

#### 방문객 등록
```javascript
import { createVisitor } from '@/api/visitors'

const result = await createVisitor({
  name: '김철수',
  age: 11,
  gender: 'male',
  phone: '010-1234-5678',
  address: '천안시 서북구',
  visitPurpose: '대피소 견학'
})

if (result.success) {
  alert('방문객이 등록되었습니다.')
}
```

---

## 🗄️ 백엔드 구현 (Spring Boot)

### 1. 의존성 추가 (build.gradle 또는 pom.xml)

**Gradle:**
```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
    implementation 'io.jsonwebtoken:jjwt-impl:0.11.5'
    implementation 'io.jsonwebtoken:jjwt-jackson:0.11.5'
    implementation 'org.postgresql:postgresql'
}
```

**Maven:**
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
</dependencies>
```

### 2. application.properties

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/shelter_db
spring.datasource.username=postgres
spring.datasource.password=your_password

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# JWT
jwt.secret=your-secret-key-here-must-be-at-least-256-bits
jwt.expiration=86400000

# CORS
spring.web.cors.allowed-origins=http://localhost:5173
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

### 3. Entity 예시 (User.java)

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String username;

    private String phone;

    @Column(length = 20)
    private String role = "user";

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    // Getters and Setters
}
```

### 4. Controller 예시 (AuthController.java)

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = authService.authenticate(request.getEmail(), request.getPassword());

            // JWT 토큰 생성
            String token = jwtUtil.generateToken(user.getEmail());

            // 마지막 로그인 시간 업데이트
            user.setLastLoginAt(LocalDateTime.now());
            authService.updateUser(user);

            LoginResponse response = new LoginResponse();
            response.setSuccess(true);
            response.setToken(token);
            response.setUser(user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "회원가입이 완료되었습니다.");
            response.put("data", user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractUsername(token);

            User user = authService.findByEmail(email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
    }
}
```

### 5. Service 예시 (AuthService.java)

```java
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        if (!user.getIsActive()) {
            throw new RuntimeException("비활성화된 계정입니다.");
        }

        return user;
    }

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUsername(request.getUsername());
        user.setPhone(request.getPhone());
        user.setRole("user");
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    public User updateUser(User user) {
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
}
```

---

## 🔄 기존 코드 변경

### App.vue 수정

**변경 전 (Firebase):**
```javascript
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/index';

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    status.value = user ? '로그아웃' : '로그인'
  })
})
```

**변경 후 (백엔드 API):**
```javascript
import { isAuthenticated } from '@/api/auth';

onMounted(() => {
  status.value = isAuthenticated() ? '로그아웃' : '로그인'
})
```

### router/index.js 수정

**변경 전 (Firebase):**
```javascript
import { auth } from "../firebase/index";

const currentUser = auth.currentUser;
```

**변경 후 (백엔드 API):**
```javascript
import { isAuthenticated, isAdmin } from '@/api/auth';

const authenticated = isAuthenticated();
const admin = isAdmin();
```

---

## 📝 체크리스트

### 프론트엔드 (Vue)
- ✅ API 모듈 생성 완료
- ✅ 환경변수 설정 완료
- ✅ 로그인 페이지 생성 완료
- ⬜ 기존 Firebase 코드를 백엔드 API로 교체
- ⬜ router guard 수정
- ⬜ 전역 상태 관리 (Pinia) 추가 (선택)

### 백엔드 (Spring Boot)
- ⬜ Spring Boot 프로젝트 생성
- ⬜ PostgreSQL 데이터베이스 설정
- ⬜ Entity 클래스 작성
- ⬜ Repository 작성
- ⬜ Service 작성
- ⬜ Controller 작성
- ⬜ JWT 인증 구현
- ⬜ CORS 설정
- ⬜ 테스트

---

## 🚀 테스트 방법

### 1. 백엔드 실행
```bash
cd backend
./gradlew bootRun
```

### 2. 프론트엔드 실행
```bash
cd fronteend/fronted
npm run dev
```

### 3. 로그인 테스트
```
http://localhost:5173/login
```

---

## 📚 참고 자료

- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [Spring Security JWT](https://github.com/jwtk/jjwt)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Vue Axios 사용법](https://axios-http.com/docs/intro)

---

## ❓ FAQ

### Q: Firebase를 완전히 제거해야 하나요?
A: 아니요. Firebase를 남겨두고 백엔드 API를 추가로 사용할 수도 있습니다.

### Q: React 백엔드를 그대로 사용할 수 있나요?
A: 네, REST API는 프론트엔드 기술과 무관합니다. React든 Vue든 동일한 API를 사용할 수 있습니다.

### Q: JWT 토큰은 어디에 저장하나요?
A: `localStorage`에 저장합니다. 더 높은 보안이 필요하면 `httpOnly` 쿠키를 사용하세요.

### Q: CORS 오류가 발생하면?
A: 백엔드의 CORS 설정을 확인하세요. `application.properties`에 프론트엔드 주소를 추가해야 합니다.

---

이 가이드를 참고하여 Firebase → 백엔드 API로 마이그레이션하시면 됩니다! 🎯
