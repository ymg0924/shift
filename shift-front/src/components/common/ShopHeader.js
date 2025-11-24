import React, { useState } from "react";
import {
  Container,
  Navbar,
  Nav,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsSearch, BsCart, BsBoxArrowRight } from "react-icons/bs";
import "../../styles/header.css";

const ShopHeader = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  // 검색 기능
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    navigate(`/shop/search?keyword=${keyword}`);
  };

  return (
    <>
      {/* 상단 로고 + 검색 + 아이콘 */}
      <Navbar bg="white" className="header-top border-bottom py-3">
        <Container className="header-container">
          {/* 로고 클릭 → 쇼핑몰 홈 */}
          <Navbar.Brand
            role="button"
            className="fw-bold fs-4"
            onClick={() => navigate("/shop")}
          >
            Shift
          </Navbar.Brand>

          {/* 검색바 */}
          <Form
            className="header-search d-none d-md-flex flex-grow-1 mx-4"
            onSubmit={handleSearchSubmit}
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

          <Nav className="header-icons d-flex flex-row gap-3 align-items-center">
            {/* 장바구니 이동 */}
            <Button
              variant="link"
              className="text-dark p-0"
              onClick={() => navigate("/cart")}
            >
              <BsCart size={24} />
            </Button>

            {/* 로그아웃 버튼(기능 없음, 기존 유지) */}
            <Button variant="link" className="text-dark p-0">
              <BsBoxArrowRight size={24} />
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* 카테고리 바 (고정 표기) */}
      <div className="category-bar border-bottom">
        <Container className="header-container">
          <Nav className="gap-4 overflow-auto flex-nowrap category-nav">
            <Nav.Link
              className="category-item text-nowrap"
              onClick={() => navigate("/shop/products")}
            >
              전체상품
            </Nav.Link>

            <Nav.Link
              className="category-item text-nowrap"
              onClick={() => navigate("/category/1")}
            >
              디퓨저/캔들
            </Nav.Link>

            <Nav.Link
              className="category-item text-nowrap"
              onClick={() => navigate("/category/2")}
            >
              화병/트레이
            </Nav.Link>

            <Nav.Link
              className="category-item text-nowrap"
              onClick={() => navigate("/gift-card")}
            >
              금액권
            </Nav.Link>
          </Nav>
        </Container>
      </div>
    </>
  );
};

export default ShopHeader;