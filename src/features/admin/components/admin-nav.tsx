"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sectionMeta } from "@/features/admin/section-fields";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import { AdminIcon, type AdminIconName, sectionIcons } from "./admin-icons";

type NavItem = { href: string; label: string; icon: AdminIconName };

const groups: { title?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admin", label: "Inicio", icon: "home" }] },
  {
    title: "Secciones",
    items: sectionMeta.map((section) => ({
      href: `/admin/secciones/${section.key}`,
      label: section.title,
      icon: sectionIcons[section.key],
    })),
  },
  {
    title: "Archivos",
    items: [{ href: "/admin/medios", label: "Imágenes y videos", icon: "images" }],
  },
];

export function AdminNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // The drawer only exists below lg: Escape closes it and the page behind does not scroll.
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const initials = (name || email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const panel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <img src="/media/delta-mark.svg" alt="" width={36} height={36} />
        <div className="leading-tight">
          <p className="m-0 font-display text-[15px] font-semibold">Panel Delta</p>
          <p className="m-0 text-xs text-muted">Contenido del sitio</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
          className="ml-auto grid size-9 cursor-pointer place-items-center rounded-lg text-muted hover:bg-sand lg:hidden"
        >
          <AdminIcon name="x" />
        </button>
      </div>
      <nav aria-label="Panel" className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.title ?? "main"} className="mt-3 first:mt-0">
            {group.title ? (
              <p className="m-0 mb-1.5 px-3 text-[11px] font-extrabold tracking-[0.12em] text-muted/80 uppercase">
                {group.title}
              </p>
            ) : null}
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {group.items.map((item) => {
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold no-underline transition-colors duration-150",
                        active
                          ? "bg-delta/[0.08] text-delta-dark"
                          : "text-ink/80 hover:bg-sand hover:text-ink",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-delta transition-transform duration-200",
                          active ? "scale-y-100" : "scale-y-0",
                        )}
                      />
                      <AdminIcon
                        name={item.icon}
                        className={cn(
                          "transition-colors",
                          active ? "text-delta" : "text-muted group-hover:text-ink",
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink/80 no-underline hover:bg-sand hover:text-ink"
        >
          <AdminIcon name="external" className="text-muted" />
          Ver sitio
          <span className="sr-only">(se abre en otra pestaña)</span>
        </a>
        <div className="mt-2 flex items-center gap-3 rounded-lg bg-sand px-3 py-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white"
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="m-0 truncate text-sm font-semibold">{name || "Administrador"}</p>
            <p className="m-0 truncate text-xs text-muted">{email}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white hover:text-delta-dark disabled:opacity-50"
          >
            <AdminIcon
              name={signingOut ? "loader" : "logout"}
              className={signingOut ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="grid size-10 cursor-pointer place-items-center rounded-lg border border-line bg-white"
        >
          <AdminIcon name="menu" />
        </button>
        <img src="/media/delta-mark.svg" alt="" width={28} height={28} />
        <span className="font-display text-[15px] font-semibold">Panel Delta</span>
      </header>

      <aside className="hidden border-r border-line bg-white lg:sticky lg:top-0 lg:block lg:h-dvh">
        {panel}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="anim-fade-in absolute inset-0 cursor-default bg-ink/45"
          />
          <aside
            id="admin-drawer"
            aria-label="Menú del panel"
            className="anim-drawer absolute inset-y-0 left-0 w-[min(300px,85vw)] bg-white shadow-xl"
          >
            {panel}
          </aside>
        </div>
      ) : null}
    </>
  );
}
