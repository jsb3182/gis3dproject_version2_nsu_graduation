package com.study.domain.disaster;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List; // [수정] 리스트 사용을 위해 import 추가

// [수정] 잘못된 Header import 제거함 (내부 클래스 Header를 사용해야 함)

// 외부 api 응답 전체를 받는 클래스 입니다, 구조 : { "header": {...}, "body": { "items": [...] } }
public class DisasterMessage {

    private Header header; // 응답 헤더 정보
    private Body body;     // 실제 재난문자 데이터 리스트를 감싸는 바디

    // getter setter 1 데이터를 꺼내는 메서드 get
    public Header getHeader() { return header; }
    // 데이터를 넣는 메서드(set 데이터를 넣는 메서드)
    public void setHeader(Header header) { this.header = header; }

    // 데이터 받아오기 리스트에 get
    public Body getBody() { return body; }
    public void setBody(Body body) { this.body = body; }

    // ==========================================
    // [내부 클래스] 헤더 정보
    // ==========================================
    public static class Header {
        private String resultCode; // 결과 코드 0이면 성공
        private String resultMsg;  // 결과 메세지

        public String getResultCode() { return resultCode; }
        public void setResultCode(String resultCode) { this.resultCode = resultCode; }
        public String getResultMsg() { return resultMsg; }
        public void setResultMsg(String resultMsg) { this.resultMsg = resultMsg; }
    }

    // ==========================================
    // [내부 클래스] 바디 정보 (Body 클래스추가하기)
    // ==========================================
    public static class Body {
        @JsonProperty("items") // API JSON에서 "items"라는 이름으로 리스트가 옴
        private List<Item> items;

        public List<Item> getItems() { return items; }
        public void setItems(List<Item> items) { this.items = items; }
    }

    // ==========================================
    // [내부 클래스] 실제 재난 문자 아이템 (Header 밖으로 꺼냈습니다)
    // ==========================================
    public static class Item {
        @JsonProperty("SN")
        private String sn; // 일련번호
        @JsonProperty("CRT_DT")
        private String crtDt; // 생성일시
        @JsonProperty("MSG_CN")
        private String msgCn; // 메시지 내용
        @JsonProperty("RCPTN_RGN_NM")
        private String rcptnRgnNm; // 수신지역 이름
        @JsonProperty("EMRG_STEP_NM")
        private String emrgStepNm; // 긴급 단계
        @JsonProperty("DST_SE_NM")
        private String dstSeNm; // 재해 구분

        // 아이템 리스트 Getter / Setter
        public String getSn() { return sn; }
        public void setSn(String sn) { this.sn = sn; }

        public String getCrtDt() { return crtDt; }
        public void setCrtDt(String crtDt) { this.crtDt = crtDt; }

        public String getMsgCn() { return msgCn; }
        public void setMsgCn(String msgCn) { this.msgCn = msgCn; }

        public String getRcptnRgnNm() { return rcptnRgnNm; }
        public void setRcptnRgnNm(String rcptnRgnNm) { this.rcptnRgnNm = rcptnRgnNm; }

        public String getEmrgStepNm() { return emrgStepNm; }
        public void setEmrgStepNm(String emrgStepNm) { this.emrgStepNm = emrgStepNm; }

        public String getDstSeNm() { return dstSeNm; }
        public void setDstSeNm(String dstSeNm) { this.dstSeNm = dstSeNm; }
    }
}