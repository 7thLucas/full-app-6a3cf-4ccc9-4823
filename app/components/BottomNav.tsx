import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { Calculator, BarChart2, BookOpen, Package, LogOut } from "lucide-react";
import type { AppRole } from "~/lib/pos-store.client";

interface BottomNavProps {
  role: AppRole;
  onSwitchRole: () => void;
}

const KASIR_TABS = [
  { to: "/",        label: "Kasir",     Icon: Calculator },
];

const OWNER_TABS = [
  { to: "/",          label: "Kasir",      Icon: Calculator },
  { to: "/dashboard", label: "Dashboard",  Icon: BarChart2  },
  { to: "/resep",     label: "Resep",      Icon: BookOpen   },
  { to: "/inventaris",label: "Inventaris", Icon: Package    },
];

export function BottomNav({ role, onSwitchRole }: BottomNavProps) {
  const { pathname } = useLocation();
  const tabs = role === "owner" ? OWNER_TABS : KASIR_TABS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-navbarBackground border-t border-border max-w-[430px] mx-auto">
      <div className="flex items-center">
        {tabs.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5",
                "transition-colors duration-100",
                active
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        {/* Role toggle */}
        <button
          onClick={onSwitchRole}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-2 gap-0.5",
            "text-muted-foreground transition-colors duration-100",
          )}
        >
          <LogOut size={22} strokeWidth={1.8} />
          <span className="text-[10px] font-medium">
            {role === "owner" ? "Keluar" : "Owner"}
          </span>
        </button>
      </div>
    </nav>
  );
}
