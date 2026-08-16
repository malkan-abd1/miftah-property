import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PropertyForm, toValues } from "@/components/PropertyForm";
import { getProperty, updateProperty } from "@/lib/properties.functions";
import { useSession } from "@/lib/session";
import type { PropertyRecord } from "@/lib/options";

export const Route = createFileRoute("/properties/$id/edit")({
  head: () => ({
    meta: [
      { title: "تعديل العقار — مفتاح" },
      { name: "description", content: "تعديل بيانات العقار وصوره وسعره داخل مساحة عمل المكتب." },
      { property: "og:title", content: "تعديل العقار — مفتاح" },
      { property: "og:description", content: "تحديث تفاصيل العقار في نظام مفتاح." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: EditPropertyPage,
});

function EditPropertyPage() {
  const { id } = useParams({ from: "/properties/$id/edit" });
  const { session } = useSession();
  const navigate = useNavigate();
  const fetchOne = useServerFn(getProperty);
  const update = useServerFn(updateProperty);

  const { data } = useQuery({
    queryKey: ["property", id, session?.token],
    queryFn: () => fetchOne({ data: { token: session!.token, id } }),
    enabled: !!session,
  });

  return (
    <AppShell title="تعديل العقار" requireManager>
      {!data ? (
        <p className="text-muted-foreground">جارٍ التحميل…</p>
      ) : (
        <PropertyForm
          initial={toValues(data as PropertyRecord)}
          submitLabel="حفظ التعديلات"
          onSubmit={async (values) => {
            await update({ data: { token: session!.token, id, values } });
            toast.success("تم حفظ التعديلات");
            navigate({ to: "/properties/$id", params: { id } });
          }}
        />
      )}
    </AppShell>
  );
}
