import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Building2,
  ClipboardList,
  Clock,
  Home,
  TrendingUp,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { getDashboardStats } from "@/lib/requests.functions";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — مفتاح" },
      { name: "description", content: "نظرة عامة على عقارات المكتب وطلبات العملاء والمتابعات والنشاط." },
    ],
  }),
  component: DashboardPage,
});

function StatCard({
  icon,
  label,
  value,
  to,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  to?: string;
  accent?: string;
}) {
  const inner = (
    <GlassCard className="h-full">
      <GlassCardContent className="flex items-center gap-3 pt-5">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: accent ?? "var(--glass-tint)" }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-bold">{value}</div>
          <div className="truncate text-sm text-muted-foreground">{label}</div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function DashboardPage() {
  const { session } = useSession();
  const fetchStats = useServerFn(getDashboardStats);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", session?.token],
    queryFn: () => fetchStats({ data: { token: session!.token } }),
    enabled: !!session,
  });

  return (
    <AppShell title="لوحة التحكم">
      {isLoading || !data ? (
        <p className="text-muted-foreground">جارٍ التحميل…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              icon={<Home className="size-6 text-primary" />}
              label="إجمالي العقارات"
              value={data.propertyCount}
              to="/properties"
            />
            <StatCard
              icon={<Building2 className="size-6 text-emerald-600" />}
              label="عقارات متاحة"
              value={data.availableCount}
              to="/properties"
            />
            <StatCard
              icon={<TrendingUp className="size-6 text-amber-600" />}
              label="مباع / مؤجر"
              value={`${data.soldCount} / ${data.rentedCount}`}
            />
            <StatCard
              icon={<Users className="size-6 text-primary" />}
              label="طلبات العملاء"
              value={data.requestCount}
              to="/requests"
            />
            <StatCard
              icon={<ClipboardList className="size-6 text-amber-600" />}
              label="طلبات جديدة"
              value={data.newRequests}
              to="/requests"
            />
            <StatCard
              icon={<Clock className="size-6 text-destructive" />}
              label="متابعات معلّقة"
              value={data.pendingFollowups.length}
            />
          </div>

          {/* Pending follow-ups */}
          {data.pendingFollowups.length > 0 && (
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>متابعات تحتاج إجراء</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="flex flex-col gap-2">
                {data.pendingFollowups.map((f) => (
                  <Link
                    key={f.id}
                    to="/requests/$id"
                    params={{ id: f.request_id }}
                    className="flex items-center justify-between border-b border-[var(--glass-ring)] py-2 text-sm last:border-0"
                  >
                    <span className="text-muted-foreground">{f.note}</span>
                    <span className="text-xs font-semibold text-destructive">
                      {f.next_followup}
                    </span>
                  </Link>
                ))}
              </GlassCardContent>
            </GlassCard>
          )}

          {/* Recent requests */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>أحدث طلبات العملاء</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="flex flex-col gap-2">
              {data.recentRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد طلبات بعد.</p>
              ) : (
                data.recentRequests.map((r) => (
                  <Link
                    key={r.id}
                    to="/requests/$id"
                    params={{ id: r.id }}
                    className="flex items-center justify-between border-b border-[var(--glass-ring)] py-2 text-sm last:border-0"
                  >
                    <span className="font-medium">
                      #{r.ref_no} — {r.client_name}
                    </span>
                    <span className="rounded-full bg-[var(--glass-tint)] px-2 py-0.5 text-xs">
                      {r.status}
                    </span>
                  </Link>
                ))
              )}
            </GlassCardContent>
          </GlassCard>

          {/* Recent activity */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>آخر النشاطات</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="flex flex-col gap-2">
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا يوجد نشاط بعد.</p>
              ) : (
                data.recentActivity.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between border-b border-[var(--glass-ring)] py-2 text-sm last:border-0"
                  >
                    <span>
                      <span className="font-medium">{a.actor_name ?? ""}</span> — {a.action}
                      {a.detail ? ` (${a.detail})` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString("ar")}
                    </span>
                  </div>
                ))
              )}
            </GlassCardContent>
          </GlassCard>
        </div>
      )}
    </AppShell>
  );
}
