import type { ReactNode } from "react";
import { AccordionGroup } from "@/components/accordion-group";
import { channels } from "@/components/channels";
import { Icon } from "@/components/icons";
import { reveal } from "@/components/reveal";

const questions: { question: string; answer: ReactNode }[] = [
  {
    question: "¿Tengo que abandonar mi casa para fumigar?",
    answer: (
      <>
        <p>
          Si el trabajo es en toda la casa, conviene irse y volver a las 4 horas, cuando se disipen
          los gases.
        </p>
        <ul className="mt-3 mb-0 list-none space-y-2 p-0">
          <li className="relative pl-5 before:absolute before:top-[0.6em] before:left-0 before:size-1.5 before:rounded-full before:bg-delta">
            Guardá en bolsas de consorcio los alimentos abiertos, los cepillos de dientes y el papel
            higiénico.
          </li>
          <li className="relative pl-5 before:absolute before:top-[0.6em] before:left-0 before:size-1.5 before:rounded-full before:bg-delta">
            Las mascotas salen con vos.
          </li>
        </ul>
        <p className="mt-3">Del resto nos hacemos cargo nosotros.</p>
      </>
    ),
  },
  {
    question: "¿Usan productos tóxicos?",
    answer: (
      <p>
        El tratamiento usa insecticida químico. Todos los productos están aprobados por ANMAT y
        habilitados para uso domiciliario.
      </p>
    ),
  },
  {
    question: "¿Emiten certificados?",
    answer: (
      <p>
        Sí. Emitimos certificados avalados por el Ministerio de Desarrollo Agrario y por un asesor
        técnico matriculado.
      </p>
    ),
  },
];

export function Faq() {
  return (
    <section id="preguntas" aria-labelledby="faq-title" className="bg-sand font-body text-ink">
      <div className="mx-auto grid w-[calc(100%-36px)] max-w-[1120px] gap-8 py-14 md:w-[calc(100%-72px)] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] md:gap-16 md:py-20">
        <div {...reveal()} className="md:sticky md:top-28 md:self-start">
          <h2
            id="faq-title"
            className="m-0 font-display text-[clamp(30px,3.4vw,44px)] leading-none font-semibold tracking-[-0.04em] text-ink"
          >
            Preguntas frecuentes
          </h2>
          <p className="mt-4 mb-0 max-w-sm text-base leading-relaxed text-muted">
            Lo que más nos consultan antes de un tratamiento.
          </p>
          <a
            href={channels.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg whitespace-nowrap bg-delta px-5 text-[15px] font-bold text-white no-underline transition-colors hover:bg-delta-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-delta-dark [&_.icon]:size-[18px]"
          >
            <Icon name="whatsapp" />
            ¿Otra duda? Escribinos
          </a>
        </div>
        <AccordionGroup className="border-t border-line">
          {questions.map((item, index) => (
            <details
              key={item.question}
              name="faq"
              open={index === 0}
              className="group border-b border-line"
              {...reveal(index + 1)}
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg leading-snug font-semibold tracking-[-0.02em] text-ink transition-colors hover:text-delta md:text-xl [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="relative grid size-9 shrink-0 place-items-center rounded-full border border-line bg-paper transition-[rotate,background-color,border-color] duration-300 group-open:rotate-45 group-open:border-delta group-open:bg-delta group-data-closing:rotate-0 group-data-closing:border-line group-data-closing:bg-paper"
                >
                  <span className="absolute h-0.5 w-3.5 rounded-full bg-ink transition-colors duration-300 group-open:bg-white group-data-closing:bg-ink" />
                  <span className="absolute h-3.5 w-0.5 rounded-full bg-ink transition-colors duration-300 group-open:bg-white group-data-closing:bg-ink" />
                </span>
              </summary>
              <div>
                <div className="pr-4 pb-6 text-[15px] leading-relaxed text-muted md:pr-16 md:text-base [&_p]:m-0">
                  {item.answer}
                </div>
              </div>
            </details>
          ))}
        </AccordionGroup>
      </div>
    </section>
  );
}
