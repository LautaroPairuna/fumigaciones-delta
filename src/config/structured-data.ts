import { site } from "./site";

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#business`,
    name: site.brand,
    description: site.description,
    url: site.url,
    logo: `${site.url}/media/delta-mark.png`,
    image: `${site.url}/opengraph-image.jpg`,
    telephone: `+${site.phone}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: site.areaServed.map((name) => ({ "@type": "City", name })),
    sameAs: [site.instagram],
  };
}

// JSON.stringify does not escape "<", so "</script>" inside a value would end the tag early.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
