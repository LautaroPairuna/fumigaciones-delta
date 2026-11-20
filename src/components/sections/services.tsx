import type { Channels } from "@/components/channels";
import { Icon } from "@/components/icons";
import { reveal } from "@/components/reveal";
import type { SiteContent } from "@/features/content/schema";

type Problem = SiteContent["services"]["indoor"][number];

const cardClass =
  "flex h-full items-start gap-3.5 rounded-2xl border border-line bg-white p-4 text-left no-underline transition-colors";

function ProblemCard({ problem }: { problem: Problem }) {
  const body = (
    <>
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-delta/10 text-delta [&_.icon]:size-[22px]">
        <Icon name={problem.icon} />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <strong className="text-base leading-tight font-bold text-ink">{problem.title}</strong>
        <span className="text-sm leading-snug text-muted">{problem.text}</span>
      </span>
    </>
  );
  return problem.href ? (
    <a
      href={problem.href}
      className={`${cardClass} hover:border-delta focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-delta-dark`}
    >
      {body}
    </a>
  ) : (
    <div className={cardClass}>{body}</div>
  );
}

function GroupLabel({ id, children }: { id: string; children: string }) {
  return (
    <h3
      id={id}
      className="m-0 mb-3 text-[13px] font-extrabold tracking-[0.12em] text-delta uppercase"
    >
      {children}
    </h3>
  );
}

export function Services({
  content,
  phoneLabel,
  channels,
}: {
  content: SiteContent["services"];
  phoneLabel: string;
  channels: Channels;
}) {
  return (
    <section className="services-board" id="servicios" aria-labelledby="services-title">
      <div className="mx-auto flex w-[min(1180px,calc(100%-40px))] flex-col gap-[clamp(20px,3vh,32px)]">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5" {...reveal()}>
          <div>
            <h2
              id="services-title"
              className="m-0 font-display text-[clamp(34px,4vw,56px)] leading-none font-semibold tracking-[-0.05em] text-ink"
            >
              {content.title}
            </h2>
            {content.subtitle ? (
              <p className="mt-3 mb-0 text-[clamp(15px,1.2vw,17px)] text-muted">
                {content.subtitle}
              </p>
            ) : null}
          </div>
          <a
            href={channels.phone}
            aria-label={`Emergencias las 24 horas: llamar al ${phoneLabel}`}
            className="flex items-center gap-3.5 rounded-2xl bg-delta py-3 pr-5 pl-3.5 text-white no-underline transition-colors hover:bg-delta-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-delta-dark"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-white/15 [&_.icon]:size-[22px]">
              <Icon name="phone" />
            </span>
            <span className="flex flex-col">
              <strong className="font-display text-[22px] leading-none font-semibold tracking-[-0.03em]">
                {content.emergencyLabel}
              </strong>
              <span className="mt-1 text-sm font-semibold text-white/85">{phoneLabel}</span>
            </span>
          </a>
        </header>

        <section aria-labelledby="prob-casa" {...reveal(1)}>
          <GroupLabel id="prob-casa">{content.indoorLabel}</GroupLabel>
          <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {content.indoor.map((problem) => (
              <li key={`${problem.icon}-${problem.title}`}>
                <ProblemCard problem={problem} />
              </li>
            ))}
          </ul>
        </section>

        <div className="grid grid-cols-1 gap-x-3 gap-y-[clamp(20px,3vh,32px)] lg:grid-cols-2">
          <section aria-labelledby="prob-animal" className="flex flex-col" {...reveal(2)}>
            <GroupLabel id="prob-animal">{content.animalsLabel}</GroupLabel>
            <ul className="m-0 grid flex-1 list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
              {content.animals.map((problem) => (
                <li key={`${problem.icon}-${problem.title}`}>
                  <ProblemCard problem={problem} />
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="prob-aire" className="flex flex-col" {...reveal(3)}>
            <GroupLabel id="prob-aire">{content.openAirLabel}</GroupLabel>
            <div className="flex-1">
              <ProblemCard problem={content.openAir} />
            </div>
          </section>
        </div>

        <section
          aria-labelledby="prob-lugar"
          className="flex flex-col gap-4 rounded-2xl bg-sand px-5 py-4 lg:flex-row lg:items-center lg:gap-8"
          {...reveal(4)}
        >
          <h3
            id="prob-lugar"
            className="m-0 shrink-0 text-[13px] font-extrabold tracking-[0.12em] text-delta uppercase"
          >
            {content.placesLabel}
          </h3>
          <ul className="m-0 flex list-none flex-wrap gap-x-7 gap-y-3 p-0">
            {content.places.map((place) => (
              <li
                key={place.title}
                className="flex items-center gap-2.5 text-base font-bold text-ink [&_.icon]:size-5"
              >
                <span className="text-muted">
                  <Icon name={place.icon} />
                </span>
                {place.title}
                {place.certified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-delta/10 px-2.5 py-1 text-xs font-bold text-delta-dark [&_.icon]:size-3.5">
                    <Icon name="badge" />
                    {content.certifiedLabel}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
