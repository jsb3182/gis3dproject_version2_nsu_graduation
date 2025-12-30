-- gender_enum 타입 생성 부분 삭제 또는 주석 처리
-- CREATE TYPE public.gender_enum AS ENUM ('M', 'F');

CREATE TABLE public.tb_member (
    id            bigserial PRIMARY KEY,
    login_id      varchar(20) NOT NULL,
    password      varchar(60) NOT NULL,
    name          varchar(20) NOT NULL,
    gender        varchar(1) NOT NULL,  -- ← 이렇게 수정
    birthday      date NOT NULL,
    delete_yn     boolean NOT NULL DEFAULT false,
    created_date  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date timestamp DEFAULT NULL,
    CONSTRAINT uix_member_login_id UNIQUE (login_id)
);