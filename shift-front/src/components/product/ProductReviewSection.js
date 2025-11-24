import React, { useState, useMemo } from "react";
import "../../styles/review.css";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toISOString().substring(0, 10);
};

const StarRating = ({ rating, showNumber = false, size = 18 }) => {
  const totalStars = 5;

  return (
    <div className="star-wrap">
      {Array.from({ length: totalStars }).map((_, idx) => (
        <span
          key={idx}
          className={idx < rating ? "star active" : "star"}
          style={{ fontSize: `${size}px` }}
        >
          ★
        </span>
      ))}

      {showNumber && (
        <span className="star-number">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

const ProductReviewSection = ({ reviews }) => {
  const [expanded, setExpanded] = useState({});
  const [sortType, setSortType] = useState("latest");

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 📌 평균 평점 계산
  const { avgRating, count } = useMemo(() => {
    if (!reviews || reviews.length === 0)
      return { avgRating: 0, count: 0 };

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return {
      avgRating: total / reviews.length,
      count: reviews.length,
    };
  }, [reviews]);

  const MAX_LENGTH = 80;

  // 📌 정렬
  const sortedReviews = useMemo(() => {
    const arr = [...(reviews || [])];
    if (sortType === "latest")
      return arr.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    if (sortType === "high")
      return arr.sort((a, b) => b.rating - a.rating);
    if (sortType === "low")
      return arr.sort((a, b) => a.rating - b.rating);
    return arr;
  }, [sortType, reviews]);

  return (
    <div className="review-section">
      {/* 평균 평점 + 리뷰 개수 + 정렬 */}
      <div className="review-header">
        <div className="review-title">
          리뷰 ({count})
          {count > 0 && (
            <div className="avg-rating-box">
              <StarRating rating={avgRating} showNumber={true} size={20} />
            </div>
          )}
        </div>

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="review-sort"
        >
          <option value="latest">최신순</option>
          <option value="high">평점 높은순</option>
          <option value="low">평점 낮은순</option>
        </select>
      </div>

      {/* 리뷰 없음 */}
      {count === 0 && (
        <p className="no-review-text">등록된 리뷰가 없습니다.</p>
      )}

      {/* 리뷰 리스트 */}
      {sortedReviews.map((review) => {
        const isLong = review.content.length > MAX_LENGTH;
        const showFull = expanded[review.reviewId];

        const displayText =
          isLong && !showFull
            ? review.content.slice(0, MAX_LENGTH) + "..."
            : review.content;

        return (
          <div key={review.reviewId} className="review-card">
            {/* 상단 */}
            <div className="review-card-top">
              <StarRating rating={review.rating} showNumber={false} size={16} />
              <div className="review-user">
                {review.userName || "익명"}
              </div>
            </div>

            {/* 내용 */}
            <div className="review-content">{displayText}</div>

            {/* 더보기/접기 */}
            {isLong && (
              <div
                className="review-toggle"
                onClick={() => toggleExpand(review.reviewId)}
              >
                {showFull ? "접기 ▲" : "더보기 ▼"}
              </div>
            )}

            {/* 작성일 */}
            <div className="review-date">{formatDate(review.createdDate)}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductReviewSection;
