import type { SectionKey } from "@/features/content/schema";

type Base = { name: string; label: string; hint?: string };

export type Field =
  | (Base & { kind: "text"; max: number; optional?: boolean })
  | (Base & { kind: "textarea"; max: number; rows?: number; optional?: boolean })
  | (Base & { kind: "boolean" })
  | (Base & { kind: "month" })
  | (Base & { kind: "icon" })
  | (Base & { kind: "image" })
  | (Base & { kind: "video" })
  | (Base & { kind: "stringList"; itemLabel: string; max: number; itemMax: number })
  | (Base & { kind: "group"; fields: Field[] })
  | (Base & {
      kind: "list";
      itemLabel: string;
      titleField: string;
      max: number;
      fields: Field[];
      newItem: Record<string, unknown>;
    });

export type SectionMeta = { key: SectionKey; title: string; description: string; fields: Field[] };

const problemFields: Field[] = [
  { kind: "icon", name: "icon", label: "Ícono" },
  { kind: "text", name: "title", label: "Título", max: 60 },
  { kind: "textarea", name: "text", label: "Descripción", max: 240, rows: 2 },
  {
    kind: "text",
    name: "href",
    label: "Enlace interno (opcional)",
    hint: "Ancla de una sección, por ejemplo #murcielagos. Vacío = sin enlace.",
    max: 40,
    optional: true,
  },
];

const newProblem = { icon: "bug", title: "", text: "", href: "" };

export const sectionMeta: SectionMeta[] = [
  {
    key: "contact",
    title: "Contacto y SEO",
    description: "Teléfono, WhatsApp, Instagram, zonas y el título que muestra Google.",
    fields: [
      {
        kind: "text",
        name: "title",
        label: "Título del sitio (Google y pestaña)",
        max: 70,
      },
      {
        kind: "textarea",
        name: "description",
        label: "Descripción para Google",
        hint: "Entre 120 y 160 caracteres rinde mejor en los resultados.",
        max: 200,
        rows: 3,
      },
      {
        kind: "text",
        name: "phone",
        label: "Teléfono para llamadas",
        hint: "Solo números con código de país, sin + ni espacios: 542215622173",
        max: 15,
      },
      { kind: "text", name: "phoneLabel", label: "Teléfono como se muestra", max: 30 },
      {
        kind: "text",
        name: "whatsapp",
        label: "Número de WhatsApp",
        hint: "Solo números con código de país: 542215622173",
        max: 15,
      },
      { kind: "text", name: "instagram", label: "Enlace de Instagram", max: 200 },
      {
        kind: "textarea",
        name: "greeting",
        label: "Mensaje inicial de WhatsApp",
        max: 200,
        rows: 2,
      },
      {
        kind: "stringList",
        name: "areaServed",
        label: "Zonas de cobertura",
        itemLabel: "Zona",
        max: 10,
        itemMax: 40,
      },
    ],
  },
  {
    key: "hero",
    title: "Portada",
    description: "Título principal, bajada y video de fondo.",
    fields: [
      { kind: "text", name: "titleLine1", label: "Título, primera línea", max: 40 },
      { kind: "text", name: "titleLine2", label: "Título, segunda línea", max: 40, optional: true },
      { kind: "textarea", name: "lead", label: "Bajada", max: 200, rows: 2 },
      { kind: "text", name: "ctaLabel", label: "Texto del botón", max: 40 },
      { kind: "video", name: "background", label: "Video de fondo" },
    ],
  },
  {
    key: "services",
    title: "Servicios",
    description: "Problemas que resuelven, agrupados, y lugares donde trabajan.",
    fields: [
      { kind: "text", name: "title", label: "Título", max: 80 },
      { kind: "text", name: "subtitle", label: "Subtítulo", max: 160, optional: true },
      { kind: "text", name: "emergencyLabel", label: "Botón de emergencias", max: 40 },
      { kind: "text", name: "indoorLabel", label: "Grupo 1: título", max: 60 },
      {
        kind: "list",
        name: "indoor",
        label: "Grupo 1: problemas",
        itemLabel: "Problema",
        titleField: "title",
        max: 8,
        fields: problemFields,
        newItem: newProblem,
      },
      { kind: "text", name: "animalsLabel", label: "Grupo 2: título", max: 60 },
      {
        kind: "list",
        name: "animals",
        label: "Grupo 2: problemas",
        itemLabel: "Problema",
        titleField: "title",
        max: 6,
        fields: problemFields,
        newItem: newProblem,
      },
      { kind: "text", name: "openAirLabel", label: "Grupo 3: título", max: 60 },
      { kind: "group", name: "openAir", label: "Grupo 3: servicio", fields: problemFields },
      { kind: "text", name: "placesLabel", label: "Lugares: título", max: 60 },
      {
        kind: "list",
        name: "places",
        label: "Lugares",
        itemLabel: "Lugar",
        titleField: "title",
        max: 6,
        fields: [
          { kind: "icon", name: "icon", label: "Ícono" },
          { kind: "text", name: "title", label: "Nombre", max: 40 },
          { kind: "boolean", name: "certified", label: "Muestra la etiqueta de certificado" },
        ],
        newItem: { icon: "house", title: "", certified: false },
      },
      { kind: "text", name: "certifiedLabel", label: "Etiqueta de certificado", max: 40 },
    ],
  },
  {
    key: "bats",
    title: "Murciélagos",
    description: "Texto de la especialidad, época permitida, ley y video de fondo.",
    fields: [
      { kind: "text", name: "eyebrow", label: "Antetítulo", max: 40 },
      { kind: "text", name: "title", label: "Título", max: 60 },
      { kind: "textarea", name: "lead", label: "Texto principal", max: 400, rows: 4 },
      {
        kind: "stringList",
        name: "points",
        label: "Etiquetas",
        itemLabel: "Etiqueta",
        max: 4,
        itemMax: 60,
      },
      { kind: "text", name: "ctaLabel", label: "Texto del botón", max: 60 },
      { kind: "text", name: "seasonLabel", label: "Época: antetítulo", max: 40 },
      { kind: "text", name: "seasonTitle", label: "Época: título", max: 60 },
      { kind: "month", name: "openFrom", label: "Época: desde" },
      { kind: "month", name: "openTo", label: "Época: hasta" },
      { kind: "text", name: "lawPrefix", label: "Ley: texto antes", max: 80, optional: true },
      { kind: "text", name: "lawName", label: "Ley: nombre (en negrita)", max: 80 },
      { kind: "text", name: "lawSuffix", label: "Ley: texto después", max: 120, optional: true },
      { kind: "textarea", name: "lawDetail", label: "Qué dice la ley", max: 1200, rows: 5 },
      { kind: "video", name: "background", label: "Video de fondo" },
    ],
  },
  {
    key: "coverage",
    title: "Reseñas y cobertura",
    description: "Reseñas de clientes, zona de servicio y garantías.",
    fields: [
      {
        kind: "list",
        name: "reviews",
        label: "Reseñas",
        itemLabel: "Reseña",
        titleField: "who",
        max: 12,
        fields: [
          { kind: "textarea", name: "text", label: "Texto", max: 200, rows: 2 },
          { kind: "text", name: "who", label: "Nombre y barrio", max: 60 },
        ],
        newItem: { text: "", who: "" },
      },
      { kind: "text", name: "eyebrow", label: "Antetítulo", max: 40 },
      { kind: "text", name: "titleLine1", label: "Título, primera línea", max: 40 },
      { kind: "text", name: "titleLine2", label: "Título, segunda línea", max: 40, optional: true },
      { kind: "textarea", name: "lead", label: "Texto", max: 300, rows: 3 },
      {
        kind: "list",
        name: "assurances",
        label: "Garantías",
        itemLabel: "Garantía",
        titleField: "title",
        max: 6,
        fields: [
          { kind: "icon", name: "icon", label: "Ícono" },
          { kind: "text", name: "title", label: "Título", max: 60 },
          { kind: "textarea", name: "text", label: "Texto", max: 160, rows: 2 },
        ],
        newItem: { icon: "shield", title: "", text: "" },
      },
      { kind: "text", name: "ctaLabel", label: "Texto del botón", max: 40 },
    ],
  },
  {
    key: "crew",
    title: "Equipo",
    description: "Presentación y fotos del equipo.",
    fields: [
      { kind: "text", name: "titleLine1", label: "Título, primera línea", max: 30 },
      { kind: "text", name: "titleLine2", label: "Título, segunda línea", max: 30, optional: true },
      { kind: "textarea", name: "lead", label: "Texto", max: 300, rows: 3 },
      {
        kind: "stringList",
        name: "note",
        label: "Frase destacada (una línea por renglón)",
        itemLabel: "Renglón",
        max: 4,
        itemMax: 40,
      },
      {
        kind: "list",
        name: "members",
        label: "Integrantes",
        itemLabel: "Integrante",
        titleField: "name",
        max: 5,
        fields: [
          { kind: "text", name: "name", label: "Nombre", max: 60 },
          { kind: "text", name: "role", label: "Puesto", max: 80 },
          { kind: "text", name: "focus", label: "Especialidad", max: 100, optional: true },
          {
            kind: "image",
            name: "photo",
            label: "Foto",
            hint: "Ideal: recorte vertical con fondo transparente (PNG o WebP).",
          },
          {
            kind: "text",
            name: "alt",
            label: "Descripción de la foto",
            hint: "La leen los lectores de pantalla y Google.",
            max: 160,
          },
          { kind: "boolean", name: "lead", label: "Destacado (foto más grande, al centro)" },
        ],
        newItem: {
          name: "",
          role: "",
          focus: "",
          photo: null,
          alt: "",
          lead: false,
        },
      },
    ],
  },
  {
    key: "quote",
    title: "Presupuesto",
    description: "Textos de la sección de contacto y de cada canal.",
    fields: [
      { kind: "text", name: "title", label: "Título", max: 60 },
      { kind: "textarea", name: "lead", label: "Texto", max: 300, rows: 3 },
      { kind: "text", name: "whatsappText", label: "WhatsApp: descripción", max: 80 },
      { kind: "text", name: "instagramText", label: "Instagram: descripción", max: 80 },
      { kind: "text", name: "phoneText", label: "Teléfono: descripción", max: 80 },
      { kind: "text", name: "coverageTitle", label: "Zona: título", max: 60 },
      { kind: "text", name: "coverageText", label: "Zona: descripción", max: 80 },
      { kind: "textarea", name: "note", label: "Nota al pie", max: 200, rows: 2, optional: true },
    ],
  },
  {
    key: "faq",
    title: "Preguntas frecuentes",
    description: "Preguntas y respuestas.",
    fields: [
      { kind: "text", name: "title", label: "Título", max: 60 },
      { kind: "text", name: "lead", label: "Bajada", max: 200, optional: true },
      { kind: "text", name: "ctaLabel", label: "Texto del botón", max: 40 },
      {
        kind: "list",
        name: "questions",
        label: "Preguntas",
        itemLabel: "Pregunta",
        titleField: "question",
        max: 20,
        fields: [
          { kind: "text", name: "question", label: "Pregunta", max: 160 },
          {
            kind: "textarea",
            name: "answer",
            label: "Respuesta",
            hint: "Separá párrafos con una línea en blanco. Empezá una línea con «- » para hacer una lista.",
            max: 2000,
            rows: 6,
          },
        ],
        newItem: { question: "", answer: "" },
      },
    ],
  },
  {
    key: "footer",
    title: "Pie de página",
    description: "Frase debajo del logo.",
    fields: [{ kind: "text", name: "tagline", label: "Frase", max: 120 }],
  },
];

export function getSectionMeta(key: string): SectionMeta | undefined {
  return sectionMeta.find((section) => section.key === key);
}
