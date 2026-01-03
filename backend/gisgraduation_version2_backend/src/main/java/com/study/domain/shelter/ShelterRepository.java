package com.study.domain.shelter;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ShelterRepository extends JpaRepository<Shelter, Integer> {

    @Query(value = """
        SELECT
            gid,                -- 0
            manage_number,      -- 1
            dedong_semugo,      -- 2
            detail_address,     -- 3
            address_number,     -- 4
            max_depi_person,    -- 5
            max_area,           -- 6
            longitude,          -- 7
            latitude,           -- 8
            ST_Distance(
                geom::geography,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
            ) AS distance       -- 9 (meter)
        FROM minbangwi
        WHERE geom IS NOT NULL
          AND ST_DWithin(
              geom::geography,
              ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
              :meter
          )
        ORDER BY distance
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findNearWithDistance(
            @Param("lon") double lon,
            @Param("lat") double lat,
            @Param("meter") double meter,
            @Param("limit") int limit
    );
}
