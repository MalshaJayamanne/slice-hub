import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import ToastContext from "../context/ToastContext";

const toneMap = {
  success: {
    icon: CheckCircle2,
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-800",
    iconColor: "text-emerald-500",
    progress: "bg-emerald-500",
    defaultTitle: "Success",
  },
  error: {
    icon: AlertCircle,
    wrapper: "border-red-200 bg-red-50 text-red-800",
    iconColor: "text-red-500",
    progress: "bg-red-500",
    defaultTitle: "Something went wrong",
  },
  info: {
    icon: Info,
    wrapper: "border-sky-200 bg-sky-50 text-sky-800",
    iconColor: "text-sky-500",
    progress: "bg-sky-500",
    defaultTitle: "Heads up",
  },
};

const createToastId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function ToastItem({ toast, onDismiss }) {
  const tone = toneMap[toast.type] || toneMap.info;
  const Icon = tone.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-[1.35rem] border px-4 py-4 shadow-xl shadow-slate-900/10 backdrop-blur ${tone.wrapper}`}
      role="status"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <div className="flex items-start gap-3 pr-8">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm">
          <Icon size={18} className={tone.iconColor} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-extrabold tracking-[-0.02em]">
            {toast.title || tone.defaultTitle}
          </p>
          {toast.message ? (
            <p className="mt-1 text-sm leading-5 text-current/80">
              {toast.message}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-current/55 transition hover:bg-white/70 hover:text-current"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>

      <motion.div
        className={`absolute bottom-0 left-0 h-1 ${tone.progress}`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: toast.duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const recentToastRef = useRef(null);
  const timeoutIdsRef = useRef(new Set());

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message, duration = 4200 }) => {
      const fingerprint = `${type}:${title || ""}:${message || ""}`;
      const now = Date.now();

      if (
        recentToastRef.current?.fingerprint === fingerprint &&
        now - recentToastRef.current.createdAt < 1200
      ) {
        return recentToastRef.current.id;
      }

      const id = createToastId();
      const toast = { id, type, title, message, duration };
      recentToastRef.current = {
        id,
        fingerprint,
        createdAt: now,
      };

      setToasts((current) => [toast, ...current].slice(0, 4));

      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
        timeoutIdsRef.current.delete(timeoutId);
      }, duration);
      timeoutIdsRef.current.add(timeoutId);

      return id;
    },
    [dismissToast]
  );

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      timeoutIdsRef.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
      success: (message, title = "Success", options = {}) =>
        showToast({ ...options, type: "success", title, message }),
      error: (message, title = "Something went wrong", options = {}) =>
        showToast({ ...options, type: "error", title, message }),
      info: (message, title = "Heads up", options = {}) =>
        showToast({ ...options, type: "info", title, message }),
    }),
    [dismissToast, showToast]
  );

  const toastLayer = (
    <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" ? createPortal(toastLayer, document.body) : null}
    </ToastContext.Provider>
  );
}
