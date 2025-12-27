package com.study.domain.post;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "tb_post")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; //제목

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; //본문의내용

    @Column(name = "writer_id", nullable = false)
    private Long writerId; //작성자ID

    @Column(name = "view_cnt", nullable = false)
    private int viewCnt = 0; //조회수

    @Column(name = "delete_yn", nullable = false)
    private boolean deleteYn = false; //삭제여부

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now(); //생성일시

    @Column(name = "modified_date")
    private LocalDateTime modifiedDate; //수정일시

    public Post() {
    }// 기본 생성자

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

