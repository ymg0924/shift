import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "../../styles/auth/WithdrawalModal.css";
import { FaUserShield } from "react-icons/fa6";

const PasswordConfirmModal = ({ show, onHide, onConfirm }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    onConfirm(password);
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      contentClassName="password-confirm-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0" />
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="px-4 pb-4 pt-0">
          {/* 제목 영역 */}
          <div className="text-center mb-4">
            <div className="mb-3">
              <span style={{ fontSize: "3rem", color: "#5b8fc3" }}>
                <FaUserShield />
              </span>
            </div>
            <h4 className="fw-bold text-dark mb-2">본인 확인</h4>
            <p className="password-guide-text m-0">
              소중한 정보 보호를 위해
              <br />
              현재 비밀번호를 입력해주세요.
            </p>
          </div>

          {/* 입력창 영역 */}
          <Form.Group className="mb-2">
            <Form.Control
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              className="password-modal-input"
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              isInvalid={!!error}
              autoFocus
            />
            <Form.Control.Feedback type="invalid" className="text-center mt-2">
              {error}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>

        {/* 버튼 영역 */}
        <Modal.Footer className="border-0 px-4 pb-4 pt-0 flex-nowrap gap-2">
          <Button className="flex-fill btn-cancel-light" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" className="flex-fill btn-confirm-custom">
            확인
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PasswordConfirmModal;
