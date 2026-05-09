import { useMemo, useState } from "react";
import { MessageCircle, Pizza } from "lucide-react";

import { sendAssistantMessage } from "../../api/aiAPI";
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

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({ foods: [], restaurants: [] });

  const unreadLabel = useMemo(() => {
    if (isOpen) {
      return "";
    }

    return "Ask AI";
  }, [isOpen]);

  const submitMessage = async (text) => {
    const cleanMessage = text.trim();

    if (!cleanMessage || isLoading) {
      return;
    }

    setInput("");
    setIsOpen(true);
    setIsLoading(true);
    setMessages((current) => [...current, createMessage("user", cleanMessage)]);

    try {
      const data = await sendAssistantMessage(cleanMessage);

      setSuggestions({
        foods: data.suggestions?.foods || [],
        restaurants: data.suggestions?.restaurants || [],
      });
      setMessages((current) => [
        ...current,
        createMessage("bot", data.reply || "I could not find a response for that yet."),
      ]);
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
          onInputChange={setInput}
          onPrompt={submitMessage}
          onSubmit={handleSubmit}
        />
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-6 right-4 z-[70] flex h-14 items-center gap-3 rounded-2xl bg-slate-950 px-4 text-white shadow-2xl shadow-slate-950/25 transition hover:-translate-y-1 hover:bg-[#FF4F40] sm:right-6"
        aria-label="Open Slice Hub AI assistant"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          {isOpen ? <Pizza size={19} fill="currentColor" /> : <MessageCircle size={19} />}
        </span>
        {unreadLabel && <span className="hidden text-sm font-black sm:inline">{unreadLabel}</span>}
      </button>
    </>
  );
}

export default AIAssistant;
