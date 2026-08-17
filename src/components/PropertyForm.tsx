import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import {
  CURRENCIES,
  DEED_TYPES,
  DIRECTIONS,
  FACADES,
  FEATURE_OPTIONS,
  FINISHINGS,
  GOVERNORATES,
  LISTING_TYPES,
  OWNERSHIP_TYPES,
  PRICE_PERIODS,
  PROPERTY_TYPES,
  STATUSES,
  type PropertyRecord,
} from "@/lib/options";
import { uploadMedia } from "@/lib/properties.functions";
import { useSession } from "@/lib/session";

export type PropertyValues = {
  title: string | null;
  listing_type: string | null;
  deed_type: string | null;
  property_type: string | null;
  status: string;
  governorate: string | null;
  area: string | null;
  address_details: string | null;
  floor: number | null;
  has_roof: boolean;
  has_roof_garage: boolean;
  has_garden: boolean;
  is_duplex: boolean;
  is_suspended: boolean;
  has_salon: boolean;
  has_elevator24: boolean;
  rooms: number | null;
  size: number | null;
  facade: string | null;
  direction: string | null;
  finishing: string | null;
  features: string[];
  ownership_type: string | null;
  ownership_notes: string | null;
  partners: number | null;
  price: number | null;
  currency: string;
  price_period: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  office_name: string | null;
  office_phone: string | null;
  facebook_url: string | null;
  notes: string | null;
  rent_end_date: string | null;
  photos: string[];
  videos: string[];
  is_direct: boolean;
};

export const emptyValues: PropertyValues = {
  title: "",
  listing_type: LISTING_TYPES[0],
  deed_type: null,
  property_type: PROPERTY_TYPES[0],
  status: STATUSES[0],
  governorate: null,
  area: "",
  address_details: "",
  floor: null,
  has_roof: false,
  has_roof_garage: false,
  has_garden: false,
  is_duplex: false,
  is_suspended: false,
  has_salon: false,
  has_elevator24: false,
  rooms: null,
  size: null,
  facade: null,
  direction: null,
  finishing: null,
  features: [],
  ownership_type: null,
  ownership_notes: "",
  partners: null,
  price: null,
  currency: "USD",
  price_period: PRICE_PERIODS[0],
  owner_name: "",
  owner_phone: "",
  office_name: "",
  office_phone: "",
  facebook_url: "",
  notes: "",
  rent_end_date: null,
  photos: [],
  videos: [],
  is_direct: true,
};

export function toValues(p: PropertyRecord): PropertyValues {
  const { id, workspace_id, ref_no, created_at, updated_at, created_by, updated_by, photoUrls, videoUrls, ...rest } = p;
  void id, workspace_id, ref_no, created_at, updated_at, created_by, updated_by, photoUrls, videoUrls;
  return rest as PropertyValues;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <select
      className="glass-field appearance-none [&>option]:bg-background [&>option]:text-foreground"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">{placeholder ?? "— اختر —"}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <LiquidButton
      type="button"
      size="sm"
      variant={checked ? "primary" : "default"}
      onClick={() => onChange(!checked)}
      className={checked ? "" : "text-muted-foreground"}
    >
      {label}
    </LiquidButton>
  );

}

export function PropertyForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: PropertyValues;
  submitLabel: string;
  onSubmit: (values: PropertyValues) => Promise<void>;
}) {
  const [v, setV] = useState<PropertyValues>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const upload = useServerFn(uploadMedia);
  const { session } = useSession();

  const set = <K extends keyof PropertyValues>(k: K, val: PropertyValues[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));

  const num = (s: string) => (s === "" ? null : Number(s));

  async function handleFiles(files: FileList | null, kind: "photos" | "videos") {
    if (!files || !session) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const buf = new Uint8Array(await file.arrayBuffer());
        let bin = "";
        for (const b of buf) bin += String.fromCharCode(b);
        const res = await upload({
          data: {
            token: session.token,
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            dataBase64: btoa(bin),
          },
        });
        setPreviews((p) => ({ ...p, [res.path]: res.url }));
        setV((prev) => ({ ...prev, [kind]: [...prev[kind], res.path] }));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر رفع الملف");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(v);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر الحفظ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>معلومات أساسية</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="اسم / مرجع العرض">
            <input className="glass-field" value={v.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="نوع الإعلان">
            <Select value={v.listing_type} onChange={(x) => set("listing_type", x)} options={LISTING_TYPES} />
          </Field>
          <Field label="نوع السند">
            <Select value={v.deed_type} onChange={(x) => set("deed_type", x)} options={DEED_TYPES} />
          </Field>
          <Field label="نوع العقار">
            <Select value={v.property_type} onChange={(x) => set("property_type", x)} options={PROPERTY_TYPES} />
          </Field>
          <Field label="الحالة">
            <Select value={v.status} onChange={(x) => set("status", x ?? "متاح")} options={STATUSES} />
          </Field>
          <Field label="المحافظة">
            <Select value={v.governorate} onChange={(x) => set("governorate", x)} options={GOVERNORATES} />
          </Field>
          <Field label="المنطقة">
            <input className="glass-field" value={v.area ?? ""} onChange={(e) => set("area", e.target.value)} />
          </Field>
          <Field label="تفاصيل العنوان">
            <input
              className="glass-field"
              value={v.address_details ?? ""}
              onChange={(e) => set("address_details", e.target.value)}
            />
          </Field>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>المواصفات</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="grid gap-3 sm:grid-cols-3">
          <Field label="الطابق">
            <input
              className="glass-field"
              type="number"
              value={v.floor ?? ""}
              onChange={(e) => set("floor", num(e.target.value))}
            />
          </Field>
          <Field label="عدد الغرف">
            <input
              className="glass-field"
              type="number"
              value={v.rooms ?? ""}
              onChange={(e) => set("rooms", num(e.target.value))}
            />
          </Field>
          <Field label="المساحة (م²)">
            <input
              className="glass-field"
              type="number"
              value={v.size ?? ""}
              onChange={(e) => set("size", num(e.target.value))}
            />
          </Field>
          <Field label="الواجهة">
            <Select value={v.facade} onChange={(x) => set("facade", x)} options={FACADES} />
          </Field>
          <Field label="الاتجاه">
            <Select value={v.direction} onChange={(x) => set("direction", x)} options={DIRECTIONS} />
          </Field>
          <Field label="مستوى الإكساء">
            <Select value={v.finishing} onChange={(x) => set("finishing", x)} options={FINISHINGS} />
          </Field>
          <div className="sm:col-span-3 flex flex-wrap gap-2 pt-1">
            <Toggle label="سطح" checked={v.has_roof} onChange={(x) => set("has_roof", x)} />
            <Toggle label="كراج" checked={v.has_roof_garage} onChange={(x) => set("has_roof_garage", x)} />
            <Toggle label="حديقة" checked={v.has_garden} onChange={(x) => set("has_garden", x)} />
            <Toggle label="دوبلكس" checked={v.is_duplex} onChange={(x) => set("is_duplex", x)} />
            <Toggle label="معلق" checked={v.is_suspended} onChange={(x) => set("is_suspended", x)} />
            <Toggle label="صالون" checked={v.has_salon} onChange={(x) => set("has_salon", x)} />
            <Toggle label="مصعد 24" checked={v.has_elevator24} onChange={(x) => set("has_elevator24", x)} />
            <Toggle label="عرض مباشر" checked={v.is_direct} onChange={(x) => set("is_direct", x)} />
          </div>
          <div className="sm:col-span-3">
            <span className="text-sm text-muted-foreground">المزايا</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {FEATURE_OPTIONS.map((f) => (
                <Toggle
                  key={f}
                  label={f}
                  checked={v.features.includes(f)}
                  onChange={(on) =>
                    set("features", on ? [...v.features, f] : v.features.filter((x) => x !== f))
                  }
                />
              ))}
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>الملكية والسعر</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="grid gap-3 sm:grid-cols-3">
          <Field label="نوع الملكية">
            <Select value={v.ownership_type} onChange={(x) => set("ownership_type", x)} options={OWNERSHIP_TYPES} />
          </Field>
          <Field label="عدد الشركاء">
            <input
              className="glass-field"
              type="number"
              value={v.partners ?? ""}
              onChange={(e) => set("partners", num(e.target.value))}
            />
          </Field>
          <Field label="ملاحظات الملكية">
            <input
              className="glass-field"
              value={v.ownership_notes ?? ""}
              onChange={(e) => set("ownership_notes", e.target.value)}
            />
          </Field>
          <Field label="السعر">
            <input
              className="glass-field"
              type="number"
              value={v.price ?? ""}
              onChange={(e) => set("price", num(e.target.value))}
            />
          </Field>
          <Field label="العملة">
            <Select value={v.currency} onChange={(x) => set("currency", x ?? "USD")} options={CURRENCIES} />
          </Field>
          <Field label="فترة السعر">
            <Select value={v.price_period} onChange={(x) => set("price_period", x)} options={PRICE_PERIODS} />
          </Field>
          <Field label="تاريخ انتهاء الإيجار">
            <input
              className="glass-field"
              type="date"
              value={v.rent_end_date ?? ""}
              onChange={(e) => set("rent_end_date", e.target.value || null)}
            />
          </Field>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>جهات الاتصال</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="اسم المالك">
            <input className="glass-field" value={v.owner_name ?? ""} onChange={(e) => set("owner_name", e.target.value)} />
          </Field>
          <Field label="هاتف المالك">
            <input className="glass-field" value={v.owner_phone ?? ""} onChange={(e) => set("owner_phone", e.target.value)} />
          </Field>
          <Field label="اسم المكتب">
            <input className="glass-field" value={v.office_name ?? ""} onChange={(e) => set("office_name", e.target.value)} />
          </Field>
          <Field label="هاتف المكتب">
            <input className="glass-field" value={v.office_phone ?? ""} onChange={(e) => set("office_phone", e.target.value)} />
          </Field>
          <Field label="رابط الفيسبوك">
            <input className="glass-field" value={v.facebook_url ?? ""} onChange={(e) => set("facebook_url", e.target.value)} />
          </Field>
          <Field label="الملاحظات">
            <textarea
              className="glass-field min-h-24"
              value={v.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>الصور والفيديو</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <label className="glass-panel inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm">
              <Upload className="size-4" /> رفع صور
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files, "photos")}
              />
            </label>
            <label className="glass-panel inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm">
              <Upload className="size-4" /> رفع فيديو
              <input
                type="file"
                accept="video/*"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files, "videos")}
              />
            </label>
            {uploading && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex flex-wrap gap-2">
            {v.photos.map((p) => (
              <div key={p} className="relative size-20 overflow-hidden rounded-xl border border-[var(--glass-ring)]">
                {previews[p] ? (
                  <img src={previews[p]} alt="" className="size-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">صورة</div>
                )}
                <button
                  type="button"
                  onClick={() => set("photos", v.photos.filter((x) => x !== p))}
                  className="absolute left-1 top-1 rounded-full bg-foreground/70 p-1 text-background"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            {v.videos.map((p) => (
              <div
                key={p}
                className="relative flex size-20 items-center justify-center rounded-xl border border-[var(--glass-ring)] text-xs"
              >
                فيديو
                <button
                  type="button"
                  onClick={() => set("videos", v.videos.filter((x) => x !== p))}
                  className="absolute left-1 top-1 rounded-full bg-foreground/70 p-1 text-background"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>

      <LiquidButton type="submit" size="xl" disabled={busy || uploading} className="w-full">
        {busy ? <Loader2 className="animate-spin" /> : null} {submitLabel}
      </LiquidButton>
    </form>
  );
}
