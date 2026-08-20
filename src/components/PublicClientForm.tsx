import { useState } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import {
  CONTACT_METHODS,
  CURRENCIES,
  FACADES,
  FEATURE_OPTIONS,
  FINISHINGS,
  GOVERNORATES,
  LISTING_TYPES,
  PROPERTY_TYPES,
} from "@/lib/options";

export interface PublicFormValues {
  client_name: string;
  client_phone: string;
  contact_method: string | null;
  listing_type: string | null;
  property_type: string | null;
  governorate: string | null;
  area: string | null;
  min_price: number | null;
  max_price: number | null;
  currency: string;
  min_size: number | null;
  max_size: number | null;
  rooms: number | null;
  finishing: string | null;
  facade: string | null;
  features: string[];
  notes: string | null;
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
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
  placeholder: string;
}) {
  return (
    <select
      className="glass-field appearance-none [&>option]:bg-background [&>option]:text-foreground"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
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

export function PublicClientForm({
  submitting,
  onSubmit,
  formTitle,
  formIntro,
}: {
  submitting?: boolean;
  onSubmit: (values: PublicFormValues) => void;
  formTitle?: string;
  formIntro?: string;
}) {
  const [v, setV] = useState<PublicFormValues>({
    client_name: "",
    client_phone: "",
    contact_method: null,
    listing_type: null,
    property_type: null,
    governorate: null,
    area: null,
    min_price: null,
    max_price: null,
    currency: "USD",
    min_size: null,
    max_size: null,
    rooms: null,
    finishing: null,
    facade: null,
    features: [],
    notes: null,
  });

  const set = <K extends keyof PublicFormValues>(key: K, value: PublicFormValues[K]) =>
    setV((p) => ({ ...p, [key]: value }));
  const num = (s: string) => (s.trim() === "" ? null : Number(s));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      {/* Header */}
      {formTitle && (
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">{formTitle}</h1>
          {formIntro && <p className="mt-2 text-sm text-muted-foreground">{formIntro}</p>}
        </div>
      )}

      {/* Client Information */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>بيانات التواصل</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="grid gap-3 pt-5 sm:grid-cols-2">
          <Field label="اسمك" required>
            <input
              required
              className="glass-field"
              placeholder="أدخل اسمك الكامل"
              value={v.client_name}
              onChange={(e) => set("client_name", e.target.value)}
            />
          </Field>
          <Field label="رقم الهاتف / واتساب" required>
            <input
              required
              className="glass-field"
              inputMode="tel"
              placeholder="مثال: 0912345678"
              value={v.client_phone}
              onChange={(e) => set("client_phone", e.target.value)}
            />
          </Field>
          <Field label="طريقة التواصل المفضلة">
            <Select
              value={v.contact_method}
              onChange={(x) => set("contact_method", x)}
              options={CONTACT_METHODS}
              placeholder="اختر طريقة التواصل"
            />
          </Field>
        </GlassCardContent>
      </GlassCard>

      {/* Basic Requirements */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>المتطلبات الأساسية</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="grid gap-3 pt-5 sm:grid-cols-2">
          <Field label="نوع الإعلان">
            <Select
              value={v.listing_type}
              onChange={(x) => set("listing_type", x)}
              options={LISTING_TYPES}
              placeholder="بيع أو إيجار"
            />
          </Field>
          <Field label="نوع العقار">
            <Select
              value={v.property_type}
              onChange={(x) => set("property_type", x)}
              options={PROPERTY_TYPES}
              placeholder="اختر نوع العقار"
            />
          </Field>
          <Field label="المحافظة">
            <Select
              value={v.governorate}
              onChange={(x) => set("governorate", x)}
              options={GOVERNORATES}
              placeholder="اختر المحافظة"
            />
          </Field>
          <Field label="المنطقة / الحي">
            <input
              className="glass-field"
              placeholder="مثال: الروضة، المزة"
              value={v.area ?? ""}
              onChange={(e) => set("area", e.target.value || null)}
            />
          </Field>
        </GlassCardContent>
      </GlassCard>

      {/* Price Range */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>نطاق السعر</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="grid gap-3 pt-5 sm:grid-cols-2">
          <Field label="العملة">
            <Select
              value={v.currency}
              onChange={(x) => set("currency", x ?? "USD")}
              options={CURRENCIES}
              placeholder="USD"
            />
          </Field>
          <div />
          <Field label="الحد الأدنى للسعر">
            <input
              className="glass-field"
              inputMode="numeric"
              placeholder="ترك فارغ للبدون حد أدنى"
              value={v.min_price ?? ""}
              onChange={(e) => set("min_price", num(e.target.value))}
            />
          </Field>
          <Field label="الحد الأقصى للسعر">
            <input
              className="glass-field"
              inputMode="numeric"
              placeholder="ترك فارغ للبدون حد أقصى"
              value={v.max_price ?? ""}
              onChange={(e) => set("max_price", num(e.target.value))}
            />
          </Field>
        </GlassCardContent>
      </GlassCard>

      {/* Size & Rooms */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>المساحة والغرف</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="grid gap-3 pt-5 sm:grid-cols-2">
          <Field label="عدد الغرف (حد أدنى)">
            <input
              className="glass-field"
              inputMode="numeric"
              placeholder="مثال: 2"
              value={v.rooms ?? ""}
              onChange={(e) => set("rooms", num(e.target.value))}
            />
          </Field>
          <div />
          <Field label="الحد الأدنى للمساحة (م²)">
            <input
              className="glass-field"
              inputMode="numeric"
              placeholder="ترك فارغ للبدون حد أدنى"
              value={v.min_size ?? ""}
              onChange={(e) => set("min_size", num(e.target.value))}
            />
          </Field>
          <Field label="الحد الأقصى للمساحة (م²)">
            <input
              className="glass-field"
              inputMode="numeric"
              placeholder="ترك فارغ للبدون حد أقصى"
              value={v.max_size ?? ""}
              onChange={(e) => set("max_size", num(e.target.value))}
            />
          </Field>
        </GlassCardContent>
      </GlassCard>

      {/* Finishing & Facade */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>مستوى التشطيب والواجهة</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="grid gap-3 pt-5 sm:grid-cols-2">
          <Field label="مستوى الإكساء">
            <Select
              value={v.finishing}
              onChange={(x) => set("finishing", x)}
              options={FINISHINGS}
              placeholder="اختر المستوى"
            />
          </Field>
          <Field label="الواجهة">
            <Select
              value={v.facade}
              onChange={(x) => set("facade", x)}
              options={FACADES}
              placeholder="اختر الواجهة"
            />
          </Field>
        </GlassCardContent>
      </GlassCard>

      {/* Features */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>المزايا المطلوبة</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="space-y-3 pt-5">
          <div className="text-xs text-muted-foreground">اختر جميع المزايا التي تهمك</div>
          <div className="flex flex-wrap gap-2">
            {FEATURE_OPTIONS.map((f) => {
              const active = v.features.includes(f);
              return (
                <LiquidButton
                  key={f}
                  type="button"
                  size="sm"
                  variant={active ? "primary" : "default"}
                  onClick={() =>
                    set(
                      "features",
                      active ? v.features.filter((x) => x !== f) : [...v.features, f],
                    )
                  }
                >
                  {f}
                </LiquidButton>
              );
            })}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Notes */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>ملاحظات إضافية</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="pt-5">
          <Field label="أي متطلبات خاصة أو ملاحظات؟">
            <textarea
              className="glass-field min-h-24"
              placeholder="مثال: قريب من المدرسة، بها موقف سيارة..."
              value={v.notes ?? ""}
              onChange={(e) => set("notes", e.target.value || null)}
            />
          </Field>
        </GlassCardContent>
      </GlassCard>

      {/* Submit Button */}
      <LiquidButton
        type="submit"
        variant="primary"
        disabled={submitting}
        className="w-full"
      >
        {submitting ? "جاري التقديم…" : "إرسال الطلب"}
      </LiquidButton>
    </form>
  );
}
