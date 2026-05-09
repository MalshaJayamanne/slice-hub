import { SendHorizonal } from "lucide-react";

function ChatInput({ value, disabled, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-slate-100 bg-white p-3">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit(event);
          }
        }}
        placeholder="Ask for food, restaurants, or order help..."
        rows={1}
        className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#FF4F40] focus:bg-white focus:ring-4 focus:ring-[#FF4F40]/10"
        disabled={disabled}
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF4F40] text-white shadow-lg shadow-[#FF4F40]/25 transition hover:-translate-y-0.5 hover:bg-[#E63E30] disabled:pointer-events-none disabled:opacity-50"
        aria-label="Send message"
      >
        <SendHorizonal size={18} />
      </button>
    </form>
  );
}

export default ChatInput;
