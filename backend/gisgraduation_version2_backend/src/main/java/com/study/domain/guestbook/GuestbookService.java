package com.study.domain.guestbook;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GuestbookService {
    private final GuestbookRepository guestbookRepository;

    public GuestbookService(GuestbookRepository guestbookRepository) {
        this.guestbookRepository = guestbookRepository;
    }

    /**
     * 방명록 작성
     */
    @Transactional
    public Long saveGuestbook(GuestbookRequest params) {
        Guestbook guestbook = new Guestbook(params.getTargetId(), params.getWriterId(), params.getContent());
        return guestbookRepository.save(guestbook).getId();
    }

    /**
     * 특정 사용자의 방명록 조회
     */
    public List<Guestbook> findGuestbooksByTarget(Long targetId) {
        return guestbookRepository.findAllByTargetIdAndDeleteYnFalseOrderByCreatedDateDesc(targetId);
    }

    /**
     * 방명록 수정
     */
    @Transactional
    public void updateGuestbook(Long entryId, String content) {
        Guestbook guestbook = guestbookRepository.findById(entryId)
                .orElseThrow(() -> new IllegalArgumentException("방명록을 찾을 수 없습니다."));

        guestbook.setContent(content);
        guestbook.setModifiedDate(LocalDateTime.now());
        guestbookRepository.save(guestbook);
    }

    /**
     * 방명록 삭제 (논리 삭제)
     */
    @Transactional
    public void deleteGuestbook(Long entryId) {
        Guestbook guestbook = guestbookRepository.findById(entryId)
                .orElseThrow(() -> new IllegalArgumentException("방명록을 찾을 수 없습니다."));

        guestbook.setDeleteYn(true);
        guestbookRepository.save(guestbook);
    }
}
