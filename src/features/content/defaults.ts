import type { SiteContent } from "./schema";

export const defaultContent: SiteContent = {
  contact: {
    title: "Delta · Fumigaciones en La Plata",
    description:
      "Fumigaciones Delta en La Plata. Control de plagas, exclusión de murciélagos y servicios certificados para casas, gastronomía e industria. Presupuesto sin cargo.",
    phone: "542215622173",
    phoneLabel: "0221 562-2173",
    whatsapp: "542215622173",
    instagram: "https://www.instagram.com/deltafumigacion/",
    greeting: "Hola Fumigaciones Delta. Quiero consultar por un servicio.",
    areaServed: ["La Plata", "City Bell", "Gonnet", "Ensenada"],
  },
  hero: {
    titleLine1: "Control total",
    titleLine2: "de plagas.",
    lead: "Casas, negocios y locales gastronómicos en La Plata. Presupuesto sin cargo.",
    ctaLabel: "Pedir presupuesto",
    background: {
      src: "/media/inicio-fondo.mp4",
      poster: { src: "/media/inicio-fondo-poster.jpg", width: 1280, height: 720 },
    },
  },
  services: {
    title: "Problemas que resolvemos",
    subtitle: "Si tu caso está en esta lista, lo atendemos.",
    emergencyLabel: "Emergencias 24 h",
    indoorLabel: "En casa o en el local",
    indoor: [
      { icon: "bug", title: "Cucarachas", text: "Cocina, baño y zonas húmedas.", href: "" },
      { icon: "rat", title: "Roedores", text: "Casa, depósito o local.", href: "" },
      { icon: "paw", title: "Pulgas y garrapatas", text: "Donde hay mascotas.", href: "" },
      { icon: "bed", title: "Chinches de cama", text: "Colchón y dormitorio.", href: "" },
    ],
    animalsLabel: "Entró un animal",
    animals: [
      {
        icon: "bat",
        title: "Murciélagos",
        text: "Exclusión en techo y taparrollo.",
        href: "#murcielagos",
      },
      {
        icon: "squirrel",
        title: "Comadrejas y lagartos",
        text: "Captura y reubicación.",
        href: "",
      },
    ],
    openAirLabel: "Espacio abierto",
    openAir: {
      icon: "wind",
      title: "Termonebulización",
      text: "Patios, quintas, campings, canchas, galerías y salones. Niebla de microgotas que se adhiere al follaje, al césped y a las superficies.",
      href: "",
    },
    placesLabel: "Dónde trabajamos",
    places: [
      { icon: "house", title: "Casas", certified: false },
      { icon: "utensils", title: "Gastronomía", certified: true },
      { icon: "factory", title: "Industria", certified: true },
    ],
    certifiedLabel: "Con certificado",
  },
  bats: {
    eyebrow: "Especialistas",
    title: "Murciélagos",
    lead: "Somos especialistas. Hacemos exclusiones amigables, con un enfoque ecológico y de preservación de la especie: el animal sale y el acceso se cierra.",
    points: ["Techo y taparrollo", "Trabajos en altura"],
    ctaLabel: "Consultar por murciélagos",
    seasonLabel: "Época permitida",
    seasonTitle: "De abril a septiembre",
    openFrom: 3,
    openTo: 8,
    lawPrefix: "Trabajamos según la",
    lawName: "Ley Nacional N.º 22.421",
    lawSuffix: "de conservación de la fauna.",
    lawDetail:
      "Declara de interés público la protección y conservación de la fauna silvestre. Prohíbe la caza, la captura o la destrucción de ejemplares, de sus crías o de sus refugios cuando se hace en infracción a las normas vigentes. Las penas previstas son multa, comiso y prisión de un mes a tres años, en los supuestos de la ley.",
    background: {
      src: "/media/fondo-murcielago.mp4",
      poster: { src: "/media/fondo-murcielago-poster.jpg", width: 1600, height: 900 },
    },
  },
  coverage: {
    reviews: [
      { text: "Marcaron el foco de cucarachas y a los días no vimos más.", who: "Camila, Tolosa" },
      { text: "En el local coordinaron fuera del horario de cocina.", who: "Martín, Centro" },
      {
        text: "Pensábamos que eran ratas. Eran murciélagos y lo cerraron.",
        who: "Diego, City Bell",
      },
      {
        text: "Pulgas en la casa. Volvieron a controlar y quedó resuelto.",
        who: "Pablo, Los Hornos",
      },
      {
        text: "Explicaron qué no tocar ese día. El departamento quedó habitable.",
        who: "Laura, Gonnet",
      },
      { text: "Puntuales, y la casa no quedó con olor.", who: "Sofía, Berisso" },
    ],
    eyebrow: "Zona de servicio",
    titleLine1: "Cobertura en",
    titleLine2: "La Plata.",
    lead: "Casas, negocios y locales gastronómicos. Confirmamos la zona antes de coordinar la visita.",
    assurances: [
      {
        icon: "shield",
        title: "Exclusión de murciélagos",
        text: "Diagnóstico del ingreso y cierre, con seguimiento.",
      },
      {
        icon: "hygiene",
        title: "Tratamiento ecológico",
        text: "El lugar queda habitable, sin un olor que se quede.",
      },
      {
        icon: "tools",
        title: "Instrumentos profesionales",
        text: "Gel, estaciones y equipos según el foco.",
      },
      {
        icon: "van",
        title: "Servicio a domicilio",
        text: "Movilidad propia en La Plata, City Bell, Gonnet y Ensenada.",
      },
    ],
    ctaLabel: "Cotizar para mi zona",
  },
  crew: {
    titleLine1: "Quiénes",
    titleLine2: "somos",
    lead: "Personal capacitado en control de plagas urbanas. Contamos con las herramientas para resolverlo.",
    note: ["Profesional,", "eficiente", "y ecológica."],
    members: [
      {
        name: "Marcelo",
        role: "Técnico aplicador",
        focus: "Insectos, pulgas y chinches de cama",
        photo: { src: "/media/marcelo-recorte.webp", width: 391, height: 800 },
        alt: "Marcelo, técnico aplicador de Fumigaciones Delta",
        lead: false,
      },
      {
        name: "Francisco Arce",
        role: "Dueño y técnico en manejo integral de plagas",
        focus: "",
        photo: { src: "/media/francisco-recorte.webp", width: 523, height: 1040 },
        alt: "Francisco Arce, dueño y técnico en manejo integral de plagas",
        lead: true,
      },
      {
        name: "Nicolás",
        role: "Técnico aplicador",
        focus: "Cucarachas alemanas y roedores",
        photo: { src: "/media/nicolas-recorte.webp", width: 318, height: 800 },
        alt: "Nicolás, técnico aplicador de Fumigaciones Delta",
        lead: false,
      },
    ],
  },
  quote: {
    title: "Pedí tu presupuesto.",
    lead: "El cotizador arma el mensaje con tu nombre, qué está pasando y la dirección. Si preferís, llamá o escribinos.",
    whatsappText: "Consulta o presupuesto por mensaje.",
    instagramText: "Escribinos o mandá fotos del lugar.",
    phoneText: "Atención y emergencias.",
    coverageTitle: "La Plata y alrededores",
    coverageText: "City Bell, Gonnet, Ensenada y zonas cercanas.",
    note: "Casas, negocios y locales gastronómicos en La Plata, City Bell, Gonnet y Ensenada.",
  },
  faq: {
    title: "Preguntas frecuentes",
    lead: "Lo que más nos consultan antes de un tratamiento.",
    ctaLabel: "¿Otra duda? Escribinos",
    questions: [
      {
        question: "¿Tengo que abandonar mi casa para fumigar?",
        answer:
          "Si el trabajo es en toda la casa, conviene irse y volver a las 4 horas, cuando se disipen los gases.\n\n- Guardá en bolsas de consorcio los alimentos abiertos, los cepillos de dientes y el papel higiénico.\n- Las mascotas salen con vos.\n\nDel resto nos hacemos cargo nosotros.",
      },
      {
        question: "¿Usan productos tóxicos?",
        answer:
          "El tratamiento usa insecticida químico. Todos los productos están aprobados por ANMAT y habilitados para uso domiciliario.",
      },
      {
        question: "¿Emiten certificados?",
        answer:
          "Sí. Emitimos certificados avalados por el Ministerio de Desarrollo Agrario y por un asesor técnico matriculado.",
      },
    ],
  },
  footer: {
    tagline: "Control de plagas urbanas en La Plata.",
  },
};
