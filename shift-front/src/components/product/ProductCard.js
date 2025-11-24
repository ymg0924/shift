import React from "react";
import { Card } from "react-bootstrap";
import "../../styles/product.css";

import { PRODUCT_MAIN_IMG } from "../../utils/productImages";

const ProductCard = ({ product, onClick }) => {
  // ----- 데이터 정규화 -----
  const name = product.name || product.productName || "상품명 없음";

  /**
   * 기존 이미지 처리 로직 (DB 기반) — 지금은 사용 안 함
   * -----------------------------------------------------
   * const image =
   *   product.image ||
   *   product.imageUrl ||
   *   (product.imageUrls && product.imageUrls.length > 0
   *     ? product.imageUrls[0]
   *     : "/no-image.png");
   */

  // ----- static 대표 이미지 사용 -----
  const image = PRODUCT_MAIN_IMG;

  return (
    <Card className="product-card" onClick={onClick}>
      <div className="product-img-wrapper">
        <Card.Img variant="top" src={image} className="product-img" />
      </div>

      <Card.Body className="p-3">
        <Card.Title className="product-title">{name}</Card.Title>

        <Card.Text className="product-price">
          {product.price?.toLocaleString()}원
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
