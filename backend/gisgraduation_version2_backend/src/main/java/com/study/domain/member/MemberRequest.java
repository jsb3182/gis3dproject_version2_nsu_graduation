package com.study.domain.member;
import java.time.LocalDate;
//회원가입 화면에서 데이터를 받는 클레스
//회원가입 요청 데이터 전요 클래스
public class MemberRequest {
    private String loginId; //아이디 중복 검사 대상
    private String password; //비밀번호 서비스에서 암호화ㅣ후에 엔티티에 저장
    private String name;
    private String gender; //성별 나중에 Enum으로 바꾸기 좋음
    private LocalDate birthday;//생년월일 json loacdate자동 맵핑

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
