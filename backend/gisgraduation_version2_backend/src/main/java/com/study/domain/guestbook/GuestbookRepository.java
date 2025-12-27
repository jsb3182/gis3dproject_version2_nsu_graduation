package com.study.domain.guestbook;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface GuestbookRepository extends JpaRepository<Guestbook, Long> {
    //특정 사용자의 방문록 리스트 조회 (삭제되지 않은 것만 최신순)
    List<Guestbook> findAllByTargetIdAndDeleteYnFalseOrderByCreatedDateDesc(Long targetId);
}
