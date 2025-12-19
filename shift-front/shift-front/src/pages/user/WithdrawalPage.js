import React, { useState, useEffect } from "react";
import { Container, Button, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import MainLayout from "../../components/common/MainLayout";
import PasswordConfirmModal from "../../components/user/PasswordConfirmModal";
import PointWarningModal from "../../components/user/PointWarningModal";
import { getMyInfo, verifyPassword, withdrawUser } from "../../api/userApi";
import "../../styles/auth/Withdrawal.css";

const WithdrawalPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userInfo, setUserInfo] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);

  // 비밀번호 모달 관련
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  // 포인트 경고 모달
  const [showPointWarningModal, setShowPointWarningModal] = useState(false);

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getMyInfo();
        setUserInfo(data);
      } catch (error) {
        alert("사용자 정보를 불러오는데 실패했습니다.");
        navigate("/mypage");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // 비밀번호 확인 완료
  const handlePasswordConfirm = async (password) => {
    try {
      const isValid = await verifyPassword(password);

      if (isValid) {
        setIsVerified(true);
        setShowPasswordModal(false);
      } else {
        alert("비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "비밀번호 확인에 실패했습니다.";
      alert(errorMsg);
    }
  };

  // 비밀번호 모달 닫기
  const handlePasswordModalClose = () => {
    navigate("/mypage");
  };

  // 회원탈퇴 버튼 클릭
  const handleWithdrawalClick = () => {
    if (!agreed) {
      alert("회원탈퇴에 동의해주세요.");
      return;
    }

    // 포인트가 있으면 경고 모달 표시
    if (userInfo?.points > 0) {
      setShowPointWarningModal(true);
    } else {
      // 포인트가 없으면 바로 탈퇴 확인
      handleWithdrawal();
    }
  };

  // 포인트 경고 모달에서 확인 클릭
  const handlePointWarningConfirm = () => {
    setShowPointWarningModal(false);
    handleWithdrawal();
  };

  // 실제 회원탈퇴 처리
  const handleWithdrawal = async () => {
    if (
      !window.confirm("정말 탈퇴하시겠습니까?\n탈퇴 후에는 복구할 수 없습니다.")
    ) {
      return;
    }

    try {
      setLoading(true);

      // 회원탈퇴 API 호출 (백엔드에서 비밀번호 재확인 불필요)
      await withdrawUser();

      alert("회원탈퇴가 완료되었습니다.\n그동안 이용해주셔서 감사합니다.");

      // 로그아웃 처리
      dispatch(logout());

      // 메인 페이지로 이동
      navigate("/", { replace: true });
    } catch (error) {
      // 백엔드 에러 메시지 처리
      let errorMsg = "회원탈퇴에 실패했습니다.";

      if (error.response?.data) {
        const data = error.response.data;
        // 문자열로 온 경우
        if (typeof data === "string") {
          errorMsg = data;
        }
        // 객체로 온 경우
        else if (data.message) {
          errorMsg = data.message;
        }
      }

      // "진행 중인 주문이 있어 탈퇴할 수 없습니다" 같은 메시지
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isVerified) {
    return (
      <MainLayout>
        <Container className="py-5 text-center">로딩중...</Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* 비밀번호 확인 모달 */}
      <PasswordConfirmModal
        show={showPasswordModal}
        onHide={handlePasswordModalClose}
        onConfirm={handlePasswordConfirm}
      />

      {/* 포인트 경고 모달 */}
      <PointWarningModal
        show={showPointWarningModal}
        onHide={() => setShowPointWarningModal(false)}
        onConfirm={handlePointWarningConfirm}
        points={userInfo?.points}
      />

      {/* 회원탈퇴 페이지 본문 */}
      {isVerified && (
        <Container
          className="py-5 d-flex justify-content-center"
          style={{ maxWidth: "820px" }}
        >
          <div
            className="withdrawal-card"
            style={{ maxWidth: "820px", width: "100%" }}
          >
            <div className="text-center mb-4">
              <h2 className="fw-bold text-danger">회원 탈퇴</h2>
              <p className="text-muted">Shift를 정말 떠나시겠습니까?</p>
            </div>

            {/* 경고 메시지 */}
            <div className="alert-danger-custom mb-4 shadow-sm">
              <div className="alert-title-custom">
                <i className="bi bi-exclamation-triangle-fill"></i>
                회원탈퇴 시 유의사항
              </div>

              <ul
                className="mb-0 ps-3"
                style={{ lineHeight: "1.6", fontSize: "1rem", color: "#555" }}
              >
                <li>
                  <strong>회원 정보 및 서비스 이용 기록 삭제</strong>
                  <div className="text-muted small mb-2">
                    탈퇴 즉시 회원 정보는 삭제되거나 비식별화 처리되며, 모든
                    서비스 이용 기록은 복구할 수 없습니다.
                  </div>
                </li>

                <li>
                  <strong>포인트 소멸</strong>
                  <div className="text-muted small mb-2">
                    <span className="text-danger fw-bold">
                      보유하신 포인트는 모두 소멸
                    </span>
                    되며, 탈퇴 후에는 절대 복구되지 않습니다.
                  </div>
                </li>

                <li>
                  <strong>진행 중인 거래 확인</strong>
                  <div className="text-muted small mb-2">
                    <span className="fw-bold text-dark">
                      현재 배송 중인 상품
                    </span>
                    이 있는 경우{" "}
                    <span className="text-danger fw-bold">
                      탈퇴가 불가능합니다.
                    </span>
                    <br />
                    상품이 도착하여 '구매 확정' 처리가 완료된 후 다시
                    시도해주세요.
                  </div>
                </li>

                <li>
                  <strong>법적 의무 보관</strong>
                  <div className="text-muted small">
                    전자상거래 등에서의 소비자 보호에 관한 법률에 따라 계약,
                    대금 결제 및 재화 공급에 관한 기록은 5년간 보관됩니다.
                  </div>
                </li>
              </ul>
            </div>

            {/* 회원 정보 표시 */}
            <div className="info-card-custom shadow-sm">
              <h5 className="fw-bold mb-4" style={{ color: "#343a40" }}>
                회원 정보 확인
              </h5>

              {/* 변경 전: d-flex justify-content-between (양끝 정렬) */}
              {/* 변경 후: Row > Col 구조 (비율 정렬) */}

              {/* 아이디 */}
              <Row className="mb-3 align-items-center">
                <Col xs={3} className="text-muted">
                  아이디
                </Col>
                <Col xs={9} className="fw-bold text-dark">
                  {userInfo?.loginId}
                </Col>
              </Row>

              {/* 이름 */}
              <Row className="mb-3 align-items-center">
                <Col xs={3} className="text-muted">
                  이름
                </Col>
                <Col xs={9} className="text-dark">
                  {userInfo?.name}
                </Col>
              </Row>

              <hr
                style={{
                  borderColor: "#dee2e6",
                  opacity: 0.5,
                  margin: "1.5rem 0",
                }}
              />

              {/* 포인트 (가장 중요한 정보니 글씨를 키웁니다) */}
              <Row className="align-items-center">
                <Col xs={3} className="fw-bold text-dark">
                  소멸 예정 포인트
                </Col>
                <Col xs={9}>
                  <span className="point-text" style={{ fontSize: "1.4rem" }}>
                    {" "}
                    {/* 포인트 글씨 약간 더 키움 */}
                    {userInfo?.points
                      ? userInfo.points.toLocaleString()
                      : "0"}{" "}
                    P
                  </span>
                </Col>
              </Row>
            </div>

            {/* 동의 체크박스 */}

            <div className="agreement-box mb-4 mt-4">
              <Form.Check
                type="checkbox"
                id="agree-withdrawal"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                label={
                  <span className="ms-2 fw-bold text-dark">
                    위 내용을 모두 확인했으며, 탈퇴에 동의합니다.
                  </span>
                }
              />
            </div>

            {/* 버튼 */}
            <div className="d-flex gap-3 mt-4">
              <Button
                className="flex-fill py-3 btn-cancel-custom"
                variant="light"
                onClick={() => navigate("/mypage")}
              >
                취소
              </Button>
              <Button
                className="flex-fill py-3 btn-danger-custom"
                onClick={handleWithdrawalClick}
                disabled={!agreed}
              >
                {agreed ? "탈퇴하기" : "동의 후 탈퇴 가능"}
              </Button>
            </div>
          </div>
        </Container>
      )}
    </MainLayout>
  );
};

export default WithdrawalPage;
