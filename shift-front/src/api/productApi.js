import axios from "axios";

const API_BASE = "http://localhost:8080"; // 백엔드 주소

export const getProducts = async () => {
  const res = await axios.get(`${API_BASE}/products`);
  return res.data.items; // API 명세 구조에 맞춤
};

export const searchProducts = async (keyword) => {
  const res = await axios.get(`${API_BASE}/products/search?keyword=${keyword}`);
  
  // Postman 응답이 배열이므로 그대로 반환
  return res.data;
};