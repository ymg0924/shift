import axios from "axios";
import store from "../store/store";
import { loginSuccess, logout } from "../store/authSlice";

// 공통 Axios 인스턴스 생성
const httpClient = axios.create({
  baseURL: "http://localhost:8080", // 백엔드 기본 주소
  timeout: 10000, // 요청 타임아웃
  withCredentials: true, // 리프레시 토큰 전송을 위한 쿠키 포함
});

// 공통 요청/응답 처리
httpClient.interceptors.request.use(
  (config) => {
    // 로컬스토리지에서 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // 재시도 플래그 설정

      try {
        console.log("액세스 토큰 만료, 리프레시 토큰으로 갱신 시도");

        // 리프레시 토큰으로 액세스 토큰 갱신 요청
        const { data } = await httpClient.post("/auth/refresh");

        const newAccessToken = data.accessToken;

        // 로컬스토리지에 새로운 액세스 토큰 저장
        localStorage.setItem("accessToken", newAccessToken);
        store.dispatch(loginSuccess({ accessToken: newAccessToken })); // Redux 상태 업데이트

        // 원래 요청에 새로운 액세스 토큰 설정 후 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return httpClient(originalRequest);
      } catch (refreshError) {
        console.error("토큰 갱신 실패, 로그인 필요:", refreshError);

        localStorage.removeItem("accessToken");
        store.dispatch(logout()); // Redux 상태 초기화
        window.location.href = "/"; // 로그인 페이지로 리다이렉트

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
