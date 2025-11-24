import React, { useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentRoomId } from "../../store/chatSlice";
import MainLayout from "../../components/common/MainLayout";
import httpClient from "../../api/httpClient";
import "../../styles/checkoutComplete.css";

const CheckoutComplete = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    items = [],
    totalPrice = 0,
  } = location.state || {};

  const chatroomId = useSelector(
    (state) => state.chat?.currentRoomId ?? null
  );

  // 언마운트 시 gift 플로우용 currentRoomId 초기화
  useEffect(() => {
    return () => {
      dispatch(setCurrentRoomId(null));
    };
  }, [dispatch]);

  const handleGoToChat = () => {
    // 채팅방 정보 불러와서 채팅방으로 이동
    (async () => {
      try {
        const chatroom = await httpClient.get(`/chatrooms/data/${chatroomId}`);
        console.log("응답 데이터:", chatroom.data);

        const chatroomData = chatroom.data;
        navigate(`/chatroom/${chatroomId}`, { state: { room: chatroomData } });

      } catch (error) {
        console.error("채팅방 정보 불러오기 오류:", error);
              navigate("/chatroom/list");
      }
    })();
  };

  return (
    <MainLayout maxWidth="900px">
        <div className="checkout-complete-bg">
            <div className="checkout-complete-wrapper">
                <Container className="py-4">

        {/* 주문 완료 헤더 */}
        <div className="text-center mb-4 checkout-complete-header">

          <div className="checkout-complete-icon">✔</div>

          <h3>주문이 완료되었습니다</h3>
          <p>결제가 정상적으로 처리되었어요.</p>

          <div className="checkout-order-number">
            주문번호 <strong>#{orderId}</strong>
          </div>
        </div>

        {/* 주문 상품 */}
        <section className="mb-4">
          <h5 className="checkout-section-title">주문 상품</h5>

          <div className="d-flex flex-column gap-3">
            {items.map((item, idx) => (
              <Card
                key={idx}
                className="p-3 checkout-item-card"
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold fs-6">
                      {item.name ?? item.productName}
                    </div>
                    <div className="text-muted">
                      {item.quantity}개
                    </div>
                  </div>

                  <div className="fw-bold text-end">
                    {(item.price * item.quantity).toLocaleString()}원
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 결제 정보 */}
        <section className="mb-5">
          <h5 className="checkout-section-title">결제 정보</h5>

          <Card className="p-4 checkout-payment-card">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">총 상품금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">배송비</span>
              <span>0원</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold">총 결제 금액</span>
              <span className="fw-bold text-primary fs-4">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          </Card>
        </section>

        {/* 버튼 2개 */}
        <div className="d-grid gap-3 mb-5">
          <Button
            className="py-3 fw-bold checkout-btn-primary"
            onClick={() => navigate("/shop")}
          >
            계속 쇼핑하기
          </Button>

          <Button
            className="py-3 fw-bold checkout-btn-outline"
            onClick={handleGoToChat}
          >
            채팅으로 이동하기
          </Button>
        </div>

                </Container>
            </div>
        </div>
    </MainLayout>
  );
};

export default CheckoutComplete;
