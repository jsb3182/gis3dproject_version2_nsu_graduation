package org.example.gisgraduation_version2_backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GisgraduationVersion2BackendApplication {

    // 클래스 단위 로거 (정석)
    private static final Logger logger =
            LoggerFactory.getLogger(GisgraduationVersion2BackendApplication.class);

    public static void main(String[] args) {
        logger.info("Starting Gisgraduation Version2 Backend Application...");
        SpringApplication.run(GisgraduationVersion2BackendApplication.class, args);
        logger.info("Application started successfully");
    }
}
