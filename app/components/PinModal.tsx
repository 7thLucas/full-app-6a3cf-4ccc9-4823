import { useState, useEffect } from "react";
import { cn } from "~/lib/utils";

interface PinModalProps {
  isOpen: boolean;
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function PinModal({ isOpen, correctPin, onSuccess, onClose }: PinModalProps) {
  const [entered, setEntered] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!isOpen) setEntered("");
  }, [isOpen]);

  const appendDigit = (d: string) => {
    if (entered.length >= 4) return;
    const next = entered + d;
    setEntered(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === correctPin) {
          onSuccess();
          setEntered("");
        } else {
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setEntered("");
          }, 600);
        }
      }, 100);
    }
  };

  const backspace = () => setEntered((e) => e.slice(0, -1));

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl p-6 w-72 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center text-lg font-bold text-foreground mb-1">
          Mode Owner
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-5">
          Masukkan PIN untuk melanjutkan
        </p>

        {/* PIN dots */}
        <div className={cn("flex justify-center gap-3 mb-6", shake && "animate-shake")}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-150",
                i < entered.length
                  ? "bg-primary border-primary"
                  : "border-border bg-transparent",
              )}
            />
          ))}
        </div>

        {/* Mini numpad */}
        <div className="grid grid-cols-3 gap-2">
          {["1","2","3","4","5","6","7","8","9","",  "0","⌫"].map((key, idx) => (
            <button
              key={idx}
              disabled={key === ""}
              onClick={() => {
                if (key === "⌫") backspace();
                else if (key !== "") appendDigit(key);
              }}
              className={cn(
                "h-12 rounded-xl text-lg font-semibold transition-transform active:scale-90 duration-75",
                key === ""
                  ? "invisible"
                  : key === "⌫"
                  ? "bg-muted text-muted-foreground"
                  : "bg-card text-card-foreground border border-border",
              )}
            >
              {key}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-muted-foreground py-1"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
