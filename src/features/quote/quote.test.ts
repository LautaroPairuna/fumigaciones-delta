import { describe, expect, it } from "vitest";
import {
  buildQuoteMessage,
  hasWhatsappContact,
  normalizeAnswer,
  validateAnswer,
  whatsappUrl,
} from "./quote";

describe("normalizeAnswer", () => {
  it("trims and collapses inner whitespace", () => {
    expect(normalizeAnswer("  Juan \n  Pérez\t ")).toBe("Juan Pérez");
  });
});

describe("validateAnswer", () => {
  it("requires at least 2 characters for the name", () => {
    expect(validateAnswer(0, "J")).toBe("Escribí tu nombre o el de tu empresa.");
    expect(validateAnswer(0, "Jo")).toBeNull();
  });

  it("requires at least 8 characters for the problem", () => {
    expect(validateAnswer(1, "ratas")).toBe(
      "Contanos un poco más sobre el problema para poder ayudarte.",
    );
    expect(validateAnswer(1, "ratas!!!")).toBeNull();
  });

  it("requires at least 6 characters for the address", () => {
    expect(validateAnswer(2, "Calle")).toBe("Escribí la dirección donde hace falta el servicio.");
    expect(validateAnswer(2, "Calle 2")).toBeNull();
  });
});

describe("buildQuoteMessage", () => {
  it("joins greeting, problem, address and closing line", () => {
    expect(
      buildQuoteMessage({
        brand: "Fumigaciones Delta",
        name: "Ana",
        problem: "Murciélagos en el techo",
        address: "Calle 12 1450, Tolosa",
      }),
    ).toBe(
      [
        "Hola Fumigaciones Delta, soy Ana.",
        "Necesito ayuda con esto: Murciélagos en el techo",
        "Dirección: Calle 12 1450, Tolosa",
        "Quisiera hablar con un asesor para evaluar el tratamiento y coordinar.",
      ].join("\n"),
    );
  });
});

describe("hasWhatsappContact", () => {
  it("accepts 10 to 15 digits only", () => {
    expect(hasWhatsappContact("542215622173")).toBe(true);
    expect(hasWhatsappContact("123456789")).toBe(false);
    expect(hasWhatsappContact("+542215622173")).toBe(false);
    expect(hasWhatsappContact("")).toBe(false);
  });
});

describe("whatsappUrl", () => {
  it("targets the configured number with the encoded text", () => {
    expect(whatsappUrl("542215622173", "Hola Delta. ¿Atienden?")).toBe(
      "https://wa.me/542215622173?text=Hola%20Delta.%20%C2%BFAtienden%3F",
    );
  });

  it("falls back to the contact picker when the number is invalid", () => {
    expect(whatsappUrl("", "Hola")).toBe("https://wa.me/?text=Hola");
  });
});
