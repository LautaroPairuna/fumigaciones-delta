import { channels } from "@/components/channels";
import { Icon, type IconName } from "@/components/icons";
import { reveal } from "@/components/reveal";
import { site } from "@/config/site";
import { QuoteChat } from "@/features/quote/quote-chat";

const items: {
  kind: keyof typeof channels;
  icon: IconName;
  title: string;
  text: string;
  external: boolean;
}[] = [
  {
    kind: "whatsapp",
    icon: "whatsapp",
    title: "WhatsApp",
    text: "Consulta o presupuesto por mensaje.",
    external: true,
  },
  {
    kind: "instagram",
    icon: "instagram",
    title: "Instagram",
    text: "Escribinos o mandá fotos del lugar.",
    external: true,
  },
  {
    kind: "phone",
    icon: "phone",
    title: site.phoneLabel,
    text: "Atención y emergencias.",
    external: false,
  },
  {
    kind: "maps",
    icon: "pin",
    title: "Calle 2 Nº 627",
    text: "La Plata, Buenos Aires.",
    external: true,
  },
];

export function Quote() {
  return (
    <section className="quote-section" id="cotizar" aria-labelledby="quote-title">
      <div className="container quote-layout">
        <div className="quote-intro" {...reveal()}>
          <h2 id="quote-title">Pedí tu presupuesto.</h2>
          <p>
            El cotizador arma el mensaje con tu nombre, qué está pasando y la dirección. Si
            preferís, llamá o escribinos.
          </p>
          <div className="channel-row">
            {items.map((item) => (
              <a
                key={item.kind}
                className={`channel channel-${item.kind}`}
                data-channel={item.kind}
                href={channels[item.kind]}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <Icon name={item.icon} className="icon channel-mark" />
                <span className="channel-copy">
                  <strong>{item.title}</strong>
                  <small>{item.text}</small>
                </span>
                <Icon name="diagonal" className="icon channel-go" />
              </a>
            ))}
          </div>
          <p className="quote-note">
            Casas, negocios y locales gastronómicos en La Plata, Berisso y Ensenada.
          </p>
        </div>
        <QuoteChat {...reveal(1)} />
      </div>
    </section>
  );
}
