/**
 * BottomNav — mobile bottom navigation bar.
 * Kasir only sees Kasir tab. Owner sees all tabs.
 */
import { Link, useLocation } from "react-router";
import { Calculator, LayoutDashboard, Package, UtensilsCrossed } from "lucide-react";
import { cn } from "~/lib/utils";
import type { AppRole } from "~/lib/pos-store";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  ownerOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/", label: "Kasir", icon: <Calculator size={22} /> },
  { href: "/owner", label: "Dashboard", icon: <LayoutDashboard size={22} />, ownerOnly: true },
  { href: "/menu", label: "Menu", icon: <UtensilsCrossed size={22} />, ownerOnly: true },
  { href: "/inventory", label: "Inventori", icon: <Package size={22} />, ownerOnly: true },
];

interface BottomNavProps {
  role: AppRole;
}

export function BottomNav({ role }: BottomNavProps) {
  const location = useLocation();
  const visibleItems = navItems.filter((item) => !item.ownerOnly || role === "owner");

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 bg-navbar border-t border-border"
      style={{ boxShadow: "0 -2px 8px rgba(0,0,0,0.08)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
