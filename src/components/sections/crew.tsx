import { reveal } from "@/components/reveal";

const crew = [
  {
    name: "Marcelo",
    role: "Técnico aplicador",
    focus: "Insectos, pulgas y chinches de cama",
    photo: { src: "/media/marcelo-recorte.webp", width: 391, height: 800 },
    alt: "Marcelo, técnico aplicador de Fumigaciones Delta",
  },
  {
    name: "Francisco Arce",
    role: "Dueño y técnico en manejo integral de plagas",
    photo: { src: "/media/francisco-recorte.webp", width: 523, height: 1040 },
    alt: "Francisco Arce, dueño y técnico en manejo integral de plagas",
    lead: true,
  },
  {
    name: "Nicolás",
    role: "Técnico aplicador",
    focus: "Cucarachas alemanas y roedores",
    photo: { src: "/media/nicolas-recorte.webp", width: 318, height: 800 },
    alt: "Nicolás, técnico aplicador de Fumigaciones Delta",
  },
];

export function Crew() {
  return (
    <section className="crew" id="nosotros" aria-labelledby="crew-title">
      <div className="crew-inner">
        <div className="crew-intro" {...reveal()}>
          <div className="crew-copy">
            <h2 id="crew-title">
              Quiénes
              <br />
              somos
            </h2>
            <p>
              Personal capacitado en control de plagas urbanas. Contamos con las herramientas para
              resolverlo.
            </p>
          </div>
          <p className="crew-note">
            Profesional,
            <br />
            eficiente
            <br />y ecológica.
          </p>
        </div>
        <div className="crew-stage">
          {crew.map((person, index) => (
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
