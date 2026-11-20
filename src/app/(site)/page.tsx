import type { Metadata } from "next";
import { channelLinks } from "@/components/channels";
import { IconLibrary } from "@/components/icons";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionSettle } from "@/components/section-settle";
import { Bats } from "@/components/sections/bats";
import { Coverage } from "@/components/sections/coverage";
import { Crew } from "@/components/sections/crew";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Quote } from "@/components/sections/quote";
import { Services } from "@/components/sections/services";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/config/site";
import { localBusinessJsonLd, serializeJsonLd } from "@/config/structured-data";
import { getSiteContent } from "@/features/content/queries";

// Content comes from the database, which is not reachable during `next build`.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { contact } = await getSiteContent();
  return {
    title: contact.title,
    description: contact.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "es_AR",
      url: "/",
      siteName: site.brand,
      title: contact.title,
      description: contact.description,
      images: [site.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: contact.title,
      description: contact.description,
      images: [site.ogImage],
    },
  };
}

export default async function HomePage() {
  const content = await getSiteContent();
  const { contact } = content;
  const channels = channelLinks(contact);

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD escaped by serializeJsonLd
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessJsonLd(contact)) }}
      />
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <IconLibrary />
      <SiteHeader />
      <main id="contenido" tabIndex={-1}>
        <Hero content={content.hero} />
        <Services content={content.services} phoneLabel={contact.phoneLabel} channels={channels} />
        <Bats content={content.bats} />
        <Coverage content={content.coverage} areaServed={contact.areaServed} channels={channels} />
        <Crew content={content.crew} />
        <Quote content={content.quote} contact={contact} channels={channels} />
        <Faq content={content.faq} channels={channels} />
      </main>
      <SiteFooter
        tagline={content.footer.tagline}
        phoneLabel={contact.phoneLabel}
        channels={channels}
      />
      <SectionSettle />
      <ScrollReveal />
    </>
  );
}
