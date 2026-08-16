import type { PropertyRecord } from "./options";

const line = (label: string, value: unknown) =>
  value === null || value === undefined || value === "" ? "" : `${label}: ${value}\n`;

export function formatPropertyForShare(p: PropertyRecord, withUrl = true) {
  const flags: string[] = [];
  if (p.has_roof) flags.push("سطح");
  if (p.has_roof_garage) flags.push("سطح كراج");
  if (p.has_garden) flags.push("حديقة");
  if (p.is_duplex) flags.push("دوبلكس");
  if (p.is_suspended) flags.push("معلق");
  if (p.has_salon) flags.push("صالون");
  if (p.has_elevator24) flags.push("مصعد 24");

  let msg = `🔑 عرض رقم ${p.ref_no}\n`;
  msg += line("النوع", p.property_type);
  msg += line("نوع الإعلان", p.listing_type);
  msg += line("الموقع", [p.governorate, p.area, p.address_details].filter(Boolean).join(" - "));
  msg += line("الطابق", p.floor);
  if (flags.length) msg += `المواصفات: ${flags.join(" • ")}\n`;
  msg += line("عدد الغرف", p.rooms);
  msg += line("المساحة", p.size ? `${p.size} م²` : "");
  msg += line("الواجهة", p.facade);
  msg += line("الاتجاه", p.direction);
  msg += line("الإكساء", p.finishing);
  if (p.features?.length) msg += `المزايا: ${p.features.join(" • ")}\n`;
  msg += line("السعر", p.price ? `${p.price.toLocaleString("en-US")} ${p.currency}${p.price_period ? ` (${p.price_period})` : ""}` : "");
  msg += line("الحالة", p.status);
  msg += line("ملاحظات", p.notes);
  msg += line("هاتف المالك", p.owner_phone);
  msg += line("المكتب", p.office_name);
  msg += line("هاتف المكتب", p.office_phone);
  if (withUrl && typeof window !== "undefined") {
    msg += `\n${window.location.origin}/properties/${p.id}`;
  }
  return msg.trim();
}

export function formatSearchResultsForShare(list: PropertyRecord[], withUrls = true) {
  const seen = new Set<string>();
  const unique = list.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
  return unique.map((p) => formatPropertyForShare(p, withUrls)).join("\n\n———\n\n");
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function shareText(text: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch {
      /* fall through to whatsapp */
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  return "whatsapp";
}
