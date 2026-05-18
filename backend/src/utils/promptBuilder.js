const formatFood = (food) => {
  const restaurantName = food.restaurant?.name || "Unknown restaurant";
  const description = food.description ? ` - ${food.description}` : "";

  return `${food.name} (${food.category}) from ${restaurantName}, Rs. ${food.price}${description}`;
};

const formatRestaurant = (restaurant) => {
  const description = restaurant.description ? ` - ${restaurant.description}` : "";
  const rating = restaurant.rating ? ` Rating: ${restaurant.rating}.` : "";

  return `${restaurant.name} (${restaurant.category})${description}.${rating}`;
};

const formatOrder = (order) => {
  if (!order) {
    return "No recent order found for this user.";
  }

  const restaurantName = order.restaurant?.name || "the restaurant";
  const items = order.items
    .map((item) => `${item.quantity} x ${item.name}`)
    .join(", ");

  return `Latest order ${order._id} from ${restaurantName}: ${order.status}. Items: ${items}. Total: Rs. ${order.totalAmount}.`;
};

const formatHistory = (history = []) => {
  if (!history.length) {
    return "No recent assistant conversation.";
  }

  return history
    .slice(-8)
    .map((entry) => `${entry.sender === "user" ? "User" : "Assistant"}: ${entry.text}`)
    .join("\n");
};

const formatOrderHistory = (orders = []) => {
  if (!orders.length) {
    return "No recent order history found for this user.";
  }

  return orders
    .slice(0, 5)
    .map((order) => {
      const restaurantName = order.restaurant?.name || "the restaurant";
      const items = order.items.map((item) => `${item.quantity} x ${item.name}`).join(", ");
      return `${restaurantName}: ${items}`;
    })
    .join("\n");
};

export const buildSliceHubPrompt = ({
  message,
  history = [],
  foods,
  restaurants,
  latestOrder,
  orderHistory = [],
  user,
}) => {
  const foodContext = foods.length
    ? foods.map(formatFood).join("\n")
    : "No matching foods were found in the current catalog.";

  const restaurantContext = restaurants.length
    ? restaurants.map(formatRestaurant).join("\n")
    : "No approved restaurants were found for this request.";

  return [
    "You are Slice Hub AI Assistant, a helpful food ordering assistant for a MERN food delivery platform in Sri Lanka.",
    "Use only the provided Slice Hub context for food, restaurant, and order facts. Do not invent restaurant names, order statuses, prices, or menu items.",
    "Help with food recommendations, restaurant discovery, order support, navigation guidance, seller onboarding FAQs, and checkout/cart guidance.",
    "Keep replies friendly, concise, and practical. Mention prices in Rs. when available.",
    "If the user asks to track an order and no authenticated order context is available, ask them to log in and open Orders.",
    "If there are matching foods or restaurants, suggest at most five options.",
    "Use recent conversation only to understand follow-up phrases like cheaper ones, the second one, or add it to cart.",
    "",
    `User role: ${user?.role || "guest"}`,
    `User message: ${message}`,
    "",
    "Recent conversation:",
    formatHistory(history),
    "",
    "Recent order history for personalization:",
    formatOrderHistory(orderHistory),
    "",
    "Matching food catalog:",
    foodContext,
    "",
    "Approved restaurants:",
    restaurantContext,
    "",
    "Authenticated order context:",
    formatOrder(latestOrder),
  ].join("\n");
};
