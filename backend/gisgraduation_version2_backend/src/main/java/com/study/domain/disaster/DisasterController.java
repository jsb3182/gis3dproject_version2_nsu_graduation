package com.study.domain.disaster;
import com.study.domain.disaster.DisasterMessage; // DTO 클래스 import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

    @RestController //json 데이터를 반환하는 컨트롤러 라고 표시됩니다.
    @RequestMapping("/api/disaster")// 이컨드롤러의 기본주소는 "http/내서버/api/disaster"로 시작합니다/

    public class DisasterController {
        public final DisasterService disasterService;
        //생성자 주입
        //스프링이 실행될때 자동으로 연결 주입해줍니다.
        @Autowired
        public DisasterController(DisasterService disasterService) {
            this.disasterService = disasterService;
        }
        //프로트엔드에서 get으로 이제 요청을 받으면 재난 문자 리스트를 주게 됩니다.    
        //요청 주소: GET http://localhost: 8080/api/disaster
        @GetMapping//get 요청을 받겠다고 선언
        public ResponseEntity<List<DisasterMessage.Item>>getRealtimeDisasterInfo() {
            //서비스에게 "지금 당장 데이터 가져와쥐라고 시킵니다."
            List<DisasterMessage.Item> data = disasterService.getDisasterMessagesNow();
            //가져온 데이터를 프론트 엔드에게 보냅니다.
            return ResponseEntity.ok(data);
        }
    }
