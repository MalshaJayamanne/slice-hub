import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const toneMap = {
  success: {
    icon: CheckCircle2,
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconColor: "text-emerald-500",
    button: "text-emerald-500 hover:bg-emerald-100",
    defaultTitle: "Success",
  },
  error: {
    icon: AlertCircle,
    wrapper: "border-red-200 bg-red-50 text-red-700",
    iconColor: "text-red-500",
    button: "text-red-500 hover:bg-red-100",
    defaultTitle: "Something went wrong",
  },
  info: {
    icon: Info,
    wrapper: "border-sky-200 bg-sky-50 text-sky-700",
    iconColor: "text-sky-500",
    button: "text-sky-500 hover:bg-sky-100",
    defaultTitle: "Heads up",
  },
};

export default function FeedbackAlert({
  type = "info",
  title,
  message,
  onClose,
  className = "",
}) {
  if (!message) {
    return null;
  }

  const tone = toneMap[type] || toneMap.info;
  const Icon = tone.icon;

  return (
    <div
      className={`rounded-[1.5rem] border px-5 py-4 shadow-sm ${tone.wrapper} ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm">
            <Icon size={18} className={tone.iconColor} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-[-0.02em]">
              {title || tone.defaultTitle}
            </p>
            <p className="mt-1 text-sm leading-6">{message}</p>
          </div>
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${tone.button}`}
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
