import { Bot, User } from "lucide-react";

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
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FF4F40] text-white">
          <Bot size={16} />
        </div>
      )}

      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-md bg-slate-900 text-white"
            : "rounded-bl-md border border-slate-100 bg-white text-slate-700"
        }`}
      >
        <div className="space-y-1.5">{renderMessageText(message.text)}</div>
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
          <User size={16} />
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
