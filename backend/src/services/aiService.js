import { GoogleGenerativeAI } from "@google/generative-ai";

import Food from "../models/Food.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import { buildSliceHubPrompt } from "../utils/promptBuilder.js";

const MAX_CONTEXT_ITEMS = 8;
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

export const collectAssistantContext = async ({ message, user }) => {
  const keywords = extractKeywords(message);
  const maxPrice = extractMaxPrice(message);
  const restaurantFilter = {
    status: "approved",
    ...buildTextFilter(keywords, ["name", "category", "description"]),
  };

  const approvedRestaurants = await Restaurant.find(restaurantFilter)
    .select("name category description")
    .sort({ createdAt: -1 })
    .limit(MAX_CONTEXT_ITEMS)
    .lean();

  const approvedRestaurantIds = approvedRestaurants.map((restaurant) => restaurant._id);
  const fallbackRestaurantIds =
    approvedRestaurantIds.length > 0
      ? approvedRestaurantIds
      : (
          await Restaurant.find({ status: "approved" })
            .select("_id")
            .sort({ createdAt: -1 })
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
    .populate("restaurant", "name category")
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
      .populate("restaurant", "name category")
      .sort({ price: 1, createdAt: -1 })
      .limit(MAX_CONTEXT_ITEMS)
      .lean();
  }

  const latestOrder = await getLatestOrder(user, message);

  return {
    foods,
    restaurants: approvedRestaurants,
    latestOrder,
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

const buildLocalReply = ({ message, context, user }) => {
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
    foods: context.foods,
    restaurants: context.restaurants,
    latestOrder: context.latestOrder,
    user,
  });
  const result = await model.generateContent(prompt);

  return result.response.text().trim();
};

export const generateAssistantReply = async ({ message, user }) => {
  const context = await collectAssistantContext({ message, user });

  try {
    const aiReply = await askGemini({ message, context, user });

    if (aiReply) {
      return {
        reply: aiReply,
        mode: "gemini",
        context,
      };
    }
  } catch (error) {
    console.error("Gemini assistant error:", error.message);
  }

  return {
    reply: buildLocalReply({ message, context, user }),
    mode: "local",
    context,
  };
};
