import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Phone, MessageCircle, Share2, Trash2, Pencil } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { RequestForm } from "@/components/RequestForm";
import {
  getRequest,
  updateRequest,
  deleteRequest,
  addFollowup,
} from "@/lib/requests.functions";
import { useSession } from "@/lib/session";
import { REQUEST_STATUSES, type ClientRequestRecord, type FollowupRecord, type PropertyRecord, type RequestValues } from "@/lib/options";
import { formatSearchResultsForShare, shareText } from "@/lib/sharing";

export const Route = createFileRoute("/requests/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل طلب العميل — مفتاح" },
      { name: "description", content: "تفاصيل طلب العميل مع العروض المطابقة وسجل المتابعات." },
      { property: "og:title", content: "تفاصيل طلب العميل — مفتاح" },
      { property: "og:description", content: "اعرض العروض المطابقة لطلب العميل وسجّل المتابعات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RequestDetailPage,
});

const toValues = (r: ClientRequestRecord): RequestValues => ({
  client_name: r.client_name,
  client_phone: r.client_phone,
  contact_method: r.contact_method,
  listing_type: r.listing_type,
  property_type: r.property_type,
  governorate: r.governorate,
  area: r.area,
  min_price: r.min_price,
  max_price: r.max_price,
  currency: r.currency,
  min_size: r.min_size,
  max_size: r.max_size,
  rooms: r.rooms,
  finishing: r.finishing,
  facade: r.facade,
  features: r.features ?? [],
  status: r.status,
  notes: r.notes,
  next_followup: r.next_followup,
});

const phoneDigits = (p: string | null) => (p ?? "").replace(/[^\d+]/g, "");

function RequestDetailPage() {
  const { id } = Route.useParams();
  const { session } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchOne = useServerFn(getRequest);
  const save = useServerFn(updateRequest);
  const remove = useServerFn(deleteRequest);
  const followup = useServerFn(addFollowup);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextStatus, setNextStatus] = useState("");

  const key = ["request", id, session?.token];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchOne({ data: { token: session!.token, id } }),
    enabled: !!session,
  });

  if (isLoading || !data) {
    return (
      <AppShell title="طلب العميل">
        <div className="py-10 text-center text-muted-foreground">جارٍ التحميل…</div>
      </AppShell>
    );
  }

  const r = data.request as ClientRequestRecord;
  const followups = (data.followups ?? []) as FollowupRecord[];
  const matches = (data.matches ?? []) as { property: PropertyRecord; score: number }[];
  const phone = phoneDigits(r.client_phone);

  if (editing) {
    return (
      <AppShell title={`تعديل طلب #${r.ref_no}`}>
        <RequestForm
          initial={toValues(r)}
          submitting={saving}
          submitLabel="حفظ التعديلات"
          onSubmit={async (values) => {
            setSaving(true);
            try {
              await save({ data: { token: session!.token, id, values } });
              await qc.invalidateQueries({ queryKey: ["request", id] });
              await qc.invalidateQueries({ queryKey: ["requests"] });
              toast.success("تم حفظ التعديلات");
              setEditing(false);
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "تعذّر الحفظ");
            } finally {
              setSaving(false);
            }
          }}
        />
        <div className="mt-3">
          <LiquidButton type="button" onClick={() => setEditing(false)}>
            إلغاء
          </LiquidButton>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`طلب #${r.ref_no}`}>
      <div className="space-y-4">
        <GlassCard>
          <GlassCardContent className="space-y-2 pt-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-[var(--glass-tint)] px-2 py-0.5">{r.status}</span>
              {r.contact_method ? <span>{r.contact_method}</span> : null}
              {r.next_followup ? <span>المتابعة القادمة: {r.next_followup}</span> : null}
            </div>
            <div className="text-lg font-semibold">{r.client_name}</div>
            {r.client_phone ? <div className="text-sm text-muted-foreground">{r.client_phone}</div> : null}
            <div className="text-sm">
              {[r.property_type, r.listing_type, r.governorate, r.area].filter(Boolean).join(" - ") ||
                "بدون تفاصيل"}
            </div>
            <div className="text-sm">
              الميزانية:{" "}
              {r.min_price || r.max_price
                ? `${(r.min_price ?? 0).toLocaleString("en-US")} - ${(r.max_price ?? 0).toLocaleString("en-US")} ${r.currency}`
                : "غير محددة"}
            </div>
            <div className="text-sm">
              المساحة:{" "}
              {r.min_size || r.max_size
                ? `${r.min_size ?? 0} - ${r.max_size ?? 0} م²`
                : "غير محددة"}
            </div>
            {r.rooms ? <div className="text-sm">عدد الغرف: {r.rooms}+</div> : null}
            {r.finishing ? <div className="text-sm">الإكساء: {r.finishing}</div> : null}
            {r.facade ? <div className="text-sm">الواجهة: {r.facade}</div> : null}
            {r.features?.length ? (
              <div className="text-sm">المزايا المطلوبة: {r.features.join(" • ")}</div>
            ) : null}
            {r.notes ? <div className="text-sm text-muted-foreground">{r.notes}</div> : null}

            <div className="flex flex-wrap gap-2 pt-2">
              {phone ? (
                <>
                  <a href={`tel:${phone}`}>
                    <LiquidButton type="button" size="sm">
                      <Phone className="size-4" /> اتصال
                    </LiquidButton>
                  </a>
                  <a
                    href={`https://wa.me/${phone.replace(/^\+/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <LiquidButton type="button" size="sm">
                      <MessageCircle className="size-4" /> واتساب
                    </LiquidButton>
                  </a>
                </>
              ) : null}
              <LiquidButton type="button" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="size-4" /> تعديل
              </LiquidButton>
              {session?.role === "manager" ? (
                <LiquidButton
                  type="button"
                  size="sm"
                  className="text-destructive"
                  onClick={async () => {
                    if (!window.confirm("حذف هذا الطلب نهائياً؟")) return;
                    try {
                      await remove({ data: { token: session.token, id } });
                      await qc.invalidateQueries({ queryKey: ["requests"] });
                      toast.success("تم حذف الطلب");
                      navigate({ to: "/requests" });
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "تعذّر الحذف");
                    }
                  }}
                >
                  <Trash2 className="size-4" /> حذف
                </LiquidButton>
              ) : null}
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardContent className="space-y-3 pt-5">
            <div className="flex items-center justify-between">
              <div className="font-semibold">العروض المطابقة ({matches.length})</div>
              {matches.length ? (
                <LiquidButton
                  type="button"
                  size="sm"
                  onClick={() => shareText(formatSearchResultsForShare(matches.map((m) => m.property)))}
                >
                  <Share2 className="size-4" /> مشاركة
                </LiquidButton>
              ) : null}
            </div>
            {matches.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                لا توجد عقارات مطابقة حالياً
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {matches.map((m) => (
                  <div
                    key={m.property.id}
                    className="cursor-pointer rounded-2xl bg-[var(--glass-tint)] p-3"
                    onClick={() => navigate({ to: "/properties/$id", params: { id: m.property.id } })}
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>عرض #{m.property.ref_no}</span>
                      <span className="font-semibold text-foreground">{m.score}%</span>
                    </div>
                    <div className="truncate text-sm font-semibold">
                      {[m.property.property_type, m.property.governorate, m.property.area]
                        .filter(Boolean)
                        .join(" - ")}
                    </div>
                    <div className="text-sm">
                      {m.property.price
                        ? `${m.property.price.toLocaleString("en-US")} ${m.property.currency}`
                        : "السعر غير محدد"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardContent className="space-y-3 pt-5">
            <div className="font-semibold">المتابعات</div>
            <textarea
              className="glass-field min-h-20 w-full"
              placeholder="اكتب ملاحظة المتابعة…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                className="glass-field"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
              />
              <select
                className="glass-field appearance-none [&>option]:bg-background [&>option]:text-foreground"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
              >
                <option value="">إبقاء الحالة</option>
                {REQUEST_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <LiquidButton
                type="button"
                variant="primary"
                onClick={async () => {
                  if (!note.trim()) {
                    toast.error("اكتب ملاحظة أولاً");
                    return;
                  }
                  try {
                    await followup({
                      data: {
                        token: session!.token,
                        id,
                        note: note.trim(),
                        next_followup: nextDate || null,
                        status: nextStatus || null,
                      },
                    });
                    setNote("");
                    setNextDate("");
                    setNextStatus("");
                    await qc.invalidateQueries({ queryKey: ["request", id] });
                    await qc.invalidateQueries({ queryKey: ["requests"] });
                    toast.success("تمت إضافة المتابعة");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "تعذّر الحفظ");
                  }
                }}
              >
                إضافة متابعة
              </LiquidButton>
            </div>

            <div className="space-y-2">
              {followups.length === 0 ? (
                <div className="py-2 text-sm text-muted-foreground">لا توجد متابعات بعد</div>
              ) : (
                followups.map((f) => (
                  <div key={f.id} className="rounded-2xl bg-[var(--glass-tint)] p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{f.actor_name ?? "—"}</span>
                      <span>{new Date(f.created_at).toLocaleString("ar")}</span>
                    </div>
                    <div className="text-sm">{f.note}</div>
                    {f.next_followup ? (
                      <div className="text-xs text-muted-foreground">
                        المتابعة القادمة: {f.next_followup}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </AppShell>
  );
}
