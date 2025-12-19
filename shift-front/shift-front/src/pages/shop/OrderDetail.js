import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { IoArrowBack, IoCheckmarkCircleOutline } from "react-icons/io5";
import MainLayout from "../../components/common/MainLayout";
import {
  getOrderDetail,
  cancelOrder,
  requestRefund,
  confirmOrder,
} from "../../api/orderApi";
import ReviewWriteModal from "../../components/product/ReviewWriteModal";
import httpClient from "../../api/httpClient";
import { resolveProductImage, VOUCHER_IMG } from "../../utils/productImages";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 리뷰 모달 상태
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState(null);
  const [reviewOrderItemId, setReviewOrderItemId] = useState(null);
  const [reviewProductName, setReviewProductName] = useState("");

  const formatNumber = (num) => {
    if (num == null) return "-";
    return Number(num).toLocaleString();
  };

  const formatDateTime = (str) => {
    if (!str) return "";
    if (str.includes("T")) {
        const [date, time] = str.split('T');
        return `${date} ${time.substring(0, 5)}`;
    }
    return str;
  };

  // 배송 상태 색상 개선 (파스텔 톤 적용)
  const getDeliveryStatusStyle = (status) => {
    switch (status) {
      case "P": // 배송준비중 (오렌지/옐로우)
        return { text: "배송준비중", bg: "#fff3cd", color: "#856404", border: "1px solid #ffeeba" };
      case "S": // 배송중 (블루)
        return { text: "배송중", bg: "#cff4fc", color: "#055160", border: "1px solid #b6effb" };
      case "D": // 배송완료 (그린)
        return { text: "배송완료", bg: "#d1e7dd", color: "#0f5132", border: "1px solid #badbcc" };
      case "C": // 취소 (그레이)
        return { text: "주문취소", bg: "#f8f9fa", color: "#6c757d", border: "1px solid #dee2e6" };
      default:
        return { text: status || "-", bg: "#f8f9fa", color: "#212529", border: "1px solid #dee2e6" };
    }
  };

  const mapPaymentStatus = (status) => {
    switch (status) {
      case "SUCCESS": return "결제완료";
      case "PENDING": return "결제대기";
      case "CANCELED": return "결제취소";
      default: return status || "-";
    }
  };

  // 주문 상세 재조회 함수
  const loadDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderDetail(orderId);
      
      // 각 주문상품(orderItem)에 대해 리뷰 작성 여부를 서버에서 조회
      if (data.items && data.items.length > 0) {
        const itemsWithReview = await Promise.all(
          data.items.map(async (item) => {
            try {
              const res = await httpClient.get(
                `/products/order-items/${item.orderItemId}/reviews/check`
              );
              const { reviewWritten } = res.data || {};
              return { ...item, reviewWritten: !!reviewWritten };
            } catch (e) {
              return item; // 실패하면 기존 데이터 그대로 사용
            }
          })
        );
        data.items = itemsWithReview;
      }

      setOrder(data);
    } catch (e) {
      console.error("주문 상세 조회 실패", e);
      setError("주문 상세 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [orderId]);

  // 주문 취소 가능 여부: 주문상태 S + 배송상태 P 조건을
  // payment.status(SUCCESS) + delivery.status(P)로 판단
  
  // 안전하게 order가 null일 수 있으므로 optional chaining으로 보호
  const paymentStatus = order?.payment?.status; // SUCCESS / PENDING / CANCELED
  const deliveryStatus = order?.delivery?.status; // P / S / D / C

  // 금액권(카테고리 ID=3) 주문 여부 플래그
  const isGiftVoucher = order?.items?.some((item) => item.categoryId === 3);

  // "나에게 구매"인지 여부 (sender == receiver)
  const isSelfOrder =
    order && order.senderId != null && order.receiverId != null
      ? order.senderId === order.receiverId
      : false;

  // 주문 취소 가능 여부: 주문상태 S + 배송상태 P 조건을
  // payment.status(SUCCESS) + delivery.status(P)로 판단
  const canCancel =
    paymentStatus === "PENDING" &&
    (deliveryStatus === "P" || deliveryStatus == null);

  /**
   * 환불 가능 조건 (SHOP-013)
   * - 결제완료(SUCCESS)
   * - 배송 상태가 취소(C)가 아닌 경우
   */
  const canRefund =
    isSelfOrder &&
    paymentStatus === "SUCCESS" && 
    deliveryStatus !== "C" &&
    deliveryStatus !== "D" && // 구매확정 후(D,D)는 환불 버튼 숨김
    !isGiftVoucher;  // 금액권이면 환불 버튼 숨김

  /**
   * 구매확정 가능 조건 (SHOP-020, "나에게 구매"만 우선)
   * - 나에게 구매 (sender == receiver)
   * - 결제완료(SUCCESS)
   * - 배송이 취소되지 않음
   * - 이미 배송완료(D) 상태에서 확정하는 시나리오도 허용 (또는 여기서 조건 조정 가능)
   */
  const canConfirmPurchase =
    isSelfOrder &&
    paymentStatus === "SUCCESS" &&
    deliveryStatus !== "C" &&
    deliveryStatus !== "D"; // 이미 확정된 건 또 못 누르게

  /**
   * 리뷰 작성 버튼 노출 조건
   * - 나에게 구매
   * - 결제완료(SUCCESS)
   * - 배송상태 D (구매확정 이후)
   * - 금액권 주문 아님
   */
  const canWriteReview =
    isSelfOrder &&
    paymentStatus === "SUCCESS" &&
    deliveryStatus === "D" &&
    !isGiftVoucher;

  // 주문 취소
  const handleCancelOrder = async () => {
    if (!order) return;

    const ok = window.confirm("주문을 취소하시겠습니까?");
    if (!ok) return;

    try {
      setActionLoading(true);
      const res = await cancelOrder(order.orderId);
      if (!res?.result) { alert("취소할 수 없는 상태입니다."); return; }
      alert("주문이 취소되었습니다.");
      await loadDetail(); // 상태 다시 조회
    } catch (e) { alert("오류가 발생했습니다."); } finally { setActionLoading(false); }
  };

  // 환불 요청
  const handleRefund = async () => {
    if (!order) return;
    if (!window.confirm("환불을 요청하시겠습니까?")) return;
    // 환불 요청 금액 = 결제된 현금 + 포인트
    const amount = (order.payment?.cashAmount ?? 0) + (order.payment?.pointUsed ?? 0);
    try {
      setActionLoading(true);
      const res = await requestRefund(order.orderId, amount);
      if (!res?.result) { alert("환불 요청 실패"); return; }
      alert("환불이 완료되었습니다.");
      // 환불 완료 후 주문 목록(Mypage - 주문목록 탭)으로 자동 이동
      navigate("/mypage", { state: { activeTab: "orders" } });
    } catch (e) { alert("오류가 발생했습니다."); } finally { setActionLoading(false); }
  };

  // 구매확정 (나에게 구매용)
  const handleConfirmPurchase = async () => {
    if (!order) return;
    if (!window.confirm("구매확정 하시겠습니까? 확정 후엔 환불이 불가합니다.")) return;
    try {
      setActionLoading(true);
      const res = await confirmOrder(order.orderId);
      if (!res?.result) { alert("구매확정 실패"); return; }
      alert("구매가 확정되었습니다.");
      await loadDetail(); // 주문/배송 상태 재조회 (D,D 포함)
    } catch (e) { alert("오류가 발생했습니다."); } finally { setActionLoading(false); }
  };

  // 상품 상세로 이동
  const handleGoToProductDetail = (id) => id && navigate(`/product/${id}`);

  // 리뷰 작성 모달 열기
  const handleOpenReviewModal = (item) => {
    if (!item?.productId) return;
    setReviewProductId(item.productId);
    setReviewOrderItemId(item.orderItemId);
    setReviewProductName(item.productName || `상품 ${item.productId}`);
    setShowReviewModal(true);
  };

  // 리뷰 작성 성공 시 콜백 (필요하면 상세 재조회)
  const handleReviewSuccess = async (productNameFromChild) => {
    alert(`[${productNameFromChild || "상품"}] 리뷰 작성 완료`);
    setShowReviewModal(false);
    await loadDetail(); 
  };

  // 렌더링용 변수 미리 계산
  const badgeStyle = order ? getDeliveryStatusStyle(order.delivery?.status) : {};

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
          <Alert variant="danger" className="border-0 shadow-sm rounded-4" style={{ background: "#fff5f5" }}>
            {error}
          </Alert>
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => navigate(-1)}>
            <IoArrowBack className="me-2" /> 뒤로가기
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
            <h2 className="fw-bold mb-1" style={{ color: "#222", letterSpacing: "-0.5px" }}>
              주문 상세
            </h2>
            <p className="text-muted mb-0 small">
              주문하신 상품의 상세 내역입니다.
            </p>
          </div>
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4 fw-medium border-opacity-25"
            onClick={() => navigate(-1)}
          >
            <IoArrowBack className="me-2" />
            뒤로가기
          </Button>
        </div>

        {!order && <div className="text-muted p-5 text-center">주문 정보를 찾을 수 없습니다.</div>}

        {order && (
          <>
            {/* 주문 기본 정보 */}
            <Card className="border-0 shadow-sm mb-4 rounded-4" style={{ overflow: "hidden" }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <div className="small fw-bold mb-1" style={{ color: "#5b8fc3", letterSpacing: "0.5px" }}>
                            주문번호_
                        </div>
                        <div className="fw-bold" style={{ fontSize: "1.25rem", color: "#222" }}>
                            #{order.orderId}
                        </div>
                    </div>
                    <span
                        className="d-inline-block py-2 px-3 rounded-pill fw-bold"
                        style={{ 
                            fontSize: "0.85rem",
                            backgroundColor: badgeStyle.bg,
                            color: badgeStyle.color,
                            border: badgeStyle.border
                        }}
                    >
                        {badgeStyle.text}
                    </span>
                </div>

                <div className="p-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
                    <div className="row row-cols-2 g-3 small">
                        <div className="col">
                            <span className="text-muted d-block mb-1">주문일자</span>
                            <span className="fw-semibold text-dark">{formatDateTime(order.orderDate)}</span>
                        </div>
                        <div className="col">
                            <span className="text-muted d-block mb-1">결제 상태</span>
                            <span className="fw-semibold text-dark">{mapPaymentStatus(order.payment?.status)}</span>
                        </div>
                        <div className="col">
                            <span className="text-muted d-block mb-1">보내는 사람</span>
                            <span className="fw-semibold text-dark">{order.senderName ?? "-"}</span>
                        </div>
                        <div className="col">
                            <span className="text-muted d-block mb-1">받는 사람</span>
                            <span className="fw-semibold text-dark">{order.receiverName ?? "-"}</span>
                        </div>
                        <div className="col-12 border-top pt-3 mt-3">
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">운송장 번호</span>
                                <span className="fw-semibold text-dark">{order.delivery?.trackingNumber ?? "등록 대기중"}</span>
                            </div>
                        </div>
                    </div>
                </div>
              </Card.Body>
            </Card>

            {/* 주문 상품 목록 */}
            <Card className="border-0 shadow-sm mb-4 rounded-4" style={{ overflow: "hidden" }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4" style={{ color: "#222" }}>
                    주문 상품 <span className="text-muted fw-normal fs-6 ms-1">{order.items?.length ?? 0}개</span>
                </h5>

                {order.items && order.items.length > 0 ? (
                  <div className="d-flex flex-column gap-4">
                    {order.items.map((item, idx) => {
                      const hasReview = item.reviewWritten === true;
                      const isVoucher = item.categoryId === 3; // 금액권 여부 체크
                      
                      return (
                        <div key={item.productId ?? idx} className="d-flex gap-3 align-items-start position-relative">
                            {/* 금액권이 아닐 때만 클릭 가능한 이미지 */}
                            {!isVoucher ? (
                              <div 
                                  role="button"
                                  onClick={() => handleGoToProductDetail(item.productId)}
                                  style={{ width: 80, height: 80, flexShrink: 0, cursor: "pointer" }}
                              >
                                  <img
                                      src={resolveProductImage(item.imageUrl)}
                                      alt="상품"
                                      className="rounded-3 shadow-sm border"
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                              </div>
                            ) : (
                              // 금액권: 클릭 불가능한 이미지
                              <div style={{ width: 80, height: 80, flexShrink: 0 }}>
                                  <img
                                      src={VOUCHER_IMG}
                                      alt="금액권"
                                      className="rounded-3 shadow-sm border"
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                              </div>
                            )}

                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                    {isVoucher ? (
                                        // 금액권: 클릭 불가능한 일반 텍스트
                                        <span
                                            className="fw-bold text-dark"
                                            style={{ fontSize: "1rem", lineHeight: "1.3" }}
                                        >
                                            {item.productName ?? `금액권`}
                                        </span>
                                    ) : (
                                        // 일반 상품: 클릭 가능한 링크
                                        <span
                                            role="button"
                                            className="fw-bold text-dark text-decoration-none"
                                            style={{ fontSize: "1rem", lineHeight: "1.3", cursor: "pointer" }}
                                            onClick={() => handleGoToProductDetail(item.productId)}
                                            onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                                            onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                                        >
                                            {item.productName ?? `상품 ${item.productId}`}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="d-flex align-items-center text-muted small mb-2">
                                    <span>{formatNumber(item.itemPrice)}원</span>
                                    <span className="mx-2">|</span>
                                    <span>{item.quantity}개</span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <span className="fw-bold text-dark" style={{ fontSize: "1.05rem" }}>
                                        {formatNumber(item.itemPrice * item.quantity)}원
                                    </span>

                                    {/* 금액권은 리뷰 작성 불가 */}
                                    {canWriteReview && !isVoucher && (
                                        !hasReview ? (
                                            <Button
                                                variant="outline-dark"
                                                size="sm"
                                                className="rounded-pill px-3 py-1"
                                                onClick={() => handleOpenReviewModal(item)}
                                                style={{ fontSize: "0.75rem", borderColor: "#dee2e6" }}
                                            >
                                                리뷰 작성
                                            </Button>
                                        ) : (
                                            <span className="text-success small fw-medium">
                                                <IoCheckmarkCircleOutline className="me-1 fs-5" />
                                                작성 완료
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted text-center py-4">주문 상품 정보가 없습니다.</div>
                )}
              </Card.Body>
            </Card>

            {/* 결제 정보 */}
            <Card className="border-0 shadow-sm mb-4 rounded-4" style={{ overflow: "hidden" }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4" style={{ color: "#222" }}>결제 금액</h5>
                <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between text-muted small">
                        <span>총 상품금액</span>
                        <span>{formatNumber(order.totalPrice)}원</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted small">
                        <span>배송비</span>
                        <span>0원</span> {/* 배송비 정보가 없다면 0원 처리 혹은 숨김 */}
                    </div>
                    <div className="d-flex justify-content-between text-muted small">
                        <span>포인트 사용</span>
                        <span style={{ color: "#5b8fc3" }}>-{formatNumber(order.payment?.pointUsed)}P</span>
                    </div>
                    <hr className="my-3 border-secondary border-opacity-10" />
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold fs-5">총 결제 금액</span>
                        <span className="fw-bold fs-4 text-primary" style={{ color: "#222" }}>
                            {formatNumber((order.payment?.cashAmount ?? 0) + (order.payment?.pointUsed ?? 0))}원
                        </span>
                    </div>
                </div>
              </Card.Body>
            </Card>

            {/* 취소 / 환불 / 구매확정 버튼 영역 */}
            {(canConfirmPurchase || canCancel || canRefund) && (
              <div className="d-flex flex-column gap-2 mt-4 pb-4">
                {/* 구매확정 */}
                {canConfirmPurchase && (
                  <Button
                    className="rounded-pill px-5 py-3 fw-bold w-100 border-0"
                    style={{
                        background: "linear-gradient(135deg, #5b8fc3 0%, #4a7ba7 100%)",
                        boxShadow: "0 4px 12px rgba(91, 143, 195, 0.3)",
                        fontSize: "1rem"
                    }}
                    disabled={actionLoading}
                    onClick={handleConfirmPurchase}
                  >
                    {actionLoading ? <><Spinner animation="border" size="sm" className="me-2" />처리 중...</> : "구매 확정하기"}
                  </Button>
                )}
                
                {/* 주문 취소 / 환불 요청 버튼 */}
                {(canCancel || canRefund) && (
                  <div className="d-flex gap-2">
                    {canCancel && (
                      <Button
                        variant="outline-secondary"
                        className="rounded-pill px-4 py-2 fw-medium flex-grow-1"
                        disabled={actionLoading}
                        onClick={handleCancelOrder}
                      >
                        주문 취소
                      </Button>
                    )}

                    {canRefund && (
                      <Button
                        variant="outline-danger"
                        className="rounded-pill px-4 py-2 fw-medium flex-grow-1"
                        disabled={actionLoading}
                        onClick={handleRefund}
                        style={{ borderWidth: "1.5px" }}
                      >
                        환불 요청
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {/* 리뷰 작성 모달 */}
        <ReviewWriteModal
          show={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
          orderItemId={reviewOrderItemId}
          productId={reviewProductId}
          productName={reviewProductName}
        />
      </Container>
    </MainLayout>
  );
};

export default OrderDetail;