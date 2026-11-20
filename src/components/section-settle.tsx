"use client";

import { useEffect } from "react";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// When the user releases a scroll gesture, eases to the nearest section edge.
// Any new input cancels it so the gesture is never fought.
export function SectionSettle() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const menuOpen = () => document.body.classList.contains("menu-open");
    let settleTimer = 0;
    let intentTimer = 0;
    let animationFrame = 0;
    let animating = false;
    let pendingIntent = false;
    let origin: number | null = null;
    let pointerDown = false;
    let armedOrigin = 0;

    function stopAnimation() {
      animating = false;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      document.documentElement.style.scrollBehavior = "";
    }

    function armSettle() {
      clearTimeout(intentTimer);
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, 170);
    }

    function noteIntent() {
      if (reducedMotion.matches || menuOpen()) return;
      if (origin == null) origin = window.scrollY;
      pendingIntent = true;
      if (animating) stopAnimation();
      clearTimeout(intentTimer);
      intentTimer = window.setTimeout(() => {
        if (settleTimer) return;
        pendingIntent = false;
        origin = null;
      }, 500);
    }

    function onPointerDown(event: PointerEvent) {
      if (event.button > 0) return;
      pointerDown = true;
      armedOrigin = window.scrollY;
      if (animating) stopAnimation();
    }

    function releasePointer() {
      pointerDown = false;
    }

    const navigationKeys = new Set([
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "Home",
      "End",
      " ",
    ]);
    function onKeyDown(event: KeyboardEvent) {
      if (animating && navigationKeys.has(event.key)) stopAnimation();
    }

    function onScroll() {
      if (animating) return;
      if (pointerDown && !reducedMotion.matches && !menuOpen()) {
        pendingIntent = true;
        if (origin == null) origin = armedOrigin;
      }
      if (pendingIntent) armSettle();
    }

    function onReducedMotionChange() {
      if (!reducedMotion.matches) return;
      clearTimeout(settleTimer);
      clearTimeout(intentTimer);
      settleTimer = 0;
      stopAnimation();
      pendingIntent = false;
      origin = null;
    }

    function settle() {
      settleTimer = 0;
      if (pointerDown) {
        armSettle();
        return;
      }
      const travel = window.scrollY - (origin ?? window.scrollY);
      pendingIntent = false;
      origin = null;
      if (reducedMotion.matches || menuOpen() || Math.abs(travel) < 1) return;
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.toString().trim()) return;
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        active.matches("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      const headerH = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
      const viewH = window.innerHeight;
      const frameH = Math.max(1, viewH - headerH);
      const scroll = window.scrollY;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewH);
      if (maxScroll < 12) return;

      const points: number[] = [];
      let covered = false;
      for (const section of document.querySelectorAll("main > section")) {
        const rect = section.getBoundingClientRect();
        const height = rect.height;
        if (height < 48) continue;
        const top = rect.top + scroll;
        const start = clamp(top - headerH, 0, maxScroll);
        if (height > frameH + 20 && rect.top <= headerH + 10 && rect.bottom >= viewH - 10) {
          covered = true;
        }
        points.push(start);
        if (height > frameH + 20) {
          const end = clamp(top + height - viewH, 0, maxScroll);
          if (end - start > 24) points.push(end);
        }
      }
      if (covered) return;
      points.push(maxScroll);

      const unique: number[] = [];
      for (const point of points.sort((a, b) => a - b)) {
        const previous = unique.at(-1);
        if (previous == null || point - previous > 10) unique.push(point);
      }

      let target: number | null = null;
      let best = Number.POSITIVE_INFINITY;
      const direction = Math.sign(travel);
      for (const point of unique) {
        const distance = Math.abs(point - scroll);
        if (target == null || distance < best - 8) {
          target = point;
          best = distance;
          continue;
        }
        if (Math.abs(distance - best) > 36 || !direction) continue;
        const candidateFollows = direction > 0 ? point >= scroll : point <= scroll;
        const currentFollows = direction > 0 ? target >= scroll : target <= scroll;
        if (candidateFollows && !currentFollows) {
          target = point;
          best = distance;
        }
      }
      if (target == null || best < 6 || best > viewH * 0.52) return;
      if (Math.abs(travel) < 28 && best > 64) return;

      const duration = Math.round(Math.min(700, Math.max(420, 320 + best * 0.4)));
      const startY = scroll;
      const delta = target - startY;
      const started = performance.now();
      animating = true;
      document.documentElement.style.scrollBehavior = "auto";
      const step = (now: number) => {
        if (!animating) return;
        const progress = Math.min(1, (now - started) / duration);
        window.scrollTo(0, startY + delta * (1 - (1 - progress) ** 3));
        if (progress < 1) animationFrame = requestAnimationFrame(step);
        else stopAnimation();
      };
      animationFrame = requestAnimationFrame(step);
    }

    const passive = { passive: true } as const;
    window.addEventListener("wheel", noteIntent, passive);
    window.addEventListener("touchstart", noteIntent, passive);
    document.addEventListener("pointerdown", onPointerDown, passive);
    document.addEventListener("pointerup", releasePointer, passive);
    document.addEventListener("pointercancel", releasePointer, passive);
    window.addEventListener("keydown", onKeyDown, passive);
    window.addEventListener("scroll", onScroll, passive);
    reducedMotion.addEventListener("change", onReducedMotionChange);
    return () => {
      clearTimeout(settleTimer);
      clearTimeout(intentTimer);
      stopAnimation();
      window.removeEventListener("wheel", noteIntent);
      window.removeEventListener("touchstart", noteIntent);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", releasePointer);
      document.removeEventListener("pointercancel", releasePointer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      reducedMotion.removeEventListener("change", onReducedMotionChange);
    };
  }, []);

  return null;
}
