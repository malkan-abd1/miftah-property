import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifySession, requireManager } from "./auth.server";
import type { RequestValues } from "./options";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function generateFormToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let token = "";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  for (const b of bytes) token += chars[b % chars.length];
  return token;
}

export const createRequestForm = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        token: z.string(),
        title: z.string().min(1),
        intro: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const s = await requireManager(data.token);
    const db = await admin();
    let token = generateFormToken();
    for (let i = 0; i < 5; i++) {
      const { data: exists } = await db.from("request_forms").select("id").eq("token", token).maybeSingle();
      if (!exists) break;
      token = generateFormToken();
    }
    const { data: form, error } = await db
      .from("request_forms")
      .insert({
        workspace_id: s.ws,
        token,
        title: data.title,
        intro: data.intro || null,
        is_active: true,
        created_by: s.name,
      })
      .select("id, token")
      .single();
    if (error) throw new Error(error.message);
    await db.from("activity_logs").insert({
      workspace_id: s.ws,
      actor_name: s.name,
      actor_role: s.role,
      action: "إنشاء استمارة عميل عام",
      detail: data.title,
    });
    return form;
  });

export const getPublicForm = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: form, error } = await db
      .from("request_forms")
      .select("id, workspace_id, title, intro, is_active")
      .eq("token", data.token)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!form) throw new Error("الاستمارة غير موجودة أو غير نشطة");
    return form;
  });

const clientFormSubmitSchema = z.object({
  client_name: z.string().min(1),
  client_phone: z.string().min(1),
  contact_method: z.string().nullable().default(null),
  listing_type: z.string().nullable().default(null),
  property_type: z.string().nullable().default(null),
  governorate: z.string().nullable().default(null),
  area: z.string().nullable().default(null),
  min_price: z.number().nullable().default(null),
  max_price: z.number().nullable().default(null),
  currency: z.string().default("USD"),
  min_size: z.number().nullable().default(null),
  max_size: z.number().nullable().default(null),
  rooms: z.number().nullable().default(null),
  finishing: z.string().nullable().default(null),
  facade: z.string().nullable().default(null),
  features: z.array(z.string()).default([]),
  notes: z.string().nullable().default(null),
});

export const submitClientForm = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ formToken: z.string(), values: clientFormSubmitSchema }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: form } = await db
      .from("request_forms")
      .select("id, workspace_id, is_active")
      .eq("token", data.formToken)
      .maybeSingle();
    if (!form || !form.is_active) throw new Error("الاستمارة غير متاحة");

    const { data: request, error } = await db
      .from("client_requests")
      .insert({
        workspace_id: form.workspace_id,
        form_id: form.id,
        source: "استمارة عامة",
        client_name: data.values.client_name,
        client_phone: data.values.client_phone,
        contact_method: data.values.contact_method,
        listing_type: data.values.listing_type,
        property_type: data.values.property_type,
        governorate: data.values.governorate,
        area: data.values.area,
        min_price: data.values.min_price,
        max_price: data.values.max_price,
        currency: data.values.currency,
        min_size: data.values.min_size,
        max_size: data.values.max_size,
        rooms: data.values.rooms,
        finishing: data.values.finishing,
        facade: data.values.facade,
        features: data.values.features,
        status: "جديد",
        notes: data.values.notes,
        created_by: "عميل - استمارة عامة",
        updated_by: "عميل - استمارة عامة",
      })
      .select("id, ref_no")
      .single();
    if (error) throw new Error(error.message);

    await db.from("activity_logs").insert({
      workspace_id: form.workspace_id,
      actor_name: "عميل",
      actor_role: "عام",
      action: "تقديم طلب عبر استمارة عامة",
      detail: `${data.values.client_name} - طلب رقم ${request.ref_no}`,
      request_id: request.id,
    });

    return { id: request.id, ref_no: request.ref_no };
  });

export const updateFormStatus = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ token: z.string(), id: z.string(), is_active: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    const s = await requireManager(data.token);
    const db = await admin();
    const { error } = await db
      .from("request_forms")
      .update({ is_active: data.is_active })
      .eq("id", data.id)
      .eq("workspace_id", s.ws);
    if (error) throw new Error(error.message);
    await db.from("activity_logs").insert({
      workspace_id: s.ws,
      actor_name: s.name,
      actor_role: s.role,
      action: data.is_active ? "تفعيل استمارة عميل" : "تعطيل استمارة عميل",
    });
    return { ok: true };
  });

export const listRequestForms = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const s = await requireManager(data.token);
    const db = await admin();
    const { data: forms, error } = await db
      .from("request_forms")
      .select("id, token, title, is_active, created_at, created_by")
      .eq("workspace_id", s.ws)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return forms ?? [];
  });

export const deleteRequestForm = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string(), id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const s = await requireManager(data.token);
    const db = await admin();
    const { error } = await db
      .from("request_forms")
      .delete()
      .eq("id", data.id)
      .eq("workspace_id", s.ws);
    if (error) throw new Error(error.message);
    await db.from("activity_logs").insert({
      workspace_id: s.ws,
      actor_name: s.name,
      actor_role: s.role,
      action: "حذف استمارة عميل",
    });
    return { ok: true };
  });
