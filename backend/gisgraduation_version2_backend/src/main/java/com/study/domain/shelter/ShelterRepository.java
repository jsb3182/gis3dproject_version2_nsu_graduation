package com.study.domain.shelter;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShelterRepository extends JpaRepository<Shelter, Long> {

    /**
     * 대피소 ID로 조회
     */
    Optional<Shelter> findByShelterId(String shelterId);

    /**
     * 주어진 위치 주변 대피소 검색 (Haversine distance 사용)
     * @param lat 위도
     * @param lon 경도
     * @param radiusKm 반경 (km)
     * @return 거리순 정렬된 대피소 목록
     */
    @Query(value = """
        SELECT s.*,
               ST_Distance(s.geom::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography) AS distance
        FROM shelter s
        WHERE ST_DWithin(
            s.geom::geography,
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
            :radiusKm * 1000
        )
        ORDER BY distance
        LIMIT 100
        """, nativeQuery = true)
    List<Object[]> findNearbyShelters(
        @Param("lat") double lat,
        @Param("lon") double lon,
        @Param("radiusKm") double radiusKm
    );
}