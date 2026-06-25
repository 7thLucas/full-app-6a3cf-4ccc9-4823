/**
 * PIN Modal — Owner unlocks full access by entering a 4+ digit PIN.
 * Clean overlay with mini numpad. Friendly Indonesian copy.
 */
import { useState, useCallback } from "react";
import { cn } from "~/lib/utils";
import { X, Delete } from "lucide-react";

interface PinModalProps {
  onSuccess: () => void;
  onClose: () => void;
  correctPin: string;
}

export function PinModal({ onSuccess, onClose, correctPin }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length >= 8) return;
      const next = pin + digit;
      setPin(next);
      setError("");

      if (next.length >= correctPin.length) {
        if (next === correctPin) {
          onSuccess();
        } else {
          setShake(true);
          setError("PIN salah. Coba lagi.");
          setTimeout(() => {
            setPin("");
            setShake(false);
          }, 700);
        }
      }
    },
    [pin, correctPin, onSuccess]
  );

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError("");
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
      <div
        className={cn(
          "relative mx-4 w-full max-w-xs rounded-2xl bg-background p-6 shadow-2xl",
          shake && "animate-shake"
        )}
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
      >
        {/* Header */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="mb-5 text-center">
          <div className="mb-1 text-2xl">🔐</div>
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--heading-font)" }}>
            Masukkan PIN Owner
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Akses fitur owner dan laporan lengkap
          </p>
        </div>

        {/* PIN Dots */}
        <div className="mb-4 flex justify-center gap-3">
          {Array.from({ length: Math.max(correctPin.length, 4) }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-3 w-3 rounded-full border-2 transition-all duration-150",
                i < pin.length
                  ? "border-primary bg-primary scale-110"
                  : "border-muted-foreground bg-transparent"
              )}
            />
          ))}
        </div>

        {error && (
          <p className="mb-3 text-center text-sm font-medium text-destructive">{error}</p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2">
          {keys.slice(0, 9).map((k) => (
            <button
              key={k}
              onClick={() => handleDigit(k)}
              className={cn(
                "flex h-14 items-center justify-center rounded-xl text-xl font-bold",
                "bg-muted text-foreground transition-transform active:scale-95",
                "border border-border hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {k}
            </button>
          ))}
          {/* Bottom row: empty, 0, delete */}
          <div />
          <button
            onClick={() => handleDigit("0")}
            className={cn(
              "flex h-14 items-center justify-center rounded-xl text-xl font-bold",
              "bg-muted text-foreground transition-transform active:scale-95",
              "border border-border hover:bg-accent hover:text-accent-foreground"
            )}
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className={cn(
              "flex h-14 items-center justify-center rounded-xl",
              "bg-muted text-foreground transition-transform active:scale-95",
              "border border-border hover:bg-accent hover:text-accent-foreground"
            )}
            aria-label="Hapus"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
