"use client";

import { useEffect } from "react";

// Reveals `[data-reveal]` blocks as they enter the viewport. Blocks already on screen at
// hydration drop out of the effect entirely, so nothing visible ever flickers.
export function ScrollReveal() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")].filter(
      (target) => {
        if (target.getBoundingClientRect().top >= window.innerHeight) return true;
        target.removeAttribute("data-reveal");
        return false;
      },
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    for (const target of targets) observer.observe(target);
    root.classList.add("js-reveal");

    const revealAll = () => {
      if (!reducedMotion.matches) return;
      for (const target of targets) target.classList.add("is-revealed");
      observer.disconnect();
    };
    reducedMotion.addEventListener("change", revealAll);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", revealAll);
      root.classList.remove("js-reveal");
    };
  }, []);

  return null;
}
