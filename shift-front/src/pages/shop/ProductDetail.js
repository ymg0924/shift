import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Image } from "react-bootstrap";
import { BsCart } from "react-icons/bs";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/common/MainLayout";
import FixedBottomButton from "../../components/common/FixedBottomButton";
import axios from "axios";
import { addCartItem } from "../../api/cartApi";
import { useSelector } from "react-redux";
import ProductDescriptionSection from "../../components/product/ProductDescriptionSection";
import ProductReviewSection from "../../components/product/ProductReviewSection";
import AddToCartModal from "../../components/product/AddToCartModal";

import {
  PRODUCT_MAIN_IMG,
  PRODUCT_DESC_IMG,
} from "../../utils/productImages";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const chatroomId = useSelector(
    (state) => state.chat?.currentRoomId ?? null
  );

  // chatroomId가 있으면 채팅에서 온 선물 플로우로 판단
  const isChatGiftMode = !!chatroomId;

  useEffect(() => {
    loadProductDetail();
    loadReviews();
  }, [productId]);

  /** 상품 상세 조회 */
  const loadProductDetail = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/products/${productId}`);
      setProduct(res.data);
    } catch (e) {
      console.error("상품 상세 조회 실패", e);
    }
  };

  /** 리뷰 조회 */
  const loadReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/products/${productId}/reviews`
      );
      setReviews(res.data);
    } catch (e) {
      console.error("리뷰 조회 실패", e);
      setReviews([]);
    }
  };

  /** 바로 구매하기 */
  const handleBuyNow = () => {
    if (!product) return;

    const itemForCheckout = {
      productId: product.productId ?? Number(productId),
      name: product.productName,
      price: product.price,
      quantity: 1,
    };

    navigate("/checkout", {
      state: {
        items: [itemForCheckout],
        isGift: false,
      },
    });
  };

  /** 선물하기 */
  const handleGift = () => {
    if (!product) return;

    const giftItem = {
      productId: product.productId ?? Number(productId),
      name: product.productName,
      price: product.price,
      quantity: 1,

      /* 기존 이미지 → static 이미지 사용되므로 무시 */
      // image: product.images?.[0] ?? null,
    };
    if (isChatGiftMode) {
    // ① 채팅방 → 상품 선택 → 선물구매하기 → 바로 결제
    navigate("/checkout", {
      state: {
        items: [giftItem],
        isGift: true,   // gift 플래그 명시
      },
    });
  } else {
    // ② 일반 쇼핑 → 상품 상세 → 선물하기 → 친구 선택
    navigate("/gift/select-receiver", {
      state: {
        items: [giftItem],
        isGift: true,   // 이후 Checkout에서도 gift로 인식 가능
      },
    });
  }
};

  /** 장바구니 담기 */
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const result = await addCartItem({
        productId: Number(productId),
        quantity: 1,
      });

      if (result?.result === true) {
        setShowModal(true);
      } else {
        alert("장바구니 담기에 실패했습니다.");
      }
    } catch (e) {
      console.error("장바구니 담기 실패", e);
      alert("장바구니 담기 중 오류가 발생했습니다.");
    }
  };

  if (!product) return null;

  /**
   * 기존 이미지 로직 (DB 이미지 사용)
   * ---------------------------------------------------
   * const mainImage = product.images?.[0] || null;
   * const descriptionImages = product.images?.slice(1) ?? [];
   */

  /** static 이미지 적용 */
  const mainImage = PRODUCT_MAIN_IMG;
  const descriptionImages = [PRODUCT_DESC_IMG];

  return (
    <>
      <MainLayout maxWidth="800px">
        <Container className="py-4">
          {/* 대표 이미지 */}
          <div
            className="rounded-4 overflow-hidden mb-4 border bg-light"
            style={{ width: "100%", aspectRatio: "1 / 1" }}
          >
            <Image
              src={mainImage}
              fluid
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* 상품 정보 */}
          <div className="mb-5 pb-4 border-bottom">
            <h2 className="fw-bold mb-2">{product.productName}</h2>

            <h3 className="fw-bold text-dark mb-2">
              {product.price.toLocaleString()}원
            </h3>

            <div className="text-muted" style={{ fontSize: "14px" }}>
              판매자: {product.seller || "-"} · 재고: {product.stock}개
            </div>
          </div>

          {/* 설명 이미지 */}
          <ProductDescriptionSection images={descriptionImages} />

          {/* 리뷰 */}
          <ProductReviewSection reviews={reviews} />
        </Container>
      </MainLayout>

      {/* 하단 버튼 */}
      <FixedBottomButton width="800px">
        <Row className="g-2">
          <Col xs={isChatGiftMode ? 6 : 4}>
            <Button
              variant="outline-dark"
              className="w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
              onClick={handleAddToCart}
            >
              <BsCart size={20} /> 장바구니
            </Button>
          </Col>

          <Col xs={isChatGiftMode ? 6 : 4}>
            <Button
              className="w-100 py-3 fw-bold gift-btn"
              onClick={handleGift}
            >
              {isChatGiftMode ? "선물구매하기" : "선물하기"}

            </Button>
          </Col>
          {!isChatGiftMode && (
            <Col xs={4}>
              <Button
                variant="dark"
                className="w-100 py-3 fw-bold"
              onClick={handleBuyNow}
            >
              구매하기
            </Button>
          </Col>
          )}
        </Row>
      </FixedBottomButton>

      {/* 장바구니 모달 */}
      <AddToCartModal
        show={showModal}
        onConfirm={() => navigate("/cart")}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
};

export default ProductDetail;