import API from "./axios";

const paymentAPI = {
  processPayment: (data) =>
    API.post("/payments/process", data),

  getPaymentHistory: () =>
    API.get("/payments/history"),

  getPaymentById: (id) =>
    API.get(`/payments/${id}`),
};

export default paymentAPI;