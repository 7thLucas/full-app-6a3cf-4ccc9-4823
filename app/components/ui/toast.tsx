import { useEffect } from "react";
import { cn } from "~/lib/utils";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, onDismiss, duration = 2000 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [message, onDismiss, duration]);

  if (!message) return null;

  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
        "bg-secondary text-secondary-foreground",
        "px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold",
        "animate-in fade-in slide-in-from-bottom-2 duration-200",
      )}
    >
      {message}
    </div>
  );
}
