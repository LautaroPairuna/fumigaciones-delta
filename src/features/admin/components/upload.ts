import type { MediaItem } from "@/features/media/service";

export type UploadKind = "image" | "video";

export const ACCEPT: Record<UploadKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/avif",
  video: "video/mp4,video/quicktime,video/webm,video/x-matroska,.mkv,.mov",
};

// XHR instead of fetch: fetch has no upload progress, and videos can take a while.
export function uploadMedia(
  file: File,
  kind: UploadKind,
  onProgress: (fraction: number) => void,
): Promise<MediaItem> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `/api/admin/media?kind=${kind}`);
    request.setRequestHeader("Content-Type", "application/octet-stream");
    request.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onload = () => {
      let body: unknown = null;
      try {
        body = JSON.parse(request.responseText);
      } catch {
        // Non-JSON error page (proxy limit, crash): fall through to the generic message.
      }
      if (request.status === 201 && body) {
        resolve(body as MediaItem);
        return;
      }
      const message =
        body && typeof body === "object" && "error" in body && typeof body.error === "string"
          ? body.error
          : request.status === 413
            ? "El archivo es demasiado grande"
            : "No se pudo subir el archivo";
      reject(new Error(message));
    };
    request.onerror = () => reject(new Error("Se cortó la conexión durante la subida"));
    request.send(file);
  });
}
