package com.study.domain.shelter;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ShelterService {

    private final ShelterRepository shelterRepository;

    public ShelterService(ShelterRepository shelterRepository) {
        this.shelterRepository = shelterRepository;
    }

    /**
     * 주변 대피소 조회 (거리 포함, meter 단위)
     */
    public List<ShelterNearResponse> findNear(double lon, double lat, double meter, int limit) {

        // 안전장치: 너무 큰 값 방지dd
        if (meter <= 0) meter = 500;           // 기본 500m
        if (limit <= 0) limit = 200;           // 기본 200개
        if (limit > 1000) limit = 1000;        // 최대 1000개 제한

        System.out.println("📍 Repository 호출 파라미터: lon=" + lon + ", lat=" + lat + ", meter=" + meter + ", limit=" + limit);

        List<Object[]> rows = shelterRepository.findNearWithDistance(lon, lat, meter, limit);

        System.out.println("📊 Repository 리턴 rows.size() = " + rows.size());

        List<ShelterNearResponse> result = new ArrayList<>();

        for (Object[] r : rows) {
            ShelterNearResponse dto = new ShelterNearResponse();

            // SELECT 순서대로 매핑
            dto.setGid(r[0] == null ? null : ((Number) r[0]).intValue());                 // gid
            dto.setManageNumber((String) r[1]);                                           // manage_number
            dto.setDedongSemugo((String) r[2]);                                           // dedong_semugo
            dto.setDetailAddress((String) r[3]);                                          // detail_address
            dto.setAddressNumber((String) r[4]);                                          // address_number

            dto.setMaxDepiPerson(r[5] == null ? null : ((Number) r[5]).doubleValue());    // max_depi_person
            dto.setMaxArea(r[6] == null ? null : ((Number) r[6]).doubleValue());          // max_area

            dto.setLongitude(r[7] == null ? null : ((Number) r[7]).doubleValue());        // longitude
            dto.setLatitude(r[8] == null ? null : ((Number) r[8]).doubleValue());         // latitude

            dto.setDistance(r[9] == null ? null : ((Number) r[9]).doubleValue());         // distance (meter)

            result.add(dto);
        }

        return result;
    }
}
