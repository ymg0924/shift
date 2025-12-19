import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getReceivedGifts } from "../../api/giftApi";
import "../../styles/mypage.css";
import "../../styles/gift/gift-list.css";

const GiftListTab = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [giftItems, setGiftItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatNumber = (n) => (n == null ? "-" : Number(n).toLocaleString());

  useEffect(() => {
    const fetchGifts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getReceivedGifts();
        setGiftItems(data);
      } catch (err) {
        setError("선물 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchGifts();
  }, []);

  const filteredGifts = giftItems.filter((item) => {
    if (filter !== "all" && item.giftType !== filter) return false;
    return true;
  });

  const handleViewDetail = (orderId, itemGiftType) => {
    navigate(`/gifts/${orderId}`, {
      state: { giftType: itemGiftType },
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };

  const getGiftTypeLabel = (giftType) => {
    switch (giftType) {
      case "POINT":
        return "금액권";
      case "PRODUCT":
      default:
        return "상품";
    }
  };

  return (
    <div className="pt-4">
      {/* 필터 버튼 */}
      <div className="mb-4 d-flex gap-2">
        {[
          { key: "all", label: "전체" },
          { key: "PRODUCT", label: "상품" },
          { key: "POINT", label: "금액권" },
        ].map((opt) => (
          <Button
            key={opt.key}
            className={`gift-filter-btn ${filter === opt.key ? "active" : "inactive"}`}
            onClick={() => setFilter(opt.key)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: "#5b8fc3" }} />
          <div className="mt-3 text-muted fw-semibold">불러오는 중...</div>
        </div>
      )}

      {error && (
        <Alert variant="dark" className="text-center fw-semibold border-2">
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <div className="d-flex flex-column gap-3">
          {filteredGifts.length > 0 ? (
            filteredGifts.map((item) => {
              // 선물 유형에 따른 배지 스타일 설정
              const isVoucher = item.giftType === "POINT";
              const badgeClass = isVoucher ? "badge-voucher" : "badge-product";

              return (
                <Card
                  key={item.orderId}
                  className="border-0 shadow-sm mypage-card-light mypage-hover rounded-4"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleViewDetail(item.orderId, item.giftType)}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-muted small fw-semibold">
                        {formatDate(item.orderDate)}
                      </span>

                      {/* 선물 유형 배지 */}
                      <span
                        className={`badge rounded-pill px-3 py-2 fw-normal ${badgeClass}`}
                      >
                        {getGiftTypeLabel(item.giftType)}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                      <div>
                        <div className="text-muted small mb-1">보낸 사람</div>
                        <div className="fw-bold text-dark">
                          {item.senderName ?? "-"}
                        </div>
                      </div>

                      <div className="text-end">
                        <div className="text-muted small mb-1">선물 번호</div>
                        <div className="fw-bold text-dark">#{item.orderId}</div>
                      </div>
                    </div>

                    <div className="text-muted small mb-1">선물 내용</div>
                    <div className="fw-semibold text-dark">
                      {item.productName ?? "선물 상세 정보"}
                    </div>

                    <div
                      className="text-end mt-3 small fw-semibold"
                      style={{ color: "#5b8fc3" }}
                    >
                      상세보기 →
                    </div>
                  </Card.Body>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-5 bg-light rounded-4 border">
              <div className="text-muted fw-semibold">
                표시할 선물이 없습니다.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GiftListTab;
