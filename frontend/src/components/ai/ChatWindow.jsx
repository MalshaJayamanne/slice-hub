import { ExternalLink, Loader2, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";

import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

const QUICK_PROMPTS = [
  "Show me spicy pizza",
  "Suggest vegetarian food",
  "Track my latest order",
  "How do I become a seller?",
];

function ChatWindow({
  messages,
  input,
  isLoading,
  suggestions,
  onClose,
  onInputChange,
  onPrompt,
  onSubmit,
}) {
  return (
    <section className="fixed bottom-24 right-4 top-[7.75rem] z-[70] flex w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/95 shadow-2xl shadow-slate-900/20 backdrop-blur-xl sm:right-6 sm:top-[8.5rem] sm:w-[420px]">
      <header className="flex items-center justify-between border-b border-slate-100 bg-slate-950 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF4F40] shadow-lg shadow-[#FF4F40]/30">
            <Sparkles size={19} />
          </div>
          <div>
            <h2 className="text-base font-black leading-tight">Slice Hub AI</h2>
            <p className="text-xs font-semibold text-white/60">Food, orders, and restaurant help</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Close assistant"
        >
          <X size={18} />
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-white px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPrompt(prompt)}
            disabled={isLoading}
            className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-[#FF4F40]/30 hover:bg-[#FF4F40]/5 hover:text-[#FF4F40] disabled:pointer-events-none disabled:opacity-60"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/80 px-4 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Loader2 className="animate-spin text-[#FF4F40]" size={17} />
            Thinking through the menu...
          </div>
        )}

        {(suggestions.foods.length > 0 || suggestions.restaurants.length > 0) && (
          <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">
              Matches
            </p>

            <div className="space-y-2">
              {suggestions.foods.slice(0, 3).map((food) => (
                <Link
                  key={food.id}
                  to={`/food/${food.id}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-[#FF4F40]/5 hover:text-[#FF4F40]"
                >
                  <span className="truncate">{food.name}</span>
                  <span className="ml-3 shrink-0 text-xs text-slate-400">Rs. {food.price}</span>
                </Link>
              ))}

              {suggestions.restaurants.slice(0, 3).map((restaurant) => (
                <Link
                  key={restaurant.id}
                  to={`/restaurant/${restaurant.id}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-[#FF4F40]/5 hover:text-[#FF4F40]"
                >
                  <span className="truncate">{restaurant.name}</span>
                  <ExternalLink className="ml-3 shrink-0 text-slate-400" size={14} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ChatInput
        value={input}
        disabled={isLoading}
        onChange={onInputChange}
        onSubmit={onSubmit}
      />
    </section>
  );
}

export default ChatWindow;
