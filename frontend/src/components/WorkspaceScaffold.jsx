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
  primary: "text-primary",
  dark: "text-contrast",
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

        <div className="surface-panel-strong p-8 sm:p-10">
          <p className="section-kicker">
            {eyebrow}
          </p>
          <h1 className="section-title">
            {title}
          </h1>
          <p className="section-copy">{description}</p>

          <div className="mt-8">{children}</div>
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
      className="surface-panel relative overflow-hidden p-8 text-center sm:p-10"
    >
      <div className="absolute right-[-2.5rem] top-[-2rem] h-28 w-28 rounded-full bg-primary/5" />
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100/90 shadow-sm">
        <Icon size={42} className="text-red-500" />
      </div>

      <h2 className="text-[2rem] font-bold tracking-[-0.04em] text-contrast">
        {title}
      </h2>
      <p className="mt-3 text-[15px] leading-8 text-gray-500">{subtitle}</p>

      {note ? (
        <div className="mt-6 rounded-[1.5rem] border border-orange-100 bg-orange-50/90 p-4 text-left">
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
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
        {label}
      </p>
      <p
        className={`mt-3 text-3xl font-black tracking-tight ${
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
