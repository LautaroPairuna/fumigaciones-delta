export type QuoteStage = 0 | 1 | 2;

const rules: Record<QuoteStage, { minimum: number; error: string }> = {
  0: { minimum: 2, error: "Escribí tu nombre o el de tu empresa." },
  1: { minimum: 8, error: "Contanos un poco más sobre el problema para poder ayudarte." },
  2: { minimum: 6, error: "Escribí la dirección donde hace falta el servicio." },
};

export function normalizeAnswer(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function validateAnswer(stage: QuoteStage, value: string): string | null {
  const rule = rules[stage];
  return value.length < rule.minimum ? rule.error : null;
}

export function buildQuoteMessage(input: {
  brand: string;
  name: string;
  problem: string;
  address: string;
}): string {
  return [
    `Hola ${input.brand}, soy ${input.name}.`,
    `Necesito ayuda con esto: ${input.problem}`,
    `Dirección: ${input.address}`,
    "Quisiera hablar con un asesor para evaluar el tratamiento y coordinar.",
  ].join("\n");
}

export function hasWhatsappContact(phone: string): boolean {
  return /^\d{10,15}$/.test(phone);
}

export function whatsappUrl(phone: string, text: string): string {
  const base = hasWhatsappContact(phone) ? `https://wa.me/${phone}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}
