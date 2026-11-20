import type { Metadata } from "next";
import { MediaLibrary } from "@/features/admin/components/media-library";
import { listMedia } from "@/features/media/service";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Imágenes y videos" };

export default async function MediaPage() {
  await requireAdmin();
  return <MediaLibrary initial={await listMedia()} />;
}
