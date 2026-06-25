import { cn } from "~/lib/utils";
import type { TMenuItem } from "~/modules/configurables/src/constants/configurables.default";

interface MenuChipsProps {
  items: TMenuItem[];
  currency: string;
  onSelect: (item: TMenuItem) => void;
}

export function MenuChips({ items, currency, onSelect }: MenuChipsProps) {
  if (!items?.length) return null;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 pb-1" style={{ minWidth: "min-content" }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={cn(
              "flex-shrink-0 flex flex-col items-center justify-center",
              "min-h-[56px] px-4 py-2 rounded-3xl border border-border",
              "bg-background text-foreground",
              "transition-all active:scale-95 active:bg-primary active:text-primary-foreground active:border-primary",
              "duration-75 text-sm font-semibold whitespace-nowrap",
            )}
          >
            <span>{item.name}</span>
            <span className="text-xs font-medium opacity-70">
              {currency} {item.price.toLocaleString("id-ID")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
