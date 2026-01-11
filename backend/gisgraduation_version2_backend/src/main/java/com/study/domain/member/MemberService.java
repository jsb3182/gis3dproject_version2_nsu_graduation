package com.study.domain.member;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
//비즈니스 로직 담당 스프링이 빈으로 관리함
@Service
public class MemberService {
    //의존성 맴버변수 MemberRepository는 데이터베이스 접근 담당
    //PasswordEncoder 비밀번호 암호화 전용객체
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    // 생성자 주입
    public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }
    //트렌잭션처리 이메서드 안의 데이터 베이서 작업으 ㄹ하나의 트랜잭션으로 묶음
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