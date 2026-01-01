package com.study.domain.shelter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

/**
 * data.go.kr 민방위 대피소 API 연동 서비스
 */
@Service
public class DataGoKrApiService {

    private final WebClient webClient;
    private final ShelterService shelterService;
    private final ObjectMapper objectMapper;

    @Value("${data.go.kr.key:YOUR_DATA_GO_KR_KEY_HERE}")
    private String apiKey;

    private static final String API_BASE_URL = "https://apis.data.go.kr/1741000/EmergencyAssemblyArea_Earthquake5/getEarthquakeShelter5List";

    public DataGoKrApiService(ShelterService shelterService, ObjectMapper objectMapper) {
        this.webClient = WebClient.builder().build();
        this.shelterService = shelterService;
        this.objectMapper = objectMapper;
    }

    /**
     * 모든 대피소 데이터 가져오기 및 저장
     */
    public int fetchAndSaveAllShelters() throws Exception {
        int totalSaved = 0;
        int pageNo = 1;
        int numOfRows = 1000;
        boolean hasMore = true;

        while (hasMore) {
            System.out.println("📥 대피소 데이터 페이지 " + pageNo + " 가져오는 중...");

            String response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .scheme("https")
                    .host("apis.data.go.kr")
                    .path("/1741000/EmergencyAssemblyArea_Earthquake5/getEarthquakeShelter5List")
                    .queryParam("serviceKey", apiKey)
                    .queryParam("pageNo", pageNo)
                    .queryParam("numOfRows", numOfRows)
                    .queryParam("type", "json")
                    .build())
                .retrieve()
                .bodyToMono(String.class)
                .block();

            if (response == null) {
                System.err.println("❌ API 응답 없음");
                break;
            }

            // JSON 파싱
            JsonNode root = objectMapper.readTree(response);
            JsonNode earthquakeShelter = root.path("EarthquakeShelter");

            // 응답 구조 확인
            if (earthquakeShelter.isMissingNode() || earthquakeShelter.size() < 2) {
                System.err.println("❌ 잘못된 응답 구조: " + response);
                break;
            }

            // EarthquakeShelter[0]: 메타데이터 (head)
            JsonNode head = earthquakeShelter.get(0).path("head");
            int totalCount = head.path("totalCount").asInt(0);

            // EarthquakeShelter[1]: 실제 데이터 (row)
            JsonNode rowNode = earthquakeShelter.get(1).path("row");

            if (!rowNode.isArray() || rowNode.size() == 0) {
                System.out.println("✅ 더 이상 데이터가 없습니다.");
                hasMore = false;
                break;
            }

            // 데이터 저장
            for (JsonNode item : rowNode) {
                try {
                    String shelterId = item.path("vt_acmdfclty_sn").asText("");
                    String name = item.path("vt_acmdfclty_nm").asText("");
                    String address = item.path("dtl_adres").asText("");
                    Integer capacity = parseIntSafe(item.path("recpt_psblty_nmpr").asText(""));
                    Double area = parseDoubleSafe(item.path("fclty_ar").asText(""));
                    String tel = item.path("mng_inst_telno").asText("");
                    String fcltyManageOrg = item.path("mdfclt_mng_inst_nm").asText("");

                    double lon = parseDoubleSafe(item.path("xcord").asText(""));
                    double lat = parseDoubleSafe(item.path("ycord").asText(""));

                    if (shelterId.isEmpty() || name.isEmpty() || lon == 0 || lat == 0) {
                        System.err.println("⚠️  필수 필드 누락: " + item.toString());
                        continue;
                    }

                    shelterService.saveShelter(shelterId, name, address, capacity, area, tel, fcltyManageOrg, lon, lat);
                    totalSaved++;

                } catch (Exception e) {
                    System.err.println("⚠️  데이터 저장 실패: " + e.getMessage());
                }
            }

            System.out.println("✅ 페이지 " + pageNo + " 완료: " + rowNode.size() + "개 처리");

            // 다음 페이지 확인
            if (totalSaved >= totalCount) {
                hasMore = false;
            } else {
                pageNo++;
            }
        }

        System.out.println("🎉 전체 " + totalSaved + "개 대피소 데이터 저장 완료");
        return totalSaved;
    }

    // Helper methods
    private Integer parseIntSafe(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Integer.parseInt(value.replaceAll("[^0-9-]", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private double parseDoubleSafe(String value) {
        if (value == null || value.isEmpty()) return 0.0;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}