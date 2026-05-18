import API from "./axios";

const uploadAPI = {
  image: ({ file, type = "food" }) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    return API.post("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default uploadAPI;
