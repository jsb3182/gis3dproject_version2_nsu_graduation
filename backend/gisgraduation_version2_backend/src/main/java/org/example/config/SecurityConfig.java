package org.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 설정 적용
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 2. CSRF 비활성화 (개발 단계 및 REST API 위주 환경)
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // API 경로 및 정적 리소스 허용 및 대피소 홈화면에 알맞게 허용하도록 수정함
                                // ✅ CORS preflight (OPTIONS) 무조건 허용
                                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                                // ✅ 기본 경로/에러/파비콘 허용
                                .requestMatchers("/", "/error", "/favicon.ico").permitAll()

                                // ✅ 정적 리소스 허용 (Vue/Vite/기본 리소스 대응)
                                .requestMatchers("/css/**", "/js/**", "/assets/**", "/*.css", "/*.js", "/*.svg").permitAll()

                                // ✅ 너가 이미 허용해둔 API들 그대로 유지
                                .requestMatchers("/api/members/**", "/api/posts/**", "/api/guestbooks/**", "/api/shelters/**",
                                        "/login", "/signup").permitAll()

                                // ✅ 나머지는 로그인 필요 유지
                                .anyRequest().authenticated()
                        )

                        // 3. 폼 로그인 설정 .. //이벤트 핸들러 추가하기
                .formLogin(login -> login
                        .loginProcessingUrl("/login")
                        .usernameParameter("loginId")
                        .passwordParameter("password")
                        .successHandler((request, response, authentication) -> {
                            response.setStatus(200);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"success\": true}");
                        })
                        .failureHandler((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"success\": false}");
                        })
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("http://localhost:5173/login")
                        .invalidateHttpSession(true)
                );

        return http.build();
    }

    // 4. CORS 상세 설정 빈
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Vue 프로젝트 주소 (Vite 기본값) 허용 - 여러 포트 허용
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174"));
        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // 모든 헤더 허용
        configuration.setAllowedHeaders(List.of("*"));
        // 쿠키 및 인증 정보를 포함한 요청 허용 (로그인 세션 유지에 필수)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}