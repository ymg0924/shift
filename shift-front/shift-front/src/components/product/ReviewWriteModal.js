import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { createReview } from "../../api/productApi";
import { IoStar, IoStarOutline } from "react-icons/io5";

const ReviewWriteModal = ({
  show,
  onClose,
  onSuccess,
  productId,
  orderItemId,
  productName,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0); // 호버 상태
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (show) {
      setRating(5);
      setContent("");
    }
  }, [show]);

  const handleSubmit = async (e) => {
    if (!orderItemId) {
      alert("리뷰를 작성할 주문 상품 정보가 없습니다.");
      return;
    }

    if (!content.trim()) {
      alert("리뷰 내용을 입력해 주세요.");
      return;
    }

    try {
      setSubmitting(true);
      await createReview({
        productId: Number(productId),
        orderItemId: Number(orderItemId),
        rating: Number(rating),
        content: content.trim(),
      });

      // 작성 성공 후 폼 초기화
      setRating(5);
      setContent("");

      // 부모에서 리뷰 목록 재조회
      if (onSuccess) {
        onSuccess(productName || "");
      }
      onClose();
    } catch (error) {
      console.error("리뷰 작성 실패", error);
      alert("리뷰 작성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      contentClassName="border-0 rounded-4 shadow-lg"
    >
      <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
        <Modal.Title className="fw-bold fs-5">리뷰 작성</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        {/* 상품명 표시 */}
        <div className="text-center mb-4 mt-2">
          <div className="text-muted small mb-1">
            구매하신 상품은 어떠셨나요?
          </div>
          <h5 className="fw-bold text-dark mb-0 text-truncate px-3">
            {productName || "상품명 없음"}
          </h5>
        </div>

        {/* 별점 선택 */}
        <div className="mb-4 text-center">
          <div className="d-flex justify-content-center align-items-center gap-2">
            {[1, 2, 3, 4, 5].map((num) => {
              // 마우스가 hover거나, 선택된 별점보다 작거나 같으면 활성화
              const isActive = (hoverRating || rating) >= num;

              return (
                <div
                  key={num}
                  onClick={() => setRating(num)}
                  onMouseEnter={() => setHoverRating(num)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    cursor: "pointer",
                    fontSize: "2.5rem",
                    transition: "all 0.2s ease",
                    // 활성화되면 살짝 커지고 골드색, 아니면 회색
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                    color: isActive ? "#ffd700" : "#e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    filter: isActive
                      ? "drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))"
                      : "none",
                  }}
                >
                  {isActive ? <IoStar /> : <IoStarOutline />}
                </div>
              );
            })}

            {/* 점수 텍스트 */}
            <span
              className="ms-2 fw-bold"
              style={{
                fontSize: "1.5rem",
                color: "#5b8fc3",
                minWidth: "40px",
                textAlign: "left",
              }}
            >
              {rating}.0
            </span>
          </div>
        </div>

        {/* 내용 입력 */}
        <Form.Group className="mb-4">
          <Form.Control
            as="textarea"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상품에 대한 솔직한 리뷰를 남겨주세요."
            disabled={submitting}
            className="bg-light border-0 rounded-3 p-3 shadow-none"
            style={{ resize: "none", fontSize: "0.95rem" }}
          />
          <div className="text-end text-muted small mt-2">
            {content.length}자 / 500자
          </div>
        </Form.Group>

        {/* 버튼 영역 */}
        <div className="d-grid gap-2">
          <Button
            className="py-3 fw-bold rounded-3 border-0 shadow-sm"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: "#5b8fc3",
              color: "#fff",
              fontSize: "1rem",
            }}
          >
            {submitting ? "등록 중..." : "리뷰 등록하기"}
          </Button>

          <Button
            variant="link"
            className="text-secondary text-decoration-none fw-semibold"
            onClick={onClose}
            disabled={submitting}
          >
            다음에 작성하기
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ReviewWriteModal;
