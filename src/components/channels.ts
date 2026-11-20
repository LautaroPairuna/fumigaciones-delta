import type { SiteContent } from "@/features/content/schema";
import { whatsappUrl } from "@/features/quote/quote";

export type Channels = ReturnType<typeof channelLinks>;

export function channelLinks(contact: SiteContent["contact"]) {
  return {
    whatsapp: whatsappUrl(contact.whatsapp, contact.greeting),
    instagram: contact.instagram,
    phone: `tel:+${contact.phone}`,
    coverage: "#cobertura",
  };
}
