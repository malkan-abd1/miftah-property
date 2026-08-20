import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, ExternalLink, LogOut, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { getActivity, getWorkspace, updateWorkspaceSettings } from "@/lib/workspace.functions";
import {
  createRequestForm,
  deleteRequestForm,
  listRequestForms,
  updateFormStatus,
} from "@/lib/public-forms.functions";
import { useSession } from "@/lib/session";
import { copyText } from "@/lib/sharing";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "إعدادات المكتب — مفتاح" },
      { name: "description", content: "إدارة اسم المكتب وكلمات مرور المدير والموظف ومتابعة سجل النشاط." },
      { property: "og:title", content: "إعدادات المكتب — مفتاح" },
      { property: "og:description", content: "إعدادات مساحة العمل وسجل نشاط المستخدمين." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { session, setSession } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchWs = useServerFn(getWorkspace);
  const fetchActivity = useServerFn(getActivity);
  const save = useServerFn(updateWorkspaceSettings);
  const fetchForms = useServerFn(listRequestForms);
  const createForm = useServerFn(createRequestForm);
  const toggleForm = useServerFn(updateFormStatus);
  const removeForm = useServerFn(deleteRequestForm);

  const [name, setName] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formIntro, setFormIntro] = useState("");
  const [creatingForm, setCreatingForm] = useState(false);

  const { data: ws } = useQuery({
    queryKey: ["workspace", session?.token],
    queryFn: () => fetchWs({ data: { token: session!.token } }),
    enabled: !!session,
  });

  const isManager = session?.role === "manager";

  const { data: activity } = useQuery({
    queryKey: ["activity", session?.token],
    queryFn: () => fetchActivity({ data: { token: session!.token } }),
    enabled: !!session && isManager,
  });

  const { data: forms } = useQuery({
    queryKey: ["request-forms", session?.token],
    queryFn: () => fetchForms({ data: { token: session!.token } }),
    enabled: !!session && isManager,
  });

  return (
    <AppShell title="الإعدادات">
      <div className="flex flex-col gap-4">
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>مساحة العمل</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">اسم المكتب</span>
              <span className="font-medium">{ws?.workspace?.name ?? "…"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">رمز الدخول</span>
              <LiquidButton
                size="sm"
                className="font-mono text-base font-bold tracking-widest"
                onClick={async () =>
                  (await copyText(ws?.workspace?.code ?? ""))
                    ? toast.success("تم نسخ الرمز")
                    : toast.error("تعذر النسخ")
                }
              >
                {ws?.workspace?.code ?? "…"} <Copy className="size-4" />
              </LiquidButton>

            </div>
            <LiquidButton
              variant="destructive"
              className="mt-2 w-full"
              onClick={() => {
                setSession(null);
                navigate({ to: "/", replace: true });
              }}
            >
              <LogOut /> تسجيل الخروج
            </LiquidButton>
          </GlassCardContent>
        </GlassCard>

        {isManager && (
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>تعديل الإعدادات</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="flex flex-col gap-3">
              <input
                className="glass-field"
                placeholder="اسم المكتب الجديد"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="glass-field"
                type="password"
                placeholder="كلمة مرور المدير الجديدة"
                value={managerPassword}
                onChange={(e) => setManagerPassword(e.target.value)}
              />
              <input
                className="glass-field"
                type="password"
                placeholder="كلمة مرور الموظف الجديدة"
                value={employeePassword}
                onChange={(e) => setEmployeePassword(e.target.value)}
              />
              <LiquidButton
                className="w-full"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await save({
                      data: {
                        token: session!.token,
                        ...(name ? { name } : {}),
                        ...(managerPassword ? { managerPassword } : {}),
                        ...(employeePassword ? { employeePassword } : {}),
                      },
                    });
                    setName("");
                    setManagerPassword("");
                    setEmployeePassword("");
                    toast.success("تم حفظ الإعدادات");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "تعذر الحفظ");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                حفظ
              </LiquidButton>
            </GlassCardContent>
          </GlassCard>
        )}

        {isManager && (
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>استمارات العملاء العامة</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                أنشئ استمارة وأرسل رابطها للعميل ليملأ متطلباته بنفسه. يصل الطلب تلقائياً إلى نظام المكتب.
              </p>

              {/* Create new form */}
              <div className="flex flex-col gap-2">
                <input
                  className="glass-field"
                  placeholder="عنوان الاستمارة (مثال: طلب عقار)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
                <input
                  className="glass-field"
                  placeholder="مقدمة قصيرة (اختياري)"
                  value={formIntro}
                  onChange={(e) => setFormIntro(e.target.value)}
                />
                <LiquidButton
                  size="sm"
                  disabled={creatingForm || !formTitle.trim()}
                  onClick={async () => {
                    setCreatingForm(true);
                    try {
                      await createForm({
                        data: { token: session!.token, title: formTitle.trim(), intro: formIntro.trim() || undefined },
                      });
                      setFormTitle("");
                      setFormIntro("");
                      qc.invalidateQueries({ queryKey: ["request-forms", session?.token] });
                      toast.success("تم إنشاء الاستمارة");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "تعذر إنشاء الاستمارة");
                    } finally {
                      setCreatingForm(false);
                    }
                  }}
                >
                  <Plus className="size-4" /> إنشاء استمارة
                </LiquidButton>
              </div>

              {/* List existing forms */}
              {(forms ?? []).map((f: { id: string; token: string; title: string; is_active: boolean; created_at: string; created_by: string | null }) => {
                const formUrl = `${window.location.origin}/form/${f.token}`;
                return (
                  <div
                    key={f.id}
                    className="flex flex-col gap-2 border-b border-[var(--glass-ring)] pb-3 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{f.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          f.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {f.is_active ? "نشطة" : "متوقفة"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <LiquidButton
                        size="sm"
                        variant="ghost"
                        onClick={async () =>
                          (await copyText(formUrl))
                            ? toast.success("تم نسخ الرابط")
                            : toast.error("تعذر النسخ")
                        }
                      >
                        <Copy className="size-4" /> نسخ الرابط
                      </LiquidButton>
                      <LiquidButton
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(formUrl, "_blank")}
                      >
                        <ExternalLink className="size-4" /> فتح
                      </LiquidButton>
                      <LiquidButton
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await toggleForm({ data: { token: session!.token, id: f.id, is_active: !f.is_active } });
                            qc.invalidateQueries({ queryKey: ["request-forms", session?.token] });
                            toast.success(f.is_active ? "تم إيقاف الاستمارة" : "تم تفعيل الاستمارة");
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : "تعذر التغيير");
                          }
                        }}
                      >
                        {f.is_active ? "إيقاف" : "تفعيل"}
                      </LiquidButton>
                      <LiquidButton
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!confirm("هل تريد حذف هذه الاستمارة؟")) return;
                          try {
                            await removeForm({ data: { token: session!.token, id: f.id } });
                            qc.invalidateQueries({ queryKey: ["request-forms", session?.token] });
                            toast.success("تم حذف الاستمارة");
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : "تعذر الحذف");
                          }
                        }}
                      >
                        <Trash2 className="size-4" /> حذف
                      </LiquidButton>
                    </div>
                  </div>
                );
              })}
              {!forms?.length && (
                <p className="text-sm text-muted-foreground">لا توجد استمارات بعد.</p>
              )}
            </GlassCardContent>
          </GlassCard>
        )}

        {isManager && (
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>سجل النشاط</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="flex flex-col gap-2">
              {(activity ?? []).map((a: Record<string, unknown>) => (
                <div
                  key={String(a["id"])}
                  className="flex items-center justify-between border-b border-[var(--glass-ring)] py-2 text-sm last:border-0"
                >
                  <span>
                    {String(a["actor_name"] ?? "")} — {String(a["action"] ?? "")}
                    {a["detail"] ? ` (${String(a["detail"])})` : ""}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(String(a["created_at"])).toLocaleString("ar")}
                  </span>
                </div>
              ))}
              {!activity?.length && <p className="text-sm text-muted-foreground">لا يوجد نشاط بعد.</p>}
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </AppShell>
  );
}
