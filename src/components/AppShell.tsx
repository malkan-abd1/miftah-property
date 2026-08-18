import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";
import { useSession } from "@/lib/session";
import { AppNav } from "./AppNav";

export function AppShell({
  children,
  requireManager = false,
  title,
}: {
  children: ReactNode;
  requireManager?: boolean;
  title?: string;
}) {
  const { session, ready } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!session) navigate({ to: "/", replace: true });
    else if (requireManager && session.role !== "manager")
      navigate({ to: "/properties", replace: true });
  }, [ready, session, requireManager, navigate]);

  if (!ready || !session || (requireManager && session.role !== "manager")) {
    return <div className="flex min-h-dvh items-center justify-center text-muted-foreground">جارٍ التحميل…</div>;
  }

  return (
    <div className="min-h-dvh pb-28">
      <header className="sticky top-0 z-30 border-b border-[var(--glass-ring)] bg-[color-mix(in_oklab,white_96%,transparent)] shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <img src={logo.url} alt="مفتاح" className="size-10 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-bold leading-tight">{title ?? "مفتاح"}</div>
            <div className="truncate text-xs text-muted-foreground">{session.workspaceName}</div>
          </div>
          <span className="glass-panel rounded-full px-3 py-1 text-xs font-semibold">
            {session.role === "manager" ? "مدير" : "موظف"}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">{session.name}</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5">{children}</main>
      <AppNav />
    </div>
  );
}
