// Premium Toast Notification system for WattWise AI — Top-Right position

import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

interface ToastContextType {
  showToast: (msg: { message: string; title?: string; type?: "success" | "error" | "info"; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    ({ message, title, type = "success", duration = 3000 }: { message: string; title?: string; type?: "success" | "error" | "info"; duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      setToasts((prev) => [...prev, { id, message, title, type, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Container — Top-Right Position */}
      <div
        className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const config = {
    success: {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
      border: "border-emerald-500/30 dark:border-emerald-500/20",
      bg: "bg-emerald-50/90 dark:bg-emerald-950/40",
    },
    error: {
      icon: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
      border: "border-red-500/30 dark:border-red-500/20",
      bg: "bg-red-50/90 dark:bg-red-950/40",
    },
    info: {
      icon: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
      border: "border-blue-500/30 dark:border-blue-500/20",
      bg: "bg-blue-50/90 dark:bg-blue-950/40",
    },
  }[toast.type || "success"];

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border bg-card/95 backdrop-blur-md p-4 shadow-xl text-foreground",
        "transition-all duration-300 animate-slide-up",
        config.border
      )}
    >
      {config.icon}
      <div className="flex-1 text-xs">
        {toast.title && <p className="font-bold text-foreground mb-0.5">{toast.title}</p>}
        <p className="text-muted-foreground leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
