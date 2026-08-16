import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireManager, verifySession } from "./auth.server";

const BUCKET = "property-media";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function signPaths(paths: string[]) {
  if (!paths.length) return [];
  const db = await admin();
  const { data } = await db.storage.from(BUCKET).createSignedUrls(paths, 60 * 60 * 24 * 7);
  return (data ?? []).map((d) => d.signedUrl ?? "");
}

async function withUrls<T extends { photos: string[]; videos: string[] }>(rows: T[]) {
  const allPhotos = rows.flatMap((r) => r.photos ?? []);
  const allVideos = rows.flatMap((r) => r.videos ?? []);
  const photoUrls = await signPaths(allPhotos);
  const videoUrls = await signPaths(allVideos);
  const pMap = new Map(allPhotos.map((p, i) => [p, photoUrls[i] ?? ""]));
  const vMap = new Map(allVideos.map((p, i) => [p, videoUrls[i] ?? ""]));
  return rows.map((r) => ({
    ...r,
    photoUrls: (r.photos ?? []).map((p) => pMap.get(p) ?? ""),
    videoUrls: (r.videos ?? []).map((p) => vMap.get(p) ?? ""),
  }));
}

export const listProperties = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const s = await verifySession(data.token);
    const db = await admin();
    const { data: rows, error } = await db
      .from("properties")
      .select("*")
      .eq("workspace_id", s.ws)
      .order("ref_no", { ascending: false });
    if (error) throw new Error(error.message);
    return withUrls(rows ?? []);
  });

export const getProperty = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string(), id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const s = await verifySession(data.token);
    const db = await admin();
    const { data: row, error } = await db
      .from("properties")
      .select("*")
      .eq("workspace_id", s.ws)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("العقار غير موجود");
    return (await withUrls([row]))[0]!;
  });

const propertySchema = z.object({
  title: z.string().nullable().optional(),
  listing_type: z.string().nullable().optional(),
  deed_type: z.string().nullable().optional(),
  property_type: z.string().nullable().optional(),
  status: z.string().default("متاح"),
  governorate: z.string().nullable().optional(),
  area: z.string().nullable().optional(),
  address_details: z.string().nullable().optional(),
  floor: z.number().nullable().optional(),
  has_roof: z.boolean().default(false),
  has_roof_garage: z.boolean().default(false),
  has_garden: z.boolean().default(false),
  is_duplex: z.boolean().default(false),
  is_suspended: z.boolean().default(false),
  has_salon: z.boolean().default(false),
  has_elevator24: z.boolean().default(false),
  rooms: z.number().nullable().optional(),
  size: z.number().nullable().optional(),
  facade: z.string().nullable().optional(),
  direction: z.string().nullable().optional(),
  finishing: z.string().nullable().optional(),
  features: z.array(z.string()).default([]),
  ownership_type: z.string().nullable().optional(),
  ownership_notes: z.string().nullable().optional(),
  partners: z.number().nullable().optional(),
  price: z.number().nullable().optional(),
  currency: z.string().default("USD"),
  price_period: z.string().nullable().optional(),
  owner_name: z.string().nullable().optional(),
  owner_phone: z.string().nullable().optional(),
  office_name: z.string().nullable().optional(),
  office_phone: z.string().nullable().optional(),
  facebook_url: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  rent_end_date: z.string().nullable().optional(),
  photos: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  is_direct: z.boolean().default(true),
});

export const createProperty = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string(), values: propertySchema }).parse(d))
  .handler(async ({ data }) => {
    const s = await requireManager(data.token);
    const db = await admin();
    const { data: row, error } = await db
      .from("properties")
      .insert({
        ...data.values,
        rent_end_date: data.values.rent_end_date || null,
        workspace_id: s.ws,
        created_by: s.name,
        updated_by: s.name,
      })
      .select("id, ref_no")
      .single();
    if (error) throw new Error(error.message);
    await db.from("activity_logs").insert({
      workspace_id: s.ws,
      actor_name: s.name,
      actor_role: s.role,
      action: "إضافة عقار",
      detail: `عرض رقم ${row.ref_no}`,
      property_id: row.id,
    });
    return row;
  });

export const updateProperty = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ token: z.string(), id: z.string(), values: propertySchema }).parse(d),
  )
  .handler(async ({ data }) => {
    const s = await requireManager(data.token);
    const db = await admin();
    const { data: row, error } = await db
      .from("properties")
      .update({
        ...data.values,
        rent_end_date: data.values.rent_end_date || null,
        updated_by: s.name,
      })
      .eq("id", data.id)
      .eq("workspace_id", s.ws)
      .select("id, ref_no")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("العقار غير موجود");
    await db.from("activity_logs").insert({
      workspace_id: s.ws,
      actor_name: s.name,
      actor_role: s.role,
      action: "تعديل عقار",
      detail: `عرض رقم ${row.ref_no}`,
      property_id: row.id,
    });
    return row;
  });

export const deleteProperty = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string(), id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const s = await requireManager(data.token);
    const db = await admin();
    const { error } = await db
      .from("properties")
      .delete()
      .eq("id", data.id)
      .eq("workspace_id", s.ws);
    if (error) throw new Error(error.message);
    await db.from("activity_logs").insert({
      workspace_id: s.ws,
      actor_name: s.name,
      actor_role: s.role,
      action: "حذف عقار",
    });
    return { ok: true };
  });

export const uploadMedia = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        token: z.string(),
        fileName: z.string(),
        contentType: z.string(),
        dataBase64: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const s = await requireManager(data.token);
    const db = await admin();
    const bin = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
    const safe = data.fileName.replace(/[^\w.-]+/g, "_");
    const path = `${s.ws}/${crypto.randomUUID()}-${safe}`;
    const { error } = await db.storage
      .from(BUCKET)
      .upload(path, bin, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    const [url] = await signPaths([path]);
    return { path, url: url ?? "" };
  });
