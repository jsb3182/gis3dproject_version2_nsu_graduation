CREATE TABLE public.tb_guestbook (
    id            bigserial PRIMARY KEY,                       -- 방문록 번호 (PK)
    target_id     bigint NOT NULL,                            -- 누구의 방문록인가? (tb_member.id)
    writer_id     bigint NOT NULL,                            -- 누가 썼는가? (tb_member.id)
    content       text NOT NULL,                              -- 방문록 내용
    delete_yn     boolean NOT NULL DEFAULT false,             -- 삭제 여부
    created_date  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 작성일시
    modified_date timestamp DEFAULT NULL,                      -- 수정일시

    -- 외래키 설정
    CONSTRAINT fk_guestbook_target FOREIGN KEY (target_id) REFERENCES public.tb_member(id),
    CONSTRAINT fk_guestbook_writer FOREIGN KEY (writer_id) REFERENCES public.tb_member(id)
);

COMMENT ON TABLE  public.tb_guestbook IS '방문록';
COMMENT ON COLUMN public.tb_guestbook.id IS '방문록 번호 (PK)';
COMMENT ON COLUMN public.tb_guestbook.target_id IS '수신자 번호';
COMMENT ON COLUMN public.tb_guestbook.writer_id IS '작성자 번호';