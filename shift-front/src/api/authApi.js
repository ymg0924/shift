import httpClient from "./httpClient";

export const loginUser = async (credentials) => {
  const response = await httpClient.post("/auth/login", credentials);
  return response.data;
};
