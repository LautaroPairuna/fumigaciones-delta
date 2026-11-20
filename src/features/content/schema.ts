import { z } from "zod";
import { iconNames } from "@/components/icons";
import { defaultContent } from "./defaults";

z.config(z.locales.es());

const text = (max: number) => z.string().trim().min(1, "Campo obligatorio").max(max);
const optionalText = (max: number) => z.string().trim().max(max);

// Only files bundled in /public/media or uploaded through the panel; never external URLs.
const mediaPath = z
  .string()
  .regex(
    /^\/(media|uploads)\/[A-Za-z0-9][\w-]*\.(webp|jpg|jpeg|png|mp4)$/,
    "Ruta de archivo no válida",
  );

export const imageSchema = z.object(
  {
    src: mediaPath,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  },
  { error: "Elegí una imagen" },
);

export const backgroundVideoSchema = z.object(
  {
    src: mediaPath,
    poster: imageSchema,
  },
  { error: "Elegí un video" },
);

const icon = z.enum(iconNames);
const anchor = z.union([
  z.literal(""),
  z.string().regex(/^#[a-z][\w-]*$/, "Usá un ancla como #murcielagos"),
]);
const digits = z
  .string()
  .regex(/^\d{8,15}$/, "Solo números, con código de país (ej.: 5422155555555)");
const month = z.number().int().min(0).max(11);

const problem = z.object({
  icon,
  title: text(60),
  text: text(240),
  href: anchor,
});

export const sectionSchemas = {
  contact: z.object({
    title: text(70),
    description: text(200),
    phone: digits,
    phoneLabel: text(30),
    whatsapp: digits,
    instagram: z.url({ protocol: /^https$/ }),
    greeting: text(200),
    areaServed: z.array(text(40)).min(1).max(10),
  }),
  hero: z.object({
    titleLine1: text(40),
    titleLine2: optionalText(40),
    lead: text(200),
    ctaLabel: text(40),
    background: backgroundVideoSchema,
  }),
  services: z.object({
    title: text(80),
    subtitle: optionalText(160),
    emergencyLabel: text(40),
    indoorLabel: text(60),
    indoor: z.array(problem).min(1).max(8),
    animalsLabel: text(60),
    animals: z.array(problem).min(1).max(6),
    openAirLabel: text(60),
    openAir: problem,
    placesLabel: text(60),
    places: z
      .array(z.object({ icon, title: text(40), certified: z.boolean() }))
      .min(1)
      .max(6),
    certifiedLabel: text(40),
  }),
  bats: z
    .object({
      eyebrow: text(40),
      title: text(60),
      lead: text(400),
      points: z.array(text(60)).max(4),
      ctaLabel: text(60),
      seasonLabel: text(40),
      seasonTitle: text(60),
      openFrom: month,
      openTo: month,
      lawPrefix: optionalText(80),
      lawName: text(80),
      lawSuffix: optionalText(120),
      lawDetail: text(1200),
      background: backgroundVideoSchema,
    })
    .refine((bats) => bats.openFrom <= bats.openTo, {
      message: "El mes final tiene que ser igual o posterior al inicial",
      path: ["openTo"],
    }),
  coverage: z.object({
    reviews: z
      .array(z.object({ text: text(200), who: text(60) }))
      .min(1)
      .max(12),
    eyebrow: text(40),
    titleLine1: text(40),
    titleLine2: optionalText(40),
    lead: text(300),
    assurances: z.array(z.object({ icon, title: text(60), text: text(160) })).max(6),
    ctaLabel: text(40),
  }),
  crew: z.object({
    titleLine1: text(30),
    titleLine2: optionalText(30),
    lead: text(300),
    note: z.array(text(40)).max(4),
    members: z
      .array(
        z.object({
          name: text(60),
          role: text(80),
          focus: optionalText(100),
          photo: imageSchema,
          alt: text(160),
          lead: z.boolean(),
        }),
      )
      .min(1)
      .max(5),
  }),
  quote: z.object({
    title: text(60),
    lead: text(300),
    whatsappText: text(80),
    instagramText: text(80),
    phoneText: text(80),
    coverageTitle: text(60),
    coverageText: text(80),
    note: optionalText(200),
  }),
  faq: z.object({
    title: text(60),
    lead: optionalText(200),
    ctaLabel: text(40),
    questions: z
      .array(z.object({ question: text(160), answer: text(2000) }))
      .min(1)
      .max(20),
  }),
  footer: z.object({
    tagline: text(120),
  }),
};

export type SectionKey = keyof typeof sectionSchemas;
export type SiteContent = { [K in SectionKey]: z.infer<(typeof sectionSchemas)[K]> };
export type ImageAsset = z.infer<typeof imageSchema>;
export type BackgroundVideo = z.infer<typeof backgroundVideoSchema>;

export const sectionKeys = Object.keys(sectionSchemas) as SectionKey[];

export function isSectionKey(value: string): value is SectionKey {
  return Object.hasOwn(sectionSchemas, value);
}

export function mergeContent(rows: { key: string; content: unknown }[]): SiteContent {
  const content: Record<string, unknown> = { ...defaultContent };
  for (const row of rows) {
    if (!isSectionKey(row.key)) continue;
    const parsed = sectionSchemas[row.key].safeParse(row.content);
    if (parsed.success) content[row.key] = parsed.data;
  }
  return content as SiteContent;
}
