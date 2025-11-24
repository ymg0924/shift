import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// layout
import DevNavigation from "./components/layout/DevNavigation";
//common
import ShopHeader from "./components/common/ShopHeader";

// auth
import Login from "./pages/auth/LoginPage";
import MyPage from "./pages/auth/MyPage";
import SignUp from "./pages/user/signUp";

// chat
import FriendList from "./pages/chat/FriendList";
import ChatRoomList from "./pages/chat/ChatRoomList";
import ChatRoom from "./pages/chat/ChatRoom";
import NewChatRoom from "./pages/chat/NewChatRoom";
import UserSearch from "./pages/chat/UserSearch";

// shop
import ShopMain from "./pages/shop/ShopMain"; // 홈(배너+추천상품)
import ProductList from "./pages/shop/ProductList"; // 전체상품/카테고리상품
import ProductDetail from "./pages/shop/ProductDetail"; // 상품상세
import ProductSearch from "./pages/shop/ProductSearch"; // 상품검색
import Cart from "./pages/shop/Cart";
import GiftCard from "./pages/shop/GiftCard";
import Checkout from "./pages/shop/Checkout";
import ReceiverSelection from "./pages/shop/ReceiverSelection";
import ReceiverCheckout from "./pages/shop/ReceiverCheckout";
import CheckoutComplete from "./pages/shop/CheckoutComplete";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./store/authSlice";
import GiftReceiverSelect from "./pages/shop/GiftReceiverSelect";


import { StompProvider } from "./api/StompProvider";

function App() {
  const dispatch = useDispatch();

  // 앱 시작 시 로컬스토리지에 토큰이 있으면 Redux 상태 업데이트
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      dispatch(loginSuccess({ accessToken: token }));
    }
  }, [dispatch]);

  return (
    <div>
      <DevNavigation />

      <div style={{ marginTop: "60px" }}>
        <StompProvider> {/* 웹소켓 전역 설정 */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/friends" element={<FriendList />} />
            <Route path="/chatroom/list" element={<ChatRoomList />} />
            <Route path="/chatroom/:chatroomId" element={<ChatRoom />} />
            <Route path="/chatroom/new" element={<NewChatRoom token={1} />} />
            <Route path="/userSearch" element={<UserSearch />} />
            <Route path="/mypage" element={<MyPage />} />

            <Route path="/signup" element={<SignUp />} />

            {/* 홈 페이지 (배너 + 추천상품) */}
            <Route path="/shop" element={<ShopMain />} />

            {/* 전체상품 페이지 */}
            <Route path="/shop/products" element={<ProductList />} />

            {/* 카테고리별 상품 페이지 */}
            <Route path="/category/:categoryId" element={<ProductList />} />

            {/* 상품 검색 페이지 */}
            <Route path="/shop/search" element={<ProductSearch />} />

            {/* 상품 상세 */}
            <Route path="/product/:productId" element={<ProductDetail />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/gift-card" element={<GiftCard />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/receiver/select" element={<ReceiverSelection />} />
            <Route path="/receiver/checkout" element={<ReceiverCheckout />} />

            {/* 주문/결제 완료 페이지 */}
            <Route
              path="/checkout/complete/:orderId"
              element={<CheckoutComplete />}
            />
            <Route path="/gift/select-receiver" element={<GiftReceiverSelect />} />


            {/* 404: 잘못된 경로 → 홈으로 */}
            <Route path="*" element={<ShopMain />} />
          </Routes>
        </StompProvider>
      </div>
    </div>
  );
}

export default App;
