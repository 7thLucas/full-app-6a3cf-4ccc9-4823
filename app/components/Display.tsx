import { usePOSStore } from "~/lib/pos-store.client";

interface DisplayProps {
  currency: string;
}

export function Display({ currency }: DisplayProps) {
  const { display } = usePOSStore();

  const formatted = display
    ? parseInt(display, 10).toLocaleString("id-ID")
    : "0";

  return (
    <div className="w-full rounded-2xl bg-muted border border-border px-4 py-4 mb-3 text-right">
      <p className="text-xs font-medium text-muted-foreground mb-1">{currency}</p>
      <p className="text-[42px] font-bold text-foreground leading-none tracking-tight">
        {formatted}
      </p>
    </div>
  );
}
