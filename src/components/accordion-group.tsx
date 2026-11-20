"use client";

import { type ReactNode, useEffect, useRef } from "react";

const DURATION_MS = 380;
const EASING = "cubic-bezier(0.16, 0.84, 0.32, 1)";

// Animates opening and closing of the `<details>` inside it and keeps only one open.
// Without JS the native `<details name>` behavior still works, just without motion.
export function AccordionGroup({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const items = [...group.querySelectorAll<HTMLDetailsElement>(":scope > details")];
    const running = new WeakMap<HTMLDetailsElement, Animation>();

    // The native `name` would close siblings instantly; exclusivity is handled here instead.
    const names = items.map((item) => item.getAttribute("name"));
    for (const item of items) item.removeAttribute("name");

    const panelOf = (item: HTMLDetailsElement) => item.querySelector<HTMLElement>(":scope > div");

    function animate(item: HTMLDetailsElement, opening: boolean) {
      const panel = panelOf(item);
      const interrupted = running.get(item);
      // Measured before cancelling, so a reversed animation continues from where it is.
      const current =
        panel && interrupted
          ? {
              height: panel.getBoundingClientRect().height,
              opacity: Number(getComputedStyle(panel).opacity),
            }
          : null;
      interrupted?.cancel();
      if (opening) {
        delete item.dataset.closing;
        item.open = true;
      } else {
        item.dataset.closing = "";
      }
      if (!panel || reducedMotion.matches) {
        finish(item, opening);
        return;
      }
      const from = current ?? {
        height: opening ? 0 : panel.getBoundingClientRect().height,
        opacity: opening ? 0 : 1,
      };
      const to = { height: opening ? panel.scrollHeight : 0, opacity: opening ? 1 : 0 };
      const animation = panel.animate(
        [
          { height: `${from.height}px`, opacity: from.opacity },
          { height: `${to.height}px`, opacity: to.opacity },
        ],
        { duration: DURATION_MS, easing: EASING },
      );
      panel.style.overflow = "hidden";
      running.set(item, animation);
      animation.onfinish = () => {
        panel.style.overflow = "";
        running.delete(item);
        finish(item, opening);
      };
      animation.oncancel = () => {
        panel.style.overflow = "";
      };
    }

    function finish(item: HTMLDetailsElement, opening: boolean) {
      if (opening) return;
      delete item.dataset.closing;
      item.open = false;
    }

    function onClick(event: MouseEvent) {
      const summary = (event.target as Element).closest("summary");
      const item = summary?.parentElement;
      if (!(item instanceof HTMLDetailsElement) || !items.includes(item)) return;
      event.preventDefault();
      const opening = !item.open || item.dataset.closing !== undefined;
      animate(item, opening);
      if (!opening) return;
      for (const other of items) {
        if (other !== item && other.open && other.dataset.closing === undefined) {
          animate(other, false);
        }
      }
    }

    group.addEventListener("click", onClick);
    return () => {
      group.removeEventListener("click", onClick);
      items.forEach((item, index) => {
        const name = names[index];
        if (name) item.setAttribute("name", name);
      });
    };
  }, []);

  return (
    <div ref={groupRef} className={className}>
      {children}
    </div>
  );
}
