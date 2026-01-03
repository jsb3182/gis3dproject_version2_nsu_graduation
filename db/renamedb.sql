ALTER TABLE minbangwi
RENAME COLUMN "대동세무고" TO dedong_semugo;

ALTER TABLE minbangwi
RENAME COLUMN "공공용시설" TO sisul_gubum;

ALTER TABLE minbangwi
RENAME COLUMN "서울특별시" TO detail_address;

ALTER TABLE minbangwi
RENAME COLUMN "서울특별_1" TO address_number;

ALTER TABLE minbangwi
RENAME COLUMN "지하" TO underground;



ALTER TABLE minbangwi
RENAME COLUMN "x좌표" TO longitude;

ALTER TABLE minbangwi
RENAME COLUMN "y좌표" TO latitude;

ALTER TABLE minbangwi
RENAME COLUMN "시도코드" TO city_code;

ALTER TABLE minbangwi
RENAME COLUMN "통계시도" TO city_number;

ALTER TABLE minbangwi
RENAME COLUMN "통계시군구" TO city;

ALTER TABLE minbangwi
RENAME COLUMN "행정동코드" TO henjung_code;

ALTER TABLE minbangwi
RENAME COLUMN "행정동명" TO henjung_name;

ALTER TABLE minbangwi
RENAME COLUMN "183" TO max_depi_person;

ALTER TABLE minbangwi
RENAME COLUMN "183.36" TO max_area;

ALTER TABLE minbangwi
RENAME COLUMN "3000000-s2" TO manage_number;
