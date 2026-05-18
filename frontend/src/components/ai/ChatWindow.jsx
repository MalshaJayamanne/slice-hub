import { ExternalLink, Loader2, Plus, Star, X } from "lucide-react";
import { Link } from "react-router-dom";

import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

const QUICK_PROMPTS = [
  "Show me spicy pizza",
  "Suggest vegetarian food",
  "Track my latest order",
  "How do I become a seller?",
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

function ChatWindow({
  messages,
  input,
  isLoading,
  suggestions,
  onClose,
  onAddFoodToCart,
  onInputChange,
  onPrompt,
  onSubmit,
}) {
  return (
    <section className="fixed bottom-24 right-4 top-[7.75rem] z-[70] flex w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur-3xl sm:right-6 sm:top-[8.5rem] sm:w-[440px]">
      <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-950 to-slate-900 px-5 py-4 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#4E82EE] via-[#A47CF3] to-[#E06B67] shadow-lg shadow-purple-500/30 transition-transform duration-500 hover:rotate-12">
            <GeminiIcon size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">Slice Hub AI</h2>
            <p className="text-[11px] font-black uppercase tracking-widest text-white/50">Powered by Gemini</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Close assistant"
        >
          <X size={20} />
        </button>
      </header>

      <div className="flex gap-2.5 overflow-x-auto border-b border-slate-100/50 bg-white/40 px-4 py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPrompt(prompt)}
            disabled={isLoading}
            className="shrink-0 rounded-xl border border-slate-200/60 bg-white/80 px-4 py-2 text-[13px] font-bold text-slate-600 transition-all hover:border-primary/30 hover:bg-white hover:text-primary hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
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
          <div className="flex items-center gap-3 px-1 py-2 text-[13px] font-bold text-slate-400">
            <div className="relative flex h-5 w-5 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
              <Loader2 className="animate-spin text-purple-600" size={16} />
            </div>
            Gemini is thinking...
          </div>
        )}

        {(suggestions.foods.length > 0 || suggestions.restaurants.length > 0) && (
          <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">
              Matches
            </p>

            <div className="space-y-2">
              {suggestions.foods.slice(0, 3).map((food) => (
                <div
                  key={food.id || food._id}
                  className="grid grid-cols-[4.5rem_1fr] gap-3 rounded-xl bg-slate-50 p-2"
                >
                  <Link
                    to={`/food/${food.id || food._id}`}
                    className="overflow-hidden rounded-lg bg-slate-200"
                  >
                    <img
                      src={food.image || "https://picsum.photos/200/160"}
                      alt={food.name}
                      className="h-20 w-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/food/${food.id || food._id}`}
                        className="truncate text-sm font-black text-slate-800 transition hover:text-[#FF4F40]"
                      >
                        {food.name}
                      </Link>
                      <span className="shrink-0 text-xs font-black text-[#FF4F40]">
                        Rs. {food.price}
                      </span>
                    </div>

                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                      {food.restaurantName || food.restaurant?.name || food.category || "Slice Hub"}
                    </p>

                    <div className="mt-2 flex min-h-6 items-center gap-2 text-[11px] font-bold text-slate-400">
                      {food.rating ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-orange-600">
                          <Star size={11} className="fill-orange-500 text-orange-500" />
                          {Number(food.rating).toFixed(1)}
                        </span>
                      ) : null}
                      {food.orderCount ? <span>{food.orderCount} ordered</span> : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddFoodToCart(food)}
                      disabled={food.availability === false}
                      className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-black text-white transition hover:bg-[#FF4F40] disabled:pointer-events-none disabled:opacity-50"
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>
                </div>
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
