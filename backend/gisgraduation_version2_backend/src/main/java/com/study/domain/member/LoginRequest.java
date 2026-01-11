package com.study.domain.member;

public class LoginRequest {
    private String loginId; //외부에서 접근이 불가능하다 아이디
    private String password;//외부에서 접근이 불가능하다 비밀번호
    //생성자 함수로 요청하기 로그인 사용자가 클라이언트에서 보냔 값을 로그인 아이디 패스워드를 담는 용도입니다.
    //json으로 객체 변환할때 반드시 필요함
    public LoginRequest() {}
    // 로그인 아이디 값을 읽을때 사용함 매개변수를 돌려받음
    public String getLoginId() {
        return loginId;
    }
    //로그인값으로 설정할때에 사용
    public void setLoginId(String loginId) {
        this.loginId = loginId;
    }
    //비밀번호 값조회
    public String getPassword() {
        return password;
    }
    //비밀번호 값 설정
    public void setPassword(String password) {
        this.password = password;
    }
}
