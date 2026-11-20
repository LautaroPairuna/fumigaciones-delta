import { describe, expect, it } from "vitest";
import { defaultContent } from "@/features/content/defaults";
import { sectionKeys, sectionSchemas } from "@/features/content/schema";
import { type Field, sectionMeta } from "./section-fields";

function fieldNames(fields: Field[]): string[] {
  return fields.map((field) => field.name).sort();
}

function expectFieldsCover(fields: Field[], value: Record<string, unknown>, where: string) {
  expect(fieldNames(fields), where).toEqual(Object.keys(value).sort());
  for (const field of fields) {
    const nested = value[field.name];
    if (field.kind === "group") {
      expectFieldsCover(field.fields, nested as Record<string, unknown>, `${where}.${field.name}`);
    }
    if (field.kind === "list") {
      const first = (nested as Record<string, unknown>[])[0];
      if (first) expectFieldsCover(field.fields, first, `${where}.${field.name}[]`);
      expect(Object.keys(field.newItem).sort(), `${where}.${field.name} newItem`).toEqual(
        fieldNames(field.fields),
      );
    }
  }
}

describe("section editor fields", () => {
  it("describe every section exactly once", () => {
    expect(sectionMeta.map((section) => section.key).sort()).toEqual([...sectionKeys].sort());
  });

  it("cover every field of each section, nested lists included", () => {
    for (const section of sectionMeta) {
      expectFieldsCover(
        section.fields,
        defaultContent[section.key] as Record<string, unknown>,
        section.key,
      );
    }
  });

  it("start new list items empty, so saving without filling them fails validation", () => {
    const faq = structuredClone(defaultContent.faq);
    const field = sectionMeta
      .find((section) => section.key === "faq")
      ?.fields.find((item) => item.name === "questions");
    if (field?.kind !== "list") throw new Error("faq questions field missing");
    faq.questions.push(field.newItem as (typeof faq.questions)[number]);
    expect(sectionSchemas.faq.safeParse(faq).success).toBe(false);
  });
});
