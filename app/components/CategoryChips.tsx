import { cn } from "~/lib/utils";

interface CategoryChipsProps {
  expenseCategories: string[];
  onIncome: () => void;
  onExpense: (category: string) => void;
}

export function CategoryChips({
  expenseCategories,
  onIncome,
  onExpense,
}: CategoryChipsProps) {
  return (
    <div className="w-full">
      {/* Income chip */}
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
        <button
          onClick={onIncome}
          className={cn(
            "flex-shrink-0 px-5 py-2 rounded-3xl min-h-[44px]",
            "bg-accent text-accent-foreground font-semibold text-sm",
            "transition-all active:scale-95 duration-75 whitespace-nowrap",
          )}
        >
          + Pemasukan
        </button>
      </div>

      {/* Expense category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {expenseCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onExpense(cat)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-3xl min-h-[44px]",
              "bg-primary text-primary-foreground font-semibold text-sm",
              "transition-all active:scale-95 duration-75 whitespace-nowrap",
            )}
          >
            − {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
