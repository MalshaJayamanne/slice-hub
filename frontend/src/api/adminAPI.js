import API from "./axios";

const adminAPI = {
  getDashboardSummary: () => API.get("/admin/dashboard-summary"),
  getUsers: (params = {}) => API.get("/admin/users", { params }),
  createUser: (data) => API.post("/admin/users", data),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getRestaurants: (params = {}) => API.get("/admin/restaurants", { params }),
  createRestaurant: (data) => API.post("/admin/restaurants", data),
  updateRestaurant: (id, data) => API.put(`/admin/restaurants/${id}`, data),
  deleteRestaurant: (id) => API.delete(`/admin/restaurants/${id}`),
  updateRestaurantStatus: (id, status) =>
    API.patch(`/admin/restaurants/${id}/status`, { status }),
  getOrders: (params = {}) => API.get("/admin/orders", { params }),
};

export default adminAPI;
