import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { getPOSDb, todayISODate, type Transaction } from "~/lib/pos-db.client";
import { usePOSStore } from "~/lib/pos-store.client";

interface TransactionLogProps {
  currency: string;
}

export function TransactionLog({ currency }: TransactionLogProps) {
  const { txVersion } = usePOSStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const db = getPOSDb();
    const today = todayISODate();
    db.transactions
      .where("date")
      .equals(today)
      .reverse()
      .limit(30)
      .sortBy("createdAt")
      .then((txs) => setTransactions([...txs].reverse()))
      .catch(console.error);
  }, [txVersion]);

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <p className="text-sm">Belum ada transaksi hari ini</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className={cn(
            "flex items-center justify-between px-4 py-3 rounded-xl bg-card",
            "border-l-4",
            tx.type === "income" ? "border-l-accent" : "border-l-primary",
          )}
        >
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-card-foreground leading-tight">
              {tx.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(tx.createdAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {tx.quantity && tx.quantity > 1 ? ` · ${tx.quantity}×` : ""}
            </span>
          </div>
          <span
            className={cn(
              "text-sm font-bold",
              tx.type === "income" ? "text-accent" : "text-primary",
            )}
          >
            {tx.type === "income" ? "+" : "−"}
            {currency} {tx.amount.toLocaleString("id-ID")}
          </span>
        </div>
      ))}
    </div>
  );
}
