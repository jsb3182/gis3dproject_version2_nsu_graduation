package com.study.domain.shelter;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

@Service
public class ShelterService {

    private final ShelterRepository shelterRepository;
    private final GeometryFactory geometryFactory;

    public ShelterService(ShelterRepository shelterRepository) {
        this.shelterRepository = shelterRepository;
        // SRID 4326 (WGS84) GeometryFactory 생성
        this.geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
    }

    /**
     * 주변 대피소 검색
     */
    @Transactional(readOnly = true)
    public List<ShelterDTO> findNearbyShelters(double lat, double lon, double radiusKm) {
        List<Object[]> results = shelterRepository.findNearbyShelters(lat, lon, radiusKm);
        List<ShelterDTO> shelters = new ArrayList<>();

        for (Object[] row : results) {
            // row[0-10]: shelter 테이블 컬럼들
            // row[11]: distance (계산된 거리)

            Long id = ((BigInteger) row[0]).longValue();
            String shelterId = (String) row[1];
            String name = (String) row[2];
            String address = (String) row[3];
            Integer capacity = row[4] != null ? (Integer) row[4] : null;
            Double area = row[5] != null ? ((Number) row[5]).doubleValue() : null;
            String tel = (String) row[6];
            String fcltyManageOrg = (String) row[7];

            // PostGIS geometry는 바이너리로 반환되므로 JTS로 파싱
            // 대신 원본 좌표를 사용하는 것이 더 간단함
            // 하지만 여기서는 별도 쿼리로 좌표 가져오기
            Shelter shelter = shelterRepository.findById(id).orElse(null);
            if (shelter == null) continue;

            Point point = shelter.getGeom();
            double shelterLon = point.getX();
            double shelterLat = point.getY();

            // 거리 (미터)
            Double distanceMeters = row[11] != null ? ((Number) row[11]).doubleValue() : null;
            Integer distance = distanceMeters != null ? distanceMeters.intValue() : 0;

            ShelterDTO dto = new ShelterDTO(
                id, name, address, capacity, area, tel, fcltyManageOrg,
                shelterLon, shelterLat, distance
            );

            shelters.add(dto);
        }

        return shelters;
    }

    /**
     * 대피소 저장 (upsert)
     */
    @Transactional
    public void saveShelter(String shelterId, String name, String address,
                           Integer capacity, Double area, String tel,
                           String fcltyManageOrg, double lon, double lat) {
        Shelter shelter = shelterRepository.findByShelterId(shelterId)
            .orElse(new Shelter());

        shelter.setShelterId(shelterId);
        shelter.setName(name);
        shelter.setAddress(address);
        shelter.setCapacity(capacity);
        shelter.setArea(area);
        shelter.setTel(tel);
        shelter.setFcltyManageOrg(fcltyManageOrg);

        Point point = geometryFactory.createPoint(new Coordinate(lon, lat));
        shelter.setGeom(point);

        shelterRepository.save(shelter);
    }

    /**
     * 전체 대피소 수
     */
    @Transactional(readOnly = true)
    public long count() {
        return shelterRepository.count();
    }
}