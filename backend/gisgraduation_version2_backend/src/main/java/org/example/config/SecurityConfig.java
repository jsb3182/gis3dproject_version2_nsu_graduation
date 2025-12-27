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
                        // API 경로 및 정적 리소스 허용
                        .requestMatchers("/api/members/**", "/login", "/signup", "/css/**", "/js/**").permitAll()
                        .anyRequest().authenticated()
                )
                // 3. 폼 로그인 설정
                .formLogin(login -> login
                        .loginProcessingUrl("/login")    // Vue에서 요청 보낼 주소
                        .usernameParameter("loginId")
                        .passwordParameter("password")
                        // REST API 환경에서는 성공 시 리다이렉트보다 상태 코드 반환이 선호되지만,
                        // 우선 기존 방식대로 유지하거나 SuccessHandler를 커스텀할 수 있습니다.
                        .defaultSuccessUrl("http://localhost:5173/HomeView", true)
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

        // Vue 프로젝트 주소 (Vite 기본값) 허용
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
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