import { reveal } from "@/components/reveal";

export function Services() {
  return (
    <section className="services-board" id="servicios" aria-labelledby="services-title">
      <div className="services-fit">
        <header className="services-mast" {...reveal()}>
          <div className="services-intro">
            <h2 id="services-title">Problemas que resolvemos</h2>
            <p>Si tu caso está en esta lista, lo atendemos.</p>
          </div>
          <p className="duty-call">
            <strong>24 h</strong>
            <span>Emergencias</span>
          </p>
        </header>
        <div className="problem-sheet">
          <div className="problem-col">
            <section className="problem-group" aria-labelledby="prob-casa" {...reveal(1)}>
              <h3 id="prob-casa">En casa o en el local</h3>
              <ul>
                <li>
                  <strong>Cucarachas</strong>
                  <span>Cocina, baño y zonas húmedas.</span>
                </li>
                <li>
                  <strong>Roedores</strong>
                  <span>Casa, depósito o local.</span>
                </li>
                <li>
                  <strong>Pulgas y garrapatas</strong>
                  <span>Donde hay mascotas.</span>
                </li>
                <li>
                  <strong>Chinches de cama</strong>
                  <span>Colchón y dormitorio.</span>
                </li>
              </ul>
            </section>
            <section className="problem-group" aria-labelledby="prob-lugar" {...reveal(3)}>
              <h3 id="prob-lugar">Casas y locales</h3>
              <ul>
                <li>
                  <strong>Casas</strong>
                  <span>En el domicilio.</span>
                </li>
                <li>
                  <strong>Gastronomía</strong>
                  <span className="is-cert">Con certificado.</span>
                </li>
                <li>
                  <strong>Industria</strong>
                  <span className="is-cert">Con certificado.</span>
                </li>
              </ul>
            </section>
          </div>
          <div className="problem-col">
            <section className="problem-group" aria-labelledby="prob-animal" {...reveal(2)}>
              <h3 id="prob-animal">Entró un animal</h3>
              <ul>
                <li>
                  <strong>
                    <a href="#murcielagos">Murciélagos</a>
                  </strong>
                  <span>Exclusión en techo y taparrollo.</span>
                </li>
                <li>
                  <strong>Comadrejas y lagartos</strong>
                  <span>Captura y reubicación.</span>
                </li>
              </ul>
            </section>
            <section className="problem-group" aria-labelledby="prob-aire" {...reveal(4)}>
              <h3 id="prob-aire">Espacio abierto</h3>
              <ul>
                <li className="problem-long">
                  <strong>Termonebulización</strong>
                  <span>
                    Patios, quintas, campings, canchas, galerías y salones. Niebla de microgotas que
                    se adhiere al follaje, al césped y a las superficies.
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
