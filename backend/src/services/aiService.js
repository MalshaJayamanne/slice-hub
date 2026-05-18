import { GoogleGenerativeAI } from "@google/generative-ai";

import Food from "../models/Food.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import { buildSliceHubPrompt } from "../utils/promptBuilder.js";

const MAX_CONTEXT_ITEMS = 8;
const HISTORY_LIMIT = 8;
const PRICE_PATTERNS = [
  /(?:under|below|less than|within|max|maximum)\s*(?:rs\.?|lkr)?\s*(\d+)/i,
  /(?:rs\.?|lkr)\s*(\d+)\s*(?:or less|and below|maximum|max)/i,
];

const STOP_WORDS = new Set([
  "a",
  "ai",
  "am",
  "an",
  "and",
  "are",
  "best",
  "bot",
  "can",
  "cheap",
  "find",
  "food",
  "for",
  "give",
  "hello",
  "help",
  "hey",
  "how",
  "hub",
  "i",
  "is",
  "me",
  "my",
  "near",
  "open",
  "order",
  "please",
  "restaurant",
  "restaurants",
  "rs",
  "show",
  "slice",
  "suggest",
  "tell",
  "the",
  "to",
  "want",
  "what",
  "where",
  "with",
]);

const FAQ_REPLIES = [
  {
    patterns: [/become.*seller/i, /seller/i, /restaurant owner/i],
    reply:
      "To become a seller, create an account, choose the seller role, then add your restaurant from the seller dashboard. An admin must approve the restaurant before customers can order from it.",
  },
  {
    patterns: [/payment/i, /pay/i],
    reply:
      "Slice Hub supports checkout from your cart and records payment history after an order attempt. If a payment fails, use the payment failed page to return to checkout and try again.",
  },
  {
    patterns: [/cart/i],
    reply:
      "Your cart can hold items from one restaurant at a time. Open the cart to update quantities, remove items, or continue to checkout.",
  },
  {
    patterns: [/login|sign in|account/i],
    reply:
      "Log in from the top navigation to access your dashboard, order history, payment history, and order tracking.",
  },
];

const extractMaxPrice = (message) => {
  for (const pattern of PRICE_PATTERNS) {
    const match = message.match(pattern);

    if (match?.[1]) {
      return Number(match[1]);
    }
  }

  return null;
};

const extractKeywords = (message) =>
  message
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 8);

const normalizeHistory = (history = []) =>
  history
    .filter((entry) => ["user", "bot"].includes(entry?.sender) && entry?.text)
    .map((entry) => ({
      sender: entry.sender,
      text: String(entry.text).slice(0, 600),
    }))
    .slice(-HISTORY_LIMIT);

const getConversationText = (history) =>
  history.map((entry) => entry.text).join(" ");

const extractActionIntent = (message) => {
  if (!/(add|put|place).*(cart|basket)|cart.*(this|that|it|one)/i.test(message)) {
    return null;
  }

  const ordinalMatch = message.match(/\b(first|1st|one|second|2nd|two|third|3rd|three)\b/i);
  const ordinalMap = {
    first: 0,
    "1st": 0,
    one: 0,
    second: 1,
    "2nd": 1,
    two: 1,
    third: 2,
    "3rd": 2,
    three: 2,
  };

  return {
    type: "add_to_cart",
    itemIndex: ordinalMatch ? ordinalMap[ordinalMatch[1].toLowerCase()] : 0,
  };
};

const buildTextFilter = (keywords, fields) => {
  if (keywords.length === 0) {
    return {};
  }

  return {
    $or: keywords.flatMap((keyword) =>
      fields.map((field) => ({
        [field]: { $regex: keyword, $options: "i" },
      }))
    ),
  };
};

const getLatestOrder = async (user, message) => {
  if (!user || !/track|status|latest order|where.*order/i.test(message)) {
    return null;
  }

  let filter = {};

  if (user.role === "customer") {
    filter = { customer: user._id };
  }

  if (user.role === "seller") {
    const sellerRestaurants = await Restaurant.find({ ownerId: user._id })
      .select("_id")
      .lean();

    filter = {
      restaurant: { $in: sellerRestaurants.map((restaurant) => restaurant._id) },
    };
  }

  return Order.findOne(filter)
    .populate("restaurant", "name")
    .sort({ createdAt: -1 })
    .lean();
};

const getRecentCustomerOrders = async (user) => {
  if (!user || user.role !== "customer") {
    return [];
  }

  return Order.find({ customer: user._id })
    .populate("restaurant", "name category rating")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
};

const getFoodOrderCounts = async (foods) => {
  if (!foods.length) {
    return new Map();
  }

  const foodIds = foods.map((food) => food._id);
  const counts = await Order.aggregate([
    { $unwind: "$items" },
    { $match: { "items.food": { $in: foodIds } } },
    { $group: { _id: "$items.food", orderCount: { $sum: "$items.quantity" } } },
  ]);

  return new Map(counts.map((item) => [String(item._id), item.orderCount]));
};

const buildUserPreferenceSets = (orders) => {
  const foodNames = new Set();
  const restaurantIds = new Set();

  orders.forEach((order) => {
    if (order.restaurant?._id) {
      restaurantIds.add(String(order.restaurant._id));
    }

    order.items.forEach((item) => {
      if (item.name) {
        foodNames.add(item.name.toLowerCase());
      }
    });
  });

  return { foodNames, restaurantIds };
};

const scoreFood = (food, preferences) => {
  let score = Number(food.orderCount || 0);
  const restaurantId = food.restaurant?._id || food.restaurant;

  if (restaurantId && preferences.restaurantIds.has(String(restaurantId))) {
    score += 5;
  }

  if (preferences.foodNames.has(String(food.name || "").toLowerCase())) {
    score += 4;
  }

  if (food.restaurant?.rating) {
    score += Number(food.restaurant.rating);
  }

  return score;
};

export const collectAssistantContext = async ({ message, history = [], user }) => {
  const normalizedHistory = normalizeHistory(history);
  const conversationText = getConversationText(normalizedHistory);
  const keywords = extractKeywords(`${message} ${conversationText}`);
  const maxPrice = extractMaxPrice(message);
  const orderHistory = await getRecentCustomerOrders(user);
  const preferences = buildUserPreferenceSets(orderHistory);
  const restaurantFilter = {
    status: "approved",
    ...buildTextFilter(keywords, ["name", "category", "description"]),
  };

  const approvedRestaurants = await Restaurant.find(restaurantFilter)
    .select("name category description image rating")
    .sort({ rating: -1, createdAt: -1 })
    .limit(MAX_CONTEXT_ITEMS)
    .lean();

  const approvedRestaurantIds = approvedRestaurants.map((restaurant) => restaurant._id);
  const fallbackRestaurantIds =
    approvedRestaurantIds.length > 0
        ? approvedRestaurantIds
        : (
            await Restaurant.find({ status: "approved" })
            .select("_id")
            .sort({ rating: -1, createdAt: -1 })
            .limit(MAX_CONTEXT_ITEMS)
            .lean()
        ).map((restaurant) => restaurant._id);

  const foodFilter = {
    availability: true,
    restaurant: { $in: fallbackRestaurantIds },
    ...buildTextFilter(keywords, ["name", "category", "description"]),
  };

  if (maxPrice !== null) {
    foodFilter.price = { $lte: maxPrice };
  }

  let foods = await Food.find(foodFilter)
    .populate("restaurant", "name category rating")
    .sort({ price: 1, createdAt: -1 })
    .limit(MAX_CONTEXT_ITEMS)
    .lean();

  if (foods.length === 0 && keywords.length > 0) {
    const fallbackFoodFilter = {
      availability: true,
      restaurant: { $in: fallbackRestaurantIds },
    };

    if (maxPrice !== null) {
      fallbackFoodFilter.price = { $lte: maxPrice };
    }

    foods = await Food.find(fallbackFoodFilter)
      .populate("restaurant", "name category rating")
      .sort({ price: 1, createdAt: -1 })
      .limit(MAX_CONTEXT_ITEMS)
      .lean();
  }

  const orderCounts = await getFoodOrderCounts(foods);
  foods = foods
    .map((food) => ({
      ...food,
      orderCount: orderCounts.get(String(food._id)) || 0,
    }))
    .sort((a, b) => scoreFood(b, preferences) - scoreFood(a, preferences));

  const latestOrder = await getLatestOrder(user, message);

  return {
    foods,
    restaurants: approvedRestaurants,
    latestOrder,
    orderHistory,
    history: normalizedHistory,
    keywords,
    maxPrice,
  };
};

const getFaqReply = (message) => {
  const match = FAQ_REPLIES.find((faq) =>
    faq.patterns.some((pattern) => pattern.test(message))
  );

  return match?.reply || "";
};

const formatFoods = (foods) =>
  foods
    .slice(0, 5)
    .map((food) => {
      const restaurantName = food.restaurant?.name || "Slice Hub";
      return `${food.name} from ${restaurantName} - Rs. ${food.price}`;
    })
    .join("\n");

const buildLocalReply = ({ message, context, user, action }) => {
  if (action?.type === "add_to_cart") {
    const targetFood = context.foods[action.itemIndex] || context.foods[0];

    if (targetFood) {
      return `I found ${targetFood.name} for the cart. Use the Add button on the match card to add it.`;
    }

    return "Tell me which food you want to add, or ask for suggestions first, and I can help you put it in the cart.";
  }

  if (/track|status|latest order|where.*order/i.test(message)) {
    if (!user) {
      return "Please log in first, then I can help track your latest Slice Hub order.";
    }

    if (!context.latestOrder) {
      return "I couldn't find a recent order for your account yet. Once you place an order, it will appear in Orders.";
    }

    const restaurantName = context.latestOrder.restaurant?.name || "the restaurant";
    return `Your latest order from ${restaurantName} is currently ${context.latestOrder.status}. You can open Orders for the full tracking view.`;
  }

  const faqReply = getFaqReply(message);

  if (faqReply) {
    return faqReply;
  }

  if (context.foods.length > 0) {
    return `Here are some Slice Hub picks for you:\n${formatFoods(context.foods)}\nOpen Restaurants or search from the navbar to view details and add items to your cart.`;
  }

  if (context.restaurants.length > 0) {
    const restaurants = context.restaurants
      .slice(0, 5)
      .map((restaurant) => `${restaurant.name} - ${restaurant.category}`)
      .join("\n");

    return `These approved restaurants may help:\n${restaurants}\nOpen Restaurants to browse their menus.`;
  }

  return "I can help with food suggestions, restaurant discovery, cart guidance, seller onboarding, and order tracking. Try asking for something like spicy pizza under Rs. 2500.";
};

const askGemini = async ({ message, context, user }) => {
  if (!process.env.GEMINI_API_KEY) {
    return "";
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });
  const prompt = buildSliceHubPrompt({
    message,
    history: context.history,
    foods: context.foods,
    restaurants: context.restaurants,
    latestOrder: context.latestOrder,
    orderHistory: context.orderHistory,
    user,
  });
  const result = await model.generateContent(prompt);

  return result.response.text().trim();
};

export const generateAssistantReply = async ({ message, history = [], user }) => {
  const context = await collectAssistantContext({ message, history, user });
  const action = extractActionIntent(message);

  try {
    const aiReply = await askGemini({ message, context, user });

    if (aiReply) {
      return {
        reply: aiReply,
        mode: "gemini",
        context,
        action,
      };
    }
  } catch (error) {
    console.error("Gemini assistant error:", error.message);
  }

  return {
    reply: buildLocalReply({ message, context, user, action }),
    mode: "local",
    context,
    action,
  };
};
