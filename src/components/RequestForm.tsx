import { useState } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import {
  CONTACT_METHODS,
  CURRENCIES,
  FACADES,
  FEATURE_OPTIONS,
  FINISHINGS,
  GOVERNORATES,
  LISTING_TYPES,
  PROPERTY_TYPES,
  REQUEST_STATUSES,
  type RequestValues,
} from "@/lib/options";

export const emptyRequest: RequestValues = {
  client_name: "",
  client_phone: null,
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
  status: "جديد",
  notes: null,
  next_followup: null,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
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

export function RequestForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial: RequestValues;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (values: RequestValues) => void;
}) {
  const [v, setV] = useState<RequestValues>(initial);
  const set = <K extends keyof RequestValues>(key: K, value: RequestValues[K]) =>
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
      <GlassCard>
        <GlassCardContent className="grid gap-3 pt-5 sm:grid-cols-2">
          <Field label="اسم العميل">
            <input
              required
              className="glass-field"
              value={v.client_name}
              onChange={(e) => set("client_name", e.target.value)}
            />
          </Field>
          <Field label="هاتف العميل">
            <input
              className="glass-field"
              inputMode="tel"
              value={v.client_phone ?? ""}
              onChange={(e) => set("client_phone", e.target.value || null)}
            />
          </Field>
          <Field label="طريقة التواصل">
            <Select
              value={v.contact_method}
              onChange={(x) => set("contact_method", x)}
              options={CONTACT_METHODS}
              placeholder="اختر"
            />
          </Field>
          <Field label="حالة الطلب">
            <Select
              value={v.status}
              onChange={(x) => set("status", x ?? "جديد")}
              options={REQUEST_STATUSES}
              placeholder="جديد"
            />
          </Field>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardContent className="grid gap-3 pt-5 sm:grid-cols-2">
          <Field label="نوع الإعلان">
            <Select
              value={v.listing_type}
              onChange={(x) => set("listing_type", x)}
              options={LISTING_TYPES}
              placeholder="الكل"
            />
          </Field>
          <Field label="نوع العقار">
            <Select
              value={v.property_type}
              onChange={(x) => set("property_type", x)}
              options={PROPERTY_TYPES}
              placeholder="الكل"
            />
          </Field>
          <Field label="المحافظة">
            <Select
              value={v.governorate}
              onChange={(x) => set("governorate", x)}
              options={GOVERNORATES}
              placeholder="الكل"
            />
          </Field>
          <Field label="المنطقة">
            <input
              className="glass-field"
              value={v.area ?? ""}
              onChange={(e) => set("area", e.target.value || null)}
            />
          </Field>
          <Field label="العملة">
            <Select
              value={v.currency}
              onChange={(x) => set("currency", x ?? "USD")}
              options={CURRENCIES}
              placeholder="USD"
            />
          </Field>
          <Field label="عدد الغرف (حد أدنى)">
            <input
              className="glass-field"
              inputMode="numeric"
              value={v.rooms ?? ""}
              onChange={(e) => set("rooms", num(e.target.value))}
            />
          </Field>
          <Field label="أدنى سعر">
            <input
              className="glass-field"
              inputMode="numeric"
              value={v.min_price ?? ""}
              onChange={(e) => set("min_price", num(e.target.value))}
            />
          </Field>
          <Field label="أعلى سعر">
            <input
              className="glass-field"
              inputMode="numeric"
              value={v.max_price ?? ""}
              onChange={(e) => set("max_price", num(e.target.value))}
            />
          </Field>
          <Field label="أدنى مساحة (م²)">
            <input
              className="glass-field"
              inputMode="numeric"
              value={v.min_size ?? ""}
              onChange={(e) => set("min_size", num(e.target.value))}
            />
          </Field>
          <Field label="أعلى مساحة (م²)">
            <input
              className="glass-field"
              inputMode="numeric"
              value={v.max_size ?? ""}
              onChange={(e) => set("max_size", num(e.target.value))}
            />
          </Field>
          <Field label="الإكساء">
            <Select
              value={v.finishing}
              onChange={(x) => set("finishing", x)}
              options={FINISHINGS}
              placeholder="الكل"
            />
          </Field>
          <Field label="الواجهة">
            <Select
              value={v.facade}
              onChange={(x) => set("facade", x)}
              options={FACADES}
              placeholder="الكل"
            />
          </Field>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardContent className="space-y-3 pt-5">
          <div className="text-sm text-muted-foreground">المزايا المطلوبة</div>
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
          <Field label="موعد المتابعة القادمة">
            <input
              type="date"
              className="glass-field"
              value={v.next_followup ?? ""}
              onChange={(e) => set("next_followup", e.target.value || null)}
            />
          </Field>
          <Field label="ملاحظات">
            <textarea
              className="glass-field min-h-24"
              value={v.notes ?? ""}
              onChange={(e) => set("notes", e.target.value || null)}
            />
          </Field>
        </GlassCardContent>
      </GlassCard>

      <LiquidButton type="submit" variant="primary" disabled={submitting} className="w-full">
        {submitting ? "جارٍ الحفظ…" : submitLabel}
      </LiquidButton>
    </form>
  );
}
