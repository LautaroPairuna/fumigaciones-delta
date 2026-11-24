"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#murcielagos", label: "Murciélagos" },
  { href: "#cobertura", label: "Cobertura" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#cotizar", label: "Contacto" },
];

const MOBILE_QUERY = "(max-width: 900px)";

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  const open = isMobile && menuOpen;

  // Syncs with the viewport media query; the menu only exists on mobile.
  useEffect(() => {
    const mobile = window.matchMedia(MOBILE_QUERY);
    const sync = () => {
      setIsMobile(mobile.matches);
      setMenuOpen(false);
    };
    sync();
    mobile.addEventListener("change", sync);
    return () => mobile.removeEventListener("change", sync);
  }, []);

  // The legacy CSS reads `body.menu-open`, which lives outside this component.
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      navRef.current?.querySelector("a")?.focus({ preventScroll: true });
    });
    const header = headerRef.current;
    const closeOutside = (event: Event) => {
      if (!header?.contains(event.target as Node)) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("click", closeOutside);
    document.addEventListener("focusin", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  // Scroll position drives the header shadow and the reading progress bar, batched per frame.
  useEffect(() => {
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const top = window.scrollY;
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(top > 16);
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${available > 0 ? Math.min(top / available, 1) : 0})`;
      }
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  // Highlights the nav link of the section in view; the hero clears it.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    let heroInView = false;
    let active: string | null = null;
    const publish = () => setCurrent(heroInView ? null : active);
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) active = `#${entry.target.id}`;
        }
        publish();
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
    );
    for (const { href } of links) {
      const section = document.querySelector(href);
      if (section) sectionObserver.observe(section);
    }
    const hero = document.querySelector("#inicio");
    const heroObserver = new IntersectionObserver(
      (entries) => {
        heroInView = entries[0]?.isIntersecting ?? false;
        publish();
      },
      { threshold: 0.6 },
    );
    if (hero) heroObserver.observe(hero);
    return () => {
      sectionObserver.disconnect();
      heroObserver.disconnect();
    };
  }, []);

  function handleNavClick(event: React.MouseEvent<HTMLElement>) {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href^='#']");
    if (!link) return;
    const wasOpen = open;
    setMenuOpen(false);
    if (!wasOpen) return;
    const destination = document.querySelector<HTMLElement>(link.getAttribute("href") ?? "");
    if (destination) {
      destination.setAttribute("tabindex", "-1");
      destination.focus({ preventScroll: true });
    }
  }

  return (
    <header ref={headerRef} className={scrolled ? "site-header is-scrolled" : "site-header"}>
      <div className="header-inner">
        <a
          className="brand"
          href="#inicio"
          aria-label="Fumigaciones Delta, ir al inicio"
          translate="no"
        >
          <img className="brand-mark" src="/media/delta-icon.svg" alt="" width={96} height={96} />
          <span className="flex flex-col items-start leading-none">
            <span className="mb-[0.18em] text-[0.3em] font-extrabold tracking-[0.24em] text-black">
              FUMIGACIONES
            </span>
            <span className="text-[#ff0010]">DELTA</span>
          </span>
        </a>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: delegated handler for the anchors inside, which are keyboard-activated natively */}
        <nav
          ref={navRef}
          className="site-nav"
          id="site-nav"
          aria-label="Navegación principal"
          inert={isMobile && !open}
          onClick={handleNavClick}
        >
          <div className="nav-links">
            {links.map(({ href, label }) => {
              const isCurrent = current === href;
              return (
                <a
                  key={href}
                  href={href}
                  className={isCurrent ? "is-current" : undefined}
                  aria-current={isCurrent ? "location" : undefined}
                >
                  {label}
                </a>
              );
            })}
          </div>
          <a className="button button-small nav-cta" href="#cotizar">
            Pedir presupuesto
            <Icon name="arrow" />
          </a>
        </nav>
        <button
          ref={toggleRef}
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen(!open)}
        >
          <span />
          <span />
        </button>
      </div>
      <div className="reading-progress" aria-hidden="true">
        <span ref={progressRef} />
      </div>
    </header>
  );
}
