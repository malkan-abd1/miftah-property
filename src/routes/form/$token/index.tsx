import { useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png.asset.json";
import { PublicClientForm } from "@/components/PublicClientForm";
import { getPublicForm, submitClientForm } from "@/lib/public-forms.functions";

export const Route = createFileRoute("/form/$token/")({
  head: () => ({
    meta: [
      { title: "استمارة طلب عقار — مفتاح" },
      { name: "description", content: "أدخل متطلباتك العقارية وسيتواصل معك المكتب بالعروض المطابقة." },
    ],
  }),
  component: PublicFormPage,
});

function PublicFormPage() {
  const { token } = useParams({ from: "/form/$token" });
  const navigate = useNavigate();
  const fetchForm = useServerFn(getPublicForm);
  const submit = useServerFn(submitClientForm);
  const [submitting, setSubmitting] = useState(false);

  const { data: form, isLoading, error } = useQuery({
    queryKey: ["public-form", token],
    queryFn: () => fetchForm({ data: { token } }),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <img src={logo.url} alt="مفتاح" className="size-20 rounded-2xl object-cover" />
        <h1 className="text-xl font-bold">الاستمارة غير متاحة</h1>
        <p className="text-sm text-muted-foreground">قد تكون الاستمارة غير صحيحة أو تم إيقافها.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <img src={logo.url} alt="مفتاح" className="size-16 rounded-2xl object-cover" />
        <h1 className="text-2xl font-bold">{form.title}</h1>
        {form.intro && <p className="text-sm text-muted-foreground">{form.intro}</p>}
      </div>

      <PublicClientForm
        submitting={submitting}
        onSubmit={async (values) => {
          setSubmitting(true);
          try {
            await submit({ data: { formToken: token, values } });
            toast.success("تم إرسال طلبك بنجاح");
            navigate({ to: "/form/$token/thanks", params: { token } });
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "تعذر إرسال الطلب");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}
