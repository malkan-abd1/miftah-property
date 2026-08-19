import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { RequestForm, emptyRequest } from "@/components/RequestForm";
import { createRequest } from "@/lib/requests.functions";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/requests/new")({
  head: () => ({
    meta: [
      { title: "طلب عميل جديد — مفتاح" },
      { name: "description", content: "تسجيل طلب عميل جديد مع الميزانية والمنطقة والمواصفات المطلوبة." },
      { property: "og:title", content: "طلب عميل جديد — مفتاح" },
      { property: "og:description", content: "أضف طلب عميل جديد ليطابقه النظام مع عقارات المكتب." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewRequestPage,
});

function NewRequestPage() {
  const { session } = useSession();
  const navigate = useNavigate();
  const save = useServerFn(createRequest);
  const [saving, setSaving] = useState(false);

  return (
    <AppShell title="طلب عميل جديد">
      <RequestForm
        initial={emptyRequest}
        submitting={saving}
        submitLabel="حفظ الطلب"
        onSubmit={async (values) => {
          setSaving(true);
          try {
            const row = await save({ data: { token: session!.token, values } });
            toast.success(`تم حفظ الطلب رقم ${row.ref_no}`);
            navigate({ to: "/requests/$id", params: { id: row.id } });
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "تعذر حفظ الطلب");
          } finally {
            setSaving(false);
          }
        }}
      />
    </AppShell>
  );
}
