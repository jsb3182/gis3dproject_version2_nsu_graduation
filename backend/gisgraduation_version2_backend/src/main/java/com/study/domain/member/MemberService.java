package com.study.domain.member;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    // 생성자 주입
    public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Long saveMember(MemberRequest params) {
        // 1. 비밀번호 암호화 (보안상 매우 중요!)
        String encodedPassword = passwordEncoder.encode(params.getPassword());

        // 2. 엔티티 생성
        Member member = new Member(
                params.getLoginId(),
                encodedPassword,
                params.getName(),
                params.getGender(),
                params.getBirthday()
        );

        // 3. DB 저장
        return memberRepository.save(member).getId();
    }
}