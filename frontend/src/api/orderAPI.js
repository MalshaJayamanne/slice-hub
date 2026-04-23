import API from "./axios";

const orderAPI = {
  placeOrder: (data) => API.post("/orders", data),
  getMyOrders: () => API.get("/orders/my-orders"),
  getTracking: (id) => API.get(`/orders/${id}/tracking`),
};

export default orderAPI;
