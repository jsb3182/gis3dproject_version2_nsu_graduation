package com.study.domain.guestbook;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guestbook")
public class GuestbookController {

    private final GuestbookService guestbookService;

    public GuestbookController(GuestbookService guestbookService) {
        this.guestbookService = guestbookService;
    }

    /**
     * 특정 사용자의 방명록 목록 조회
     * GET /api/guestbook/target/{targetId}
     */
    @GetMapping("/target/{targetId}")
    public ResponseEntity<List<Guestbook>> getGuestbookList(@PathVariable Long targetId) {
        List<Guestbook> guestbooks = guestbookService.findGuestbooksByTarget(targetId);
        return ResponseEntity.ok(guestbooks);
    }

    /**
     * 방명록 작성
     * POST /api/guestbook
     */
    @PostMapping
    public ResponseEntity<Guestbook> createGuestbook(@RequestBody GuestbookRequest request) {
        Long guestbookId = guestbookService.saveGuestbook(request);
        // 생성된 방명록을 다시 조회하여 반환 (선택적)
        return ResponseEntity.ok().build();
    }

    /**
     * 방명록 수정
     * PUT /api/guestbook/{entryId}
     */
    @PutMapping("/{entryId}")
    public ResponseEntity<Void> updateGuestbook(@PathVariable Long entryId, @RequestBody GuestbookRequest request) {
        guestbookService.updateGuestbook(entryId, request.getContent());
        return ResponseEntity.ok().build();
    }

    /**
     * 방명록 삭제
     * DELETE /api/guestbook/{entryId}
     */
    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> deleteGuestbook(@PathVariable Long entryId) {
        guestbookService.deleteGuestbook(entryId);
        return ResponseEntity.ok().build();
    }
}
