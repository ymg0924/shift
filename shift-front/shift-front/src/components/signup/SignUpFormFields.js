import React from "react";
import { Form, Button } from "react-bootstrap";

const SignUpFormFields = ({
  formData,
  errors,
  verified,
  onChange,
  onCheckLoginId,
  onCheckPhone,
  onSearchAddress,
}) => {
  return (
    <>
      {/* 아이디 입력 */}
      <Form.Group className="signup-field-group" controlId="formLoginId">
        <Form.Label className="signup-label">
          아이디 <span className="text-danger">*</span>
        </Form.Label>

        <div className="signup-input-area d-flex gap-2">
          <div className="flex-grow-1">
            <Form.Control
              type="text"
              name="loginId"
              placeholder="아이디를 입력하세요"
              value={formData.loginId}
              onChange={onChange}
              className={`py-3 shadow-none signup-input ${errors.loginId ? "is-invalid" : verified.loginId ? "is-valid" : ""}`}
            />
            <Form.Control.Feedback type="invalid" className="small">
              {errors.loginId}
            </Form.Control.Feedback>
            <Form.Control.Feedback type="valid" className="small">
              사용 가능한 아이디입니다
            </Form.Control.Feedback>
          </div>
          {/* 중복확인 */}
          <Button
            className={`signup-btn-outline text-nowrap ${
              verified.loginId ? "signup-btn-success" : ""
            }`}
            onClick={onCheckLoginId}
            disabled={verified.loginId}
            style={{ minWidth: "100px", height: "58px" }}
          >
            {verified.loginId ? "확인완료 ✓" : "중복확인"}
          </Button>
        </div>
      </Form.Group>

      {/* 비밀번호 입력 */}
      <Form.Group className="signup-field-group" controlId="formPassword">
        <Form.Label className="signup-label">
          비밀번호 <span className="text-danger">*</span>
        </Form.Label>
        <div className="signup-input-area">
          <Form.Control
            type="password"
            name="password"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={onChange}
            className={`py-3 shadow-none signup-input ${errors.password ? "is-invalid" : ""}`}
          />
          <Form.Control.Feedback type="invalid" className="small">
            {errors.password}
          </Form.Control.Feedback>
        </div>
      </Form.Group>

      {/* 비밀번호 확인 */}
      <Form.Group
        className="signup-field-group"
        controlId="formConfirmPassword"
      >
        <Form.Label className="signup-label">
          비밀번호 확인 <span className="text-danger">*</span>
        </Form.Label>

        <div className="signup-input-area">
          <Form.Control
            type="password"
            name="confirmPassword"
            placeholder="비밀번호를 다시 입력하세요"
            value={formData.confirmPassword}
            onChange={onChange}
            className={`py-3 shadow-none signup-input ${errors.confirmPassword ? "is-invalid" : ""}`}
          />
          <Form.Control.Feedback type="invalid" className="small">
            {errors.confirmPassword}
          </Form.Control.Feedback>
        </div>
      </Form.Group>

      {/* 이름 */}
      <Form.Group className="signup-field-group" controlId="formName">
        <Form.Label className="signup-label">
          이름 <span className="text-danger">*</span>
        </Form.Label>

        <div className="signup-input-area">
          <Form.Control
            type="text"
            name="name"
            placeholder="이름을 입력하세요"
            value={formData.name}
            onChange={onChange}
            className={`py-3 shadow-none signup-input ${errors.name ? "is-invalid" : ""}`}
          />
          <Form.Control.Feedback type="invalid" className="small">
            {errors.name}
          </Form.Control.Feedback>
        </div>
      </Form.Group>

      {/* 전화번호 */}
      <Form.Group className="signup-field-group" controlId="formPhone">
        <Form.Label className="signup-label">
          전화번호 <span className="text-danger">*</span>
        </Form.Label>

        <div className="signup-input-area d-flex gap-2">
          <div className="flex-grow-1">
            <Form.Control
              type="tel"
              name="phone"
              placeholder="010-0000-0000"
              value={formData.phone}
              onChange={onChange}
              className={`py-3 shadow-none signup-input ${errors.phone ? "is-invalid" : verified.phone ? "is-valid" : ""}`}
              maxLength={13}
            />
            <Form.Control.Feedback type="invalid" className="small">
              {errors.phone}
            </Form.Control.Feedback>
            <Form.Control.Feedback type="valid" className="small">
              사용 가능한 전화번호입니다
            </Form.Control.Feedback>
          </div>
          <Button
            className={`signup-btn-outline text-nowrap ${
              verified.phone ? "signup-btn-success" : ""
            }`}
            style={{ minWidth: "100px", height: "58px" }}
            onClick={onCheckPhone}
            disabled={verified.phone}
          >
            {verified.phone ? "확인완료 ✓" : "중복확인"}
          </Button>
        </div>
      </Form.Group>

      {/* 우편번호 */}
      <Form.Group
        className="signup-field-group align-items-start"
        controlId="formAddress"
      >
        <Form.Label className="signup-label" style={{ paddingTop: "15px" }}>
          주소 <span className="text-danger">*</span>
        </Form.Label>
        <div className="signup-input-area">
          <div className="d-flex gap-2 mb-2 justify-content-between">
            <Form.Control
              type="text"
              name="zipcode"
              placeholder="우편번호"
              value={formData.zipcode}
              readOnly
              className={`py-3 shadow-none signup-input ${errors.zipcode ? "is-invalid" : ""}`}
              style={{ maxWidth: "150px" }}
            />
            <Button
              className="signup-btn-outline text-nowrap flex-grow-1"
              onClick={onSearchAddress}
              style={{ maxWidth: "100px", height: "58px" }}
            >
              주소검색
            </Button>
          </div>
          {errors.zipcode && (
            <div className="invalid-feedback d-block small">
              {errors.zipcode}
            </div>
          )}

          {/* 기본주소 */}
          <Form.Control
            type="text"
            name="address1"
            placeholder="기본주소"
            value={formData.address1}
            readOnly
            className={`py-3 mb-2 shadow-none signup-input ${errors.address1 ? "is-invalid" : ""}`}
          />
          {errors.address1 && (
            <div className="invalid-feedback d-block small">
              {errors.address1}
            </div>
          )}

          {/* 상세주소 */}
          <Form.Control
            type="text"
            name="address2"
            placeholder="상세주소를 입력하세요"
            value={formData.address2}
            onChange={onChange}
            className={`py-3 shadow-none signup-input ${errors.address2 ? "is-invalid" : ""}`}
          />
          <Form.Control.Feedback type="invalid" className="small">
            {errors.address2}
          </Form.Control.Feedback>
        </div>
      </Form.Group>
    </>
  );
};

export default SignUpFormFields;
