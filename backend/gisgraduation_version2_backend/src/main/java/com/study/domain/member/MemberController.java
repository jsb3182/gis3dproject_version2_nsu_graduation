package com.study.domain.member;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/members")
public class MemberController {

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

            memberService.saveMember(params);
            return ResponseEntity.ok("회원가입 완료");
        } catch (Exception e) {
            e.printStackTrace(); // 에러 원인을 서버 콘솔에 상세히 출력
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("가입 실패: " + e.getMessage());
        }
    }

    /**
     * 현재 로그인 정보 확인
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        return ResponseEntity.ok(principal.getName());
    }
}