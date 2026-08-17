import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PlusCircle, Settings, LogOut } from "lucide-react";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

type Item = {
  title: string;
  to: string;
  icon: React.ReactNode;
  from: string;
  to_: string;
  managerOnly?: boolean;
};

const items: Item[] = [
  { title: "العقارات", to: "/properties", icon: <Home />, from: "#56CCF2", to_: "#2F80ED" },
  {
    title: "إضافة",
    to: "/properties/new",
    icon: <PlusCircle />,
    from: "#80FF72",
    to_: "#7EE8FA",
    managerOnly: true,
  },
  {
    title: "الإعدادات",
    to: "/settings",
    icon: <Settings />,
    from: "#a955ff",
    to_: "#ea51ff",
    managerOnly: true,
  },
];

export function AppNav() {
  const { session, setSession } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!session) return null;

  const visible = items.filter((i) => !i.managerOnly || session.role === "manager");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <ul className="glass-panel flex items-center gap-2 rounded-full px-3 py-2">
        {visible.map((item) => {
          const active = pathname === item.to;
          return (
            <li key={item.to} className="group relative">
              <Link
                to={item.to}
                aria-label={item.title}
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 will-change-transform group-hover:w-28 group-hover:scale-105",
                  active && "w-28",
                )}
                style={{
                  backgroundImage: active
                    ? `linear-gradient(135deg, ${item.from}, ${item.to_})`
                    : undefined,
                }}
              >
                <span
                  className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ backgroundImage: `linear-gradient(135deg, ${item.from}, ${item.to_})` }}
                />
                <span
                  className="pointer-events-none absolute inset-0 rounded-full opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-60"
                  style={{ backgroundImage: `linear-gradient(135deg, ${item.from}, ${item.to_})` }}
                />
                <span
                  className={cn(
                    "relative z-10 flex items-center gap-2 text-sm font-semibold",
                    active ? "text-primary-foreground" : "text-foreground",
                  )}
                >
                  {item.icon}
                  <span
                    className={cn(
                      "hidden whitespace-nowrap group-hover:inline",
                      active && "inline",
                    )}
                  >
                    {item.title}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
        <li>
          <LiquidButton
            variant="ghost"
            size="icon"
            onClick={() => setSession(null)}
            aria-label="تسجيل الخروج"
            className="h-12 w-12 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-5" />
          </LiquidButton>
        </li>

      </ul>
    </nav>
  );
}
