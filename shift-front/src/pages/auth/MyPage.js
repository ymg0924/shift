import React, { useEffect, useState } from "react";
import {
  Container,
  Button,
  Card,
  Tabs,
  Tab,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useSelector } from "react-redux"; // Redux 연결 (예시)
import ShopHeader from "../../components/common/ShopHeader";
import { getOrders } from "../../api/orderApi";

const MyPage = () => {
  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState("profile");

  // Redux에서 사용자 정보 가져오기 (설정 전이라면 더미 데이터 사용)
  // const user = useSelector((state) => state.user.userInfo);
  const user = { name: "홍길동", id: "hong1234", phone: "010-1234-5678" };

  // 피그마 디자인에 있는 더미 데이터들
  const pointHistory = [
    {
      date: "2025.11.03",
      desc: "선물 잔액 적립",
      amount: "+5,000",
      type: "plus",
    },
    { date: "2025.10.28", desc: "구매 적립", amount: "+1,000", type: "plus" },
    {
      date: "2025.10.15",
      desc: "포인트 사용",
      amount: "-3,000",
      type: "minus",
    },
  ];

  const gifts = [
    {
      sender: "Jane Smith",
      product: "Premium Wireless Headphones",
      status: "배송중",
    },
    { sender: "John Doe", product: "금액권 30,000원", status: "수령완료" },
  ];

  // 주문 목록
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);

        const data = await getOrders(); // userId 파라미터 없음 (JWT 기반)
        const list = data.orders ?? [];

        setOrders(list);
      } catch (e) {
        console.error("주문목록 조회 실패", e);
        setOrdersError("주문 내역을 불러오지 못했습니다.");
      } finally {
        setOrdersLoading(false);
      }
    };

    // MyPage 들어올 때 한 번 로드
    loadOrders();
  }, []);

  const getOrderStatusText = (order) => {
    const cash = order.cashUsed ?? 0;
    const point = order.pointUsed ?? 0;
    if (cash + point > 0) return "결제완료";
    return "결제대기";
  };

  // 날짜 문자열 예쁘게
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr;
  };

  return (
    <div className="bg-white min-vh-100">
      <ShopHeader />

      <Container className="py-5" style={{ maxWidth: "800px" }}>
        <h2 className="fw-bold mb-4">마이 페이지</h2>

        {/* 피그마 스타일의 탭 네비게이션 */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4 border-bottom"
          justify
        >
          {/* 1. 개인정보 탭 */}
          <Tab eventKey="profile" title="개인정보 확인/수정">
            <div className="d-flex flex-column gap-3 pt-3">
              {/* ID (Read-only) */}
              <Card className="border bg-light shadow-sm">
                <Card.Body className="d-flex justify-content-between align-items-center p-4">
                  <div>
                    <div className="text-muted small mb-1">ID</div>
                    <div className="fw-medium">{user.id}</div>
                  </div>
                </Card.Body>
              </Card>

              {/* 이름 변경 */}
              <Card className="border shadow-sm">
                <Card.Body className="d-flex justify-content-between align-items-center p-4">
                  <div>
                    <div className="text-muted small mb-1">이름</div>
                    <div className="fw-medium">{user.name}</div>
                  </div>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => alert("이름 변경")}
                  >
                    변경
                  </Button>
                </Card.Body>
              </Card>

              {/* 연락처 변경 */}
              <Card className="border shadow-sm">
                <Card.Body className="d-flex justify-content-between align-items-center p-4">
                  <div>
                    <div className="text-muted small mb-1">연락처</div>
                    <div className="fw-medium">{user.phone}</div>
                  </div>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => alert("연락처 변경")}
                  >
                    변경
                  </Button>
                </Card.Body>
              </Card>

              <div className="mt-4 pt-3 border-top">
                <Button
                  variant="link"
                  className="text-secondary text-decoration-underline p-0 small"
                  onClick={() => alert("회원탈퇴")}
                >
                  회원탈퇴
                </Button>
              </div>
            </div>
          </Tab>

          {/* 2. 배송지 관리 탭 */}
          <Tab eventKey="address" title="배송지 관리">
            <div className="pt-3">
              <Card className="border shadow-sm mb-3">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Badge
                      bg="white"
                      text="dark"
                      className="border border-dark rounded-pill px-3 py-2 fw-normal"
                    >
                      기본 배송지
                    </Badge>
                    <Button variant="outline-secondary" size="sm">
                      수정
                    </Button>
                  </div>
                  <div className="mb-2">
                    <strong>{user.name}</strong>{" "}
                    <span className="text-secondary mx-2">|</span> {user.phone}
                  </div>
                  <div className="text-secondary">
                    서울특별시 강남구 테헤란로 123
                    <br />
                    상세주소: 456호
                  </div>
                </Card.Body>
              </Card>
              <Button variant="dark" className="w-100 py-3 fw-bold">
                새 배송지 추가
              </Button>
            </div>
          </Tab>

          {/* 3. 포인트 확인 탭 */}
          <Tab eventKey="points" title="포인트 확인">
            <div className="pt-3">
              <div className="bg-light border rounded-3 p-5 text-center mb-4">
                <div className="text-secondary small mb-2">보유 포인트</div>
                <h2 className="fw-bold mb-2">15,000 P</h2>
                <div className="text-muted x-small">1 포인트 = 1 원</div>
              </div>

              <h5 className="fw-bold mb-3">포인트 내역</h5>
              <div className="d-flex flex-column gap-2">
                {pointHistory.map((item, idx) => (
                  <Card key={idx} className="border-0 border-bottom rounded-0">
                    <Card.Body className="px-2 py-3 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="text-muted small mb-1">{item.date}</div>
                        <div className="fw-medium">{item.desc}</div>
                      </div>
                      <div
                        className={`fw-bold ${item.type === "plus" ? "text-primary" : "text-secondary"}`}
                      >
                        {item.amount} P
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          </Tab>

          {/* 4. 선물함 탭 */}
          <Tab eventKey="gifts" title="선물함">
            <div className="pt-3 d-flex flex-column gap-3">
              {gifts.map((gift, idx) => (
                <Card key={idx} className="border shadow-sm">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between mb-2">
                      <div>
                        <span className="text-muted small me-2">보낸 사람</span>
                        <span className="fw-bold">{gift.sender}</span>
                      </div>
                      <Badge
                        bg="light"
                        text="dark"
                        className="border fw-normal"
                      >
                        {gift.status}
                      </Badge>
                    </div>
                    <div className="fw-medium">{gift.product}</div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Tab>

          {/* 5. 주문목록 탭 */}
          <Tab eventKey="orders" title="주문목록">
            <div className="pt-3 d-flex flex-column gap-3">
              {ordersLoading && (
                <div className="d-flex justify-content-center py-4">
                  <Spinner animation="border" />
                </div>
              )}

              {ordersError && (
                <Alert variant="danger">{ordersError}</Alert>
              )}

              {!ordersLoading && !ordersError && orders.length === 0 && (
                <div className="text-muted text-center py-4">
                  주문 내역이 없습니다.
                </div>
              )}

              {!ordersLoading &&
                !ordersError &&
                orders.map((order) => (
                  <Card key={order.orderId} className="border shadow-sm">
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">
                          {formatDate(order.orderDate)}
                        </span>
                        <Badge
                          bg="light"
                          text="dark"
                          className="border fw-normal"
                        >
                          {getOrderStatusText(order)}
                        </Badge>
                      </div>
                      <div className="fw-bold mb-1">
                        주문번호 #{order.orderId}
                      </div>
                      <div className="text-secondary">
                        {order.totalPrice?.toLocaleString()} 원
                      </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default MyPage;
