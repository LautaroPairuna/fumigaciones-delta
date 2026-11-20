import { describe, expect, it } from "vitest";
import { localBusinessJsonLd, serializeJsonLd } from "./structured-data";

describe("localBusinessJsonLd", () => {
  const data = localBusinessJsonLd();

  it("describes the business with absolute URLs", () => {
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://fumigacionesdelta.com/#business",
      name: "Fumigaciones Delta",
      url: "https://fumigacionesdelta.com",
      logo: "https://fumigacionesdelta.com/media/delta-mark.png",
      image: "https://fumigacionesdelta.com/opengraph-image.jpg",
    });
  });

  it("uses the international phone format", () => {
    expect(data.telephone).toBe("+542215622173");
  });

  it("includes the city but not the street address", () => {
    expect(data.address).toEqual({
      "@type": "PostalAddress",
      addressLocality: "La Plata",
      addressRegion: "Buenos Aires",
      addressCountry: "AR",
    });
  });

  it("lists every served city and the Instagram profile", () => {
    expect(data.areaServed).toEqual([
      { "@type": "City", name: "La Plata" },
      { "@type": "City", name: "Berisso" },
      { "@type": "City", name: "Ensenada" },
    ]);
    expect(data.sameAs).toEqual(["https://www.instagram.com/deltafumigacion/"]);
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so the payload cannot close the script tag", () => {
    const output = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(output).not.toContain("<");
    expect(JSON.parse(output)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});
