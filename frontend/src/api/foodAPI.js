import API from "./axios";

const foodAPI = {
  getByRestaurant: (id) => API.get(`/foods/restaurant/${id}`),
  getById: (id) => API.get(`/foods/${id}`),
  create: (data) => API.post("/foods", data),
  update: (id, data) => API.put(`/foods/${id}`, data),
  delete: (id) => API.delete(`/foods/${id}`),
  search: ({ q, restaurantId } = {}) =>
    API.get("/foods/search", {
      params: { q, restaurantId },
    }),
};

export default foodAPI;
