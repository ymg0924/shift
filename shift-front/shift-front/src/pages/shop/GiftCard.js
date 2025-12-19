import React, { useEffect, useState } from "react";
import { Container, Button, Form, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import MainLayout from "../../components/common/MainLayout";
import FixedBottomButton from "../../components/common/FixedBottomButton";
import RefundNoticeModal from "../../components/gift/RefundNoticeModal";
import { POINT_IMG } from "../../utils/productImages";
import "../../styles/GiftCardEffects.css";
import "../../styles/shopMain.css";

const BANNER_BASE =
  "https://shift-main-images.s3.ap-northeast-3.amazonaws.com/products";

const VOUCHER_BANNER = {
  image: `${BANNER_BASE}/product_banner_03.jpg`,
  title: "마음을 금액으로 전하는 금액권",
  subtitle:
    "무엇을 좋아할지 고민될 땐\nShift 금액권으로 선택의 즐거움을 선물하세요.",
};

const GiftCard = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [customAmount, setCustomAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [displayAmount, setDisplayAmount] = useState(0);
  const [showRefundModal, setShowRefundModal] = useState(false);

  /** -------------------------------------------------------
   * ② 수신자 정보 (state → window fallback)
   * ------------------------------------------------------- */
  const receiverId =
    location.state?.receiverId ??
    (typeof window !== "undefined" ? window.SHIFT_RECEIVER_ID : null) ??
    null;

  const receiverName =
    location.state?.receiverName ??
    (typeof window !== "undefined" ? window.SHIFT_RECEIVER_NAME : null) ??
    "선물받는 친구";

  /** -------------------------------------------------------
   * ① 채팅 플로우 판별 (Redux + state 둘 다 체크)
   * ------------------------------------------------------- */
  const chatroomIdFromRedux = useSelector(
    (state) => state.chat?.currentRoomId ?? null
  );
  const chatroomIdFromState = location.state?.chatroomId ?? null;
  const chatroomId = chatroomIdFromRedux || chatroomIdFromState;

  const isChatGiftFlow = !!chatroomId || !!receiverId;

  /** -------------------------------------------------------
   * ③ GiftCard 진입 시 초기화 규칙
   *    ▶ 쇼핑몰 플로우일 때만 전역 수신자 초기화
   * ------------------------------------------------------- */
  useEffect(() => {
    if (!isChatGiftFlow && typeof window !== "undefined") {
      window.SHIFT_RECEIVER_ID = null;
      window.SHIFT_RECEIVER_NAME = null;
    }
  }, [isChatGiftFlow]);

  /** -------------------------------------------------------
   * 금액 입력
   * ------------------------------------------------------- */
  const quickAmounts = [
    { label: "+ 1천원", value: 1000 },
    { label: "+ 5천원", value: 5000 },
    { label: "+ 1만원", value: 10000 },
    { label: "+ 5만원", value: 50000 },
  ];

  const handleCustomInput = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      setTotalAmount((prev) => prev + amount);
      setCustomAmount("");
    }
  };
  // 금액권 선물하기 → Checkout 이동 핸들러
  const handleResetAmount = () => {
    setTotalAmount(0);
    setCustomAmount("");
  };

  /** -------------------------------------------------------
   * 숫자 애니메이션
   * ------------------------------------------------------- */
  useEffect(() => {
    let start = displayAmount;
    let end = totalAmount;
    let duration = 300;
    let startTime = null;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      setDisplayAmount(Math.floor(start + (end - start) * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [totalAmount]);

  /** -------------------------------------------------------
   * 선물하기 클릭 → 모달 오픈
   * ------------------------------------------------------- */
  const handleGoToCheckout = () => {
    if (totalAmount === 0) return;
    setShowRefundModal(true);
  };

  /** -------------------------------------------------------
   * 모달 "예" → 플로우별 이동
   * ------------------------------------------------------- */
  const confirmGoToCheckout = () => {
    setShowRefundModal(false);

    const VOUCHER_PRODUCT_ID = 49; 

    const items = [
      {
        productId: VOUCHER_PRODUCT_ID,
        name: "Shift 금액권",
        price: totalAmount,
        quantity: 1,
      },
    ];

    // ① 채팅 플로우 → 바로 Checkout
    if (isChatGiftFlow) {
      const payload = {
        items,
        isGift: true,
        isVoucherOrder: true,
        chatroomId,
        receiverId,
        receiverName,
      };


      console.log("금액권 선물하기 - Checkout 이동 페이로드", payload);
      if (onNavigate) {
        onNavigate("checkout", payload);
      } else {
        navigate("/checkout", { state: payload });
      }
      return;
    }

    // ② 쇼핑몰 플로우 → 친구 선택
    navigate("/gift/select-receiver", {
      state: {
        items,
        isGift: true,
        isVoucherOrder: true,
      },
    });
  };

  const triggerRipple = (e) => {
    const btn = e.currentTarget;
    btn.classList.remove("ripple-show");
     window.requestAnimationFrame(() => {
      btn.classList.add("ripple-show");
    
    setTimeout(() => {
      btn.classList.remove("ripple-show");
    }, 300); 
  });
};

  return (
    <>
      <MainLayout maxWidth="1200px" padding="60px 20px" backgroundColor="#f8f9fa">
        <Container className="pb-5">
          {/* 배너 */} 
          <div className="shop-banner-wrapper mb-4"> 
            <div className="shop-banner-slide banner-compact"> 
              <img src={VOUCHER_BANNER.image} alt={VOUCHER_BANNER.title} className="shop-banner-image" /> 
              <div className="shop-banner-overlay" /> 
              <div className="shop-banner-text"> 
                <h2 className="shop-banner-title">{VOUCHER_BANNER.title}</h2>
                  <p className="shop-banner-subtitle"> {VOUCHER_BANNER.subtitle} 
                  </p> 
              </div> 
            </div> 
          </div>       

          <Row className="g-5 align-items-stretch"> 
            
            {/* 왼쪽: 상품 이미지 */}
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}   
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-100"
              >
                <Card className="glass-card text-center h-100 border-0">
                  <div className="shine-effect h-100 d-flex align-items-center justify-content-center bg-white">
                    <Card.Img
                      src={POINT_IMG}
                      alt="금액권 이미지"
                      style={{  
                        maxHeight: "450px", 
                        objectFit: "contain", 
                        width: "100%", 
                        padding: "20px"
                      }}
                    />
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* 오른쪽: 컨트롤 박스 */}
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="h-100"
              >
                <div className="giftcard-right-box">
                  
                  {/* 헤더 텍스트 추가로 친절함 더하기 */}
                  <div className="mb-4">
                    <h3 className="fw-bold mb-2 text-dark">금액 선택</h3>
                    <p className="text-muted small">선물하실 금액을 직접 입력하거나 선택해주세요.</p>
                  </div>

                  {/* 금액 입력 폼 */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold small text-secondary">직접 입력</Form.Label>
                    <div className="d-flex gap-2 h-100">
                      <Form.Control
                        type="number"
                        placeholder="0"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="custom-input shadow-none" 
                        style={{ height: '50px' }}
                      />
                      <Button 
                        className="btn-action-primary ripple" 
                        onMouseDown={triggerRipple} 
                        onClick={handleCustomInput}
                        style={{ minWidth: '80px' }}
                      >
                        추가
                      </Button>
                    </div>
                  </Form.Group>

                  {/* 빠른 금액 버튼 (Chips 스타일) */}
                  <div className="mb-4">
                    <Form.Label className="fw-bold small text-secondary mb-2">빠른 선택</Form.Label>
                    <Row className="g-2">
                      {quickAmounts.map((q) => (
                        <Col xs={3} key={q.value}>
                          <Button
                            className="w-100 ripple quick-amount-btn"
                            onMouseDown={triggerRipple}
                            onClick={() => setTotalAmount((p) => p + q.value)}
                          >
                            {q.label}
                          </Button>
                        </Col>
                      ))}
                    </Row>
                  </div>

                  {/* 환불 안내 & 초기화 */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="text-danger small fw-medium" style={{ fontSize: '0.8rem' }}>
                      <i className="bi bi-info-circle me-1"></i>
                      구매 후 환불 불가 상품
                    </span>
                    <Button
                      variant="light"
                      size="sm"
                      className="btn-action-reset ripple px-3 py-2"
                      onMouseDown={triggerRipple}
                      onClick={handleResetAmount}
                    >
                      초기화
                    </Button>
                  </div>

                  {/* 총 금액 표시 (가장 강조) */}
                  <motion.div
                    key={totalAmount} // 금액 바뀔 때마다 살짝 효과
                    initial={{ scale: 0.98 }}
                    animate={{ scale: 1 }}
                    className="total-amount-box"
                  >
                    <div className="d-flex justify-content-between align-items-end">
                      <span className="fs-6 fw-bold text-secondary mb-1">총 선물 금액</span>
                      <span className="amount-text">
                        {displayAmount.toLocaleString()}원
                      </span>
                    </div>
                  </motion.div>

                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </MainLayout>

      {/* 하단 고정 버튼 */}
      <FixedBottomButton width="960px">
        <Button
          // Bootstrap 기본 대신 커스텀 색상(그라데이션 등) 추천
          style={{ 
            background: totalAmount > 0 ? '#1e293b' : '#cbd5e1', 
            border: 'none',
            fontSize: '1.1rem'
          }}
          className="w-100 py-3 fw-bold ripple rounded-pill shadow-lg"
          size="lg"
          disabled={totalAmount === 0}
          onMouseDown={triggerRipple}
          onClick={handleGoToCheckout}
        >
          {totalAmount > 0 ? `${displayAmount.toLocaleString()}원 선물하기` : '금액을 선택해주세요'}
        </Button>
      </FixedBottomButton>

      <RefundNoticeModal
        show={showRefundModal}
        onCancel={() => setShowRefundModal(false)}
        onConfirm={confirmGoToCheckout}
      />
    </>
  );
};

export default GiftCard;