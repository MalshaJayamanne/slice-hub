import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const toneClasses = {
  neutral: {
    card: "border-gray-200 bg-gray-50 text-gray-700",
    iconWrap: "bg-white text-gray-500",
    button: "bg-contrast text-white hover:opacity-90",
  },
  error: {
    card: "border-red-200 bg-red-50 text-red-700",
    iconWrap: "bg-white text-red-500",
    button: "bg-red-500 text-white hover:bg-red-600",
  },
  warning: {
    card: "border-orange-200 bg-orange-50 text-orange-700",
    iconWrap: "bg-white text-orange-500",
    button: "bg-orange-500 text-white hover:bg-orange-600",
  },
  success: {
    card: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconWrap: "bg-white text-emerald-500",
    button: "bg-emerald-500 text-white hover:bg-emerald-600",
  },
};

const valueToneClasses = {
  primary: "text-[#FF4F40]",
  dark: "text-slate-900",
  success: "text-emerald-600",
  warning: "text-orange-500",
};

export function WorkspacePage({
  sidebar,
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <div className="page-shell py-10 sm:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.9fr)] lg:gap-10">
        {sidebar}

        <div className="surface-panel p-8 shadow-lg shadow-slate-200/40 sm:p-10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF4F40]">
            {eyebrow}
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500">{description}</p>

          <div className="mt-10">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceSidebar({
  icon: Icon,
  title,
  subtitle,
  note,
  children,
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="surface-panel relative overflow-hidden p-8 text-center shadow-lg shadow-slate-200/40 sm:p-10"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#FF4F40]/5 blur-2xl" />
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#FF4F40]/10 shadow-inner">
        <Icon size={42} className="text-[#FF4F40]" />
      </div>

      <h2 className="font-display text-[2rem] font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-500">{subtitle}</p>

      {note ? (
        <div className="mt-8 rounded-2xl border border-orange-200/50 bg-orange-50/50 p-5 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
            Workspace
          </p>
          <p className="mt-3 text-sm text-gray-700">{note}</p>
        </div>
      ) : null}

      {children ? <div className="mt-6 text-left">{children}</div> : null}
    </motion.div>
  );
}

export function WorkspaceStat({
  label,
  value,
  hint,
  tone = "primary",
}) {
  return (
    <div className="stat-tile min-h-[166px]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p
        className={`font-display mt-3 text-2xl font-bold tracking-tight break-words ${
          valueToneClasses[tone] || valueToneClasses.primary
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm text-gray-500">{hint}</p> : null}
    </div>
  );
}

export function WorkspaceState({
  icon: Icon = Inbox,
  title,
  message,
  tone = "neutral",
  actionLabel,
  onAction,
  animateIcon = false,
}) {
  const toneClass = toneClasses[tone] || toneClasses.neutral;

  return (
    <div className={`rounded-[1.75rem] border px-6 py-10 text-center shadow-sm ${toneClass.card}`}>
      <div
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full shadow-sm ${toneClass.iconWrap}`}
      >
        <Icon className={animateIcon ? "animate-spin" : ""} />
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm opacity-80 max-w-md mx-auto">{message}</p>

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className={`mt-6 inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${toneClass.button}`}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function WorkspaceLoadingState({
  title = "Loading",
  message = "Please wait while we load this workspace.",
}) {
  return (
    <WorkspaceState
      icon={Loader2}
      title={title}
      message={message}
      animateIcon
    />
  );
}

export function WorkspaceErrorState({
  title = "Something went wrong",
  message = "We could not load this workspace.",
  actionLabel = "Try Again",
  onAction,
}) {
  return (
    <WorkspaceState
      icon={AlertCircle}
      tone="error"
      title={title}
      message={message}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}

export function WorkspaceEmptyState({
  title = "Nothing here yet",
  message = "New items will appear here once the flow is connected.",
  actionLabel,
  onAction,
}) {
  return (
    <WorkspaceState
      icon={Inbox}
      tone="warning"
      title={title}
      message={message}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}
