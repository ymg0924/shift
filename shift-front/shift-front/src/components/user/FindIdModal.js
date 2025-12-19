import React from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useState } from "react";
import { findUserId } from "../../api/userApi";
import "../../styles/auth/FindId.css";

const FindIdModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const [foundId, setFoundId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 모달 닫기, 상태 초기화
  const handleClose = () => {
    setFormData({
      name: "",
      phone: "",
    });
    setFoundId(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.name || !formData.phone) {
      setError("이름과 전화번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setFoundId(null);

    try {
      const response = await findUserId(formData);
      setFoundId(response.loginId);
    } catch (err) {
      setError(
        err.response?.data?.message || "일치하는 회원 정보를 찾을 수 없습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      contentClassName="border-0 rounded-4 shadow-lg"
    >
      <Modal.Header closeButton className="border-0 px-4 pt-4">
        <Modal.Title className="fw-bold text-secondary fs-5">
          {foundId ? "아이디 찾기 성공" : "아이디 찾기"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4">
        {foundId ? (
          <div className="text-center animate__animated animate__fadeIn">
            <p className="text-secondary mb-4">
              찾으신 아이디는 다음과 같습니다:
            </p>

            <div className="bg-light py-4 rounded-3 mb-4">
              <h4 className="fw-bold m-0" style={{ color: "#5b8fc3" }}>
                {foundId}
              </h4>
            </div>

            <Button
              className="w-100 py-3 fw-bold border-0 rounded-3 btn-modal-custom"
              onClick={handleClose}
            >
              로그인 하러가기
            </Button>
          </div>
        ) : (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small text-secondary">
                이름
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                placeholder="이름을 입력해주세요"
                className="py-3 bg-light shadow-none form-modal-custom"
                style={{ border: "1px solid #ced4da" }}
                autoComplete="off"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small text-secondary">
                전화번호
              </Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                placeholder="전화번호를 입력해주세요(- 제외)"
                className="py-3 bg-light shadow-none form-modal-custom"
                style={{ border: "1px solid #ced4da" }}
                autoComplete="off"
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Form.Group>

            <div className="mb-3" style={{ minHeight: "24px" }}>
              {error && (
                <div className="text-danger text-center fw-bold small">
                  {error}
                </div>
              )}
            </div>

            <Button
              className="w-100 py-3 fw-bold border-0 rounded-3 btn-modal-custom"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "찾는 중..." : "아이디 찾기"}
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default FindIdModal;
