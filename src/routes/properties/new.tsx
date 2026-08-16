import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PropertyForm, emptyValues } from "@/components/PropertyForm";
import { createProperty } from "@/lib/properties.functions";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/properties/new")({
  head: () => ({
    meta: [
      { title: "إضافة عقار — مفتاح" },
      { name: "description", content: "إضافة عقار جديد إلى قاعدة بيانات المكتب مع كل التفاصيل والصور." },
      { property: "og:title", content: "إضافة عقار — مفتاح" },
      { property: "og:description", content: "نموذج إضافة عقار جديد للمكتب العقاري." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: NewPropertyPage,
});

function NewPropertyPage() {
  const { session } = useSession();
  const navigate = useNavigate();
  const create = useServerFn(createProperty);

  return (
    <AppShell title="إضافة عقار" requireManager>
      <PropertyForm
        initial={emptyValues}
        submitLabel="حفظ العقار"
        onSubmit={async (values) => {
          const res = await create({ data: { token: session!.token, values } });
          toast.success(`تم حفظ العرض رقم ${res.ref_no}`);
          navigate({ to: "/properties/$id", params: { id: res.id } });
        }}
      />
    </AppShell>
  );
}
