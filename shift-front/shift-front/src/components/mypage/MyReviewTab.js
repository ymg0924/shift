import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { getMyReviews, deleteReview } from "../../api/productApi";
import { useNavigate } from "react-router-dom";
import DeleteConfirmModal from "../common/DeleteConfirmModal";

const MyReviewTab = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    reviewId: null,
  });

  /** 상품 상세 페이지로 이동 */
  const goToProduct = (productId) => {
    if (!productId) {
      alert("상품 ID가 없습니다.");
      return;
    }
    navigate(`/product/${productId}`, { state: { from: "mypage-reviews" } });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getMyReviews();
      setReviews(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReview(deleteModal.reviewId);
      setReviews((prev) =>
        prev.filter((r) => r.reviewId !== deleteModal.reviewId)
      );
    } finally {
      setDeleteModal({ show: false, reviewId: null });
    }
  };

  const formatDate = (str) => {
    const d = new Date(str);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(d.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="pt-3 d-flex flex-column gap-3">
      {!loading && reviews.length === 0 && (
        <div className="text-center text-muted">리뷰가 존재하지 않습니다.</div>
      )}

      {!loading &&
        reviews.map((rev) => (
          <Card
            key={rev.reviewId}
            className="border-0 shadow-sm"
            style={{ backgroundColor: "#eaf2fb" }}
          >
            <Card.Body className="p-4">
              {/* 상품명 클릭 → 상품 상세 페이지 이동 */}
              <div
                className="fw-bold mb-2"
                style={{
                  fontSize: "17px",
                  cursor: "pointer",
                  color: "#5b8fc3",
                }}
                onClick={() => goToProduct(rev.productId)}
              >
                {rev.productName}
              </div>

              <div className="text-muted small mb-2">
                {rev.price?.toLocaleString()}원 · {rev.seller}
              </div>

              {/* 별점 */}
              <div className="mb-2">
                <span style={{ color: "#FFD700", fontWeight: "bold" }}>
                  {"★".repeat(rev.rating)}
                </span>
                <span className="text-muted">{"★".repeat(5 - rev.rating)}</span>
              </div>

              <div className="mb-3 text-dark">{rev.content}</div>

              {/* 날짜 + 수정/삭제 버튼 */}
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  {formatDate(rev.createdDate)}
                </span>

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    style={{ borderColor: "#5b8fc3", color: "#5b8fc3" }}
                    onClick={() => navigate("/review/edit", { state: rev })}
                  >
                    수정
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    style={{
                      backgroundColor: "#5b8fc3",
                      borderColor: "#5b8fc3",
                    }}
                    onClick={() =>
                      setDeleteModal({
                        show: true,
                        reviewId: rev.reviewId,
                      })
                    }
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}

      <DeleteConfirmModal
        show={deleteModal.show}
        title="리뷰 삭제"
        message="삭제 시 복구가 불가능합니다. 정말 삭제하시겠습니까?"
        onCancel={() => setDeleteModal({ show: false, reviewId: null })}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default MyReviewTab;
