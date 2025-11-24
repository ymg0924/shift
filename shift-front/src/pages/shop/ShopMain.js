import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/common/MainLayout";
import axios from "axios";
import ProductCard from "../../components/product/ProductCard"; // ⭐ 추가됨

const ShopMain = () => {
  const navigate = useNavigate();
  const [latest, setLatest] = useState([]); // 신상품 8개
  const [cat1Reco, setCat1Reco] = useState([]); // 카테고리1 4개
  const [cat2Reco, setCat2Reco] = useState([]); // 카테고리2 4개

  useEffect(() => {
    loadData();
  }, []);

  const safeGetItems = (res) => {
    return (
      res.data?.items ??
      res.data?.data?.items ??
      (Array.isArray(res.data) ? res.data : [])
    );
  };

  const loadData = async () => {
    try {
      /** -----------------------------
       * 1) 신상품 8개
       * ----------------------------- */
      const latestRes = await axios.get("http://localhost:8080/products/sort", {
        params: { sortType: "latest" },
      });

      const latestArr = safeGetItems(latestRes).slice(0, 8);
      const latestIds = latestArr.map((p) => p.productId);

      /** -----------------------------
       * 2) 카테고리 1
       * ----------------------------- */
      const cat1Res = await axios.get(
        "http://localhost:8080/categories/1/products"
      );
      let cat1List = safeGetItems(cat1Res).filter(
        (item) => !latestIds.includes(item.productId)
      );

      // 부족하면 보충
      if (cat1List.length < 4) {
        const allRes = await axios.get("http://localhost:8080/products");
        const allItems = safeGetItems(allRes);

        const more = allItems.filter(
          (item) =>
            item.categoryId === 1 &&
            !latestIds.includes(item.productId) &&
            !cat1List.some((p) => p.productId === item.productId)
        );

        cat1List = [...cat1List, ...more.slice(0, 4 - cat1List.length)];
      }

      cat1List = cat1List.slice(0, 4);

      /** -----------------------------
       * 3) 카테고리 2
       * ----------------------------- */
      const cat2Res = await axios.get(
        "http://localhost:8080/categories/2/products"
      );
      let cat2List = safeGetItems(cat2Res).filter(
        (item) => !latestIds.includes(item.productId)
      );

      // 부족하면 보충
      if (cat2List.length < 4) {
        const allRes = await axios.get("http://localhost:8080/products");
        const allItems = safeGetItems(allRes);

        const more = allItems.filter(
          (item) =>
            item.categoryId === 2 &&
            !latestIds.includes(item.productId) &&
            !cat2List.some((p) => p.productId === item.productId)
        );

        cat2List = [...cat2List, ...more.slice(0, 4 - cat2List.length)];
      }

      cat2List = cat2List.slice(0, 4);

      /** -----------------------------
       * 4) 상태 저장
       * ----------------------------- */
      setLatest(latestArr);
      setCat1Reco(cat1List);
      setCat2Reco(cat2List);

    } catch (err) {
      console.error("메인 데이터 로드 실패:", err);
    }
  };

  /** -----------------------------
   * ProductCard 렌더링 함수
   * ----------------------------- */
  const renderProductCard = (p) => (
    <Col key={p.productId} xs={6} md={3} className="mb-4">
      <ProductCard
        product={{
          image: p.imageUrl,          // ⭐ ProductCard 요구 데이터에 맞춰 변환
          name: p.productName,
          price: p.price,
        }}
        onClick={() => navigate(`/product/${p.productId}`)}
      />
    </Col>
  );

  return (
    <MainLayout maxWidth="1000px">
      <Container className="py-4">

        {/* ------------------ 상단 배너 ------------------ */}
        <div className="bg-light rounded-3 p-5 mb-5 text-center border">
          <h2 className="fw-bold mb-2">Shift</h2>
          <p className="text-muted">마음을 전하는 가장 쉬운 방법</p>
        </div>

        {/* ------------------ 신상품 ------------------ */}
        <h4 className="fw-bold mb-3 text-center">— 신상품 —</h4>
        <Row className="g-3">
          {latest.map(renderProductCard)}
        </Row>

        {/* ------------------ 카테고리 추천 ------------------ */}
        <h4 className="fw-bold mt-5 mb-3 text-center">— 카테고리 추천 —</h4>

        <h5 className="fw-bold mt-3 mb-2">디퓨저/캔들</h5>
        <Row className="g-3 mb-4">
          {cat1Reco.map(renderProductCard)}
        </Row>

        <h5 className="fw-bold mt-4 mb-2">화병/트레이</h5>
        <Row className="g-3">
          {cat2Reco.map(renderProductCard)}
        </Row>

      </Container>
    </MainLayout>
  );
};

export default ShopMain;