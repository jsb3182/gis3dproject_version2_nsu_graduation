package org.example.gisgraduation_version2_backend;
//파일 구조가 달라서 이제 실행할 파일을 지정해준다
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"org.example", "com.study"}) // 1. 모든 컴포넌트 스캔
@EnableJpaRepositories(basePackages = {"com.study.domain.member","com.study.domain.post","com.study.domain.guestbook"})        // 2. 리포지토리 위치 지정
@EntityScan(basePackages = {"com.study.domain.member","com.study.domain.post","com.study.domain.guestbook"})                  // 3. 엔티티(@Entity) 위치 지정
public class GisgraduationVersion2BackendApplication {

    private static final Logger logger =
            LoggerFactory.getLogger(GisgraduationVersion2BackendApplication.class);

    public static void main(String[] args) {
        logger.info("Starting Gisgraduation Version2 Backend Application...");
        SpringApplication.run(GisgraduationVersion2BackendApplication.class, args);
        logger.info("Application started successfully");
    }
}