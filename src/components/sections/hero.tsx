import { AmbientBackdrop } from "@/components/ambient-video";
import { Icon } from "@/components/icons";

export function Hero() {
  return (
    <section className="experience-hero" id="inicio" aria-labelledby="hero-title">
      <AmbientBackdrop
        className="hero-backdrop"
        poster={{
          src: "/media/inicio-fondo-poster.jpg",
          width: 1280,
          height: 720,
          fetchPriority: "high",
        }}
        video={{ id: "hero-backdrop-video", src: "/media/inicio-fondo.mp4" }}
        toggleClassName="right-4 bottom-4 md:right-6 md:bottom-6"
      />
      <div className="hero-copy container">
        <h1 id="hero-title">
          Control total
          <br /> de plagas.
        </h1>
        <p className="experience-lead">
          Casas, negocios y locales gastronómicos en La Plata. Presupuesto sin cargo.
        </p>
        <div className="experience-actions">
          <a href="#cotizar" className="button hero-primary">
            Pedir presupuesto
            <Icon name="arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
