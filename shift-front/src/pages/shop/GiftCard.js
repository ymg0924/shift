import React, { useState } from "react";
import { Container, Button, Form, Row, Col, Card } from "react-bootstrap";
import MainLayout from "../../components/common/MainLayout";
import FixedBottomButton from "../../components/common/FixedBottomButton";

import { POINT_IMG } from "../../utils/productImages";

const GiftCard = ({ onNavigate }) => {
  const [customAmount, setCustomAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  const quickAmounts = [
    { label: "+ 1천원", value: 1000 },
    { label: "+ 5천원", value: 5000 },
    { label: "+ 1만원", value: 10000 },
    { label: "+ 5만원", value: 50000 },
  ];

  const handleCustomInput = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      setTotalAmount(totalAmount + amount);
      setCustomAmount("");
    }
  };

  return (
    <>
      <MainLayout maxWidth="600px">
        <Container className="py-4">
          <h2 className="fw-bold mb-4">금액권 선물하기</h2>

          {/* 금액권 이미지 */}
          {/*
          <Card className="mb-4 bg-light border text-center py-5">
            <Card.Body>
              <h3 className="text-muted">Shift Gift Card</h3>
            </Card.Body>
          </Card>
          */}

          {/* 금액권 static 이미지 적용 */}
          <Card className="mb-4 bg-light border text-center overflow-hidden">
            <Card.Img
              src={POINT_IMG}
              alt="금액권 이미지"
              style={{ maxHeight: "260px", objectFit: "cover" }}
            />
          </Card>

          {/* 금액 입력 */}
          <Form.Group className="mb-4">
            <Form.Label>금액을 입력하세요</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="number"
                placeholder="직접 입력"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
              <Button
                variant="dark"
                onClick={handleCustomInput}
                className="text-nowrap"
              >
                입력
              </Button>
            </div>
          </Form.Group>

          {/* 빠른 금액 버튼 */}
          <Row className="g-2 mb-5">
            {quickAmounts.map((item) => (
              <Col xs={3} key={item.value}>
                <Button
                  variant="outline-secondary"
                  className="w-100 py-3"
                  onClick={() => setTotalAmount(totalAmount + item.value)}
                >
                  {item.label}
                </Button>
              </Col>
            ))}
          </Row>

          {/* 총 금액 */}
          <div className="bg-light p-4 rounded mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <span className="fs-5">총 선물 금액</span>
              <span className="fs-4 fw-bold text-primary">
                {totalAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        </Container>
      </MainLayout>

      {/* ▼ MainLayout 밖으로 이동 (핵심!!) ▼ */}
      <FixedBottomButton width="600px">
        <Button
          variant="dark"
          className="w-100 py-3 fw-bold"
          size="lg"
          disabled={totalAmount === 0}
          onClick={() => onNavigate("checkout")}
        >
          선물하기
        </Button>
      </FixedBottomButton>
      {/* ▲ 이렇게 해야 Cart/Checkout과 동일하게 정상 작동 ▲ */}
    </>
  );
};

export default GiftCard;
