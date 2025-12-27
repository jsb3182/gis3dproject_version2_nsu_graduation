package com.study.domain.guestbook;

public class GuestbookRequest {
    private Long targetId;
    private Long writerId;
    private String content;

    public  GuestbookRequest(){} //기본생성자
    //getter setter
    public Long getTargetId() {return targetId;}//데이터 꺼내오는 메소드
    public void setTargetId(Long targetId){this.targetId = targetId;}

    public Long getWriterId() {return writerId;} //데이터 저장하는 메서드
    public void setWriterId(Long writerId) {this.writerId = writerId;}

    public String getContent() {return content; }
    public void setContent(String content) {this.content = content;}
}
