import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { listRequests } from "@/lib/requests.functions";
import { useSession } from "@/lib/session";
import { REQUEST_STATUSES, type ClientRequestRecord } from "@/lib/options";

export const Route = createFileRoute("/requests/")({
  head: () => ({
    meta: [
      { title: "طلبات العملاء — مفتاح" },
      { name: "description", content: "إدارة طلبات العملاء ومتابعتها ومطابقتها مع عقارات المكتب." },
      { property: "og:title", content: "طلبات العملاء — مفتاح" },
      { property: "og:description", content: "سجّل طلب كل عميل وتابعه واعرض العروض المطابقة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  const { session } = useSession();
  const fetchList = useServerFn(listRequests);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["requests", session?.token],
    queryFn: () => fetchList({ data: { token: session!.token } }),
    enabled: !!session,
  });

  const rows = useMemo(() => {
    const list = (data ?? []) as ClientRequestRecord[];
    const term = q.trim();
    return list.filter((r) => {
      if (status && r.status !== status) return false;
      if (!term) return true;
      return [r.ref_no, r.client_name, r.client_phone, r.area, r.governorate, r.notes]
        .filter(Boolean)
        .join(" ")
        .includes(term);
    });
  }, [data, q, status]);

  return (
    <AppShell title="طلبات العملاء">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="glass-field w-full pr-9"
              placeholder="ابحث باسم العميل أو الهاتف أو رقم الطلب"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Link to="/requests/new">
            <LiquidButton variant="primary" size="icon" aria-label="طلب جديد">
              <Plus className="size-5" />
            </LiquidButton>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <LiquidButton
            type="button"
            size="sm"
            variant={status === "" ? "primary" : "default"}
            onClick={() => setStatus("")}
          >
            الكل
          </LiquidButton>
          {REQUEST_STATUSES.map((s) => (
            <LiquidButton
              key={s}
              type="button"
              size="sm"
              variant={status === s ? "primary" : "default"}
              onClick={() => setStatus(s)}
            >
              {s}
            </LiquidButton>
          ))}
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">جارٍ التحميل…</div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">لا توجد طلبات</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rows.map((r) => (
              <Link key={r.id} to="/requests/$id" params={{ id: r.id }} className="block">
                <GlassCard className="h-full">
                  <GlassCardContent className="pt-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>طلب #{r.ref_no}</span>
                      <span className="rounded-full bg-[var(--glass-tint)] px-2 py-0.5">{r.status}</span>
                      {r.next_followup ? <span>متابعة: {r.next_followup}</span> : null}
                    </div>
                    <div className="mt-1 truncate font-semibold">{r.client_name}</div>
                    <div className="truncate text-sm text-muted-foreground">
                      {[r.property_type, r.listing_type, r.governorate, r.area]
                        .filter(Boolean)
                        .join(" - ") || "بدون تفاصيل"}
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {r.min_price || r.max_price
                        ? `${(r.min_price ?? 0).toLocaleString("en-US")} - ${(r.max_price ?? 0).toLocaleString("en-US")} ${r.currency}`
                        : "الميزانية غير محددة"}
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
