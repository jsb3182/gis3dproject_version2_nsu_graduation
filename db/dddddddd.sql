CREATE TABLE minbangwi (
    gid INTEGER PRIMARY KEY,                -- 고유 ID
    manage_number TEXT,                     -- 관리 번호
    "unnamed_ 3" TEXT,                      -- (기타 정보)
    "사용중" TEXT,                            -- 사용 상태
    dedong_semugo TEXT,                     -- 시설 명칭
    sisul_gubum TEXT,                       -- 시설 구분
    detail_address TEXT,                    -- 상세 주소
    address_number TEXT,                    -- 지번 주소
    "03057" TEXT,                           -- 우편번호 등으로 추정
    underground TEXT,                       -- 지상/지하 여부
    max_area NUMERIC,                       -- 최대 면적
    max_depi_person INTEGER,                -- 최대 대피 인원
    "2025-11-20" TIMESTAMP,                 -- 생성 일시 추정
    "2025-11-22" TIMESTAMP,                 -- 수정 일시 추정
    "34" INTEGER,                           -- (코드 정보)
    longitude NUMERIC,                      -- 경도
    latitude NUMERIC,                       -- 위도
    city_code INTEGER,                      -- 도시 코드
    city_number INTEGER,                    -- 도시 번호
    city INTEGER,                           -- 도시 구분
    henjung_code BIGINT,                    -- 행정동 코드
    henjung_name TEXT,                      -- 행정동 명칭
    geom TEXT                               -- 공간 데이터 (HEX 문자열)
);