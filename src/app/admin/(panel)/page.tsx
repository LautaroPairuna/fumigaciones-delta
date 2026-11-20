import type { Metadata } from "next";
import Link from "next/link";
import { AdminIcon, sectionIcons } from "@/features/admin/components/admin-icons";
import { sectionMeta } from "@/features/admin/section-fields";
import { requireAdmin } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Inicio" };

const format = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("es-AR", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date()),
  );
  if (hour < 12) return "Buen día";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

const stagger = (index: number) => ({ "--i": index }) as React.CSSProperties;

export default async function AdminHome() {
  const session = await requireAdmin();
  const [rows, mediaCount] = await Promise.all([
    getPrisma().section.findMany({ select: { key: true, updatedAt: true, updatedBy: true } }),
    getPrisma().media.count(),
  ]);
  const updates = new Map(rows.map((row) => [row.key, row]));
  const lastUpdate = rows.reduce<(typeof rows)[number] | null>(
    (latest, row) => (!latest || row.updatedAt > latest.updatedAt ? row : latest),
    null,
  );
  const firstName = session.user.name.split(" ")[0] || "";

  const stats = [
    {
      label: "Secciones editadas",
      value: `${rows.length} de ${sectionMeta.length}`,
      icon: "check" as const,
    },
    { label: "Imágenes y videos", value: String(mediaCount), icon: "images" as const },
    {
      label: "Última edición",
      value: lastUpdate ? format.format(lastUpdate.updatedAt) : "Sin cambios todavía",
      icon: "restore" as const,
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-sm font-semibold text-delta">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </p>
          <h1 className="m-0 mt-1 font-display text-[32px] leading-tight font-semibold tracking-[-0.02em]">
            Contenido del sitio
          </h1>
          <p className="mt-2 mb-0 max-w-xl text-muted">
            Elegí una sección para editarla. Los cambios se publican apenas guardás.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink no-underline transition-colors hover:border-delta/60 hover:text-delta-dark"
        >
          <AdminIcon name="external" />
          Ver sitio
          <span className="sr-only">(se abre en otra pestaña)</span>
        </a>
      </header>

      <dl className="m-0 grid gap-3 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="anim-fade-up flex items-center gap-4 rounded-xl border border-line bg-white p-4"
            style={stagger(index)}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-sand text-delta">
              <AdminIcon name={stat.icon} />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-bold tracking-wide text-muted uppercase">{stat.label}</dt>
              <dd className="m-0 mt-0.5 truncate text-[15px] font-bold">{stat.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <section aria-labelledby="sections-title">
        <h2 id="sections-title" className="m-0 mb-4 font-display text-lg font-semibold">
          Secciones
        </h2>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {sectionMeta.map((section, index) => {
            const update = updates.get(section.key);
            return (
              <li key={section.key} className="anim-fade-up" style={stagger(index + 3)}>
                <Link
                  href={`/admin/secciones/${section.key}`}
                  className="lift group flex h-full flex-col gap-3 rounded-xl border border-line bg-white p-5 text-ink no-underline hover:border-delta/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-delta/[0.08] text-delta transition-colors duration-200 group-hover:bg-delta group-hover:text-white">
                      <AdminIcon name={sectionIcons[section.key]} />
                    </span>
                    <AdminIcon
                      name="chevronRight"
                      className="text-muted/60 transition-[translate,color] duration-200 group-hover:translate-x-0.5 group-hover:text-delta"
                    />
                  </div>
                  <div>
                    <strong className="text-base">{section.title}</strong>
                    <p className="m-0 mt-1 text-sm text-muted">{section.description}</p>
                  </div>
                  <p className="m-0 mt-auto flex items-center gap-1.5 border-t border-line pt-3 text-xs text-muted">
                    <span
                      aria-hidden="true"
                      className={`size-1.5 rounded-full ${update ? "bg-green-600" : "bg-line"}`}
                    />
                    {update
                      ? `Editado ${format.format(update.updatedAt)}${update.updatedBy ? ` · ${update.updatedBy}` : ""}`
                      : "Contenido original"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Link
        href="/admin/medios"
        className="lift anim-fade-up group flex items-center gap-4 rounded-xl border border-dashed border-muted/30 bg-sand p-5 text-ink no-underline hover:border-delta/50"
        style={stagger(sectionMeta.length + 3)}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white text-delta">
          <AdminIcon name="images" />
        </span>
        <span className="flex-1">
          <strong className="block text-base">Imágenes y videos</strong>
          <span className="text-sm text-muted">
            Subí fotos y videos de fondo. Se optimizan solos al subirlos.
          </span>
        </span>
        <AdminIcon
          name="chevronRight"
          className="text-muted/60 transition-[translate,color] duration-200 group-hover:translate-x-0.5 group-hover:text-delta"
        />
      </Link>
    </div>
  );
}
