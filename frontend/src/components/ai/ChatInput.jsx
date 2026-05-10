import { SendHorizonal } from "lucide-react";

function ChatInput({ value, disabled, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex items-end gap-3 border-t border-slate-100/50 bg-white/60 p-4 backdrop-blur-md">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit(event);
          }
        }}
        placeholder="Type your message..."
        rows={1}
        className="max-h-32 min-h-[48px] flex-1 resize-none rounded-2xl border border-slate-200/60 bg-white px-5 py-3.5 text-[15px] font-medium text-slate-700 placeholder:font-normal placeholder:text-slate-400 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
        disabled={disabled}
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 hover:bg-primary hover:shadow-primary/30 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Send message"
      >
        <SendHorizonal size={20} />
      </button>
    </form>
  );
}

export default ChatInput;
