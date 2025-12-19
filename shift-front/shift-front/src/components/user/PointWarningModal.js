import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../../styles/auth/WithdrawalModal.css";

const PointWarningModal = ({ show, onHide, onConfirm, points }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      contentClassName="point-warning-modal"
      backdrop="static"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <h4 className="text-danger mt-2">포인트 소멸 경고</h4>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4 pt-0">
        {/* 제목 영역 */}
        <div className="text-center mb-4">
          <h4 className="fw-bold text-dark">
            잠시만요! 아직 포인트가 존재해요
          </h4>
          <p className="text-muted small m-0">
            지금 탈퇴하시면 소중한 포인트가 모두 사라져요.
          </p>
        </div>

        {/* 포인트 강조 */}
        <div className="point-display-box">
          <div className="point-display-label">현재 보유 포인트</div>
          <div className="point-display-value">
            {points?.toLocaleString()}{" "}
            <span style={{ fontSize: "1.5rem" }}>P</span>
          </div>
        </div>

        {/* 경고 리스트 */}
        <div className="px-2">
          <ul className="warning-list">
            <li>
              탈퇴 즉시 포인트는 <strong>모두 소멸</strong>됩니다.
            </li>
            <li>
              소멸된 포인트는 절대 <strong>복구할 수 없습니다.</strong>
            </li>
            <li>
              포인트를 <strong>먼저 사용하신 후</strong> 탈퇴하는 것을
              추천드려요!
            </li>
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 justify-content-center gap-2">
        {/* 푸터: 버튼 영역 */}
        <div className="modal-footer-custom">
          <Button
            variant="light"
            className="flex-fill py-3 fw-bold"
            style={{
              backgroundColor: "#f1f3f5",
              border: "none",
              color: "#495057",
            }}
            onClick={onHide}
          >
            취소 (포인트 쓰러가기)
          </Button>
          <Button
            className="flex-fill py-3 fw-bold btn-danger-custom"
            onClick={onConfirm}
          >
            포기하고 탈퇴
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default PointWarningModal;
