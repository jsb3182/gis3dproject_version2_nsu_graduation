-- ====================================
-- 민방위 대피소 테이블 생성
-- ====================================

-- PostGIS 확장 활성화 (이미 활성화되어 있을 수 있음)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 대피소 테이블 생성
CREATE TABLE IF NOT EXISTS shelter (
    id BIGSERIAL PRIMARY KEY,
    shelter_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(300),
    capacity INTEGER,
    area DOUBLE PRECISION,
    tel VARCHAR(50),
    fclty_manage_org VARCHAR(200),
    geom GEOMETRY(Point, 4326) NOT NULL
);

-- 공간 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_shelter_geom ON shelter USING GIST(geom);

-- shelter_id 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_shelter_shelter_id ON shelter(shelter_id);

-- 코멘트 추가
COMMENT ON TABLE shelter IS '민방위 대피소 정보 (data.go.kr)';
COMMENT ON COLUMN shelter.shelter_id IS '대피소 고유 ID (vt_acmdfclty_sn)';
COMMENT ON COLUMN shelter.name IS '대피소 이름';
COMMENT ON COLUMN shelter.address IS '상세 주소';
COMMENT ON COLUMN shelter.capacity IS '수용 가능 인원';
COMMENT ON COLUMN shelter.area IS '시설 면적 (㎡)';
COMMENT ON COLUMN shelter.tel IS '관리 기관 전화번호';
COMMENT ON COLUMN shelter.fclty_manage_org IS '시설 관리 기관명';
COMMENT ON COLUMN shelter.geom IS '위치 좌표 (WGS84, EPSG:4326)';
