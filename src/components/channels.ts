import { site } from "@/config/site";
import { whatsappUrl } from "@/features/quote/quote";

export const channels = {
  whatsapp: whatsappUrl(site.whatsapp, site.greeting),
  instagram: site.instagram,
  phone: `tel:+${site.phone}`,
  maps: site.maps,
};
