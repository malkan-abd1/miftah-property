import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  generateCode,
  hashPassword,
  requireManager,
  signSession,
  verifyPassword,
  verifySession,
} from "./auth.server";

const SESSION_DAYS = 30;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const createWorkspace = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        name: z.string().min(2),
        ownerName: z.string().min(1),
        managerPassword: z.string().min(4),
        employeePassword: z.string().min(4),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (data.managerPassword === data.employeePassword) {
      throw new Error("يجب أن تكون كلمة مرور المدير مختلفة عن كلمة مرور الموظف");
    }
    const db = await admin();
    let code = generateCode();
    for (let i = 0; i < 5; i++) {
      const { data: exists } = await db.from("workspaces").select("id").eq("code", code).maybeSingle();
      if (!exists) break;
      code = generateCode();
    }
    const { data: ws, error } = await db
      .from("workspaces")
      .insert({
        name: data.name,
        code,
        owner_name: data.ownerName,
        manager_hash: await hashPassword(data.managerPassword),
        employee_hash: await hashPassword(data.employeePassword),
      })
      .select("id, name, code")
      .single();
    if (error) throw new Error(error.message);

    const token = await signSession({
      ws: ws.id,
      code: ws.code,
      role: "manager",
      name: data.ownerName,
      exp: Date.now() + SESSION_DAYS * 86400000,
    });
    return { token, code: ws.code, workspaceName: ws.name, role: "manager" as const, name: data.ownerName };
  });

export const login = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        code: z.string().min(4),
        password: z.string().min(1),
        displayName: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: ws } = await db
      .from("workspaces")
      .select("id, name, code, manager_hash, employee_hash")
      .eq("code", data.code.trim().toUpperCase())
      .maybeSingle();
    if (!ws) throw new Error("رمز المكتب غير صحيح");

    let role: "manager" | "employee" | null = null;
    if (await verifyPassword(data.password, ws.manager_hash)) role = "manager";
    else if (await verifyPassword(data.password, ws.employee_hash)) role = "employee";
    if (!role) throw new Error("كلمة المرور غير صحيحة");

    const name = (data.displayName || "").trim() || (role === "manager" ? "مدير" : "موظف");
    const token = await signSession({
      ws: ws.id,
      code: ws.code,
      role,
      name,
      exp: Date.now() + SESSION_DAYS * 86400000,
    });
    await db.from("activity_logs").insert({
      workspace_id: ws.id,
      actor_name: name,
      actor_role: role,
      action: "تسجيل دخول",
    });
    return { token, code: ws.code, workspaceName: ws.name, role, name };
  });

export const getWorkspace = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const s = await verifySession(data.token);
    const db = await admin();
    const { data: ws } = await db
      .from("workspaces")
      .select("id, name, code, owner_name, created_at")
      .eq("id", s.ws)
      .single();
    return { workspace: ws, role: s.role, name: s.name };
  });

export const updateWorkspaceSettings = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        token: z.string(),
        name: z.string().min(2).optional(),
        managerPassword: z.string().min(4).optional(),
        employeePassword: z.string().min(4).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const s = await requireManager(data.token);
    const db = await admin();
    const patch: { name?: string; manager_hash?: string; employee_hash?: string } = {};
    if (data.name) patch["name"] = data.name;
    if (data.managerPassword) patch["manager_hash"] = await hashPassword(data.managerPassword);
    if (data.employeePassword) patch["employee_hash"] = await hashPassword(data.employeePassword);
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await db.from("workspaces").update(patch).eq("id", s.ws);
    if (error) throw new Error(error.message);
    await db.from("activity_logs").insert({
      workspace_id: s.ws,
      actor_name: s.name,
      actor_role: s.role,
      action: "تعديل إعدادات المكتب",
      detail: Object.keys(patch).join(", "),
    });
    return { ok: true };
  });

export const getActivity = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const s = await requireManager(data.token);
    const db = await admin();
    const { data: rows } = await db
      .from("activity_logs")
      .select("*")
      .eq("workspace_id", s.ws)
      .order("created_at", { ascending: false })
      .limit(100);
    return rows ?? [];
  });
