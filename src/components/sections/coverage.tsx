import type { CSSProperties } from "react";
import { channels } from "@/components/channels";
import { CoverageMap } from "@/components/coverage-map";
import { Icon, type IconName } from "@/components/icons";
import { MarqueeToggle } from "@/components/marquee-toggle";
import { reveal } from "@/components/reveal";
import { site } from "@/config/site";

const reviews = [
  { text: "Marcaron el foco de cucarachas y a los días no vimos más.", who: "Camila, Tolosa" },
  { text: "En el local coordinaron fuera del horario de cocina.", who: "Martín, Centro" },
  { text: "Pensábamos que eran ratas. Eran murciélagos y lo cerraron.", who: "Diego, City Bell" },
  { text: "Pulgas en la casa. Volvieron a controlar y quedó resuelto.", who: "Pablo, Los Hornos" },
  {
    text: "Explicaron qué no tocar ese día. El departamento quedó habitable.",
    who: "Laura, Gonnet",
  },
  { text: "Puntuales, y la casa no quedó con olor.", who: "Sofía, Berisso" },
];

const assurances: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "shield",
    title: "Exclusión de murciélagos",
    text: "Diagnóstico del ingreso y cierre, con seguimiento.",
  },
  {
    icon: "hygiene",
    title: "Tratamiento ecológico",
    text: "El lugar queda habitable, sin un olor que se quede.",
  },
  {
    icon: "tools",
    title: "Instrumentos profesionales",
    text: "Gel, estaciones y equipos según el foco.",
  },
  {
    icon: "van",
    title: "Servicio a domicilio",
    text: "Movilidad propia en La Plata, Berisso y Ensenada.",
  },
];

const fullScore = { "--score": 5 } as CSSProperties;

// The marquee loops seamlessly by repeating the list; only the first six are announced.
const marquee = [
  reviews
    .map((review, index) => ({ ...review, hidden: false, key: `a${index}` }))
    .concat(reviews.map((review, index) => ({ ...review, hidden: true, key: `b${index}` }))),
  [...reviews, ...reviews].map((review, index) => ({ ...review, hidden: true, key: `c${index}` })),
];

export function Coverage() {
  return (
    <section className="house" id="cobertura" aria-labelledby="coverage-title">
      <div className="review-rail" {...reveal(0, "fade")}>
        <div
          className="score-chip"
          role="img"
          aria-label="Puntuación 5 de 5 en reseñas de Google. Excelente."
        >
          <div className="score-lockup" aria-hidden="true">
            <strong className="score-num">5,0</strong>
            <span className="stars score-stars" style={fullScore} />
            <span className="score-brand">
              <GoogleLogo />
              <em>Excelente</em>
            </span>
          </div>
        </div>
        <section
          className="review-viewport"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region has to be reachable by keyboard
          tabIndex={0}
          aria-label="Reseñas de clientes"
        >
          <div className="review-track" id="review-track">
            {marquee.map((set, setIndex) => (
              <div
                key={set[0]?.key}
                className="review-set"
                aria-hidden={setIndex > 0 ? true : undefined}
              >
                {set.map((review) => (
                  <article
                    key={review.key}
                    className="review-card"
                    aria-hidden={review.hidden ? true : undefined}
                  >
                    <span className="stars" style={fullScore} role="img" aria-label="5 de 5" />
                    <p>{review.text}</p>
                    <span className="who">{review.who}</span>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </section>
        <MarqueeToggle trackId="review-track" className="right-3 bottom-3" />
      </div>
      <div className="house-body">
        <div className="house-main">
          <div className="house-copy text-left" {...reveal()}>
            <p className="m-0 mb-3 flex items-center gap-2.5 text-[13px] font-extrabold tracking-[0.14em] text-delta uppercase before:h-0.5 before:w-6 before:bg-delta">
              Zona de servicio
            </p>
            <h2
              id="coverage-title"
              className="m-0 max-w-none font-display text-[clamp(34px,min(3.6vw,6vh),58px)] leading-[0.95] font-semibold tracking-[-0.05em] text-ink"
            >
              Cobertura en
              <br />
              La Plata.
            </h2>
            <p className="mx-0 mt-4 mb-0 max-w-[40ch] text-[clamp(15px,1.15vw,17px)] leading-relaxed text-muted">
              Casas, negocios y locales gastronómicos. Confirmamos la zona antes de coordinar la
              visita.
            </p>
            <ul
              aria-label="Zona de cobertura"
              className="m-0 mt-[clamp(14px,2.2vh,20px)] flex list-none flex-wrap gap-2 p-0"
            >
              {site.areaServed.map((area) => (
                <li
                  key={area}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-delta/25 bg-white px-3.5 text-sm font-bold text-ink"
                >
                  <span
                    aria-hidden="true"
                    className="size-3 rounded-[3px] bg-delta/25 ring-2 ring-delta-dark/70"
                  />
                  {area}
                </li>
              ))}
            </ul>
            <ul className="m-0 mt-[clamp(16px,2.6vh,24px)] grid w-full max-w-[600px] list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
              {assurances.map((item) => (
                <li
                  key={item.icon}
                  className="flex items-start gap-3 rounded-xl border border-line bg-white p-3.5 text-left"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-delta/10 text-delta [&_.icon]:size-[18px]">
                    <Icon name={item.icon} />
                  </span>
                  <span className="flex flex-col gap-1">
                    <strong className="text-[15px] leading-tight font-bold text-ink">
                      {item.title}
                    </strong>
                    <span className="text-[13.5px] leading-snug text-muted">{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-[clamp(16px,2.6vh,24px)] flex flex-wrap items-center gap-3">
              <a
                href="#cotizar"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-delta px-5 text-[15px] font-bold text-white no-underline transition-colors hover:bg-delta-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-delta-dark [&_.icon]:size-4"
              >
                Cotizar para mi zona
                <Icon name="arrow" />
              </a>
              <a
                href={channels.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-[15px] font-bold text-ink no-underline transition-colors hover:border-delta hover:text-delta-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-delta-dark [&_.icon]:size-[18px] [&_.icon]:text-[#1f9d55]"
              >
                <Icon name="whatsapp" />
                WhatsApp
              </a>
            </div>
          </div>
          <CoverageMap />
        </div>
      </div>
    </section>
  );
}

function GoogleLogo() {
  return (
    <svg className="google-logo" viewBox="0 0 272 92" aria-hidden="true" focusable="false">
      <path
        fill="#EA4335"
        d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
      />
      <path
        fill="#FBBC05"
        d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
      />
      <path
        fill="#4285F4"
        d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
      />
      <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z" />
      <path
        fill="#EA4335"
        d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-12.6 9.49-22.18 21.67-22.18 11.84 0 17.56 9.32 19.41 14.37l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 9.74-6.4zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
      />
      <path
        fill="#4285F4"
        d="M35.29 41.41V32H67.1c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.4.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.59.01z"
      />
    </svg>
  );
}
