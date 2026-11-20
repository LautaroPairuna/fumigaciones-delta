import type { SiteContent } from "@/features/content/schema";
import { site } from "./site";

export function localBusinessJsonLd(contact: SiteContent["contact"]) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#business`,
    name: site.brand,
    description: contact.description,
    url: site.url,
    logo: `${site.url}/media/delta-mark.png`,
    image: `${site.url}/opengraph-image.jpg`,
    telephone: `+${contact.phone}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: contact.areaServed.map((name) => ({ "@type": "City", name })),
    sameAs: [contact.instagram],
  };
}

// JSON.stringify does not escape "<", so "</script>" inside a value would end the tag early.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
