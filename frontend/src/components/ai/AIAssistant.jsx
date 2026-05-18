import { useMemo, useState } from "react";
import { Pizza } from "lucide-react";

import { sendAssistantMessage } from "../../api/aiAPI";
import { useCart } from "../../context/CartContext";
import ChatWindow from "./ChatWindow";

const createMessage = (sender, text) => ({
  id: `${sender}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  sender,
  text,
});

const initialMessages = [
  createMessage(
    "bot",
    "Hi, I am Slice Hub AI. Ask me for food ideas, restaurants, cart help, seller guidance, or order tracking."
  ),
];

const GeminiIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2L14.83 9.17L22 12L14.83 14.83L12 22L9.17 14.83L2 12L9.17 9.17L12 2Z"
      fill="currentColor"
    />
  </svg>
);

const getCartActionIndex = (message) => {
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

  return ordinalMatch ? ordinalMap[ordinalMatch[1].toLowerCase()] : 0;
};

function AIAssistant() {
  const { addItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({ foods: [], restaurants: [] });

  const historyForRequest = useMemo(
    () =>
      messages.slice(-8).map((message) => ({
        sender: message.sender,
        text: message.text,
      })),
    [messages]
  );

  const addSuggestedFood = (food) => {
    const result = addItem({
      ...food,
      _id: food._id || food.id,
      restaurant: food.restaurant || {
        _id: food.restaurantId,
        name: food.restaurantName,
      },
    });

    setMessages((current) => [...current, createMessage("bot", result.message)]);

    return result;
  };

  const submitMessage = async (text) => {
    const cleanMessage = text.trim();

    if (!cleanMessage || isLoading) {
      return;
    }

    setInput("");
    setIsOpen(true);
    setIsLoading(true);
    setMessages((current) => [...current, createMessage("user", cleanMessage)]);

    const cartActionIndex = getCartActionIndex(cleanMessage);

    if (cartActionIndex !== null && suggestions.foods.length > 0) {
      const targetFood = suggestions.foods[cartActionIndex] || suggestions.foods[0];
      addSuggestedFood(targetFood);
      setIsLoading(false);
      return;
    }

    try {
      const data = await sendAssistantMessage(cleanMessage, historyForRequest);
      const nextSuggestions = {
        foods: data.suggestions?.foods || [],
        restaurants: data.suggestions?.restaurants || [],
      };

      setSuggestions(nextSuggestions);
      setMessages((current) => [
        ...current,
        createMessage("bot", data.reply || "I could not find a response for that yet."),
      ]);

      if (data.action?.type === "add_to_cart") {
        const itemIndex = Number(data.action.itemIndex) || 0;
        const targetFood =
          suggestions.foods[itemIndex] ||
          nextSuggestions.foods[itemIndex] ||
          nextSuggestions.foods[0];

        if (targetFood) {
          addSuggestedFood(targetFood);
        }
      }
    } catch (error) {
      const fallback =
        error.response?.data?.message ||
        "I am having trouble reaching the assistant service right now. Please try again in a moment.";

      setMessages((current) => [...current, createMessage("bot", fallback)]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitMessage(input);
  };

  return (
    <>
      {isOpen && (
        <ChatWindow
          messages={messages}
          input={input}
          isLoading={isLoading}
          suggestions={suggestions}
          onClose={() => setIsOpen(false)}
          onAddFoodToCart={addSuggestedFood}
          onInputChange={setInput}
          onPrompt={submitMessage}
          onSubmit={handleSubmit}
        />
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-6 right-4 z-[70] flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-[#FF4F40] to-[#E63E30] text-white shadow-2xl shadow-[#FF4F40]/30 transition-all duration-300 hover:-translate-y-1.5 hover:rotate-6 hover:shadow-[#FF4F40]/40 sm:right-6"
        aria-label="Open Slice Hub AI assistant"
      >
        <Pizza size={26} fill="currentColor" />
        <div className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-tr from-[#4E82EE] via-[#A47CF3] to-[#E06B67] text-white shadow-lg shadow-purple-500/20">
          <GeminiIcon size={14} className="text-white" />
        </div>
      </button>
    </>
  );
}

export default AIAssistant;
