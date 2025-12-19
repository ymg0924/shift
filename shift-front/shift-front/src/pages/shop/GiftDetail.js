import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Badge, Image } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import MainLayout from "../../components/common/MainLayout";
import { getGiftDetail, acceptGift, confirmGift } from "../../api/giftApi";
import ReviewWriteModal from "../../components/product/ReviewWriteModal";
import { resolveProductImage } from "../../utils/productImages";
import "../../styles/gift/gift.css";
import { BsGiftFill, BsTruck } from "react-icons/bs";

const mapDeliveryStatus = (status) => {
  switch (status) {
    case "P":
      return "배송준비중";
    case "S":
      return "배송중";
    case "D":
      return "배송완료";
    case "C":
      return "취소";
    default:
      return status || "-";
  }
};

const formatPrice = (price) => {
  return price ? price.toLocaleString() + "원" : "-";
};

const GiftDetail = () => {
  const { giftId } = useParams();
  const navigate = useNavigate();

  const [gift, setGift] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // 처리 중 상태

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState(null);
  const [reviewOrderItemId, setReviewOrderItemId] = useState(null);
  const [reviewProductName, setReviewProductName] = useState("");

  // 상세 조회 함수
  const loadGiftDetail = async () => {
    try {
      const data = await getGiftDetail(giftId);
      setGift(data);
    } catch (err) {
      console.error("선물 상세 조회 실패:", err);
      alert("선물 정보를 불러오지 못했습니다.");
      navigate(-1);
    }
  };

  // 선물 상세 정보 API 호출
  useEffect(() => {
    loadGiftDetail(); // 분리한 함수 사용
  }, [giftId]);

  // 수락 버튼 핸들러 (SHOP-019)
  const handleAccept = async () => {
    if (isProcessing || !gift) return;
    setIsProcessing(true);
    try {
      const response = await acceptGift(gift.orderId);

      // 백엔드 응답으로 상태 업데이트
      setGift((prev) => ({ ...prev, ...response }));

      alert("선물을 수락했습니다!\n배송이 시작됩니다.");
    } catch (error) {
      console.error("선물 수락 실패:", error);
      alert("선물 수락 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 수령 확정 버튼 핸들러
  const handleConfirmReceipt = async () => {
    if (isProcessing || !gift) return;
    setIsProcessing(true);
    try {
      const response = await confirmGift(gift.orderId);

      // 백엔드 응답으로 상태 업데이트
      setGift((prev) => ({ ...prev, ...response }));

      alert("수령이 확정되었습니다!");
    } catch (error) {
      console.error("수령 확정 실패:", error);
      alert("수령 확정 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 리뷰 작성 버튼 핸들러
  const handleOpenReviewModal = (item) => {
    setReviewProductId(item.productId);
    setReviewOrderItemId(item.orderItemId);
    setReviewProductName(item.productName);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = async (name) => {
    alert(`[${name || "상품"}] 리뷰를 작성하였습니다.`);
    setShowReviewModal(false);
    loadGiftDetail(); // 데이터 갱신 (리뷰 작성 상태 업데이트)
  };

  // 로딩 중 표시
  if (!gift)
    return (
      <MainLayout>
        <Container className="py-5 text-center">로딩중...</Container>
      </MainLayout>
    );

  const items = gift?.items || [];
  const giftType = gift?.giftType || "PRODUCT";

  const isVoucher = giftType === "POINT";
  const isMultiProduct = !isVoucher && items.length > 1;
  const isSingleProduct = !isVoucher && items.length === 1;

  // 선물 요약 텍스트
  const giftSummary = (() => {
    if (!items || items.length === 0) {
      return gift.productName || "-";
    }
    if (items.length === 1) {
      return items[0].productName || `상품 ${items[0].productId}`;
    }
    return `${items[0].productName || `상품 ${items[0].productId}`} 외 ${
      items.length - 1
    }개`;
  })();

  // 리뷰 작성 가능 여부 판단
  const canWriteReviewForItem = (item) => {
    if (isVoucher) return false;
    if (gift?.deliveryStatus !== "D") return false;
    if (item.reviewWritten) return false; // 이미 true면 작성 불가
    return true;
  };

  // 상품 상세 페이지 이동
  const handleGoToProductDetail = (productId) => {
    if (!productId) return;
    navigate(`/product/${productId}`);
  };

  // 액션 버튼 렌더링
  const renderActionButton = () => {
    if (isVoucher) return null; // 금액권은 버튼 없음

    const isPaid = gift?.orderStatus === "S" || gift?.orderStatus === "PAID";

    // 결제 완료(S) + 배송 준비(P) -> 수락 버튼
    if (isPaid && gift?.deliveryStatus === "P") {
      return (
        <Button
          className="gift-btn-primary"
          size="lg"
          onClick={handleAccept}
          disabled={isProcessing}
        >
          {isProcessing ? "처리 중..." : "선물 수락하기"}
        </Button>
      );
    }
    // 배송중(S) -> 수령 확정 버튼
    if (gift?.deliveryStatus === "S") {
      return (
        <Button
          className="gift-btn-primary"
          size="lg"
          onClick={handleConfirmReceipt}
          disabled={isProcessing}
        >
          {isProcessing ? "처리 중..." : "수령 확정"}
        </Button>
      );
    }
    return null;
  };

  return (
    <MainLayout maxWidth="1000px">
      {/* 상단 헤더 */}
      <div className="bg-white border-bottom sticky-top">
        <Container
          className="py-3 d-flex align-items-center"
          style={{ maxWidth: "800px" }}
        >
          <Button
            variant="link"
            className="text-dark p-0 me-3"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft size={20} />
          </Button>
          <h5 className="mb-0 fw-bold">받은 선물 상세</h5>
        </Container>
      </div>
      <Container className="py-5" style={{ maxWidth: "800px" }}>
        {/* 선물 요약 정보 */}
        <Card className="gift-card-custom">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span
                  className={`badge rounded-pill px-3 py-2 fw-normal ${
                    isVoucher ? "badge-voucher" : "badge-product"
                  }`}
                >
                  {isVoucher ? "금액권" : "상품"}
                </span>
                <span className="fw-bold fs-5 ms-1">No. {gift.orderId}</span>
              </div>
              <div className="text-muted small">{gift.orderDate}</div>
            </div>

            <div className="d-flex flex-column gap-2">
              <div className="info-row">
                <span className="info-label">보낸 사람</span>
                <span className="info-value fs-5">{gift.senderName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">선물 내용</span>
                <span
                  className="info-value text-truncate"
                  style={{ maxWidth: "60%" }}
                >
                  {giftSummary}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* 메인 컨텐츠 영역 */}

        {/* 금액권 */}
        {isVoucher && (
          <div className="gift-voucher-card mb-4">
            <div className="gift-voucher-header">
              <BsGiftFill size={48} className="mb-3 opacity-75" />
              <h3 className="fw-bold mb-0">Shift Gift Card</h3>
              <div className="small opacity-75 mt-1">마음을 담은 선물</div>
            </div>
            <div className="gift-voucher-body">
              <div className="text-secondary small mb-2 fw-bold">충전 금액</div>
              <h1 className="fw-bold text-gift-primary mb-0 display-5">
                {formatPrice(items[0]?.price).replace("원", "")}
                <span className="fs-4 ms-1">P</span>
              </h1>
            </div>
          </div>
        )}

        {/* 단건 상품 */}
        {isSingleProduct && items[0] && (
          <Card className="gift-card-custom">
            <div
              className="p-5 text-center bg-light"
              style={{ cursor: "pointer" }}
              onClick={() => handleGoToProductDetail(items[0].productId)}
            >
              <Image
                src={resolveProductImage(items[0].imageUrl)}
                className="shadow-sm rounded-4"
                style={{ width: "240px", height: "240px", objectFit: "cover" }}
              />
            </div>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h4
                  className="fw-bold mb-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleGoToProductDetail(items[0].productId)}
                >
                  {items[0].productName}
                </h4>
                <div className="text-muted fs-5">
                  {items[0].quantity}개 <span className="mx-2">|</span>{" "}
                  <span className="fw-bold text-dark">
                    {formatPrice(items[0].price)}
                  </span>
                </div>
              </div>

              {/* 리뷰 버튼 */}
              {canWriteReviewForItem(items[0]) && (
                <Button
                  className="gift-btn-outline w-100 rounded-3 py-2"
                  onClick={() => handleOpenReviewModal(items[0])}
                >
                  리뷰 작성하기
                </Button>
              )}
              {items[0].reviewWritten && gift.deliveryStatus === "D" && (
                <Button
                  variant="secondary"
                  className="w-100 rounded-3 py-2"
                  disabled
                >
                  리뷰 작성 완료
                </Button>
              )}
            </Card.Body>
          </Card>
        )}

        {/* 다건 상품 */}
        {isMultiProduct && (
          <Card className="gift-card-custom">
            <Card.Header className="bg-white py-3 fw-bold border-bottom">
              상품 목록 ({items.length})
            </Card.Header>
            <Card.Body className="p-0">
              {items.map((item, idx) => {
                const canWrite = canWriteReviewForItem(item);
                const hasReview = item.reviewWritten === true;
                return (
                  <div
                    key={idx}
                    className="d-flex p-3 border-bottom align-items-center"
                  >
                    <Image
                      src={resolveProductImage(item.imageUrl)}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 12,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        handleGoToProductDetail(item.productId);
                      }}
                      className="me-3 border bg-light"
                    />
                    <div className="flex-grow-1">
                      <div
                        className="fw-bold mb-1 text-dark fs-6"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          handleGoToProductDetail(item.productId);
                        }}
                      >
                        {item.productName}
                      </div>
                      <div className="text-muted small">
                        {formatPrice(item.price)} / {item.quantity}개
                      </div>
                    </div>
                    {/* 개별 리뷰 버튼 */}
                    <div className="ms-2">
                      {canWrite && (
                        <Button
                          size="sm"
                          className="gift-btn-outline rounded-pill px-3"
                          onClick={() => handleOpenReviewModal(item)}
                        >
                          리뷰
                        </Button>
                      )}
                      {gift.deliveryStatus === "D" && hasReview && (
                        <Badge bg="light" text="secondary" className="border">
                          작성완료
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        )}

        {/* 배송 정보 */}
        {!isVoucher && (
          <Card className="gift-card-custom">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 d-flex align-items-center">
                <span className="me-2">
                  <BsTruck />
                </span>{" "}
                배송 정보
              </h5>

              <div className="mb-4">
                <div className="text-muted small mb-1">받는 분 주소</div>
                <div className="fs-6 fw-medium p-3 bg-light rounded-3 text-dark border-0">
                  {gift.deliveryAddress || "배송지 정보가 없습니다."}
                </div>
              </div>

              {/* 배송 상태 강조 박스 */}
              <div className="delivery-status-box">
                <div className="delivery-status-label">현재 배송 상태</div>
                <div className="delivery-status-text">
                  {mapDeliveryStatus(gift.deliveryStatus)}
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* 하단 버튼 */}
        <div className="mt-4 mb-3">{renderActionButton()}</div>
      </Container>
      <ReviewWriteModal
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={handleReviewSuccess}
        productId={reviewProductId}
        orderItemId={reviewOrderItemId}
        productName={reviewProductName}
      />
    </MainLayout>
  );
};

export default GiftDetail;
