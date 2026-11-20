import "server-only";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { defaultContent } from "./defaults";
import { mergeContent, type SiteContent } from "./schema";

export const SITE_CONTENT_TAG = "site-content";

// Cached entries embed the defaults, so editing defaults.ts must not serve an old entry.
const DEFAULTS_VERSION = createHash("sha256")
  .update(JSON.stringify(defaultContent))
  .digest("hex")
  .slice(0, 12);

const readSiteContent = unstable_cache(
  async (): Promise<SiteContent> => {
    const rows = await getPrisma().section.findMany({ select: { key: true, content: true } });
    return mergeContent(rows);
  },
  ["site-content", DEFAULTS_VERSION],
  { tags: [SITE_CONTENT_TAG] },
);

// Failures are not cached, so the next request retries the database.
export async function getSiteContent(): Promise<SiteContent> {
  try {
    return await readSiteContent();
  } catch (error) {
    console.error("[content] database unavailable, serving default content", error);
    return defaultContent;
  }
}
