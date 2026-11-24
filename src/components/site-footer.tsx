import type { Channels } from "@/components/channels";
import { Icon } from "@/components/icons";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function SiteFooter({
  tagline,
  phoneLabel,
  channels,
}: {
  tagline: string;
  phoneLabel: string;
  channels: Channels;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-main">
          <div className="footer-id">
            <a
              className="brand"
              href="#inicio"
              aria-label="Fumigaciones Delta, volver al inicio"
              translate="no"
            >
              <img
                className="brand-mark"
                src="/media/delta-mark.svg"
                alt=""
                width={96}
                height={96}
                loading="lazy"
              />
              <span className="flex flex-col items-start leading-none">
                <span className="mb-[0.18em] text-[0.3em] font-extrabold tracking-[0.24em]">
                  FUMIGACIONES
                </span>
                <span>DELTA</span>
              </span>
            </a>
            <p>{tagline}</p>
          </div>
          <div className="footer-actions">
            <nav className="footer-nav" aria-label="Navegación del pie">
              <a href="#servicios">Servicios</a>
              <a href="#murcielagos">Murciélagos</a>
              <a href="#cobertura">Cobertura</a>
              <a href="#nosotros">Nosotros</a>
              <a href="#cotizar">Contacto</a>
            </nav>
            <nav className="footer-channels" aria-label="Canales">
              <a
                data-channel="whatsapp"
                href={channels.whatsapp}
                {...external}
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" />
              </a>
              <a
                data-channel="instagram"
                href={channels.instagram}
                {...external}
                aria-label="Instagram"
              >
                <Icon name="instagram" />
              </a>
              <a data-channel="phone" href={channels.phone} aria-label={`Llamar al ${phoneLabel}`}>
                <Icon name="phone" />
              </a>
              <a
                data-channel="coverage"
                href={channels.coverage}
                aria-label="Zona de cobertura: La Plata y alrededores"
              >
                <Icon name="pin" />
              </a>
              <a href="/admin" rel="nofollow" aria-label="Panel de administración">
                <Icon name="settings" />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
