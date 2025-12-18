package com.study.domain.member;
import java.time.LocalDate;
//회원가입 화면에서 데이터를 받는 클레스

public class MemberRequest {
    private String loginId;
    private String password;
    private String name;
    private Gender gender;
    private LocalDate birthday;

    public MemberRequest(){}
    // Getter/Setter
    public String getLoginId() {return loginId; }
    public String getPassword() {return password;}
    public String getName() {return name;}
    public Gender getGender() {return gender;}
    public LocalDate getBirthday() {return birthday;}
}
