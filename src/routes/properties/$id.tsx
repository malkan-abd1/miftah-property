import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Pencil, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { deleteProperty, getProperty } from "@/lib/properties.functions";
import { useSession } from "@/lib/session";
import { copyText, formatPropertyForShare, shareText } from "@/lib/sharing";
import type { PropertyRecord } from "@/lib/options";

export const Route = createFileRoute("/properties/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل العقار — مفتاح" },
      { name: "description", content: "عرض كامل تفاصيل العقار مع الصور والسعر ومشاركة العرض عبر واتساب." },
      { property: "og:title", content: "تفاصيل العقار — مفتاح" },
      { property: "og:description", content: "تفاصيل العقار وبيانات المالك والمكتب وإمكانية المشاركة." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: PropertyDetailPage,
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

function PropertyDetailPage() {
  const { id } = useParams({ from: "/properties/$id" });
  const { session } = useSession();
  const navigate = useNavigate();
  const fetchOne = useServerFn(getProperty);
  const remove = useServerFn(deleteProperty);

  const { data, isLoading } = useQuery({
    queryKey: ["property", id, session?.token],
    queryFn: () => fetchOne({ data: { token: session!.token, id } }),
    enabled: !!session,
  });

  const p = data as PropertyRecord | undefined;

  return (
    <AppShell title={p ? `عرض #${p.ref_no}` : "تفاصيل العقار"}>
      {isLoading || !p ? (
        <p className="text-muted-foreground">جارٍ التحميل…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {!!p.photoUrls?.length && (
            <div className="flex snap-x gap-3 overflow-x-auto pb-2">
              {p.photoUrls.map((u, i) => (
                <img
                  key={i}
                  src={u}
                  alt={`${p.title ?? "عقار"} ${i + 1}`}
                  loading="lazy"
                  className="h-52 w-72 shrink-0 snap-start rounded-2xl object-cover"
                />
              ))}
            </div>
          )}
          {!!p.videoUrls?.length && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {p.videoUrls.map((u, i) => (
                <video key={i} src={u} controls className="h-52 w-72 shrink-0 rounded-2xl object-cover" />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <LiquidButton onClick={() => shareText(formatPropertyForShare(p))}>
              <Share2 /> مشاركة
            </LiquidButton>
            <LiquidButton
              onClick={async () =>
                (await copyText(formatPropertyForShare(p)))
                  ? toast.success("تم نسخ العرض")
                  : toast.error("تعذر النسخ")
              }
            >
              <Copy /> نسخ
            </LiquidButton>
            {session?.role === "manager" && (
              <>
                <Link to="/properties/$id/edit" params={{ id: p.id }}>
                  <LiquidButton>
                    <Pencil /> تعديل
                  </LiquidButton>
                </Link>
                <LiquidButton
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm("هل تريد حذف هذا العقار نهائياً؟")) return;
                    await remove({ data: { token: session.token, id: p.id } });
                    toast.success("تم حذف العقار");
                    navigate({ to: "/properties" });
                  }}
                >
                  <Trash2 /> حذف
                </LiquidButton>
              </>
            )}
          </div>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>{p.title || `${p.property_type ?? ""} ${p.area ?? ""}`}</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <Row label="الحالة" value={p.status} />
              <Row label="نوع الإعلان" value={p.listing_type} />
              <Row label="نوع العقار" value={p.property_type} />
              <Row label="نوع السند" value={p.deed_type} />
              <Row label="المحافظة" value={p.governorate} />
              <Row label="المنطقة" value={p.area} />
              <Row label="تفاصيل العنوان" value={p.address_details} />
              <Row label="الطابق" value={p.floor} />
              <Row label="عدد الغرف" value={p.rooms} />
              <Row label="المساحة" value={p.size ? `${p.size} م²` : null} />
              <Row label="الواجهة" value={p.facade} />
              <Row label="الاتجاه" value={p.direction} />
              <Row label="الإكساء" value={p.finishing} />
              <Row label="سطح" value={p.has_roof && "نعم"} />
              <Row label="كراج" value={p.has_roof_garage && "نعم"} />
              <Row label="حديقة" value={p.has_garden && "نعم"} />
              <Row label="دوبلكس" value={p.is_duplex && "نعم"} />
              <Row label="معلق" value={p.is_suspended && "نعم"} />
              <Row label="صالون" value={p.has_salon && "نعم"} />
              <Row label="مصعد 24" value={p.has_elevator24 && "نعم"} />
              <Row label="المزايا" value={p.features?.join(" • ")} />
              <Row label="نوع الملكية" value={p.ownership_type} />
              <Row label="عدد الشركاء" value={p.partners} />
              <Row label="ملاحظات الملكية" value={p.ownership_notes} />
              <Row
                label="السعر"
                value={p.price ? `${p.price.toLocaleString("en-US")} ${p.currency} ${p.price_period ?? ""}` : null}
              />
              <Row label="انتهاء الإيجار" value={p.rent_end_date} />
              <Row label="عرض مباشر" value={p.is_direct ? "نعم" : "لا"} />
              <Row label="اسم المالك" value={p.owner_name} />
              <Row label="هاتف المالك" value={p.owner_phone} />
              <Row label="اسم المكتب" value={p.office_name} />
              <Row label="هاتف المكتب" value={p.office_phone} />
              <Row label="فيسبوك" value={p.facebook_url} />
              <Row label="ملاحظات" value={p.notes} />
              <Row label="أضيف بواسطة" value={p.created_by} />
            </GlassCardContent>
          </GlassCard>
        </div>
      )}
    </AppShell>
  );
}
