import React, { useMemo, useState, useEffect } from "react";
import { Container, Button, Form, Card } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../../components/common/MainLayout";
import FixedBottomButton from "../../components/common/FixedBottomButton";
import { createOrder, requestPayment } from "../../api/orderApi";
import { requestPaymentAndGiftMessage } from "../../api/sendGiftMessage";
import { clearCartByUser } from "../../api/cartApi";
import { getMyInfo } from "../../api/userApi"; 


const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 선물 메시지 전송용 chatroomId
  const chatroomId = useSelector(
    (state) => state.chat?.currentRoomId ?? null
  );
  // gift 여부
  const isGift = location.state?.isGift ?? false;

  const receiverIdFromState = location.state?.receiverId ?? null;
  const receiverId =
    receiverIdFromState ?? (typeof window !== "undefined" ? window.SHIFT_RECEIVER_ID : null) ?? null;

  // Cart.js → navigate("/checkout", { state: { items: [...] } }) 로 넘겨줄 예정
  const initialItemsFromState = location.state?.items || [];

  // 임시 더미 (직접 접속 시를 대비)
  const fallbackOrderItems = [
    { id: 1, name: "프리미엄 무선 헤드폰", price: 45000, quantity: 1 },
    { id: 2, name: "아로마 캔들 세트", price: 32000, quantity: 2 },
  ];

  const orderItems = useMemo(
    () =>
      initialItemsFromState.length > 0
        ? initialItemsFromState
        : fallbackOrderItems,
    [initialItemsFromState]
  );

  const [paymentMethod, setPaymentMethod] = useState("method-0");
  const [submitting, setSubmitting] = useState(false);
  const [pointToUse, setPointToUse] = useState(0);

  // 보유 포인트 상태
  const [availablePoints, setAvailablePoints] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(true);

  // 결제 화면 진입 시 내 포인트 조회
  useEffect(() => {
    const loadMyPoints = async () => {
      try {
        setLoadingPoints(true);
        const data = await getMyInfo(); 
        setAvailablePoints(data.points ?? 0);
      } catch (e) {
        console.error("내 포인트 조회 실패", e);
        setAvailablePoints(0);
      } finally {
        setLoadingPoints(false);
      }
    };

    loadMyPoints();
  }, []);

  // 총 금액
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

 // 결제 split 계산
  const calcPaymentSplit = () => {
    const amount = totalAmount; // 주문 총액
    let pointUsed = 0;

    if (paymentMethod === "method-0") {
      // 일반 결제: 포인트 사용 안 함
      pointUsed = 0;
    } else if (paymentMethod === "method-1") {
      // 포인트 100% 결제
      pointUsed = amount;
    } else if (paymentMethod === "method-2") {
      // 혼합 결제: 사용자가 입력한 pointToUse 만큼 사용
      const safePoint = Math.max(0, Math.min(pointToUse || 0, amount, availablePoints));
      pointUsed = safePoint;
    }

    const cashAmount = amount - pointUsed; // 실제 현금 결제 금액

    return { amount, pointUsed, cashAmount };
  };

  // 결제 버튼 클릭 핸들러
  const handlePayment = async () => {
    if (orderItems.length === 0) {
      alert("주문할 상품이 없습니다.");
      return;
    }
    // 포인트 결제 선택인데, 보유 포인트가 부족한 경우
    if (paymentMethod === "method-1" && availablePoints < totalAmount) {
      alert(
        `보유 포인트가 부족하여 포인트 결제를 할 수 없습니다.\n` +
          `필요 포인트: ${totalAmount.toLocaleString()}P, ` +
          `보유 포인트: ${availablePoints.toLocaleString()}P`
      );
      return;
    }

    try {
      setSubmitting(true);

      // 1) 주문 생성 요청 payload 구성
      const orderRequest = {
        receiverId,
        items: orderItems.map((item) => ({
          productId: item.productId ?? item.id,
          quantity: item.quantity,
        })),
      };

      const orderRes = await createOrder(orderRequest);
      const orderId = orderRes.orderId;

      const orderStatus = orderRes.orderStatus || orderRes.status;
      const orderTotalPrice = orderRes.totalPrice ?? totalAmount;

      if (!orderId) {
        alert("주문 생성에 실패했습니다. (orderId 없음)");
        return;
      }

      // 2) 결제 금액/포인트 사용액 계산
       const { amount, pointUsed, cashAmount } = calcPaymentSplit();

      // amount는 반드시 주문 총액과 같아야 함
      if (amount !== orderTotalPrice) {
        console.warn("프론트 계산 총액과 백엔드 응답 totalPrice가 다릅니다.", {
          amount,
          orderTotalPrice,
        });
      }

      const paymentRequest = {
        orderId,
        amount,
        pointUsed,
      };

      let paymentRes;
      if (isGift && chatroomId) {
        // 채팅방에서 온 선물 플로우에만 "결제 + 선물메시지" 동시 처리
        paymentRes = await requestPaymentAndGiftMessage(paymentRequest, chatroomId);
      } else {
        // 일반 결제 / 채팅과 무관한 선물(친구 선택) 플로우
        paymentRes = await requestPayment(paymentRequest);
      }
      
      const paymentStatus = paymentRes.status;
      if (paymentStatus === "SUCCESS") {
        alert(
          `결제가 정상적으로 완료되었습니다.\n(현금: ${cashAmount.toLocaleString()}원, 포인트: ${pointUsed.toLocaleString()}P)`
        );
        // 결제성공시 장바구니 비우기
        try {
        await clearCartByUser();
        } catch (err) {
          console.error("장바구니 비우기 실패", err);
          // 실패해도 결제 완료 화면 이동은 막지 않음
        }
        // 결제 성공시 완료페이지로
        navigate(`/checkout/complete/${orderId}`, {
          state: {
            orderId,
            orderStatus,
            totalPrice: orderTotalPrice,
            payment: paymentRes,
            items: orderItems,   // 완료 페이지에서 상품 표시용
            receiverId
          },
        });
      } else {
        alert(
          `결제에 실패했습니다. (status: ${
            paymentStatus || "UNKNOWN"
          })`
        );
      }
    } catch (e) {
      console.error("주문/결제 처리 중 오류", e);
      alert("주문/결제 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };
  const { pointUsed: previewPoint, cashAmount: previewCash } = calcPaymentSplit();

  return (
    <>
      <MainLayout maxWidth="800px">
        <Container className="py-4">
          <h2 className="fw-bold mb-5">주문/결제</h2>

          {/* 배송지 정보 - 현재는 더미, 나중에 실제 주소 연동 */}
          <section className="mb-5">
            <h5 className="fw-bold mb-3">배송지</h5>
            <Card className="bg-light border p-3">
              <div className="d-flex gap-3 mb-1">
                <span className="text-muted" style={{ width: "60px" }}>
                  수령인
                </span>
                <span>홍길동</span>
              </div>

              <div className="d-flex gap-3 mb-1">
                <span className="text-muted" style={{ width: "60px" }}>
                  연락처
                </span>
                <span>010-1234-5678</span>
              </div>

              <div className="d-flex gap-3">
                <span className="text-muted" style={{ width: "60px" }}>
                  주소
                </span>
                <div>
                  서울특별시 강남구 테헤란로 123 <br />
                  상세주소: 456호
                </div>
              </div>
            </Card>
          </section>

          {/* 결제 수단 */}
          <section className="mb-5">
            <h5 className="fw-bold mb-3">결제수단</h5>
            <Form>
              {/* 보유 포인트 표시 */}
              <div className="mb-3 small text-muted">
                보유 포인트:{" "}
                {loadingPoints
                  ? "불러오는 중..."
                  : `${availablePoints.toLocaleString()} P`}
              </div>

              {["일반결제", "포인트 결제", "일반 + 포인트 결제"].map(
                (label, idx) => (
                  <div
                    key={idx}
                    className="mb-3 border rounded p-3 d-flex align-items-center"
                  >
                    <Form.Check
                      type="radio"
                      id={`payment-${idx}`}
                      label={label}
                      name="paymentMethod"
                      checked={paymentMethod === `method-${idx}`}
                      onChange={() => setPaymentMethod(`method-${idx}`)}
                      className="mb-0"
                    />
                  </div>
                )
              )}

              {/* 혼합 결제일 때 포인트 입력 필드 */}
              {paymentMethod === "method-2" && (
                <div className="mt-2">
                  <Form.Label>사용할 포인트</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    max={Math.min(totalAmount, availablePoints)}
                    value={pointToUse}
                    onChange={(e) => setPointToUse(Number(e.target.value) || 0)}
                  />
                  <div className="mt-2 small text-muted">
                    미리보기 — 포인트: {previewPoint.toLocaleString()}P, 현금:{" "}
                    {previewCash.toLocaleString()}원
                  </div>
                </div>
              )}

            </Form>
          </section>

          {/* 주문 상품 */}
          <section className="mb-5">
            <h5 className="fw-bold mb-3">주문 상품</h5>
            <div className="d-flex flex-column gap-2">
              {orderItems.map((item, idx) => (
                <Card key={item.id ?? item.productId ?? idx} className="border-0 bg-light p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">
                        {item.name ?? item.productName}
                      </div>
                      <small className="text-muted">
                        수량: {item.quantity}개
                      </small>
                    </div>

                    <div className="fw-bold">
                      {(item.price * item.quantity).toLocaleString()}원
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* 결제 정보 */}
          <section className="mb-5">
            <h5 className="fw-bold mb-3">결제 정보</h5>
            <Card className="p-4 border bg-light">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">총 상품금액</span>
                <span>{totalAmount.toLocaleString()}원</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">배송비</span>
                <span>0원</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center pt-2">
                <span className="fw-bold fs-5">최종 결제 금액</span>
                <span className="fw-bold fs-4 text-primary">
                  {totalAmount.toLocaleString()}원
                </span>
              </div>
            </Card>
          </section>
        </Container>
      </MainLayout>

      <FixedBottomButton width="800px">
        <Button
          variant="dark"
          className="w-100 py-3 fw-bold"
          size="lg"
          onClick={handlePayment}
          disabled={submitting}
        >
          {submitting
            ? "결제 처리 중..."
            : `${totalAmount.toLocaleString()}원 결제하기`}
        </Button>
      </FixedBottomButton>
    </>
  );
};

export default Checkout;
