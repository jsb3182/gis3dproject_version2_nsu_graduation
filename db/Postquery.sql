CREATE TABLE public.tb_post (
    id            bigserial PRIMARY KEY,                       -- 게시글 번호 (PK)
    title         varchar(200) NOT NULL,                      -- 제목
    content       text NOT NULL,                              -- 내용
    writer_id     bigint NOT NULL,                            -- 작성자 (tb_member.id)
    view_cnt      int NOT NULL DEFAULT 0,                     -- 조회수
    delete_yn     boolean NOT NULL DEFAULT false,             -- 삭제 여부
    created_date  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일시
    modified_date timestamp DEFAULT NULL,                      -- 최종 수정일시

    CONSTRAINT fk_post_writer FOREIGN KEY (writer_id) REFERENCES public.tb_member(id)
);

COMMENT ON TABLE  public.tb_post IS '게시판';