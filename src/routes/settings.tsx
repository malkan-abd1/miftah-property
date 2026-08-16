import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { getActivity, getWorkspace, updateWorkspaceSettings } from "@/lib/workspace.functions";
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
  const { session, clear } = useSession();
  const navigate = useNavigate();
  const fetchWs = useServerFn(getWorkspace);
  const fetchActivity = useServerFn(getActivity);
  const save = useServerFn(updateWorkspaceSettings);

  const [name, setName] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const [busy, setBusy] = useState(false);

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
              <button
                className="inline-flex items-center gap-2 font-mono text-base font-bold tracking-widest"
                onClick={async () =>
                  (await copyText(ws?.workspace?.code ?? ""))
                    ? toast.success("تم نسخ الرمز")
                    : toast.error("تعذر النسخ")
                }
              >
                {ws?.workspace?.code ?? "…"} <Copy className="size-4" />
              </button>
            </div>
            <LiquidButton
              variant="destructive"
              className="mt-2 w-full"
              onClick={() => {
                clear();
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
