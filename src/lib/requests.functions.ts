import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireManager, verifySession } from "./auth.server";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const requestSchema = z.object({
  client_name: z.string().min(1),
  client_phone: z.string().nullable().default(null),
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
  status: z.string().default("جديد"),
  notes: z.string().nullable().default(null),
  next_followup: z.string().nullable().default(null),
});

export const listRequests = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const s = await verifySession(data.token);
    const db = await admin();
    const { data: rows, error } = await db
      .from("client_requests")
      .select("*")
      .eq("workspace_id", s.ws)
      .order("ref_no", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getRequest = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string(), id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const s = await verifySession(data.token);
    const db = await admin();
    const [{ data: row, error }, { data: followups }, { data: props }] = await Promise.all([
      db
        .from("client_requests")
        .select("*")
        .eq("workspace_id", s.ws)
        .eq("id", data.id)
        .maybeSingle(),
      db
        .from("request_followups")
        .select("*")
        .eq("workspace_id", s.ws)
        .eq("request_id", data.id)
        .order("created_at", { ascending: false }),
      db.from("properties").select("*").eq("workspace_id", s.ws).eq("status", "متاح"),
    ]);
    if (error) throw new Error(error.message);
    if (!row) throw new Error("الطلب غير موجود");

    const matches = (props ?? [])
      .map((p) => {
        let score = 0;
        let total = 0;
        const hit = (cond: boolean | null) => {
          if (cond === null) return;
          total += 1;
          if (cond) score += 1;
        };
        hit(row.listing_type ? p.listing_type === row.listing_type : null);
        hit(row.property_type ? p.property_type === row.property_type : null);
        hit(row.governorate ? p.governorate === row.governorate : null);
        hit(row.area ? (p.area ?? "").includes(row.area) : null);
        hit(row.rooms ? (p.rooms ?? 0) >= row.rooms : null);
        hit(row.finishing ? p.finishing === row.finishing : null);
        hit(row.facade ? p.facade === row.facade : null);
        hit(
          row.min_price !== null || row.max_price !== null
            ? p.price !== null &&
                p.currency === row.currency &&
                (row.min_price === null || p.price >= row.min_price) &&
                (row.max_price === null || p.price <= row.max_price)
            : null,
        );
        hit(
          row.min_size !== null || row.max_size !== null
            ? p.size !== null &&
                (row.min_size === null || p.size >= row.min_size) &&
                (row.max_size === null || p.size <= row.max_size)
            : null,
        );
        if (row.features.length) {
          total += 1;
          const have = row.features.filter((f) => (p.features ?? []).includes(f)).length;
          score += have / row.features.length;
        }
        const pct = total ? Math.round((score / total) * 100) : 0;
        return { property: p, score: pct };
      })
      .filter((m) => m.score >= 50)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return { request: row, followups: followups ?? [], matches };
  });

export const createRequest = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string(), values: requestSchema }).parse(d))
  .handler(async ({ data }) => {
    const s = await verifySession(data.token);
    const db = await admin();
    const { data: row, error } = await db
      .from("client_requests")
      .insert({
        ...data.values,
        next_followup: data.values.next_followup || null,
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
      action: "إضافة طلب عميل",
      detail: `طلب رقم ${row.ref_no}`,
      request_id: row.id,
    });
    return row;
  });

export const updateRequest = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ token: z.string(), id: z.string(), values: requestSchema }).parse(d),
  )
  .handler(async ({ data }) => {
    const s = await verifySession(data.token);
    const db = await admin();
    const { data: row, error } = await db
      .from("client_requests")
      .update({
        ...data.values,
        next_followup: data.values.next_followup || null,
        updated_by: s.name,
      })
      .eq("id", data.id)
      .eq("workspace_id", s.ws)
      .select("id, ref_no")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("الطلب غير موجود");
    await db.from("activity_logs").insert({
      workspace_id: s.ws,
      actor_name: s.name,
      actor_role: s.role,
      action: "تعديل طلب عميل",
      detail: `طلب رقم ${row.ref_no}`,
      request_id: row.id,
    });
    return row;
  });

export const deleteRequest = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string(), id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const s = await requireManager(data.token);
    const db = await admin();
    const { error } = await db
      .from("client_requests")
      .delete()
      .eq("id", data.id)
      .eq("workspace_id", s.ws);
    if (error) throw new Error(error.message);
    await db.from("activity_logs").insert({
      workspace_id: s.ws,
      actor_name: s.name,
      actor_role: s.role,
      action: "حذف طلب عميل",
    });
    return { ok: true };
  });

export const addFollowup = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        token: z.string(),
        id: z.string(),
        note: z.string().min(1),
        next_followup: z.string().nullable().default(null),
        status: z.string().nullable().default(null),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const s = await verifySession(data.token);
    const db = await admin();
    const { data: req } = await db
      .from("client_requests")
      .select("id, ref_no")
      .eq("workspace_id", s.ws)
      .eq("id", data.id)
      .maybeSingle();
    if (!req) throw new Error("الطلب غير موجود");
    const { error } = await db.from("request_followups").insert({
      workspace_id: s.ws,
      request_id: data.id,
      note: data.note,
      actor_name: s.name,
      next_followup: data.next_followup || null,
    });
    if (error) throw new Error(error.message);
    await db
      .from("client_requests")
      .update({
        next_followup: data.next_followup || null,
        ...(data.status ? { status: data.status } : {}),
        updated_by: s.name,
      })
      .eq("id", data.id)
      .eq("workspace_id", s.ws);
    await db.from("activity_logs").insert({
      workspace_id: s.ws,
      actor_name: s.name,
      actor_role: s.role,
      action: "متابعة طلب عميل",
      detail: `طلب رقم ${req.ref_no}`,
      request_id: data.id,
    });
    return { ok: true };
  });

export const sendSelectedProperties = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        token: z.string(),
        id: z.string(),
        property_ids: z.array(z.string()).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const s = await verifySession(data.token);
    const db = await admin();
    const { data: req } = await db
      .from("client_requests")
      .select("id, ref_no, client_name")
      .eq("workspace_id", s.ws)
      .eq("id", data.id)
      .maybeSingle();
    if (!req) throw new Error("الطلب غير موجود");

    const { error } = await db
      .from("client_requests")
      .update({
        selected_property_ids: data.property_ids,
        sent_at: new Date().toISOString(),
        updated_by: s.name,
      })
      .eq("id", data.id)
      .eq("workspace_id", s.ws);
    if (error) throw new Error(error.message);

    await db.from("activity_logs").insert({
      workspace_id: s.ws,
      actor_name: s.name,
      actor_role: s.role,
      action: "إرسال عروض للعميل",
      detail: `طلب رقم ${req.ref_no} — ${data.property_ids.length} عقار`,
      request_id: data.id,
    });
    return { ok: true };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const s = await verifySession(data.token);
    const db = await admin();
    const ws = s.ws;

    const [props, reqs, followups, activity, forms] = await Promise.all([
      db.from("properties").select("id, status, created_at").eq("workspace_id", ws),
      db
        .from("client_requests")
        .select("id, status, created_at, next_followup, client_name, ref_no")
        .eq("workspace_id", ws)
        .order("created_at", { ascending: false }),
      db
        .from("request_followups")
        .select("id, request_id, next_followup, note, actor_name, created_at")
        .eq("workspace_id", ws)
        .order("created_at", { ascending: false })
        .limit(20),
      db
        .from("activity_logs")
        .select("id, action, actor_name, actor_role, detail, created_at")
        .eq("workspace_id", ws)
        .order("created_at", { ascending: false })
        .limit(10),
      db.from("request_forms").select("id, title, is_active").eq("workspace_id", ws),
    ]);

    const properties = (props.data ?? []) as { id: string; status: string; created_at: string }[];
    const requests = (reqs.data ?? []) as {
      id: string;
      status: string;
      created_at: string;
      next_followup: string | null;
      client_name: string;
      ref_no: number;
    }[];
    const allFollowups = (followups.data ?? []) as {
      id: string;
      request_id: string;
      next_followup: string | null;
      note: string;
      actor_name: string | null;
      created_at: string;
    }[];
    const activityRows = (activity.data ?? []) as {
      id: string;
      action: string;
      actor_name: string | null;
      actor_role: string | null;
      detail: string | null;
      created_at: string;
    }[];

    const today = new Date().toISOString().slice(0, 10);
    const pendingFollowups = allFollowups.filter(
      (f) => f.next_followup && f.next_followup <= today,
    );

    return {
      propertyCount: properties.length,
      availableCount: properties.filter((p) => p.status === "متاح").length,
      soldCount: properties.filter((p) => p.status === "مباع").length,
      rentedCount: properties.filter((p) => p.status === "مؤجر").length,
      requestCount: requests.length,
      newRequests: requests.filter((r) => r.status === "جديد").length,
      pendingFollowups,
      recentRequests: requests.slice(0, 5),
      recentActivity: activityRows,
      activeFormCount: (forms.data ?? []).filter((f: { is_active: boolean }) => f.is_active).length,
    };
  });
