// Fixed identity of the site. Editable copy and contact data live in the content sections.
export const site = {
  url: "https://fumigacionesdelta.com",
  brand: "Fumigaciones Delta",
  address: {
    locality: "La Plata",
    region: "Buenos Aires",
    country: "AR",
  },
  coverage: "/data/coverage-delta.json",
  // Same file as src/app/opengraph-image.jpg; pages that set their own openGraph must list it.
  ogImage: {
    url: "/opengraph-image.jpg",
    width: 1200,
    height: 630,
    alt: "Fumigaciones Delta · Control de plagas en La Plata",
    type: "image/jpeg",
  },
  addressExample: "Ej.: Calle 12 1450, Tolosa",
  problemExample: "Ej.: Hay murciélagos en el techo de mi casa…",
} as const;
