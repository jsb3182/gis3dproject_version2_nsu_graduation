#1.자바 17환경설정하기 가장 안정적인 버전으로 변경하기
FROM amazoncorretto:17-alpine-jdk
#2 target폴던안데 jar파일은 컨태이너 내부로 ㄴ내부로 복사 하기
COPY target/gisgraduation_version2_backend-0.0.1-SNAPSHOT.jar app.jar
#3 실행명령어
ENTRYPOINT ["java", "-jar", "/app.jar"]