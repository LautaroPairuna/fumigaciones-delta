import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionEditor } from "@/features/admin/components/section-editor";
import { getSectionMeta } from "@/features/admin/section-fields";
import { mergeContent } from "@/features/content/schema";
import { listMedia } from "@/features/media/service";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

type Props = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = getSectionMeta((await params).key);
  return { title: meta?.title ?? "Sección" };
}

export default async function SectionPage({ params }: Props) {
  await requireAdmin();
  const meta = getSectionMeta((await params).key);
  if (!meta) notFound();

  const [row, library] = await Promise.all([
    getPrisma().section.findUnique({ where: { key: meta.key } }),
    listMedia(),
  ]);
  const content = mergeContent(row ? [row] : [])[meta.key];

  return (
    <SectionEditor
      key={row?.updatedAt.toISOString() ?? "default"}
      meta={meta}
      initial={content as Record<string, unknown>}
      isCustom={Boolean(row)}
      initialLibrary={library}
    />
  );
}
