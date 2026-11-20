import { AmbientBackdrop } from "@/components/ambient-video";
import { reveal } from "@/components/reveal";

const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const OPEN_FROM = 3;
const OPEN_TO = 8;

export function Bats() {
  return (
    <section className="bats" id="murcielagos" aria-labelledby="bats-title">
      <AmbientBackdrop
        className="bats-backdrop"
        poster={{
          src: "/media/fondo-murcielago-poster.jpg",
          width: 1600,
          height: 900,
          loading: "lazy",
        }}
        video={{ id: "bats-backdrop-video", src: "/media/fondo-murcielago.mp4" }}
        toggleClassName="right-4 bottom-4 md:right-6 md:bottom-6"
      />
      <div className="bats-layout">
        <div className="bats-main" {...reveal()}>
          <h2 id="bats-title">Murciélagos</h2>
          <p className="bats-lead">
            Somos especialistas. Hacemos exclusiones amigables, con un enfoque ecológico y de
            preservación de la especie: el animal sale y el acceso se cierra.
          </p>
          <ul className="bat-points">
            <li>Techo y taparrollo.</li>
            <li>Trabajos en altura.</li>
          </ul>
        </div>
        <div className="bats-detail" {...reveal(1)}>
          <div className="season">
            <p>De abril a septiembre</p>
            <ol aria-label="Meses del año. La época permitida es de abril a septiembre.">
              {months.map((month, index) => (
                <li
                  key={month}
                  className={index >= OPEN_FROM && index <= OPEN_TO ? "is-open" : undefined}
                >
                  {month}
                </li>
              ))}
            </ol>
          </div>
          <p className="bats-law">
            Trabajamos según la Ley Nacional N.º 22.421 de conservación de la fauna. Declara de
            interés público la protección y conservación de la fauna silvestre. Prohíbe la caza, la
            captura o la destrucción de ejemplares, de sus crías o de sus refugios cuando se hace en
            infracción a las normas vigentes. Las penas previstas son multa, comiso y prisión de un
            mes a tres años, en los supuestos de la ley.
          </p>
        </div>
      </div>
    </section>
  );
}
