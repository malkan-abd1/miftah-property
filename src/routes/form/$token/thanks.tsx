import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";

export const Route = createFileRoute("/form/$token/thanks")({
  head: () => ({
    meta: [
      { title: "شكراً لك — مفتاح" },
      {
        name: "description",
        content: "تم استقبال طلبك بنجاح",
      },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const { token } = Route.useParams();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 p-6">
          <CheckCircle2 className="size-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold">شكراً لك!</h1>
        <p className="text-muted-foreground">
          تم استقبال طلبك بنجاح. سيتواصل معك فريق المكتب قريباً.
        </p>
      </div>

      <GlassCard className="w-full max-w-md">
        <GlassCardHeader>
          <GlassCardTitle>ماذا بعد؟</GlassCardTitle>
          <GlassCardDescription>
            سيقوم فريق المكتب بمراجعة طلبك والبحث عن أفضل العقارات المطابقة لمتطلباتك.
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              1
            </span>
            <p>ستتلقى رسالة عبر واتساب أو الهاتف بالعقارات المطابقة</p>
          </div>
          <div className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              2
            </span>
            <p>يمكنك الاستفسار والتواصل بشأن أي عقار يعجبك</p>
          </div>
          <div className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              3
            </span>
            <p>قد تحتاج لزيارة عقارات متعددة قبل أن تجد ما يناسبك</p>
          </div>
        </GlassCardContent>
      </GlassCard>

      <LiquidButton asChild>
        <a href="/">العودة إلى الرئيسية</a>
      </LiquidButton>
    </div>
  );
}
