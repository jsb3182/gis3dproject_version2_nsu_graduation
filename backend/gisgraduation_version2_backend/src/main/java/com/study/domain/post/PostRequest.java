package com.study.domain.post;
//데이터를 전송할 객체를 만들기
public class PostRequest {

        private String title;
        private String content;
        private Long writerId;

    public PostRequest(){} //객체 만들기?
    //getter setter
    public String getTitle() {return title;}
    public void setTitle(String title) {this.title = title; }
    public String getContent() {return title;}
    public void setContent(String content) {this.content = content; }
    public Long getWriterId() {return writerId;}
    public void setWriterId(Long writerId) {this.writerId = writerId;}

    }
