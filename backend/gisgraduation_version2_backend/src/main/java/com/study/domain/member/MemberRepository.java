package com.study.domain.member;
//db에 접근하는 인터페이스 db를 조작을 담당하는 인터페이스
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface MemberRepository extends JpaRepository<Member, Long> {
    //로그인 할때  아이디로  회원을 찾기 위해서 선언
    Optional<Member> findByLoginId(String loginId);
}
