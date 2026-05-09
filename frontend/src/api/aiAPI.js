import API from "./axios";

export const sendAssistantMessage = async (message) => {
  const response = await API.post("/ai/chat", { message });

  return response.data;
};
