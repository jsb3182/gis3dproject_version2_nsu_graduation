package com.study.domain.disaster;

import com.study.domain.disaster.DisasterMessage; // 아까 만든 DTO 클래스 import
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Collections;
import java.util.List;

// @Service: 스프링에게 "이 클래스는 비즈니스 로직(서비스)을 담당해"라고 알려주는 표시입니다.
@Service
public class DisasterService {

    // 1. 로그를 남기기 위한 도구입니다. (System.out.println 대신 사용 권장)
    private static final Logger log = LoggerFactory.getLogger(DisasterService.class);

    // 2. application.properties 파일에 적어둔 API 주소를 가져옵니다.
    @Value("${safety.api.url}")
    private String apiUrl;

    // 3. application.properties 파일에 적어둔 API 인증키를 가져옵니다.
    @Value("${safety.api.key}")
    private String apiKey;

    /**
     * [기능] 외부 행정안전부 API를 호출해서 최신 재난문자 리스트를 가져옵니다.
     * DB 저장 없이, 가져온 즉시 리스트를 반환합니다.
     */
    public List<DisasterMessage.Item> getDisasterMessagesNow() {

        // 4. 웹 브라우저처럼 인터넷 요청을 보낼 수 있는 도구(WebClient)를 생성합니다.
        WebClient webClient = WebClient.create();

        // 5. 요청할 전체 주소(URL)를 조립합니다.
        // 예: https://.../API명?serviceKey=...&returnType=json&...
        URI uri = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .queryParam("serviceKey", apiKey)  // 내 API 인증키
                .queryParam("returnType", "json")  // "데이터를 JSON 형식으로 주세요" (필수)
                .queryParam("numOfRows", "100")    // "한 번에 100개 주세요"
                .queryParam("pageNo", "1")         // "첫 번째 페이지(최신순) 주세요"
                .build()                           // 설정 끝
                .toUri();                          // URI 객체로 변환

        // 6. 로그에 어떤 주소로 요청하는지 기록합니다. (디버깅용)
        log.info("행정안전부 API 호출 시도: {}", uri);

        try {
            // 7. 실제로 GET 요청을 보냅니다.
            DisasterMessage response = webClient.get()  // GET 방식으로 요청
                    .uri(uri)                           // 위에서 만든 주소로
                    .retrieve()                         // 응답을 받아와서
                    .bodyToMono(DisasterMessage.class)  // JSON 내용을 DisasterMessage 객체로 변환해라
                    .block();                           // 다 받을 때까지 기다려라 (동기 방식)

            // 8. 데이터가 제대로 왔는지 꼼꼼하게 검사합니다.
            // (1) 응답 자체가 비었거나
            // (2) 내용물(body)이 없거나
            // (3) 내용물 안에 리스트(items)가 없으면 -> 데이터 없음 처리
            if (response == null || response.getBody() == null || response.getBody().getItems() == null) {
                log.warn("API 응답은 받았으나, 데이터 리스트가 비어있습니다.");
                return Collections.emptyList(); // 빈 리스트([])를 반환해서 에러 방지
            }

            // 9. 검사를 통과했으면 실제 데이터 리스트(items)를 꺼냅니다.
            List<DisasterMessage.Item> items = response.getBody().getItems();

            // 10. 로그에 몇 개 가져왔는지 남깁니다.
            log.info("재난문자 데이터 {}건 가져오기 성공!", items.size());

            // 11. 최종적으로 리스트를 반환합니다.
            return items;

        } catch (Exception e) {
            // 12. 통신 중 에러(인터넷 끊김, 키 오류 등)가 나면 로그를 남기고 빈 리스트를 줍니다.
            log.error("API 호출 중 오류 발생: ", e);
            return Collections.emptyList();
        }
    }
}