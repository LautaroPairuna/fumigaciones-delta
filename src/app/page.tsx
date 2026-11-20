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
import { localBusinessJsonLd, serializeJsonLd } from "@/config/structured-data";

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, escaped by serializeJsonLd
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessJsonLd()) }}
      />
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <IconLibrary />
      <SiteHeader />
      <main id="contenido" tabIndex={-1}>
        <Hero />
        <Services />
        <Bats />
        <Coverage />
        <Crew />
        <Quote />
        <Faq />
      </main>
      <SiteFooter />
      <SectionSettle />
      <ScrollReveal />
    </>
  );
}
