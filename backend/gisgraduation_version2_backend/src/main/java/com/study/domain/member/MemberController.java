package com.study.domain.member;
import org.springframework.web.bind.annotation.*;
//웹 요청을 받는 컨트롤러
@RestController
@RequestMapping("/api/members")
public class MemberController {
    private final MemberService memberService;
    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }
    //회원가입 요청 받기
    @PostMapping("/signup")
    public String signup(@RequestBody MemberRequest params) {
        memberService.saveMember(params);
        return "회원가입이 완료되었습니다";
    }

}
