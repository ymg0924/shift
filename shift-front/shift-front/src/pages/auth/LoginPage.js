import React, { useState } from "react";
import { Form, Button, Col, Row, Container } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { loginSuccess } from "../../store/authSlice";
import FindIdModal from "../../components/user/FindIdModal";
import { storage } from "../../utils/storage";

import "../../styles/auth/Login.css";
import { SHIFT_LOGO_BLUE_TEXT } from "../../utils/logoImages";
import { LOGIN_BG } from "../../utils/authImages";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });

  // 에러 메세지 상태
  const [errorMessage, setErrorMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 사용자가 다시 입력할 때 에러 메시지 초기화
    if (errorMessage) setErrorMessage("");
  };

  // 모달 표시 상태
  const [showFindIdModal, setShowFindIdModal] = useState(false);

  /**
   * payload: {
   *  loginId: string,
   *  password: string
   * }
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    // 에러 메시지 초기화
    setErrorMessage("");

    // 유효성 검사
    if (!formData.loginId || !formData.password) {
      setErrorMessage("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      // 로그인 요청
      const data = await loginUser(formData);

      const { accessToken } = data;

      // 액세스 토큰 저장(localStorage + redux)
      storage.setToken(accessToken);
      dispatch(loginSuccess({ accessToken: accessToken })); // Redux 상태 업데이트

      navigate("/friends");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
      // 입력창 초기화
      setFormData({ loginId: "", password: "" });
    }
    setLoading(false);
  };

  return (
    <Container
      fluid
      className="vh-100 d-flex justify-content-center align-items-center bg-light p-4"
    >
      <Row
        className="shadow-lg rounded-5 overflow-hidden bg-white w-100 m-0"
        style={{ maxWidth: "1000px", height: "75vh", minHeight: "600px" }}
      >
        {/* 로그인 폼 영역 */}
        <Col
          xs={12}
          md={6}
          className="d-flex justify-content-center align-items-center p-5"
        >
          <div className="w-100" style={{ maxWidth: "400px" }}>
            {/* Logo */}
            <div className="text-center mb-4">
              {/* 로고 이미지 */}
              <img
                src={SHIFT_LOGO_BLUE_TEXT}
                alt="Logo"
                style={{ width: "200px", height: "auto" }}
              />
            </div>

            {/* Form */}
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-4" controlId="formId">
                <Form.Label className="fw-bold small text-secondary">
                  ID
                </Form.Label>
                <Form.Control
                  type="text"
                  name="loginId"
                  placeholder="아이디를 입력하세요"
                  value={formData.loginId}
                  className="py-3 bg-light shadow-none login-input-hover"
                  autoComplete="off"
                  style={{
                    borderColor: "#5b8fc3",
                    border: "1px solid #ced4da",
                  }}
                  onChange={handleChange}
                  isInvalid={!!errorMessage}
                />
              </Form.Group>

              <Form.Group className="mb-2" controlId="formPassword">
                <Form.Label className="fw-bold small text-secondary">
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  className="py-3 bg-light shadow-none login-input-hover"
                  autoComplete="off"
                  style={{
                    borderColor: "#5b8fc3",
                    border: "1px solid #ced4da",
                  }}
                  onChange={handleChange}
                  isInvalid={!!errorMessage}
                />
              </Form.Group>

              {/* 에러 메시지 표시 영역 */}
              {/* minHeight를 줘서 메시지가 없어도 공간을 차지하게 하거나, 없으면 아예 숨김 */}
              <div className="mb-3" style={{ minHeight: "24px" }}>
                {errorMessage && (
                  <div className="text-danger small fw-bold text-center animate__animated animate__fadeIn">
                    <i className="bi bi-exclamation-circle me-1"></i>{" "}
                    {/* 아이콘 있으면 좋음 */}
                    {errorMessage}
                  </div>
                )}
              </div>

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                className="w-100 py-3 fw-bold border-0 rounded-3 login-btn-hover"
                style={{
                  backgroundColor: "#5b8fc3",
                  color: "white",
                  fontSize: "1.1rem",
                }}
                disabled={loading}
              >
                Login
              </Button>
            </Form>

            {/* 아이디 찾기/회원가입 */}
            <div className="mt-4 d-flex align-items-center gap-3 small text-secondary justify-content-center">
              <span
                role="button"
                className="text-decoration-none hover-text-dark login-link-hover"
                onClick={() => setShowFindIdModal(true)}
              >
                아이디 찾기
              </span>
              <span style={{ color: "#e0e0e0" }}>|</span>
              <span
                role="button"
                className="text-decoration-none hover-text-dark login-link-hover"
                onClick={() => navigate("/signup")}
              >
                회원가입
              </span>
            </div>
          </div>
        </Col>
        {/* 오른쪽 이미지 영역 */}
        <Col
          md={6}
          className="d-none d-md-block p-0"
          style={{
            // 오버레이 비법: linear-gradient를 이미지 위에 겹쳐서 사용
            backgroundImage: `
              linear-gradient(
                rgba(131, 154, 200, 0.5), 
                rgba(131, 154, 200, 0.5)
              ),
              url(${LOGIN_BG})
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </Row>

      <FindIdModal
        show={showFindIdModal}
        onClose={() => setShowFindIdModal(false)}
      />
    </Container>
  );
};

export default Login;
