export const LISTING_TYPES = ["بيع", "إيجار", "استثمار"] as const;
export const DEED_TYPES = ["طابو أخضر", "طابو زراعي", "حكم محكمة", "وكالة", "عقد بيع", "سجل مؤقت"] as const;
export const PROPERTY_TYPES = ["شقة", "منزل", "أرض", "محل", "مكتب", "فيلا", "مستودع", "مزرعة"] as const;
export const STATUSES = ["متاح", "مباع", "مؤجر", "محجوز"] as const;
export const GOVERNORATES = [
  "دمشق",
  "ريف دمشق",
  "حلب",
  "حمص",
  "حماة",
  "اللاذقية",
  "طرطوس",
  "درعا",
  "السويداء",
  "دير الزور",
  "الحسكة",
  "الرقة",
  "إدلب",
  "القنيطرة",
] as const;
export const FACADES = ["شمالية", "جنوبية", "شرقية", "غربية", "بحرية", "قبلية", "زاوية"] as const;
export const DIRECTIONS = ["أمامي", "خلفي", "جانبي", "على الشارع الرئيسي", "داخلي"] as const;
export const FINISHINGS = ["عظم", "نص تشطيب", "تشطيب عادي", "تشطيب جيد", "سوبر ديلوكس", "ديلوكس"] as const;
export const OWNERSHIP_TYPES = ["ملكية كاملة", "شراكة", "إرث", "وكالة"] as const;
export const CURRENCIES = ["USD", "SYP", "TRY", "EUR"] as const;
export const PRICE_PERIODS = ["إجمالي", "سنوي", "شهري", "يومي"] as const;

export const FEATURE_OPTIONS = [
  "سطح فقط",
  "سطح كراج فقط",
  "حديقة فقط",
  "دوبلكس فقط",
  "سطح مشترك",
  "استطراق خارجي",
  "مصعد",
  "مسبح",
  "إنترنت",
  "مصعد 24",
  "معلق",
] as const;

export type PropertyRecord = {
  id: string;
  workspace_id: string;
  ref_no: number;
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
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  photoUrls?: string[];
  videoUrls?: string[];
};

export const REQUEST_STATUSES = ["جديد", "قيد المتابعة", "مغلق", "تم التحويل لصفقة"] as const;
export const CONTACT_METHODS = ["واتساب", "اتصال", "زيارة"] as const;

export type ClientRequestRecord = {
  id: string;
  workspace_id: string;
  ref_no: number;
  client_name: string;
  client_phone: string | null;
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
  status: string;
  notes: string | null;
  next_followup: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type FollowupRecord = {
  id: string;
  request_id: string;
  note: string;
  actor_name: string | null;
  next_followup: string | null;
  created_at: string;
};

export type RequestValues = Omit<
  ClientRequestRecord,
  "id" | "workspace_id" | "ref_no" | "created_by" | "updated_by" | "created_at" | "updated_at"
>;
