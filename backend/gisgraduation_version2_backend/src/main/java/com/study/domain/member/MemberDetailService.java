package com.study.domain.member;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MemberDetailService implements UserDetailsService {

    private final MemberRepository memberRepository;

    public MemberDetailService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    // 사용자가 로그인 폼에 입력한 ID(username)를 받아서 회원 조회
    @Override
    //사용자가 로그인 폼에 입력한 Id를 매개변수로 받음
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        //db 에서 해당 아읻를 가진 회원을 찾음
        Member member = memberRepository.findByLoginId(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("존재하지 않는 사용자입니다: " + username)
                );
        //찾은 회원정보를 시큐리티를 객체로 반환함
        return new MemberDetails(member);
    }
}
