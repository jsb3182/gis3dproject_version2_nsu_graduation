package com.study.domain.post;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "tb_post") //데이터 베이스 테이블 이름
public class Post {
    @Id //기본키 설정
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; //제목

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; //본문의내용 글내용이 길수 있기 때문에  coiumnDefinition
    //jpa가 컬럼 타입을 자동 추론하지 않고 db에 그대로 text 생성

    @Column(name = "writer_id", nullable = false)
    private Long writerId; //작성자ID 작성자 pk 아이디를 저장 합니다

    @Column(name = "view_cnt", nullable = false)
    private int viewCnt = 0; //조회수 기본값 null 허용 , 글 조회 시 증가시키는 용도

    @Column(name = "delete_yn", nullable = false)
    private boolean deleteYn = false; //삭제여부 실제 dlete를 대신 상태 값으로 삭제 처리 true false로 상태 변경

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now(); //생성일시

    @Column(name = "modified_date")
    private LocalDateTime modifiedDate; //수정일시 수정할때만 값 세팅

    public Post() {
    }// 기본 생성자 jpa 필수 db에서 조회할때 내부적으로 사용함

    //게시글 생성용 생성자
    public Post(String title, String content, Long writerId) {
        this.title = title;
        this.content = content;
        this.writerId = writerId;
        this.viewCnt = 0;
        this.deleteYn = false;
        this.createdDate = LocalDateTime.now();
    }
    //getter setter
    // getter 필드 값을 가져오는 메서드 ,외부에서 내부값을 잀기 전용으로 접근할때 사용
    //setter 필드값을 변경하는 메서드입니다 외부에서 객체 내부 값을 안전하게 수정할때 사용합니다
    // 필드를 직접 건드리지말고 메서드를 통해 접근하게 만들기 객체 지항갭슐

    public Long getId() { return id; }
    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }

    public void setContent(String content) { this.content = content; }
    public Long getWriterId() { return writerId; }

    public int getViewCnt() { return viewCnt; }
    public void setViewCnt(int viewCnt) { this.viewCnt = viewCnt; }

    public boolean isDeleteYn() { return deleteYn; }
    public void setDeleteYn(boolean deleteYn) { this.deleteYn = deleteYn; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public LocalDateTime getModifiedDate() { return modifiedDate; }
    public void setModifiedDate(LocalDateTime modifiedDate) { this.modifiedDate = modifiedDate; }
}

