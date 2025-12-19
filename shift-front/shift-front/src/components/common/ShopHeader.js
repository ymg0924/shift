import React, { useState } from "react";             
import {
  Container,
  Navbar,
  Nav,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { BsSearch, BsCart, BsChatSquareDots } from "react-icons/bs";
import "../../styles/header.css";

import { setCurrentRoomId } from "../../store/chatSlice";
import { resolveProductImage } from "../../utils/productImages";

const ShopHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [keyword, setKeyword] = useState("");

  // 현재 경로 기반으로 active 여부 판단
  const isAllProducts = location.pathname.startsWith("/shop/products");
  const isCat1 = location.pathname.startsWith("/category/1");
  const isCat2 = location.pathname.startsWith("/category/2");
  const isGiftCard = location.pathname.startsWith("/gift-card");
  const isMyPage = location.pathname.startsWith("/mypage");

  // 검색 기능
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    navigate(`/shop/search?keyword=${keyword}`);
  };

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (path) => () => {
    navigate(path);
  };

  return (
    <>
      {/* 상단 로고 + 검색 + 아이콘 한 줄 */}
      <Navbar bg="white" className="header-top py-3">
        <Container className="header-container d-flex align-items-center">
          {/* 로고 클릭 → 쇼핑몰 홈 */}
          <Navbar.Brand
            role="button"
            className="d-flex align-items-center"
            onClick={() => navigate("/shop")}
          >
            <img
              src={resolveProductImage("shiftlogo.png")}
              alt="Shift Logo"
              style={{
                height: "60px",
                objectFit: "contain",
                cursor: "pointer",
              }}
            />
          </Navbar.Brand>

          {/* 검색바 */}
          <Form
            className="header-search flex-grow-1"
            onSubmit={handleSearchSubmit}
            style={{ maxWidth: "400px", margin: "0 16px" }}
          >
            <InputGroup>
              <Form.Control
                placeholder="검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input shadow-none"
              />
              <Button
                variant="light"
                className="search-btn px-3"
                type="submit"
              >
                <BsSearch />
              </Button>
            </InputGroup>
          </Form>

          {/* 장바구니 / 메신저 아이콘 */}
          <Nav className="header-icons d-flex flex-row gap-3 align-items-center">
            <Button
              variant="link"
              className="text-dark p-0"
              onClick={() => navigate("/cart")}
            >
              <BsCart size={24} />
            </Button>

            <Button
              variant="link"
              className="text-dark p-0"
              onClick={() => {
                window.SHIFT_RECEIVER_ID = "";
                window.SHIFT_RECEIVER_NAME = "";
                window.SHIFT_GIFT_FROM_CHAT = false;
                window.SHIFT_GIFT_FROM_FRIEND = false;
                dispatch(setCurrentRoomId(null));
                navigate("/chatroom/list");
              }}
            >
              <BsChatSquareDots size={24} />
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* 카테고리 바 */}
      <div className="category-bar border-bottom">
        <Container className="header-container">
          <Nav className="category-nav">
            <Nav.Link
              className={
                "category-item text-nowrap" + (isAllProducts ? " active" : "")
              }
              onClick={handleCategoryClick("/shop/products")}   // ⭐ 전체상품
            >
              전체상품
            </Nav.Link>

            <Nav.Link
              className={
                "category-item text-nowrap" + (isCat1 ? " active" : "")
              }
              onClick={handleCategoryClick("/category/1")}       // ⭐ 디퓨저/캔들
            >
              디퓨저/캔들
            </Nav.Link>

            <Nav.Link
              className={
                "category-item text-nowrap" + (isCat2 ? " active" : "")
              }
              onClick={handleCategoryClick("/category/2")}       // ⭐ 화병/트레이
            >
              화병/트레이
            </Nav.Link>

            <Nav.Link
              className={
                "category-item text-nowrap" + (isGiftCard ? " active" : "")
              }
              onClick={handleCategoryClick("/gift-card")}        // ⭐ 금액권
            >
              금액권
            </Nav.Link>

            <Nav.Link
              className={
                "category-item text-nowrap" + (isMyPage ? " active" : "")
              }
              onClick={handleCategoryClick("/mypage")}           // ⭐ 마이페이지
            >
              마이페이지
            </Nav.Link>
          </Nav>
        </Container>
      </div>
    </>
  );
};

export default ShopHeader;
