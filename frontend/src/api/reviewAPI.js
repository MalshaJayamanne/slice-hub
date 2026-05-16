import API from "./axios";

const reviewAPI = {
  getReviews: (params) => API.get("/reviews", { params }),
  createReview: (reviewData) => API.post("/reviews", reviewData),
};

export default reviewAPI;
