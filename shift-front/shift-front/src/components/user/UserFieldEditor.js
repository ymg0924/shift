import React, { useState } from "react";
import { Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import { formatPhoneNumber } from "../../utils/signUpValidation";

const UserFieldEditor = ({
  title,
  initialValue,
  inputType,
  inputHelperText,
  onSave,
  cardClassName,
}) => {
  // 이름/연락처 카드: 흰색 배경
  const cardBgClass =
    title === "이름" || title === "연락처" ? "bg-white" : cardClassName || "";

  // 연락처는 항상 하이픈 포함해서 보여주기
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(() => {
    if (inputType === "tel") {
      return formatPhoneNumber(initialValue || "");
    }
    return initialValue || "";
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);

  // 입력값 변경 시 하이픈 자동 추가
  const handleInputChange = (e) => {
    let value = e.target.value;
    if (inputType === "tel") {
      value = value.replace(/\D/g, "");
      if (value.length <= 3) {
      } else if (value.length <= 7) {
        value = value.replace(/(\d{3})(\d{1,4})/, "$1-$2");
      } else {
        value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, "$1-$2-$3");
      }
    }
    setTempValue(value);
  };

  // 저장 시 하이픈 제거해서 백엔드로 전달
  const handleSave = async () => {
    let sendValue = tempValue;
    if (inputType === "tel") {
      sendValue = tempValue.replace(/-/g, "");
    }
    setSaveLoading(true);
    setError(null);
    try {
      await onSave(sendValue);
      setIsEditing(false);
    } catch (e) {
      setError(e.message || `${title} 변경에 실패했습니다.`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempValue(
      inputType === "tel"
        ? formatPhoneNumber(initialValue || "")
        : initialValue || ""
    );
    setError(null);
  };

  // 표시할 값(수정모드 아닐 때)도 항상 하이픈 포함
  const displayValue =
    inputType === "tel"
      ? formatPhoneNumber(initialValue || "")
      : initialValue || "";

  return (
    <Card className={`border-0 shadow-sm ${cardBgClass}`}>
      <Card.Body className="p-4">
        <div className="small mb-1 fw-semibold fst-italic text-muted">
          {title}
        </div>
        {!isEditing ? (
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark">{displayValue}</span>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              변경
            </Button>
          </div>
        ) : (
          <>
            <Form.Control
              type={inputType}
              value={tempValue}
              onChange={handleInputChange}
              autoFocus
              className="mb-2"
              maxLength={inputType === "tel" ? 13 : undefined}
            />
            {inputHelperText && (
              <div className="text-muted small mb-2">{inputHelperText}</div>
            )}
            {error && <Alert variant="danger">{error}</Alert>}
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "완료"
                )}
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleCancel}
                disabled={saveLoading}
              >
                취소
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default UserFieldEditor;
