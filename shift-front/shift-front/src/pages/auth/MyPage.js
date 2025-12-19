import React, { useEffect, useState, useCallback } from "react";
import { Container, Button, Card, Tabs, Tab, Badge } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import {
  getMyInfo,
  updateUserInfo,
  checkPhoneDuplicate,
} from "../../api/userApi";
import { getOrders } from "../../api/orderApi";
import { logoutUser } from "../../api/authApi";
import { logout } from "../../store/authSlice";

import EditableUserInfoCard from "../../components/user/UserFieldEditor";
import MyReviewTab from "../../components/mypage/MyReviewTab";
import GiftListTab from "../../components/gift/GiftListTab";
import MyPointTab from "../../components/mypage/MyPointTab";
import MainLayout from "../../components/common/MainLayout";
import MyProfileSidebar from "../../components/mypage/MyProfileSidebar";

import {
  validateName,
  validatePhone,
  formatPhoneNumber,
} from "../../utils/signUpValidation";

import "../../styles/mypage.css";
import { LuShoppingBag } from "react-icons/lu";
import { BsCashCoin } from "react-icons/bs";
import { IoStar } from "react-icons/io5";
import { BiGift } from "react-icons/bi";
import { PROFILE_DEFAULT } from "../../utils/chatImages";

const menuList = [
  { key: "points", label: "포인트", icon: <BsCashCoin /> },
  { key: "reviews", label: "나의 리뷰", icon: <IoStar /> },
  { key: "gifts", label: "선물함", icon: <BiGift /> },
  { key: "orders", label: "주문내역", icon: <LuShoppingBag /> },
];

const MyPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const initialTab = location.state?.activeTab ?? "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [user, setUser] = useState({});
  const [userLoading, setUserLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profileImgSrc, setProfileImgSrc] = useState();

  /* 전체 데이터 로드 */
  useEffect(() => {
    loadMyPage();
  }, []);

  const loadMyPage = async () => {
    setUserLoading(true);
    setOrdersLoading(true);

    try {
      // 사용자 정보
      const userData = await getMyInfo();
      setUser(userData);

      // 주문 목록
      const ordersRes = await getOrders();
      setOrders(ordersRes.orders || []);

      // 프로필 이미지 주소 세팅
      setProfileImgSrc(`https://shift-main-images.s3.ap-northeast-3.amazonaws.com/user_profile/${userData.userId}.png?ts=${Date.now()}`);
    } finally {
      setUserLoading(false);
      setOrdersLoading(false);
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    navigate(".", {
      state: { ...location.state, activeTab: tabKey },
      replace: true,
    });
  };

  /** 사용자 정보 변경 */
  const handleUpdateUserField = useCallback(
    async (field, newValue) => {
      let errorMsg = "";

      if (field === "name") {
        errorMsg = validateName(newValue);
      } else if (field === "phone") {
        const formatted = formatPhoneNumber(newValue);
        errorMsg = validatePhone(formatted);

        if (!errorMsg) {
          const cleaned = formatted.replace(/-/g, "");
          if (cleaned !== user.phone?.replace(/-/g, "")) {
            const isDup = await checkPhoneDuplicate(cleaned);
            if (isDup) throw new Error("이미 사용 중인 전화번호입니다.");
          }
        }
      }

      if (errorMsg) throw new Error(errorMsg);

      const updatedUser = await updateUserInfo({
        ...user,
        [field]:
          field === "phone"
            ? formatPhoneNumber(newValue).replace(/-/g, "")
            : newValue,
      });

      setUser(updatedUser);
    },
    [user]
  );

  const handleLogout = async () => {
    if (!window.confirm("정말 로그아웃 하시겠습니까?")) return;
    await logoutUser();
    dispatch(logout());
    navigate("/");
  };

  const formatNumber = (n) => Number(n).toLocaleString();

  const getOrderStatusText = (order) => {
    switch (order.orderStatus) {
      case "PAID":
      case "S":
        return "결제완료";
      case "CANCELED":
      case "C":
        return "취소완료";
      case "COMPLETED":
      case "D":
        return "구매확정";
      default:
        return "결제대기";
    }
  };

  // 주문상태별 뱃지 색상 (모두 #5b8fc3)
  const getOrderBadgeStyle = () => ({
    backgroundColor: "#5b8fc3",
    color: "#fff",
  });

  return (
    <MainLayout>
      <Container fluid className="mypage-bg">
        {/* 상단 My Page 문구 */}
        <h2
          className="fw-bold mb-2"
          style={{ color: "#5b8fc3", letterSpacing: "1px" }}
        >
          My Page
        </h2>
        {/* 구분선 색상과 두께 조정 */}
        <hr
          className="mb-5"
          style={{ borderTop: "2px solid #5b8fc380", opacity: 0.5 }}
        />
        <div
          className="d-flex justify-content-center"
          style={{ minHeight: "80vh" }}
        >
          {/* 좌측 프로필/메뉴 */}
          <MyProfileSidebar
            user={user}
            menuList={menuList}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            formatNumber={formatNumber}
            profileImageSrc={profileImgSrc}
            onImageError={() => setProfileImgSrc(PROFILE_DEFAULT)}
          />
          {/* 우측 콘텐츠 */}
          <div style={{ flex: 1, minWidth: 320, maxWidth: 800 }}>
            <Tabs
              activeKey={activeTab}
              onSelect={handleTabChange}
              /* 탭 스타일 변경 */
              className="mb-4 border-bottom border-1 mypage-tab"
              justify
            >
              {/* 개인정보 탭 */}
              <Tab eventKey="profile" title="개인정보">
                <div className="d-flex flex-column gap-3 pt-4">
                  {/* ID 카드 */}
                  <Card className="border-0 shadow-sm mypage-card-light rounded-4">
                    <Card.Body className="p-4">
                      <div className="small mb-1 fw-semibold fst-italic text-muted">
                        ID
                      </div>
                      <div className="fw-bold text-dark">{user.loginId}</div>
                    </Card.Body>
                  </Card>
                  {/* 이름 */}
                  <EditableUserInfoCard
                    title="이름"
                    initialValue={user.name}
                    inputHelperText="이름은 2~6자 한글만 가능"
                    onSave={(v) => handleUpdateUserField("name", v)}
                    cardClassName="mypage-card-light rounded-4"
                  />
                  {/* 연락처 */}
                  <EditableUserInfoCard
                    title="연락처"
                    initialValue={user.phone}
                    inputHelperText="11자리 숫자 입력"
                    inputType="tel"
                    onSave={(v) => handleUpdateUserField("phone", v)}
                    cardClassName="mypage-card-light rounded-4"
                  />
                  {/* 주소 카드 */}
                  <Card className="border-0 shadow-sm mypage-card-light rounded-4">
                    <Card.Body className="p-4" style={{ minHeight: "100px" }}>
                      <div className="small mb-2 fw-semibold fst-italic text-muted">
                        주소
                      </div>
                      <div
                        className="fw-medium text-dark"
                        style={{ lineHeight: "1.6" }}
                      >
                        {user.address || "등록된 주소가 없습니다."}
                      </div>
                    </Card.Body>
                  </Card>
                  {/* 하단 버튼 */}
                  <div className="pt-4 border-top d-flex justify-content-between">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="px-4 fw-medium"
                      onClick={handleLogout}
                    >
                      로그아웃
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="px-4 fw-medium"
                      onClick={() => navigate("/user/withdrawal")}
                    >
                      회원탈퇴
                    </Button>
                  </div>
                </div>
              </Tab>
              {/* 포인트 */}
              <Tab eventKey="points" title="포인트 확인">
                <MyPointTab />
              </Tab>
              {/* 리뷰 */}
              <Tab eventKey="reviews" title="리뷰">
                <MyReviewTab />
              </Tab>
              {/* 선물함 */}
              <Tab eventKey="gifts" title="선물함">
                <GiftListTab />
              </Tab>
              {/* 주문목록 */}
              <Tab eventKey="orders" title="주문목록">
                <div className="pt-4 d-flex flex-column gap-3">
                  {!ordersLoading && orders.length === 0 && (
                    <div className="text-center text-muted py-5 mypage-card-light rounded-4">
                      주문 내역이 없습니다.
                    </div>
                  )}

                  {!ordersLoading &&
                    orders.map((order) => (
                      <Card
                        key={order.orderId}
                        className="border-0 shadow-sm mypage-card-light mypage-hover rounded-4"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/orders/${order.orderId}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            navigate(`/orders/${order.orderId}`);
                          }
                        }}
                      >
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between mb-3">
                            <span className="text-muted small fw-semibold">
                              {order.orderDate}
                            </span>
                            <Badge
                              style={getOrderBadgeStyle()}
                              className="fw-normal px-3 mypage-badge"
                            >
                              {getOrderStatusText(order)}
                            </Badge>
                          </div>
                          <div className="d-flex justify-content-between mb-3">
                            <div>
                              <div className="text-muted small mb-1">
                                받는 사람
                              </div>
                              <div className="fw-bold text-dark">
                                {order.receiverName ?? `ID ${order.receiverId}`}
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="text-muted small mb-1">
                                주문번호
                              </div>
                              <div className="fw-bold text-dark">
                                #{order.orderId}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between mt-3 pt-3 border-top border-2 border-light">
                            <span className="text-muted small fw-semibold">
                              총 결제 금액
                            </span>
                            <span className="fw-bold text-dark fs-5">
                              {formatNumber(order.totalPrice)}원
                            </span>
                          </div>
                          <div
                            className="text-end mt-3 small fw-semibold"
                            style={{ color: "#5b8fc3" }}
                          >
                            상세보기 →
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
};

export default MyPage;
