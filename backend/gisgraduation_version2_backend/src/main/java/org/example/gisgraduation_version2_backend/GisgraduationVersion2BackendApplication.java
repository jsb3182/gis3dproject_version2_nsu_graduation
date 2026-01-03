package org.example.gisgraduation_version2_backend;

import com.fasterxml.jackson.databind.ObjectMapper; // 추가
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule; // 추가
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean; // 추가
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"org.example", "com.study"})
@EnableJpaRepositories(basePackages = {"com.study.domain.member","com.study.domain.post","com.study.domain.guestbook","com.study.domain.shelter"})
@EntityScan(basePackages = {"com.study.domain.member","com.study.domain.post","com.study.domain.guestbook","com.study.domain.shelter"})
public class GisgraduationVersion2BackendApplication {

    private static final Logger logger = LoggerFactory.getLogger(GisgraduationVersion2BackendApplication.class);

    public static void main(String[] args) {
        logger.info("Starting Gisgraduation Version2 Backend Application...");
        SpringApplication.run(GisgraduationVersion2BackendApplication.class, args);
        logger.info("Application started successfully");
    }

    /**
     * ✅ 수동으로 ObjectMapper를 빈으로 등록합니다.
     * 외부 라이브러리 객체를 스프링이 관리하도록 하여 DataGoKrApiService에 주입해줍니다.
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // API 데이터 중 LocalDate/LocalDateTime 같은 시간 데이터를 정상적으로 읽기 위해 모듈 등록
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
}