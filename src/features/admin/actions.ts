"use server";

import { updateTag } from "next/cache";
import { SITE_CONTENT_TAG } from "@/features/content/queries";
import { isSectionKey, sectionSchemas } from "@/features/content/schema";
import { deleteMedia, UploadError } from "@/features/media/service";
import { getAdminSession } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const SESSION_EXPIRED: ActionResult = { ok: false, error: "Sesión vencida. Volvé a ingresar." };

export async function saveSection(key: string, data: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return SESSION_EXPIRED;
  if (!isSectionKey(key)) return { ok: false, error: "Sección desconocida" };

  const parsed = sectionSchemas[key].safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      fieldErrors[path] ??= issue.message;
    }
    return { ok: false, error: "Revisá los campos marcados", fieldErrors };
  }

  await getPrisma().section.upsert({
    where: { key },
    create: { key, content: parsed.data, updatedBy: session.user.email },
    update: { content: parsed.data, updatedBy: session.user.email },
  });
  updateTag(SITE_CONTENT_TAG);
  return { ok: true };
}

export async function resetSection(key: string): Promise<ActionResult> {
  if (!(await getAdminSession())) return SESSION_EXPIRED;
  if (!isSectionKey(key)) return { ok: false, error: "Sección desconocida" };
  await getPrisma().section.deleteMany({ where: { key } });
  updateTag(SITE_CONTENT_TAG);
  return { ok: true };
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  if (!(await getAdminSession())) return SESSION_EXPIRED;
  const rows = await getPrisma().section.findMany({ select: { content: true } });
  const stored = JSON.stringify(rows.map((row) => row.content));
  try {
    await deleteMedia(id, (src) => stored.includes(src));
    return { ok: true };
  } catch (error) {
    if (error instanceof UploadError) return { ok: false, error: error.message };
    throw error;
  }
}
