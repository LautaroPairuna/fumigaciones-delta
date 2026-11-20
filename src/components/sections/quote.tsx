import type { Channels } from "@/components/channels";
import { Icon, type IconName } from "@/components/icons";
import { reveal } from "@/components/reveal";
import type { SiteContent } from "@/features/content/schema";
import { QuoteChat } from "@/features/quote/quote-chat";

export function Quote({
  content,
  contact,
  channels,
}: {
  content: SiteContent["quote"];
  contact: SiteContent["contact"];
  channels: Channels;
}) {
  const items: {
    kind: keyof Channels;
    icon: IconName;
    title: string;
    text: string;
    external: boolean;
  }[] = [
    {
      kind: "whatsapp",
      icon: "whatsapp",
      title: "WhatsApp",
      text: content.whatsappText,
      external: true,
    },
    {
      kind: "instagram",
      icon: "instagram",
      title: "Instagram",
      text: content.instagramText,
      external: true,
    },
    {
      kind: "phone",
      icon: "phone",
      title: contact.phoneLabel,
      text: content.phoneText,
      external: false,
    },
    {
      kind: "coverage",
      icon: "pin",
      title: content.coverageTitle,
      text: content.coverageText,
      external: false,
    },
  ];

  return (
    <section className="quote-section" id="cotizar" aria-labelledby="quote-title">
      <div className="container quote-layout">
        <div className="quote-intro" {...reveal()}>
          <h2 id="quote-title">{content.title}</h2>
          <p>{content.lead}</p>
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
                <Icon name={item.external ? "diagonal" : "arrow"} className="icon channel-go" />
              </a>
            ))}
          </div>
          {content.note ? <p className="quote-note">{content.note}</p> : null}
        </div>
        <QuoteChat whatsapp={contact.whatsapp} {...reveal(1)} />
      </div>
    </section>
  );
}
