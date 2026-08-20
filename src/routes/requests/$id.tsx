import { useState } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
  MessageCircle,
  Phone,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import {
  addFollowup,
  deleteRequest,
  getRequest,
  sendSelectedProperties,
} from "@/lib/requests.functions";
import { useSession } from "@/lib/session";
import { copyText, formatPropertyForShare, shareText } from "@/lib/sharing";
import type { PropertyRecord } from "@/lib/options";

export const Route = createFileRoute("/requests/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل الطلب — مفتاح" },
      { name: "description", content: "تفاصيل طلب العميل مع العقارات المطابقة والمتابعات." },
    ],
  }),
  component: RequestDetailPage,
});

function Row({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === "" || value === false) return null;
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--glass-ring)] py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-left font-medium">{String(value)}</span>
    </div>
  );
}

function scoreLabel(score: number) {
  if (score >= 80) return { text: "تطابق عالٍ", color: "text-emerald-600" };
  if (score >= 60) return { text: "تطابق متوسط", color: "text-amber-600" };
  return { text: "تطابق ضعيف", color: "text-muted-foreground" };
}

function RequestDetailPage() {
  const { id } = useParams({ from: "/requests/$id" });
  const { session } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchOne = useServerFn(getRequest);
  const addFollow = useServerFn(addFollowup);
  const sendSelected = useServerFn(sendSelectedProperties);
  const remove = useServerFn(deleteRequest);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [nextFollowup, setNextFollowup] = useState("");
  const [status, setStatus] = useState("");
  const [savingFollowup, setSavingFollowup] = useState(false);
  const [sending, setSending] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["request", id, session?.token],
    queryFn: () => fetchOne({ data: { token: session!.token, id } }),
    enabled: !!session,
  });

  const req = data?.request;
  const followups = data?.followups ?? [];
  const matches = data?.matches ?? [];

  function toggleSelect(pid: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  }

  async function handleSendSelected() {
    if (selected.size === 0) {
      toast.error("اختر عقاراً واحداً على الأقل");
      return;
    }
    setSending(true);
    try {
      const ids = Array.from(selected);
      await sendSelected({ data: { token: session!.token, id, property_ids: ids } });
      const matchedProps = matches
        .filter((m) => selected.has(m.property.id))
        .map((m) => m.property as unknown as PropertyRecord);
      const text = matchedProps.map((p) => formatPropertyForShare(p)).join("\n\n———\n\n");
      await shareText(`عزيزي ${req?.client_name ?? ""}،\n\nوجدنا لك هذه العروض المطابقة:\n\n${text}`);
      toast.success("تم إرسال العروض المختارة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر الإرسال");
    } finally {
      setSending(false);
    }
  }

  async function handleAddFollowup() {
    if (!note.trim()) {
      toast.error("أدخل ملاحظة المتابعة");
      return;
    }
    setSavingFollowup(true);
    try {
      await addFollow({
        data: {
          token: session!.token,
          id,
          note: note.trim(),
          next_followup: nextFollowup || null,
          status: status || null,
        },
      });
      setNote("");
      setNextFollowup("");
      setStatus("");
      qc.invalidateQueries({ queryKey: ["request", id, session?.token] });
      qc.invalidateQueries({ queryKey: ["requests", session?.token] });
      toast.success("تمت إضافة المتابعة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر حفظ المتابعة");
    } finally {
      setSavingFollowup(false);
    }
  }

  return (
    <AppShell title={req ? `طلب #${req.ref_no}` : "تفاصيل الطلب"}>
      {isLoading || !req ? (
        <p className="text-muted-foreground">جارٍ التحميل…</p>
      ) : (
        <div className="flex flex-col gap-4">
          <Link to="/requests" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowRight className="size-4" /> رجوع للطلبات
          </Link>

          {/* Client info + actions */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>{req.client_name}</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="flex flex-col gap-3">
              <Row label="الحالة" value={req.status} />
              <Row label="الهاتف" value={req.client_phone} />
              <Row label="طريقة التواصل" value={req.contact_method} />
              <Row label="نوع الإعلان" value={req.listing_type} />
              <Row label="نوع العقار" value={req.property_type} />
              <Row label="المحافظة" value={req.governorate} />
              <Row label="المنطقة" value={req.area} />
              <Row label="الغرف (حد أدنى)" value={req.rooms} />
              <Row
                label="الميزانية"
                value={
                  req.min_price || req.max_price
                    ? `${(req.min_price ?? 0).toLocaleString("en-US")} - ${(req.max_price ?? 0).toLocaleString("en-US")} ${req.currency}`
                    : null
                }
              />
              <Row
                label="المساحة"
                value={
                  req.min_size || req.max_size
                    ? `${req.min_size ?? ""} - ${req.max_size ?? ""} م²`
                    : null
                }
              />
              <Row label="الإكساء" value={req.finishing} />
              <Row label="الواجهة" value={req.facade} />
              <Row label="المزايا" value={req.features?.join(" • ")} />
              <Row label="ملاحظات" value={req.notes} />
              <Row label="المتابعة القادمة" value={req.next_followup} />
              <Row label="المصدر" value={req.source} />
              <Row label="أضيف بواسطة" value={req.created_by} />

              <div className="flex flex-wrap gap-2 pt-2">
                {req.client_phone && (
                  <>
                    <LiquidButton
                      size="sm"
                      onClick={() => window.open(`https://wa.me/${req.client_phone!.replace(/[^0-9]/g, "")}`, "_blank")}
                    >
                      <MessageCircle className="size-4" /> واتساب
                    </LiquidButton>
                    <LiquidButton size="sm" onClick={() => window.open(`tel:${req.client_phone}`, "_blank")}>
                      <Phone className="size-4" /> اتصال
                    </LiquidButton>
                  </>
                )}
                {session?.role === "manager" && (
                  <LiquidButton
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!confirm("هل تريد حذف هذا الطلب نهائياً؟")) return;
                      await remove({ data: { token: session.token, id: req.id } });
                      toast.success("تم حذف الطلب");
                      navigate({ to: "/requests" });
                    }}
                  >
                    <Trash2 className="size-4" /> حذف
                  </LiquidButton>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Matching properties */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>العقارات المطابقة ({matches.length})</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="flex flex-col gap-3">
              {matches.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد عقارات مطابقة حالياً.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <LiquidButton
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(new Set(matches.map((m) => m.property.id)))}
                    >
                      اختيار الكل
                    </LiquidButton>
                    <LiquidButton size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                      إلغاء الاختيار
                    </LiquidButton>
                    <LiquidButton
                      size="sm"
                      variant="primary"
                      disabled={sending || selected.size === 0}
                      onClick={handleSendSelected}
                    >
                      {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                      إرسال المختار ({selected.size})
                    </LiquidButton>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {matches.map((m) => {
                      const p = m.property as unknown as PropertyRecord;
                      const sl = scoreLabel(m.score);
                      const isSel = selected.has(p.id);
                      return (
                        <Link
                          key={p.id}
                          to="/properties/$id"
                          params={{ id: p.id }}
                          className="block"
                        >
                          <div
                            className={`glass-panel rounded-2xl p-3 transition-transform active:scale-[0.99] ${
                              isSel ? "ring-2 ring-primary" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">عرض #{p.ref_no}</span>
                              <span className={`text-xs font-semibold ${sl.color}`}>{sl.text} ({m.score}%)</span>
                            </div>
                            <div className="mt-1 truncate font-semibold">
                              {p.title || `${p.property_type ?? ""} ${p.area ?? ""}`}
                            </div>
                            <div className="truncate text-sm text-muted-foreground">
                              {[p.governorate, p.area].filter(Boolean).join(" - ")}
                            </div>
                            <div className="mt-1 text-sm font-semibold">
                              {p.price ? `${p.price.toLocaleString("en-US")} ${p.currency}` : "—"}
                            </div>
                            <LiquidButton
                              size="sm"
                              variant={isSel ? "primary" : "default"}
                              className="mt-2 w-full"
                              onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSelect(p.id);
                              }}
                            >
                              {isSel ? <Check className="size-4" /> : <Plus className="size-4" />}
                              {isSel ? "مختار" : "اختيار"}
                            </LiquidButton>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </GlassCardContent>
          </GlassCard>

          {/* Follow-ups */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>سجل المتابعات</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="flex flex-col gap-3">
              {followups.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد متابعات بعد.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {followups.map((f) => (
                    <div
                      key={f.id}
                      className="border-b border-[var(--glass-ring)] pb-2 text-sm last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{f.actor_name ?? "—"}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(f.created_at).toLocaleString("ar")}
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{f.note}</p>
                      {f.next_followup && (
                        <p className="mt-0.5 text-xs text-primary">المتابعة القادمة: {f.next_followup}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add followup form */}
              <div className="mt-2 flex flex-col gap-2">
                <textarea
                  className="glass-field min-h-20"
                  placeholder="ملاحظة المتابعة…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="glass-field"
                    value={nextFollowup}
                    onChange={(e) => setNextFollowup(e.target.value)}
                  />
                  <select
                    className="glass-field appearance-none [&>option]:bg-background [&>option]:text-foreground"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">بدون تغيير الحالة</option>
                    <option value="جديد">جديد</option>
                    <option value="قيد المتابعة">قيد المتابعة</option>
                    <option value="مغلق">مغلق</option>
                    <option value="تم التحويل لصفقة">تم التحويل لصفقة</option>
                  </select>
                </div>
                <LiquidButton
                  size="sm"
                  disabled={savingFollowup}
                  onClick={handleAddFollowup}
                  className="w-full"
                >
                  {savingFollowup ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  إضافة متابعة
                </LiquidButton>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      )}
    </AppShell>
  );
}
