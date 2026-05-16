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
    <div className="page-shell py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(340px,0.7fr)_minmax(0,3fr)] lg:gap-12">
        <aside className="h-fit">
          {sidebar}
        </aside>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-panel p-8 shadow-2xl shadow-slate-200/50 sm:p-12"
        >
          <div className="max-w-4xl">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF4F40]">
              {eyebrow}
            </p>
            <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {title}
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-slate-500 max-w-2xl">{description}</p>
          </div>

          <div className="mt-12 h-px bg-slate-100/80 w-full" />

          <div className="mt-12">{children}</div>
        </motion.div>
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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="surface-panel relative overflow-hidden p-10 text-center shadow-xl shadow-slate-200/40"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
      <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-primary/10 shadow-inner">
        <Icon size={48} className="text-primary" />
      </div>

      <h2 className="font-display text-[2.25rem] font-bold tracking-tight text-slate-900 leading-tight">
        {title}
      </h2>
      <p className="mt-4 text-[15px] font-medium leading-relaxed text-slate-500">{subtitle}</p>

      {note ? (
        <div className="mt-10 rounded-[2rem] border border-orange-100 bg-orange-50/50 p-6 text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">
            Current Status
          </p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700">{note}</p>
        </div>
      ) : null}

      {children ? <div className="mt-8 space-y-4 text-left">{children}</div> : null}
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
    <div className="stat-tile min-h-[160px] p-6 sm:p-8 flex flex-col justify-center">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p
        className={`font-display mt-3 text-2xl lg:text-3xl font-bold tracking-tight break-words ${
          valueToneClasses[tone] || valueToneClasses.primary
        }`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-3 flex items-start gap-2 text-[11px] font-bold text-slate-400">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
          <span className="leading-snug">{hint}</span>
        </p>
      ) : null}
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
