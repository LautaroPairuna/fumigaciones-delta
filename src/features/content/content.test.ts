import { describe, expect, it } from "vitest";
import { defaultContent } from "./defaults";
import { parseRichText } from "./rich-text";
import { mergeContent, sectionKeys, sectionSchemas } from "./schema";

describe("parseRichText", () => {
  it("splits paragraphs on blank lines and groups dash lines into one list", () => {
    expect(parseRichText("First line.\n\n- one\n- two\n\nLast.")).toEqual([
      { type: "paragraph", text: "First line." },
      { type: "list", items: ["one", "two"] },
      { type: "paragraph", text: "Last." },
    ]);
  });

  it("joins wrapped lines of a paragraph and ignores surrounding whitespace", () => {
    expect(parseRichText("  Line one\nline two  \n\n\n")).toEqual([
      { type: "paragraph", text: "Line one line two" },
    ]);
  });

  it("returns no blocks for empty text", () => {
    expect(parseRichText("   \n ")).toEqual([]);
  });
});

describe("section schemas", () => {
  it("accept every default section", () => {
    for (const key of sectionKeys) {
      expect(sectionSchemas[key].safeParse(defaultContent[key]).success, key).toBe(true);
    }
  });

  it("reject media paths outside /media and /uploads", () => {
    const crew = structuredClone(defaultContent.crew);
    const member = crew.members[0];
    if (!member) throw new Error("default crew is empty");
    for (const src of ["https://evil.example/x.webp", "/uploads/../.env", "javascript:alert(1)"]) {
      member.photo.src = src;
      expect(sectionSchemas.crew.safeParse(crew).success, src).toBe(false);
    }
  });

  it("reject a bats season that ends before it starts", () => {
    const bats = { ...defaultContent.bats, openFrom: 8, openTo: 3 };
    expect(sectionSchemas.bats.safeParse(bats).success).toBe(false);
  });

  it("reject phone numbers with formatting characters", () => {
    const contact = { ...defaultContent.contact, phone: "+54 221 562-2173" };
    expect(sectionSchemas.contact.safeParse(contact).success).toBe(false);
  });
});

describe("mergeContent", () => {
  it("uses stored sections and falls back to defaults for missing ones", () => {
    const hero = { ...defaultContent.hero, lead: "Texto nuevo" };
    const content = mergeContent([{ key: "hero", content: hero }]);
    expect(content.hero.lead).toBe("Texto nuevo");
    expect(content.faq).toEqual(defaultContent.faq);
  });

  it("falls back to the default when a stored section no longer matches its schema", () => {
    const content = mergeContent([{ key: "hero", content: { lead: 42 } }]);
    expect(content.hero).toEqual(defaultContent.hero);
  });

  it("ignores unknown section keys", () => {
    const content = mergeContent([{ key: "legacy", content: {} }]);
    expect(Object.keys(content).sort()).toEqual([...sectionKeys].sort());
  });
});
