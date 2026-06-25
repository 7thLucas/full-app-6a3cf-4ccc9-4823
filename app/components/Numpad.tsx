import { cn } from "~/lib/utils";
import { usePOSStore } from "~/lib/pos-store.client";

const KEYS = ["1","2","3","4","5","6","7","8","9","000","0","⌫"];

export function Numpad() {
  const { appendDigit, backspace } = usePOSStore();

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {KEYS.map((key, idx) => (
        <NumKey
          key={idx}
          label={key}
          onPress={() => {
            if (key === "⌫") backspace();
            else if (key === "000") {
              appendDigit("0");
              appendDigit("0");
              appendDigit("0");
            } else {
              appendDigit(key);
            }
          }}
        />
      ))}
    </div>
  );
}

function NumKey({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button
      onPointerDown={onPress}
      className={cn(
        "min-h-[72px] rounded-2xl text-[28px] font-semibold select-none",
        "bg-background text-foreground border border-border",
        "transition-all active:scale-90 active:bg-primary active:text-primary-foreground",
        "duration-75 shadow-sm",
        label === "⌫" && "text-xl",
      )}
    >
      {label}
    </button>
  );
}
