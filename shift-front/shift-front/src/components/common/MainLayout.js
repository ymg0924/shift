import React from "react";
import ShopHeader from "./ShopHeader";
import ShopFooter from "./ShopFooter";
import "../../styles/layout.css";

const MainLayout = ({
  children,
  showHeader = true,
  showFooter = true,
  maxWidth = "1200px",
  padding = "0px",
}) => {
  return (
    <div className="layout-wrapper">
      {/* 공통 헤더 */}
      {showHeader && <ShopHeader />}

      {/* 메인 콘텐츠 */}
      <main className="layout-main" style={{ maxWidth, padding }}>
        {children}
      </main>

      {/* 공통 푸터 */}
      {showFooter && <ShopFooter />}
    </div>
  );
};

export default MainLayout;
