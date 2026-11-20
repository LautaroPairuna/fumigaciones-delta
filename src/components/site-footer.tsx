import { channels } from "@/components/channels";
import { Icon } from "@/components/icons";
import { site } from "@/config/site";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function SiteFooter() {
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
                src="/media/delta-mark.webp"
                alt=""
                width={96}
                height={96}
                loading="lazy"
              />
              <span>DELTA</span>
            </a>
            <p>Control de plagas urbanas en La Plata.</p>
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
              <a
                data-channel="phone"
                href={channels.phone}
                aria-label={`Llamar al ${site.phoneLabel}`}
              >
                <Icon name="phone" />
              </a>
              <a
                data-channel="maps"
                href={channels.maps}
                {...external}
                aria-label="Ubicación en Google Maps"
              >
                <Icon name="pin" />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
