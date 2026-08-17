import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Filter, Plus, Search, Share2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { listProperties } from "@/lib/properties.functions";
import { useSession } from "@/lib/session";
import {
  CURRENCIES,
  FACADES,
  FEATURE_OPTIONS,
  FINISHINGS,
  GOVERNORATES,
  LISTING_TYPES,
  PROPERTY_TYPES,
  STATUSES,
  type PropertyRecord,
} from "@/lib/options";
import { formatSearchResultsForShare, shareText } from "@/lib/sharing";

export const Route = createFileRoute("/properties/")({
  head: () => ({
    meta: [
      { title: "العقارات — مفتاح" },
      { name: "description", content: "قائمة عقارات المكتب مع بحث وفلاتر تفصيلية ومشاركة العروض." },
      { property: "og:title", content: "العقارات — مفتاح" },
      { property: "og:description", content: "بحث وفلترة عقارات المكتب ومشاركتها عبر واتساب." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PropertiesPage,
});

type Filters = {
  q: string;
  listing_type: string;
  property_type: string;
  status: string;
  governorate: string;
  area: string;
  facade: string;
  finishing: string;
  currency: string;
  minPrice: string;
  maxPrice: string;
  minSize: string;
  maxSize: string;
  rooms: string;
  floor: string;
  features: string[];
  flags: string[];
};

const FLAGS: { key: keyof PropertyRecord; label: string }[] = [
  { key: "has_roof", label: "سطح" },
  { key: "has_roof_garage", label: "كراج" },
  { key: "has_garden", label: "حديقة" },
  { key: "is_duplex", label: "دوبلكس" },
  { key: "is_suspended", label: "معلق" },
  { key: "has_salon", label: "صالون" },
  { key: "has_elevator24", label: "مصعد 24" },
  { key: "is_direct", label: "مباشر" },
];

const initialFilters: Filters = {
  q: "",
  listing_type: "",
  property_type: "",
  status: "",
  governorate: "",
  area: "",
  facade: "",
  finishing: "",
  currency: "",
  minPrice: "",
  maxPrice: "",
  minSize: "",
  maxSize: "",
  rooms: "",
  floor: "",
  features: [],
  flags: [],
};

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <LiquidButton
      type="button"
      size="sm"
      variant={active ? "primary" : "default"}
      onClick={onClick}
      className={active ? "" : "text-muted-foreground"}
    >
      {label}
    </LiquidButton>
  );

}

function SelectFilter({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <select
      className="glass-field appearance-none [&>option]:bg-background [&>option]:text-foreground"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function PropertiesPage() {
  const { session } = useSession();
  const fetchList = useServerFn(listProperties);
  const [f, setF] = useState<Filters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["properties", session?.token],
    queryFn: () => fetchList({ data: { token: session!.token } }),
    enabled: !!session,
  });

  const results = useMemo(() => {
    const rows = (data ?? []) as PropertyRecord[];
    const q = f.q.trim();
    return rows.filter((p) => {
      if (q) {
        const hay = [
          p.ref_no,
          p.title,
          p.area,
          p.address_details,
          p.governorate,
          p.owner_name,
          p.owner_phone,
          p.office_name,
          p.notes,
        ]
          .filter(Boolean)
          .join(" ");
        if (!hay.includes(q)) return false;
      }
      if (f.listing_type && p.listing_type !== f.listing_type) return false;
      if (f.property_type && p.property_type !== f.property_type) return false;
      if (f.status && p.status !== f.status) return false;
      if (f.governorate && p.governorate !== f.governorate) return false;
      if (f.area && !(p.area ?? "").includes(f.area)) return false;
      if (f.facade && p.facade !== f.facade) return false;
      if (f.finishing && p.finishing !== f.finishing) return false;
      if (f.currency && p.currency !== f.currency) return false;
      if (f.minPrice && (p.price ?? 0) < Number(f.minPrice)) return false;
      if (f.maxPrice && (p.price ?? Infinity) > Number(f.maxPrice)) return false;
      if (f.minSize && (p.size ?? 0) < Number(f.minSize)) return false;
      if (f.maxSize && (p.size ?? Infinity) > Number(f.maxSize)) return false;
      if (f.rooms && p.rooms !== Number(f.rooms)) return false;
      if (f.floor && p.floor !== Number(f.floor)) return false;
      if (f.features.some((x) => !(p.features ?? []).includes(x))) return false;
      if (f.flags.some((k) => !p[k as keyof PropertyRecord])) return false;
      return true;
    });
  }, [data, f]);

  async function shareAll() {
    if (!results.length) {
      toast.error("لا توجد نتائج للمشاركة");
      return;
    }
    await shareText(formatSearchResultsForShare(results));
  }

  return (
    <AppShell title="العقارات">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="glass-panel flex flex-1 items-center gap-2 rounded-full px-4">
            <Search className="size-4 text-muted-foreground" />
            <input
              className="w-full bg-transparent py-2.5 text-sm outline-none"
              placeholder="بحث برقم العرض أو المنطقة أو المالك…"
              value={f.q}
              onChange={(e) => setF({ ...f, q: e.target.value })}
            />
          </div>
          <LiquidButton size="icon" onClick={() => setShowFilters((s) => !s)} aria-label="الفلاتر">
            <Filter />
          </LiquidButton>
          <LiquidButton size="icon" onClick={shareAll} aria-label="مشاركة النتائج">
            <Share2 />
          </LiquidButton>
        </div>

        {showFilters && (
          <GlassCard>
            <GlassCardContent className="grid gap-3 pt-5 sm:grid-cols-3">
              <SelectFilter value={f.listing_type} onChange={(v) => setF({ ...f, listing_type: v })} options={LISTING_TYPES} placeholder="نوع الإعلان" />
              <SelectFilter value={f.property_type} onChange={(v) => setF({ ...f, property_type: v })} options={PROPERTY_TYPES} placeholder="نوع العقار" />
              <SelectFilter value={f.status} onChange={(v) => setF({ ...f, status: v })} options={STATUSES} placeholder="الحالة" />
              <SelectFilter value={f.governorate} onChange={(v) => setF({ ...f, governorate: v })} options={GOVERNORATES} placeholder="المحافظة" />
              <input className="glass-field" placeholder="المنطقة" value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} />
              <SelectFilter value={f.facade} onChange={(v) => setF({ ...f, facade: v })} options={FACADES} placeholder="الواجهة" />
              <SelectFilter value={f.finishing} onChange={(v) => setF({ ...f, finishing: v })} options={FINISHINGS} placeholder="الإكساء" />
              <SelectFilter value={f.currency} onChange={(v) => setF({ ...f, currency: v })} options={CURRENCIES} placeholder="العملة" />
              <input className="glass-field" type="number" placeholder="عدد الغرف" value={f.rooms} onChange={(e) => setF({ ...f, rooms: e.target.value })} />
              <input className="glass-field" type="number" placeholder="الطابق" value={f.floor} onChange={(e) => setF({ ...f, floor: e.target.value })} />
              <input className="glass-field" type="number" placeholder="أقل سعر" value={f.minPrice} onChange={(e) => setF({ ...f, minPrice: e.target.value })} />
              <input className="glass-field" type="number" placeholder="أعلى سعر" value={f.maxPrice} onChange={(e) => setF({ ...f, maxPrice: e.target.value })} />
              <input className="glass-field" type="number" placeholder="أقل مساحة" value={f.minSize} onChange={(e) => setF({ ...f, minSize: e.target.value })} />
              <input className="glass-field" type="number" placeholder="أعلى مساحة" value={f.maxSize} onChange={(e) => setF({ ...f, maxSize: e.target.value })} />
              <div className="sm:col-span-3 flex flex-wrap gap-2">
                {FLAGS.map((fl) => (
                  <Chip
                    key={fl.key as string}
                    label={fl.label}
                    active={f.flags.includes(fl.key as string)}
                    onClick={() =>
                      setF({
                        ...f,
                        flags: f.flags.includes(fl.key as string)
                          ? f.flags.filter((x) => x !== fl.key)
                          : [...f.flags, fl.key as string],
                      })
                    }
                  />
                ))}
              </div>
              <div className="sm:col-span-3 flex flex-wrap gap-2">
                {FEATURE_OPTIONS.map((x) => (
                  <Chip
                    key={x}
                    label={x}
                    active={f.features.includes(x)}
                    onClick={() =>
                      setF({
                        ...f,
                        features: f.features.includes(x)
                          ? f.features.filter((y) => y !== x)
                          : [...f.features, x],
                      })
                    }
                  />
                ))}
              </div>
              <LiquidButton
                type="button"
                variant="ghost"
                size="sm"
                className="sm:col-span-3"
                onClick={() => setF(initialFilters)}
              >
                إعادة ضبط الفلاتر
              </LiquidButton>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{isLoading ? "جارٍ التحميل…" : `${results.length} نتيجة`}</span>
          {session?.role === "manager" && (
            <Link to="/properties/new" className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground">
              <Plus className="size-4" /> إضافة عقار
            </Link>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((p) => (
            <Link key={p.id} to="/properties/$id" params={{ id: p.id }} className="block">
              <GlassCard className="h-full transition-transform hover:scale-[1.01]">
                <GlassCardContent className="flex gap-3 pt-5">
                  {p.photoUrls?.[0] ? (
                    <img src={p.photoUrls[0]} alt={p.title ?? "عقار"} loading="lazy" className="size-24 rounded-xl object-cover" />
                  ) : (
                    <div className="flex size-24 items-center justify-center rounded-xl bg-[var(--glass-tint)] text-xs text-muted-foreground">
                      بدون صورة
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>عرض #{p.ref_no}</span>
                      <span className="rounded-full bg-[var(--glass-tint)] px-2 py-0.5">{p.status}</span>
                    </div>
                    <div className="mt-1 truncate font-semibold">
                      {p.title || `${p.property_type ?? ""} ${p.area ?? ""}`}
                    </div>
                    <div className="truncate text-sm text-muted-foreground">
                      {[p.governorate, p.area].filter(Boolean).join(" - ")}
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      {p.price ? `${p.price.toLocaleString("en-US")} ${p.currency}` : "السعر غير محدد"}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
