-- 1. 성별 타입(ENUM)을 먼저 생성합니다.
CREATE TYPE public.gender_enum AS ENUM ('M', 'F');

-- 2. 이제 테이블을 생성합니다. (오류가 났던 부분)
CREATE TABLE public.tb_member (
    id            bigserial PRIMARY KEY,
    login_id      varchar(20) NOT NULL,
    password      varchar(60) NOT NULL,
    name          varchar(20) NOT NULL,
    gender        public.gender_enum NOT NULL, -- 생성한 타입을 사용
    birthday      date NOT NULL,
    delete_yn     boolean NOT NULL DEFAULT false,
    created_date  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date timestamp DEFAULT NULL,
    CONSTRAINT uix_member_login_id UNIQUE (login_id)
);

-- 3. 테이블 주석 설정
COMMENT ON TABLE public.tb_member IS '회원';