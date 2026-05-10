import { Pizza, User } from "lucide-react";

const renderInlineText = (text) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-black text-inherit">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });

const renderMessageText = (text) => {
  const lines = text.split("\n");

  return lines.map((line, index) => {
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);

    if (bulletMatch) {
      return (
        <div key={`${line}-${index}`} className="flex gap-2">
          <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
          <span>{renderInlineText(bulletMatch[1])}</span>
        </div>
      );
    }

    if (!line.trim()) {
      return <div key={`blank-${index}`} className="h-2" />;
    }

    return <div key={`${line}-${index}`}>{renderInlineText(line)}</div>;
  });
};

function MessageBubble({ message }) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4F40] to-[#E63E30] text-white shadow-lg shadow-[#FF4F40]/20">
          <Pizza size={18} fill="currentColor" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-[1.25rem] px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
          isUser
            ? "rounded-tr-none bg-slate-900 text-white"
            : "rounded-tl-none border border-slate-100 bg-white font-medium text-slate-700"
        }`}
      >
        <div className="space-y-2">{renderMessageText(message.text)}</div>
      </div>

      {isUser && (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          <User size={18} />
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
