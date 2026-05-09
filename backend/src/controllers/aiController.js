import { generateAssistantReply } from "../services/aiService.js";
import { createHttpError, normalizeStringValue } from "../utils/validation.js";

export const chatWithAI = async (req, res, next) => {
  try {
    const message = normalizeStringValue(req.body.message);

    if (!message) {
      throw createHttpError("Message is required.", 400);
    }

    if (message.length > 1000) {
      throw createHttpError("Message must be 1000 characters or fewer.", 400);
    }

    const result = await generateAssistantReply({
      message,
      user: req.user || null,
    });

    res.status(200).json({
      success: true,
      reply: result.reply,
      mode: result.mode,
      suggestions: {
        foods: result.context.foods.slice(0, 5).map((food) => ({
          id: food._id,
          name: food.name,
          price: food.price,
          restaurantId: food.restaurant?._id || food.restaurant,
          restaurantName: food.restaurant?.name || "",
        })),
        restaurants: result.context.restaurants.slice(0, 5).map((restaurant) => ({
          id: restaurant._id,
          name: restaurant.name,
          category: restaurant.category,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
