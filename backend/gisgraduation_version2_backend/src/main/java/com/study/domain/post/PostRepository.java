package com.study.domain.post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
// extends JpaRepository 상속받으면 스프링 부트의 기본적인 삭제 저장 조회 코들 자동으로 만들어줌
public interface PostRepository extends JpaRepository<Post, Long> {
    //삭제되지 않은 게시글만 조회하는 기능 (추가)
    List<Post> findAllByDeleteYnFalse();
    //특정 작성자의 글만 조회 기능(추가)
    List<Post> findAllByWriterId(Long writerId);
}
