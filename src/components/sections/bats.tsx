import { AmbientBackdrop } from "@/components/ambient-video";
import { Icon } from "@/components/icons";
import { reveal } from "@/components/reveal";
import type { SiteContent } from "@/features/content/schema";

const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function Bats({ content }: { content: SiteContent["bats"] }) {
  return (
    <section className="bats" id="murcielagos" aria-labelledby="bats-title">
      <AmbientBackdrop
        className="bats-backdrop"
        poster={{ ...content.background.poster, loading: "lazy" }}
        video={{ id: "bats-backdrop-video", src: content.background.src }}
        toggleClassName="right-4 bottom-4 md:right-6 md:bottom-6"
      />
      <div className="bats-layout items-center">
        <div {...reveal()}>
          <p className="m-0 mb-4 flex items-center gap-2.5 text-[13px] font-extrabold tracking-[0.14em] text-white/85 uppercase before:h-0.5 before:w-6 before:bg-delta">
            {content.eyebrow}
          </p>
          <h2 id="bats-title">{content.title}</h2>
          <p className="bats-lead">{content.lead}</p>
          {content.points.length > 0 ? (
            <ul className="m-0 mt-6 flex list-none flex-wrap gap-2.5 p-0">
              {content.points.map((point) => (
                <li
                  key={point}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-black/35 px-4 text-[15px] font-bold text-white backdrop-blur-sm [&_.icon]:size-[18px] [&_.icon]:text-[#ff8a90]"
                >
                  <Icon name="shield" />
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
          <a
            href="#cotizar"
            className="mt-7 inline-flex min-h-12 items-center gap-2.5 rounded-lg bg-delta px-6 text-base font-bold whitespace-nowrap text-white no-underline transition-colors hover:bg-delta-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white [&_.icon]:size-[18px]"
          >
            {content.ctaLabel}
            <Icon name="arrow" />
          </a>
        </div>

        <div
          className="min-w-0 rounded-2xl border border-white/15 bg-[#071208]/60 p-[clamp(20px,2.4vw,32px)] backdrop-blur-md"
          {...reveal(1)}
        >
          <p className="m-0 flex items-center gap-2 text-[13px] font-extrabold tracking-[0.12em] text-white/80 uppercase [&_.icon]:size-[18px] [&_.icon]:text-[#ff8a90]">
            <Icon name="calendar" />
            {content.seasonLabel}
          </p>
          <p className="mt-2 mb-4 font-display text-[clamp(28px,2.6vw,38px)] leading-none font-semibold tracking-[-0.04em] text-white">
            {content.seasonTitle}
          </p>
          <ol
            aria-label={`Meses del año. La época permitida es de ${monthNames[content.openFrom]} a ${monthNames[content.openTo]}.`}
            className="m-0 grid list-none grid-cols-6 gap-1.5 p-0 sm:grid-cols-12"
          >
            {months.map((month, index) => {
              const open = index >= content.openFrom && index <= content.openTo;
              return (
                <li
                  key={month}
                  className={`rounded-lg py-2.5 text-center text-[13px] leading-none ${
                    open ? "bg-delta font-bold text-white" : "bg-white/10 text-white/60"
                  }`}
                >
                  {month}
                </li>
              );
            })}
          </ol>

          <div className="mt-6 border-t border-white/15 pt-5">
            <p className="m-0 flex items-start gap-3 text-[15px] leading-normal text-white/90 [&_.icon]:mt-0.5 [&_.icon]:size-5 [&_.icon]:shrink-0 [&_.icon]:text-[#ff8a90]">
              <Icon name="scale" />
              <span>
                {content.lawPrefix ? `${content.lawPrefix} ` : null}
                <strong className="text-white">{content.lawName}</strong>
                {content.lawSuffix ? ` ${content.lawSuffix}` : null}
              </span>
            </p>
            <details className="group mt-3 pl-8">
              <summary className="cursor-pointer list-none text-sm font-bold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Qué dice la ley</span>
                <span className="hidden group-open:inline">Ocultar</span>
              </summary>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-white/80">{content.lawDetail}</p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
