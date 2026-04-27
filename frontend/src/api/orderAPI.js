import API from "./axios";

const orderAPI = {
  placeOrder: (data) => API.post("/orders", data),
  getMyOrders: () => API.get("/orders/my-orders"),
  getSellerOrders: (params = {}) => API.get("/orders/seller", { params }),
  getOrderById: (id) => API.get(`/orders/${id}`),
  getTracking: (id) => API.get(`/orders/${id}/tracking`),
  updateOrderStatus: (id, status) => API.patch(`/orders/${id}/status`, { status }),
};

export default orderAPI;
