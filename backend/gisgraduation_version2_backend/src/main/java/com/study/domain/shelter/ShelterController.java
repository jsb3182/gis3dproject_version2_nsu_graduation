package com.study.domain.shelter;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shelters")
public class ShelterController {

    private final ShelterService shelterService;
    private final DataGoKrApiService dataGoKrApiService;

    public ShelterController(ShelterService shelterService, DataGoKrApiService dataGoKrApiService) {
        this.shelterService = shelterService;
        this.dataGoKrApiService = dataGoKrApiService;
    }

    /**
     * 주변 대피소 검색
     * GET /api/shelters/nearby?lat=37.5&lon=127.0&radius=2
     */
    @GetMapping("/nearby")
    public ResponseEntity<?> findNearbyShelters(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "2") double radius) {

        try {
            List<ShelterDTO> shelters = shelterService.findNearbyShelters(lat, lon, radius);
            return ResponseEntity.ok(shelters);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "대피소 검색 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * data.go.kr에서 대피소 데이터 새로고침
     * POST /api/shelters/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshShelters() {
        try {
            int count = dataGoKrApiService.fetchAndSaveAllShelters();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", count + "개 대피소 데이터 업데이트 완료");
            response.put("count", count);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "데이터 새로고침 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 저장된 대피소 개수 조회
     * GET /api/shelters/count
     */
    @GetMapping("/count")
    public ResponseEntity<?> getShelterCount() {
        try {
            long count = shelterService.count();
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}