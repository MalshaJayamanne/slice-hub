import API from "./axios";

const adminAPI = {
  getDashboardSummary: () => API.get("/admin/dashboard-summary"),
  getUsers: (params = {}) => API.get("/admin/users", { params }),
  getRestaurants: (params = {}) => API.get("/admin/restaurants", { params }),
  updateRestaurantStatus: (id, status) =>
    API.patch(`/admin/restaurants/${id}/status`, { status }),
  getOrders: (params = {}) => API.get("/admin/orders", { params }),
};

export default adminAPI;
