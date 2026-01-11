package com.study.domain.member;
//http 샅애 코드 응답 바디를 직접 제어하기 위해 사용
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//@RestController, @PostMapping, @GetMapping 다양한 어노 태이션 묶기
import java.security.Principal; //스프링 세큐리티에 인증된 사용자의 값만 존재함
//모든 메서드 반환값 json 문자열 그대로 응답
@RestController
@RequestMapping("/api/members")
public class MemberController {
    //의존성 주입하기
    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    /**
     * 회원가입 요청 처리
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody MemberRequest params) {
        // 1. 로그로 데이터 확인 (toString을 오버라이드 했으므로 제대로 찍힙니다)
        System.out.println("프론트 데이터: " + params);

        try {
            // 2. 성별 검증 수정 (Enum이므로 null 체크만 하거나 Enum 상수로 비교)
            if (params.getGender() == null) {
                return ResponseEntity.badRequest().body("성별(M/F)을 선택해주세요.");
            }
        //회원저장 처리
            memberService.saveMember(params);
            return ResponseEntity.ok("회원가입 완료");
        }//아래는 예외처리
        catch (Exception e) {
            e.printStackTrace(); // 에러 원인을 서버 콘솔에 상세히 출력
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("가입 실패: " + e.getMessage());
        }
    }

    /**
     * 현재 로그인 정보 확인
     */
    //get으로 이제 시큐리티로 인증된 사용자면 Principal 객체를 자동 주입
    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        return ResponseEntity.ok(principal.getName());
    }
}