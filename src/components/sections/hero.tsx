import { AmbientBackdrop } from "@/components/ambient-video";
import { Icon } from "@/components/icons";
import type { SiteContent } from "@/features/content/schema";

export function Hero({ content }: { content: SiteContent["hero"] }) {
  return (
    <section className="experience-hero" id="inicio" aria-labelledby="hero-title">
      <AmbientBackdrop
        className="hero-backdrop"
        poster={{ ...content.background.poster, fetchPriority: "high" }}
        video={{ id: "hero-backdrop-video", src: content.background.src }}
        toggleClassName="right-4 bottom-4 md:right-6 md:bottom-6"
      />
      <div className="hero-copy container">
        <h1 id="hero-title">
          {content.titleLine1}
          {content.titleLine2 ? (
            <>
              <br /> {content.titleLine2}
            </>
          ) : null}
        </h1>
        <p className="experience-lead">{content.lead}</p>
        <div className="experience-actions">
          <a href="#cotizar" className="button hero-primary">
            {content.ctaLabel}
            <Icon name="arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
