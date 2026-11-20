import { Fragment } from "react";
import { reveal } from "@/components/reveal";
import type { SiteContent } from "@/features/content/schema";

export function Crew({ content }: { content: SiteContent["crew"] }) {
  return (
    <section className="crew" id="nosotros" aria-labelledby="crew-title">
      <div className="crew-inner">
        <div className="crew-intro" {...reveal()}>
          <div className="crew-copy">
            <h2 id="crew-title">
              {content.titleLine1}
              {content.titleLine2 ? (
                <>
                  <br />
                  {content.titleLine2}
                </>
              ) : null}
            </h2>
            <p>{content.lead}</p>
          </div>
          {content.note.length > 0 ? (
            <p className="crew-note">
              {content.note.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </Fragment>
              ))}
            </p>
          ) : null}
        </div>
        <div className="crew-stage">
          {content.members.map((person, index) => (
            <figure
              key={person.name}
              {...reveal(index + 1)}
              className={person.lead ? "crew-person crew-person-lead" : "crew-person"}
            >
              <div className="crew-shot">
                <img
                  src={person.photo.src}
                  alt={person.alt}
                  width={person.photo.width}
                  height={person.photo.height}
                  loading="lazy"
                />
              </div>
              <figcaption>
                <strong>{person.name}</strong>
                <span>{person.role}</span>
                {person.focus && <em>{person.focus}</em>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
