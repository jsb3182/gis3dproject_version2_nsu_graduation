package com.study.domain.guestbook;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_guestbook")
public class Guestbook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "target_Id", nullable = false)
    private Long targetId; //작성자 아이디

    @Column(name= "writer_id" , nullable = false)
    private Long writerId; //작성자 ID


    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "delete_yn", nullable = false)
    private boolean deleteYn; //작성자 콘텐츠

    @Column(name = "created_date", nullable = false,updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "modified_date")
    private LocalDateTime modifiedDate;

    public Guestbook() {}

    public Guestbook(Long targetId, Long writerId, String content) {
        this.targetId = targetId;
        this.writerId = writerId;
        this.content = content;
        this.deleteYn = false;
        this.createdDate = LocalDateTime.now();
    }
    //getter setter 직접 작성
    public Long getId() { return id; }
    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public Long getWriterId() { return writerId; }
    public void setWriterId(Long writerId) { this.writerId = writerId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public boolean isDeleteYn() { return deleteYn; }
    public void setDeleteYn(boolean deleteYn) { this.deleteYn = deleteYn; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public LocalDateTime getModifiedDate() { return modifiedDate; }
    public void setModifiedDate(LocalDateTime modifiedDate) { this.modifiedDate = modifiedDate; }
}
