import type { ReadableStream } from "node:stream/web";
import { checkContentLength, isMediaKind } from "@/features/media/policy";
import { ingestUpload, UploadError } from "@/features/media/service";
import { getAdminSession } from "@/lib/auth";
import { env } from "@/lib/env";

function error(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

function decodeFileName(header: string | null): string {
  try {
    return decodeURIComponent(header ?? "archivo").slice(0, 255);
  } catch {
    return "archivo";
  }
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(env().BETTER_AUTH_URL).origin) {
    return error(403, "Origen no permitido");
  }
  if (!(await getAdminSession())) return error(401, "Sesión vencida. Volvé a ingresar.");

  const kind = new URL(request.url).searchParams.get("kind");
  if (!isMediaKind(kind)) return error(400, "Tipo de archivo no indicado");

  const length = checkContentLength(request.headers.get("content-length"), kind);
  if (!length.ok) {
    const messages = {
      400: "El archivo está vacío",
      411: "Falta el tamaño del archivo",
      413:
        kind === "image"
          ? "La imagen supera el máximo de 20 MB"
          : "El video supera el máximo de 300 MB",
    };
    return error(length.status, messages[length.status]);
  }
  if (!request.body) return error(400, "El archivo está vacío");

  const originalName = decodeFileName(request.headers.get("x-file-name"));

  try {
    const item = await ingestUpload({
      kind,
      body: request.body as ReadableStream<Uint8Array>,
      originalName,
    });
    return Response.json(item, { status: 201 });
  } catch (caught) {
    if (caught instanceof UploadError) return error(caught.status, caught.message);
    console.error("[media] upload failed", caught);
    return error(500, "No se pudo guardar el archivo");
  }
}
