import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Pagination,
  Form,
} from "react-bootstrap";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductCard from "../../components/product/ProductCard";
import MainLayout from "../../components/common/MainLayout";
import "../../styles/productlist.css";  // ⭐ 스타일 외부 관리
import "../../styles/shopMain.css";

const BANNER_BASE =
  "https://shift-main-images.s3.ap-northeast-3.amazonaws.com/products";

const CATEGORY_BANNERS = {
  all: {
    // 전체 상품용 배너
    image: `${BANNER_BASE}/product_banner_00.jpg`,
    title: "오늘은 어떤 취향을 고를까요?",
    subtitle: "디퓨저부터 트레이까지\nShift에서 천천히 둘러보세요.",
  },
  1: {
    // 디퓨저/캔들
    image: `${BANNER_BASE}/product_banner_01.jpg`,
    title: "오늘 하루, 향으로 기억되다",
    subtitle: "디퓨저와 향초로\n하루의 끝을 더 깊고 편안하게.",
  },
  2: {
    // 화병/트레이
    image: `${BANNER_BASE}/product_banner_02.jpg`,
    title: "투명한 유리 꽃병으로 완성하는 공간",
    subtitle: "아침 햇살을 담은 유리 꽃병으로\n집 안의 분위기를 한 단계 더 올려보세요.",
  },
  3: {
    // 금액권
    image: `${BANNER_BASE}/shopmain_banner_03.jpg`,
    title: "마음을 금액으로 전하는 금액권",
    subtitle: "무엇을 좋아할지 고민될 땐\nShift 금액권으로 선택의 즐거움을 선물하세요.",
  },
  default: {
    // 예외용
    image: `${BANNER_BASE}/shopmain_banner_03.jpg`,
    title: "Shift와 함께하는 작은 선물",
    subtitle: "일상을 조금 더 특별하게 만들어 줄\n작은 것들을 만나보세요.",
  },
};

// ⭐ 카테고리 ID → 카테고리명 매핑
const getCategoryName = (id) => {
  const map = {
    1: "디퓨저/캔들",
    2: "화병/트레이",
    3: "금액권",
  };
  return map[id] || "카테고리";
};

const ProductList = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortType, setSortType] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, [categoryId, location.pathname, sortType]);

  const loadData = async () => {
    setLoading(true);

    try {
      let res;

      if (location.pathname.includes("/shop/products")) {
        res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/products/sort`, {
          params: { sortType },
        });
      } else if (categoryId) {
        res = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/products/categories/${categoryId}/products/sort`,
          { params: { sortType } }
        );
      }

      setProducts(res?.data || []);
    } catch (err) {
      console.error("상품 조회 실패:", err);
    }

    setLoading(false);
  };

  // shop-section 스크롤 애니메이션
  useEffect(() => {
    if (loading) return;

    const sections = document.querySelectorAll(".shop-section");
    if (!sections.length) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      sections.forEach((sec) => sec.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [loading]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // 현재 페이지(전체/카테고리)에 맞는 배너 선택
  const isAllProducts = location.pathname.includes("/shop/products");
  const numericCategoryId = categoryId ? Number(categoryId) : null;
  const bannerConfig = isAllProducts
    ? CATEGORY_BANNERS.all
    : CATEGORY_BANNERS[numericCategoryId] || CATEGORY_BANNERS.default;


  return (
    <MainLayout maxWidth="2000px" padding="50px">
      <Container className="pb-4">

        {/* 상단 배너 */}
        <div className="shop-banner-wrapper mb-4">
          <div className="shop-banner-slide banner-compact">
            <img
              src={bannerConfig.image}
              alt={bannerConfig.title}
              className="shop-banner-image"
            />
            <div className="shop-banner-overlay" />
            <div className="shop-banner-text">
              <h2 className="shop-banner-title">{bannerConfig.title}</h2>
              <p className="shop-banner-subtitle">
                {bannerConfig.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* 제목 + 정렬 */}
        <div className="productlist-header">
          <h4 className="fw-bold">
            {location.pathname.includes("/shop/products")
              ? "전체 상품"
              : getCategoryName(Number(categoryId))}
          </h4>

          <Form.Select
            className="productlist-sort"
            value={sortType}
            onChange={(e) => {
              setSortType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="latest">최신순</option>
            <option value="priceAsc">가격 낮은순</option>
            <option value="priceDesc">가격 높은순</option>
          </Form.Select>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center text-muted py-5">
            표시할 상품이 없습니다.
          </div>
        ) : (          
          <section className="shop-section">
            <Row xs={2} md={3} lg={4} className="g-4">
              {currentItems.map((p) => (
                <Col key={p.productId}>
                  <ProductCard
                    product={{
                      image: p.imageUrls && p.imageUrls.length > 0
                        ? p.imageUrls[0]
                        : null,
                      name: p.productName,
                      price: p.price,
                    }}
                    onClick={() => navigate(`/product/${p.productId}`)}
                  />
                </Col>
              ))}
            </Row>

            <div className="d-flex justify-content-center mt-4">
              <Pagination className="productlist-pagination">
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    active={idx + 1 === currentPage}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </section>
        )}
      </Container>
    </MainLayout>
  );
};

export default ProductList;