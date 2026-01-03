package com.study.domain.shelter;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shelters")
public class ShelterApiController {

    private final ShelterService shelterService;

    public ShelterApiController(ShelterService shelterService) {
        this.shelterService = shelterService;
    }

    /**
     * 주변 대피소 조회
     * 예) /api/shelters/near?lat=37.5665&lon=126.9780&km=2&limit=200
     */
    @GetMapping("/near")
    public List<ShelterNearResponse> near(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "2") double km,
            @RequestParam(defaultValue = "200") int limit
    ) {
        System.out.println("🔍 대피소 검색 요청: lat=" + lat + ", lon=" + lon + ", km=" + km + ", limit=" + limit);
        double meter = km * 1000.0;
        List<ShelterNearResponse> result = shelterService.findNear(lon, lat, meter, limit);
        System.out.println("✅ 검색 결과: " + result.size() + "개 대피소 발견");
        if (result.size() > 0) {
            System.out.println("첫 번째 대피소: " + result.get(0).getDedongSemugo());
        }
        return result;
    }
}
