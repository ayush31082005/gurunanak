import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);
const DEFAULT_DURATION = 4500;

const variantConfig = {
  success: {
    title: "Success",
    label: "OK",
    card: "border-emerald-200 bg-emerald-50 text-emerald-950",
    badge: "bg-emerald-100 text-emerald-700",
    message: "text-emerald-900/80",
  },
  error: {
    title: "Error",
    label: "!",
    card: "border-rose-200 bg-rose-50 text-rose-950",
    badge: "bg-rose-100 text-rose-700",
    message: "text-rose-900/80",
  },
  info: {
    title: "Message",
    label: "i",
    card: "border-sky-200 bg-sky-50 text-sky-950",
    badge: "bg-sky-100 text-sky-700",
    message: "text-sky-900/80",
  },
};

const inferAlertVariant = (message) => {
  const normalizedMessage = String(message || "").toLowerCase();

  if (
    /(failed|invalid|error|please|no |not |unable|empty|wrong|cancel)/.test(
      normalizedMessage
    )
  ) {
    return "error";
  }

  if (
    /(success|successful|saved|deleted|updated|placed|sent|applied|confirmed|reordered|added)/.test(
      normalizedMessage
    )
  ) {
    return "success";
  }

  return "info";
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((toastId) => {
    const timer = timersRef.current.get(toastId);

    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(toastId);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      const toastId =
        options.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const duration = options.duration ?? DEFAULT_DURATION;

      setToasts((currentToasts) => [
        ...currentToasts.slice(-2),
        {
          id: toastId,
          message: String(message || ""),
          title: options.title,
          variant: options.variant || "success",
        },
      ]);

      if (duration !== Infinity) {
        const timer = window.setTimeout(() => {
          removeToast(toastId);
        }, duration);

        timersRef.current.set(toastId, timer);
      }

      return toastId;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      success: (message, options = {}) =>
        showToast(message, { ...options, variant: "success" }),
      error: (message, options = {}) =>
        showToast(message, { ...options, variant: "error" }),
      info: (message, options = {}) =>
        showToast(message, { ...options, variant: "info" }),
      removeToast,
    }),
    [removeToast, showToast]
  );

  useEffect(() => {
    const previousAlert = window.alert;

    window.alert = (message) => {
      const text = String(message || "");
      showToast(text, {
        title: inferAlertVariant(text) === "error" ? "Error" : "Success",
        variant: inferAlertVariant(text),
      });
    };

    return () => {
      window.alert = previousAlert;
    };
  }, [showToast]);

  useEffect(() => {
    const currentTimers = timersRef.current;

    return () => {
      currentTimers.forEach((timer) => window.clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-[156px] z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:top-36 lg:top-32">
        {toasts.map((toast) => {
          const config = variantConfig[toast.variant] || variantConfig.info;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 text-left shadow-[0_18px_45px_rgba(15,23,42,0.18)] ${config.card}`}
              role="status"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${config.badge}`}
              >
                {config.label}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold">
                  {toast.title || config.title}
                </h3>
                <p className={`mt-1 text-xs leading-5 ${config.message}`}>
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-full px-2 text-lg leading-6 text-slate-400 transition hover:bg-white/70 hover:text-slate-700"
                aria-label="Close message"
              >
                x
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
};
