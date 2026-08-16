import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png.asset.json";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import { createWorkspace, login } from "@/lib/workspace.functions";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مفتاح — إدارة العقارات للمكاتب العقارية" },
      {
        name: "description",
        content:
          "مفتاح: نظام داخلي لإدارة عقارات المكاتب العقارية مع مساحات عمل منفصلة وصلاحيات مدير وموظف.",
      },
      { property: "og:title", content: "مفتاح — إدارة العقارات" },
      {
        property: "og:description",
        content: "نظام إدارة عقارات للمكاتب العقارية مع صلاحيات مدير وموظف ومشاركة العروض عبر واتساب.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, ready, setSession } = useSession();
  const [mode, setMode] = useState<"login" | "create">("login");
  const [busy, setBusy] = useState(false);
  const doLogin = useServerFn(login);
  const doCreate = useServerFn(createWorkspace);

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [wsName, setWsName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");

  useEffect(() => {
    if (ready && session) navigate({ to: "/properties", replace: true });
  }, [ready, session, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await doLogin({ data: { code, password, displayName } });
      setSession(res);
      navigate({ to: "/properties", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر تسجيل الدخول");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await doCreate({
        data: { name: wsName, ownerName, managerPassword, employeePassword },
      });
      setSession(res);
      toast.success(`تم إنشاء المكتب — رمز الدخول: ${res.code}`);
      navigate({ to: "/settings", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر إنشاء المكتب");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="flex flex-col items-center gap-3">
        <img src={logo.url} alt="شعار مفتاح" className="size-24 rounded-3xl object-cover shadow-[var(--glass-shadow)]" />
        <h1 className="text-3xl font-black tracking-tight">مفتاح</h1>
        <p className="text-sm text-muted-foreground">نظام إدارة العقارات للمكاتب العقارية</p>
      </div>

      <GlassCard className="w-full max-w-md">
        <GlassCardHeader>
          <GlassCardTitle>{mode === "login" ? "تسجيل الدخول" : "إنشاء مكتب جديد"}</GlassCardTitle>
          <GlassCardDescription>
            {mode === "login"
              ? "أدخل رمز المكتب وكلمة المرور الخاصة بدورك"
              : "أنشئ مساحة عمل خاصة بمكتبك مع كلمتَي مرور"}
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input
                className="glass-field text-center text-lg tracking-[0.35em]"
                placeholder="رمز المكتب"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
              <input
                className="glass-field"
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                className="glass-field"
                placeholder="اسمك (اختياري — يظهر في السجل)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <LiquidButton type="submit" size="xl" disabled={busy} className="mt-2 w-full">
                {busy ? <Loader2 className="animate-spin" /> : <KeyRound />} دخول
              </LiquidButton>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <input
                className="glass-field"
                placeholder="اسم المكتب"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                required
              />
              <input
                className="glass-field"
                placeholder="اسمك (المدير الأول)"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
              />
              <input
                className="glass-field"
                type="password"
                placeholder="كلمة مرور المدير"
                value={managerPassword}
                onChange={(e) => setManagerPassword(e.target.value)}
                required
              />
              <input
                className="glass-field"
                type="password"
                placeholder="كلمة مرور الموظف"
                value={employeePassword}
                onChange={(e) => setEmployeePassword(e.target.value)}
                required
              />
              <LiquidButton type="submit" size="xl" disabled={busy} className="mt-2 w-full">
                {busy ? <Loader2 className="animate-spin" /> : null} إنشاء المكتب
              </LiquidButton>
            </form>
          )}
        </GlassCardContent>
      </GlassCard>

      <button
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        onClick={() => setMode(mode === "login" ? "create" : "login")}
      >
        {mode === "login" ? "ليس لديك مكتب؟ أنشئ مساحة عمل جديدة" : "لديك رمز مكتب؟ سجّل الدخول"}
      </button>
    </div>
  );
}
