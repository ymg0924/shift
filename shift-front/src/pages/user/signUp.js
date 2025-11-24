import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import TermsModal from '../../components/user/TermsModal';
import { registerUser, checkLoginIdDuplicate, checkPhoneDuplicate } from '../../api/userApi';
import { 
  validateLoginId, validateName, validatePhone, validatePassword, validateAddress, formatPhoneNumber 
} from './validation';

const SignUp = () => {
  const navigate = useNavigate();
  
  // Daum API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // 사용자로부터 입력받는 회원 정보
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    zipcode: '',
    address1: '',
    address2: ''
  });

  // 각 필드별 에러 메시지 상태
  const [errors, setErrors] = useState({});

  // 약관 동의 상태
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false
  });

  // 약관 모달 상태
  const [modal, setModal] = useState({ isOpen: false, type: null });

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 전화번호는 입력 시 자동으로 하이픈 포맷팅 적용
    let finalValue = value;
    if (name === 'phone') {
      finalValue = formatPhoneNumber(value);
    }

    // 변경된 값을 formData에 즉시 반영
    setFormData(prev => ({ ...prev, [name]: finalValue }));

    // 입력할 때마다 실시간 유효성 검사
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 아이디 중복확인 버튼
  const handleCheckLoginId = async () => {
    const error = validateLoginId(formData.loginId);
    if (error) {
      alert(error);
      setErrors(prev => ({ ...prev, loginId: error }));
      return;
    }

    try {
      const isDuplicate = await checkLoginIdDuplicate(formData.loginId);
      if (isDuplicate) {
        alert('이미 사용 중인 아이디입니다');
        setErrors(prev => ({ ...prev, loginId: '이미 사용 중인 아이디입니다' }));
      } else {
        alert('사용 가능한 아이디입니다');
        setErrors(prev => ({ ...prev, loginId: '' }));
      }
    } catch (err) {
      console.error(err);
      alert('아이디 중복 확인에 실패했습니다');
    }
  };

  // 전화번호 중복확인 버튼
  const handleCheckPhone = async () => {
    const error = validatePhone(formData.phone);
    if (error) {
      alert(error);
      setErrors(prev => ({ ...prev, phone: error }));
      return;
    }

    try {
      const cleanPhone = formData.phone.replace(/-/g, '');
      const isDuplicate = await checkPhoneDuplicate(cleanPhone);
      if (isDuplicate) {
        alert('이미 사용 중인 전화번호입니다');
        setErrors(prev => ({ ...prev, phone: '이미 사용 중인 전화번호입니다' }));
      } else {
        alert('사용 가능한 전화번호입니다');
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    } catch (err) {
      console.error(err);
      alert('전화번호 중복 확인에 실패했습니다');
    }
  };

  // Daum 우편번호 검색
  const handleSearchAddress = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        let address1 = '';
        
        // 도로명 주소인 경우
        if (data.userSelectedType === 'R') {
          address1 = data.roadAddress;
        } else {
          // 지번 주소인 경우
          address1 = data.jibunAddress;
        }
        
        // 우편번호, 기본주소 설정하고 상세주소 초기화
        setFormData(prev => ({
          ...prev,
          zipcode: data.zonecode,
          address1: address1,
          address2: ''
        }));
        
        // 상세주소 입력란에 포커스
        setTimeout(() => {
          document.getElementById('formAddress2')?.focus();
        }, 100);
      }
    }).open();
  };

  // 약관 토글
  const toggleAgreement = (field) => {
    setAgreements(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleAllAgreements = () => {
    const allChecked = agreements.terms && agreements.privacy && agreements.marketing;
    setAgreements({ terms: !allChecked, privacy: !allChecked, marketing: !allChecked });
  };

  // 회원가입 버튼 클릭
  const handleSignUp = async () => {
    // 필수 약관 확인
    if (!agreements.terms || !agreements.privacy) {
      alert('필수 약관에 동의해주세요');
      return;
    }

    // 최종 유효성 검사 (모든 필드 다시 확인)
    const fullAddress = `${formData.address1} ${formData.address2}`.trim();
    const newErrors = {};
    newErrors.loginId = validateLoginId(formData.loginId);
    newErrors.password = validatePassword(formData.password);
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    newErrors.name = validateName(formData.name);
    newErrors.phone = validatePhone(formData.phone);
    newErrors.address = validateAddress(fullAddress);

    // 에러가 하나라도 있으면 가입 중단
    const hasError = Object.values(newErrors).some(msg => msg !== '');
    if (hasError) {
      setErrors(newErrors);
      alert('입력 항목을 확인해주세요');
      return;
    }

    // API 데이터 매핑
    const requestData = {
      loginId: formData.loginId,
      password: formData.password,
      name: formData.name,
      phone: formData.phone.replace(/-/g, ''),
      address: fullAddress,
      termsAgreed: true
    };

    // API 호출
    try {
      const response = await registerUser(requestData);
      console.log('가입 성공:', response);
      alert('회원가입이 완료되었습니다!');
      navigate('/');  // 회원가입 성공 시 로그인 페이지로 이동(추후 자동 로그인 후 메인페이지로 이동)
    } catch (error) {
      console.error('가입 실패:', error);
      const resData = error.response?.data;
      const serverMsg = (typeof resData === 'object' && resData.message) 
                        ? resData.message 
                        : resData || '회원가입 중 오류가 발생했습니다.';
      alert(serverMsg);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-white mx-auto border-start border-end" style={{ maxWidth: "480px" }}>
      {/* 로고 */}
      <div className="mb-4">
        <h1 className="display-4 fw-bold text-dark tracking-tight">Shift</h1>
      </div>

      {/* 폼 */}
      <div className="w-100 px-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        
        {/* 아이디 입력 */}
        <Form.Group className="mb-3" controlId="formLoginId">
          <Form.Label className="small text-secondary">아이디</Form.Label>
          <Form.Control
            type="text"
            name="loginId"
            placeholder="아이디를 입력하세요"
            value={formData.loginId}
            onChange={handleChange}
            className={`py-3 border-2 shadow-none ${errors.loginId ? 'is-invalid' : ''}`}
            style={{ borderColor: "#eee" }}
          />
          <Form.Control.Feedback type="invalid" className="small">
            {errors.loginId}
          </Form.Control.Feedback>
          <Button 
            variant="outline-dark"
            className="w-100 mt-2"
            onClick={handleCheckLoginId}
          >
            중복확인
          </Button>
        </Form.Group>

        {/* 비밀번호 입력 */}
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label className="small text-secondary">비밀번호</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleChange}
            className={`py-3 border-2 shadow-none ${errors.password ? 'is-invalid' : ''}`}
            style={{ borderColor: "#eee" }}
          />
          <Form.Control.Feedback type="invalid" className="small">
            {errors.password}
          </Form.Control.Feedback>
        </Form.Group>

        {/* 비밀번호 확인 */}
        <Form.Group className="mb-3" controlId="formConfirmPassword">
          <Form.Label className="small text-secondary">비밀번호 확인</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            placeholder="비밀번호를 다시 입력하세요"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`py-3 border-2 shadow-none ${errors.confirmPassword ? 'is-invalid' : ''}`}
            style={{ borderColor: "#eee" }}
          />
          <Form.Control.Feedback type="invalid" className="small">
            {errors.confirmPassword}
          </Form.Control.Feedback>
        </Form.Group>

        {/* 이름 */}
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label className="small text-secondary">이름</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="이름을 입력하세요"
            value={formData.name}
            onChange={handleChange}
            className={`py-3 border-2 shadow-none ${errors.name ? 'is-invalid' : ''}`}
            style={{ borderColor: "#eee" }}
          />
          <Form.Control.Feedback type="invalid" className="small">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>

        {/* 전화번호 */}
        <Form.Group className="mb-3" controlId="formPhone">
          <Form.Label className="small text-secondary">전화번호</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            placeholder="010-0000-0000"
            value={formData.phone}
            onChange={handleChange}
            className={`py-3 border-2 shadow-none ${errors.phone ? 'is-invalid' : ''}`}
            style={{ borderColor: "#eee" }}
            maxLength={13}
          />
          <Form.Control.Feedback type="invalid" className="small">
            {errors.phone}
          </Form.Control.Feedback>
          <Button 
            variant="outline-dark"
            className="w-100 mt-2"
            onClick={handleCheckPhone}
          >
            중복확인
          </Button>
        </Form.Group>

        {/* 우편번호 */}
        <Form.Group className="mb-3" controlId="formZipcode">
          <Form.Label className="small text-secondary">우편번호</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              name="zipcode"
              placeholder="우편번호"
              value={formData.zipcode}
              readOnly
              className="py-3 border-2 shadow-none"
              style={{ borderColor: "#eee" }}
            />
            <Button
              variant="outline-dark"
              onClick={handleSearchAddress}
              style={{ whiteSpace: 'nowrap' }}
            >
              주소검색
            </Button>
          </div>
        </Form.Group>

        {/* 기본주소 */}
        <Form.Group className="mb-3" controlId="formAddress1">
          <Form.Label className="small text-secondary">기본주소</Form.Label>
          <Form.Control
            type="text"
            name="address1"
            placeholder="기본주소"
            value={formData.address1}
            readOnly
            className="py-3 border-2 shadow-none"
            style={{ borderColor: "#eee" }}
          />
        </Form.Group>

        {/* 상세주소 */}
        <Form.Group className="mb-3" controlId="formAddress2">
          <Form.Label className="small text-secondary">상세주소</Form.Label>
          <Form.Control
            type="text"
            name="address2"
            placeholder="상세주소를 입력하세요"
            value={formData.address2}
            onChange={handleChange}
            className={`py-3 border-2 shadow-none ${errors.address ? 'is-invalid' : ''}`}
            style={{ borderColor: "#eee" }}
          />
          <Form.Control.Feedback type="invalid" className="small">
            {errors.address}
          </Form.Control.Feedback>
        </Form.Group>

        {/* 약관 동의 */}
        <div className="mb-4 mt-4">
          <div className="border rounded p-3 mb-3 bg-light">
            <Form.Check 
              type="checkbox"
              id="check-all"
              label="모든 약관에 동의합니다"
              checked={agreements.terms && agreements.privacy && agreements.marketing}
              onChange={toggleAllAgreements}
              className="fw-bold"
            />
          </div>
          
          <div className="ps-2 d-flex flex-column gap-2">
            {[
              { id: 'terms', label: '(필수) 서비스 이용약관' },
              { id: 'privacy', label: '(필수) 개인정보 수집 및 이용' },
              { id: 'marketing', label: '(선택) 마케팅 정보 수신' }
            ].map(({ id, label }) => (
              <div key={id} className="d-flex justify-content-between align-items-center">
                <Form.Check 
                  type="checkbox"
                  id={`check-${id}`}
                  label={label}
                  checked={agreements[id]}
                  onChange={() => toggleAgreement(id)}
                  className="small text-secondary"
                />
                <Button 
                  variant="link" 
                  className="text-secondary text-decoration-underline p-0 small"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => setModal({ isOpen: true, type: id })}
                >
                  보기
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button
          className="w-100 py-3 fw-bold mt-4 border-0"
          style={{ backgroundColor: "black", color: "white" }}
          onClick={handleSignUp}
        >
          회원가입
        </Button>
      </div>

      {/* 하단 링크 */}
      <div className="mt-4 small text-secondary">
        <span role="button" className="text-decoration-none hover-text-dark" onClick={() => navigate('/')}>
          이미 계정이 있으신가요? 로그인
        </span>
      </div>

      {/* 약관 모달 */}
      <TermsModal 
        isOpen={modal.isOpen}
        type={modal.type}
        onClose={() => setModal({ isOpen: false, type: null })}
        onAgree={() => {
          if (modal.type) setAgreements(prev => ({ ...prev, [modal.type]: true }));
          setModal({ isOpen: false, type: null });
        }}
      />
    </div>
  );
};

export default SignUp;