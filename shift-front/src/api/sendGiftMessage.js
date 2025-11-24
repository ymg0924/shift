import { useSelector } from "react-redux";
import httpClient from "./httpClient";

export const requestPaymentAndGiftMessage = async (paymentRequest, chatroomId) => {
  const res = await httpClient.post(`/payments/gift/${chatroomId}`, paymentRequest);
  return res.data;
};
