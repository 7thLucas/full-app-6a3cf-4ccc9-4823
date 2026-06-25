import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "~/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // base
          "inline-flex items-center justify-center font-semibold rounded-xl",
          "transition-transform active:scale-95 duration-75 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // size
          size === "sm" && "px-3 py-2 text-sm min-h-[40px]",
          size === "md" && "px-4 py-3 text-base min-h-[48px]",
          size === "lg" && "px-6 py-4 text-base min-h-[56px] w-full",
          // variant
          variant === "primary" && "bg-primary text-primary-foreground shadow-sm",
          variant === "secondary" &&
            "bg-transparent border-2 border-border text-foreground",
          variant === "ghost" && "bg-transparent text-foreground hover:bg-muted",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
