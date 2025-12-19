import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Button, Spinner, Alert, Form } from "react-bootstrap";
import MainLayout from "../../components/common/MainLayout";
import { updateReview } from "../../api/productApi";
import { IoArrowBack, IoStar, IoStarOutline } from "react-icons/io5";
import "../../styles/review-form.css";

const ReviewEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rev = location.state;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // 원본 데이터 저장
  const [originalRating, setOriginalRating] = useState(0);
  const [originalContent, setOriginalContent] = useState("");

  useEffect(() => {
    if (!rev) {
      setError("리뷰 정보를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    setRating(rev.rating);
    setContent(rev.content);
    setOriginalRating(rev.rating);
    setOriginalContent(rev.content);
    setLoading(false);
  }, [rev]);

  const handleUpdate = async () => {
    if (!rating) {
      alert("별점을 선택해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    try {
      setActionLoading(true);

      const dto = {
        reviewId: rev.reviewId,
        rating,
        content,
      };

      await updateReview(dto);

      alert("리뷰가 수정되었습니다.");
      navigate("/mypage", { state: { activeTab: "reviews" } });
    } catch (e) {
      console.error(e);
      alert("리뷰 수정 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  // 변경사항 확인
  const hasChanges = rating !== originalRating || content !== originalContent;

  if (loading) {
    return (
      <MainLayout maxWidth="800px">
        <Container className="py-5 d-flex justify-content-center">
          <Spinner animation="border" style={{ color: "#5b8fc3" }} />
        </Container>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout maxWidth="800px">
        <Container className="py-5">
          <Alert 
            variant="danger" 
            className="border-0 shadow-sm rounded-4"
            style={{ background: "#fff5f5" }}
          >
            {error}
          </Alert>
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4"
            onClick={() => navigate("/mypage", { state: { activeTab: "reviews" } })}
          >
            <IoArrowBack className="me-2" />
            뒤로가기
          </Button>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout maxWidth="800px">
      <Container className="py-4" style={{ maxWidth: "680px" }}>
        {/* 헤더 */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 
              className="fw-bold mb-1" 
              style={{ color: "#222", letterSpacing: "-0.5px" }}
            >
              리뷰 수정하기
            </h2>
            <p className="text-muted mb-0 small">
              상품에 대한 솔직한 의견을 남겨주세요
            </p>
          </div>
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4 fw-medium"
            onClick={() =>
              navigate("/mypage", { state: { activeTab: "reviews" } })
            }
          >
            <IoArrowBack className="me-2" />
            뒤로가기
          </Button>
        </div>

        {/* 상품 정보 카드 */}
        <Card 
          className="border-0 shadow-sm mb-4 rounded-4"
          style={{ 
            background: "linear-gradient(135deg, #c5ebf5ff 0%, #c5dff5ff 50%, #7f97daff 100%)",
            overflow: "hidden"
          }}
        >
          <Card.Body className="p-4">
            <div 
              className="small fw-semibold mb-3" 
              style={{ 
                color: "#5b8fc3",
                letterSpacing: "0.5px",
                textTransform: "uppercase"
              }}
            >
              상품 정보
            </div>
            
            <div 
              className="fw-bold mb-2" 
              style={{ 
                fontSize: "1.1rem",
                color: "#222",
                lineHeight: "1.4"
              }}
            >
              {rev.productName}
            </div>

            <div className="d-flex align-items-center gap-3 text-muted small">
              <span className="fw-semibold" style={{ color: "#5b8fc3" }}>
                {rev.price?.toLocaleString()}원
              </span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>{rev.seller}</span>
            </div>
          </Card.Body>
        </Card>

        {/* 별점 선택 카드 */}
        <Card 
          className="border-0 shadow-sm mb-4 rounded-4"
          style={{ overflow: "hidden" }}
        >
          <Card.Body className="p-4">
            <div 
              className="small fw-semibold mb-3" 
              style={{ 
                color: "#5b8fc3",
                letterSpacing: "0.5px",
                textTransform: "uppercase"
              }}
            >
              별점
            </div>
            
            <div className="d-flex align-items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  onClick={() => setRating(num)}
                  onMouseEnter={() => setHoverRating(num)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    cursor: "pointer",
                    fontSize: "2.5rem",
                    transition: "all 0.2s ease",
                    transform: (hoverRating >= num || rating >= num) ? "scale(1.1)" : "scale(1)",
                    color: (hoverRating >= num || rating >= num) ? "#ffd700" : "#e0e0e0",
                  }}
                >
                  {(hoverRating >= num || rating >= num) ? (
                    <IoStar style={{ filter: "drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))" }} />
                  ) : (
                    <IoStarOutline />
                  )}
                </div>
              ))}
              {rating > 0 && (
                <span 
                  className="ms-3 fw-bold" 
                  style={{ 
                    fontSize: "1.2rem",
                    color: "#5b8fc3"
                  }}
                >
                  {rating}.0
                </span>
              )}
            </div>


          </Card.Body>
        </Card>

        {/* 리뷰 내용 카드 */}
        <Card 
          className="border-0 shadow-sm mb-4 rounded-4"
          style={{ overflow: "hidden" }}
        >
          <Card.Body className="p-4">
            <div 
              className="small fw-semibold mb-3" 
              style={{ 
                color: "#5b8fc3",
                letterSpacing: "0.5px",
                textTransform: "uppercase"
              }}
            >
              리뷰작성
            </div>
            
            <Form.Control
              as="textarea"
              rows={8}
              maxLength={500}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="상품에 대한 솔직한 리뷰를 작성해주세요..."
              className="border-0 rounded-3"
              style={{
                background: "#f1f2f5ff",
                resize: "none",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                padding: "1rem",
              }}
            />
            
            <div 
              className="text-end mt-3"
            >
              <span 
                className="small fw-semibold"
                style={{ 
                  color: content.length >= 500 ? "#dc3545" : "#5b8fc3"
                }}
              >
                {content.length}/500
              </span>
            </div>
          </Card.Body>
        </Card>

        {/* 수정 버튼 */}
        <div className="d-flex gap-3">
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4 py-2 fw-medium flex-grow-1"
            onClick={() =>
              navigate("/mypage", { state: { activeTab: "reviews" } })
            }
            disabled={actionLoading}
          >
            취소
          </Button>
          <Button
            className="rounded-pill px-5 py-2 fw-semibold flex-grow-1 border-0"
            style={{
              background: "linear-gradient(135deg, #5b8fc3 0%, #4a7ba7 100%)",
              boxShadow: "0 4px 12px rgba(91, 143, 195, 0.3)",
              transition: "all 0.3s ease",
            }}
            disabled={actionLoading || !rating || !content.trim() || !hasChanges}
            onClick={handleUpdate}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(91, 143, 195, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(91, 143, 195, 0.3)";
            }}
          >
            {actionLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                처리 중...
              </>
            ) : (
              "수정 완료"
            )}
          </Button>
        </div>

        {/* 하단 안내 */}
        <div 
          className="text-center mt-4 p-3 rounded-3"
          style={{ 
            background: "#f8f9fa",
            fontSize: "0.85rem",
            color: "#666"
          }}
        >
          💡 리뷰는 다른 고객들에게 큰 도움이 됩니다
        </div>
      </Container>
    </MainLayout>
  );
};

export default ReviewEdit;