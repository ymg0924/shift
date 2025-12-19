import React from "react";
import { Button, ListGroup } from "react-bootstrap";

const ProfileDetailPanel = ({
  title,
  imageSrc,
  onImageError,
  onImageClick,
  overlayText,
  fields,
  actionLabel,
  onActionClick,
  showAction = false,
}) => {
  const shouldRenderAction = showAction && typeof onActionClick === "function";

  return (
    <div className="profile-detail-shell">
      <div className="profile-detail-card">
        <div className="d-flex justify-content-between align-items-center mb-4 profile-detail-header">
          <h2 className="fw-bold m-0">{title}</h2>
        </div>

        <div className="d-flex flex-column align-items-center gap-4">
          <div
            className={`profile-image-wrapper ${onImageClick ? "clickable" : ""}`}
            onClick={onImageClick}
            style={{ position: "relative" }}
          >
            <img
              src={imageSrc}
              onError={onImageError}
              className="profile-avatar-lg"
              alt={`${title} 이미지`}
            />

            {overlayText && <div className="overlay-hover">{overlayText}</div>}
          </div>

          <ListGroup className="w-100 profile-field-list">
            {fields.map(({ label, value }) => (
              <ListGroup.Item
                key={label}
                className="d-flex justify-content-between align-items-center profile-field-item"
              >
                <span className="fw-bold text-muted">{label}</span>
                <span className="text-dark">{value ?? "-"}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>

          {shouldRenderAction && (
            <div className="d-flex justify-content-center w-100">
              <Button
                variant="outline-primary"
                onClick={onActionClick}
                className="fw-semibold profile-action-btn"
              >
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailPanel;
