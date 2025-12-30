package com.study.domain.member;
import java.time.LocalDate;
//회원가입 화면에서 데이터를 받는 클레스

public class MemberRequest {
    private String loginId;
    private String password;
    private String name;
    private String gender;
    private LocalDate birthday;

    public MemberRequest(){}
    // Getter/Setter
    public String getLoginId() {return loginId; }
    public String getPassword() {return password;}
    public String getName() {return name;}
    public String getGender() {return gender;}
    public LocalDate getBirthday() {return birthday;}

    public void setLoginId(String loginId) { this.loginId = loginId; }
    public void setPassword(String password) { this.password = password; }
    public void setName(String name) { this.name = name; }
    public void setGender(String gender) { this.gender = gender; }
    public void setBirthday(LocalDate birthday) { this.birthday = birthday; }

    @Override
    public String toString() {
        return "MemberRequest{" + "loginId='" + loginId + '\'' + ", name='" + name + '\'' + ", gender=" + gender + ", birthday=" + birthday + '}';
    }
}
