import httpClient from "./httpClient";

/**
 * 주문 생성 (SHOP-006)
 * POST /orders

 * Response 예시:
 * {
 *   "orderId": 25,
 *   "senderId": 3,
 *   "receiverId": 5,
 *   "totalPrice": 65000,
 *   "orderDate": "2025-11-05",
 *   "status": "CREATED",
 *   "result": true
 * }
 */
export const createOrder = async (orderRequest) => {
  const res = await httpClient.post("/orders", orderRequest);
  return res.data;
};

/**
 * 주문 내역 조회 (SHOP-007)
 * GET /orders
 * Response 예시:
 * {
 *   "orders": [
 *     {
 *       "orderId": 25,
 *       "senderId": 3,
 *       "receiverId": 5,
 *       "orderDate": "2025-11-05",
 *       "totalPrice": 65000,
 *       "pointUsed": 0,
 *       "cashUsed": 65000
 *     }
 *   ]
 * }
 */
export const getOrders = async () => {
  const res = await httpClient.get("/orders"); 
  return res.data;
};

/**
 * 주문 상세 조회 (SHOP-008)
 * GET /orders/{orderId}
 */
export const getOrderDetail = async (orderId) => {
  const res = await httpClient.get(`/orders/${orderId}`);
  return res.data;
};

/**
 * 결제 요청 (SHOP-009)
 * POST /payments
 * Request 예시:
 * {
 *   "orderId": 1,
 *   "amount": 80000,
 *   "pointUsed": 2000
 * }
 * Response 예시:
 * {
 *   "orderId": 3,
 *   "cashAmount": 55000,
 *   "pointUsed": 5000,
 *   "status": "SUCCESS",
 *   "approvedAt": "2025-11-05T13:20:00"
 * }
 */
export const requestPayment = async (paymentRequest) => {
  const res = await httpClient.post("/payments", paymentRequest);
  return res.data;
};

/**
 * 결제 결과 조회 (SHOP-010)
 * GET /payments/{orderId}
 */
export const getPaymentResult = async (orderId) => {
  const res = await httpClient.get(`/payments/${orderId}`);
  return res.data;
};

/**
 * 주문 취소 (SHOP-012)
 * PUT /orders/{orderId}/cancel
 */
export const cancelOrder = async (orderId) => {
  const res = await httpClient.put(`/orders/${orderId}/cancel`);
  return res.data;
};
