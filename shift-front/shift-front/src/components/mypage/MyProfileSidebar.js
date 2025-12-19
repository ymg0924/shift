import React from "react";
import { Card, Button } from "react-bootstrap";
import { PROFILE_DEFAULT } from "../../utils/chatImages";

const MyProfileSidebar = ({
  user,
  menuList,
  activeTab,
  setActiveTab,
  formatNumber,
  profileImageSrc,
  onImageError,
}) => (
  <div
    style={{
      width: 260,
      minWidth: 220,
      marginRight: "2.5rem",
      position: "sticky",
      top: "120px",
      alignSelf: "flex-start",
      zIndex: 2,
      background: "transparent",
    }}
  >
    {/* 프로필 카드 */}
    <Card
      className="mb-4 text-center shadow-sm"
      style={{
        background: "#fff",
        color: "#222",
        borderRadius: "1.5rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
      }}
    >
      {/* 프로필 이미지 */}
      <Card.Body className="p-4">
        <div
          className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: 140,
            height: 140,
            background: "#5b8fc3",
            color: "#fff",
            fontSize: 36,
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(91,143,195,0.3)",
            overflow: "hidden",  
          }}
        >
          <img
              src={profileImageSrc}
              onError={onImageError}
              className="profile-avatar-lg profile-avatar-sidebar"
              alt={"프로필 이미지"}
            />
        </div>
        <div className="fw-bold fs-5">{user.loginId}</div>
        <div className="mb-3 text-muted">{user.name}</div>
        
        {/* 포인트 섹션 */}
        <div className="p-3" style={{ background: "#f7f9fc", borderRadius: "1rem" }}>
            <div
                className="small mb-1"
                style={{
                    color: "#5b8fc3",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                }}
            >
                보유 포인트
            </div>
            <div
                className="fw-bold"
                style={{
                    fontSize: 22,
                    color: "#5b8fc3",
                }}
            >
                {formatNumber(
                    user.points != null
                        ? user.points
                        : user.point != null
                        ? user.point
                        : 0
                )}
                P
            </div>
        </div>
      </Card.Body>
    </Card>
    {/* 메뉴 */}
    <Card
      className="shadow-sm"
      style={{
        borderRadius: "1.5rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
      }}
    >
      <Card.Body className="p-0">
        <ul className="list-unstyled mb-0">
          {menuList.map((menu) => (
            <li key={menu.key}>
              <Button
                variant="link"
                className={`w-100 text-start px-4 py-3 border-0 rounded-0 fw-semibold ${
                  activeTab === menu.key ? "mypage-menu-active" : "text-dark"
                }`}
                style={{
                    background: "transparent",
                    color: "inherit",
                    fontWeight: 500,
                    fontSize: 16,
                    letterSpacing: "0.5px",
                }}
                onClick={() => {
                  setActiveTab(menu.key);
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }}
              >
                <span style={{ fontSize: 18, marginRight: 12 }}>
                  {menu.icon}
                </span>
                {menu.label}
              </Button>
            </li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  </div>
);

export default MyProfileSidebar;