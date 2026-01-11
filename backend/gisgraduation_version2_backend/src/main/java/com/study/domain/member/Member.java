package com.study.domain.member;
import jakarta.persistence.*; //jpa 에서 쓰는 어노테이션을 가져옴
import java.time.LocalDate;
import java.time.LocalDateTime; //날짜 가져오기
//내가만든 데이터베이스 테이블과 연결되는 클레스
//이 클레스는 db 테이블과 맵핑되는 엔티티이다
@Entity
@Table(name = "tb_member", schema = "public") //테이블 이름 스키마어디에 있는지 public
public class Member {
    @Id //기본키
    @GeneratedValue(strategy = GenerationType.IDENTITY) //pk 설정 identity는 db가 자동으로 증가처리함
    private Long id;

    @Column(name = "login_id", nullable = false, unique = true)
    private String loginId; // 디비 컬럼명, notnull 유니크로 중복이 안된다

    @Column(nullable = false)
    private String password;//비밀번호

    @Column(nullable = false)
    private String name; //이름

    @Column(nullable = false, length = 1)
    private String gender;

    @Column(nullable = false)
    private LocalDate birthday; //생년월일

    @Column(name = "delete_yn", nullable =false)
    private boolean deleteYn = false;//논리삭제 컬럼 그 상태 값으로 처리
    //생성시각 udate 퀴리가 날라와도 상태가 그대로임
    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now();
    //서비스 레이어에서 직접 설명하는구조
    @Column(name = "modified_date")
    private LocalDateTime modifiedDate;

    //롬복 없으므로 직접 set getter 생성
    //외부에서 값을 읽을 수 있도록 하는 메서드.
    //
    //JPA 자체는 필드 접근/프로퍼티 접근 방식에 따라 달라질 수 있지만, 보통 서비스/컨트롤러/DTO 변환에서 getter가 필요해.
    //
    //setter는 코드에 일부만 있고 “Generate로 만들라”고 되어 있지? → 값 수정 기능이 필요하면 setter도 만들어야 함.

    public Member() {}// jpa 기본 생성자
    public Member(String loginId, String password, String name, String gender, LocalDate birthday) {
        this.loginId = loginId;
        this.password = password;
        this.name = name;
        this.gender = gender;
        this.birthday = birthday;
        this.deleteYn = false;
        this.createdDate = LocalDateTime.now();
    }
    //gettet setter 다른 클레스에서 값을 꺼내ㅑ서나 넣을때 사용
    public Long getId(){ return id;}
    public void setId(Long id){this.id = id;}

    public String getLoginId(){return loginId ;}
    public void setLoginId(String loginId){this.loginId = loginId;}

    public String getPassword(){return password;}
    public void setPassword(String password){this.password = password;}

    public String getName(){return name;}
    public void setName(String name){this.name = name;}

    public String getGender(){return gender;}
    public void setGender(String gender){this.gender = gender;}

    public LocalDate getBirthday(){return birthday;}
    public void setBirthday(LocalDate birthday) {this.birthday = birthday;}

    public boolean isDeleteYn() {
        return deleteYn;
    }


}
