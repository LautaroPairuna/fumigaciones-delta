"use client";

import { useEffect, useEffectEvent } from "react";
import { cn } from "@/lib/cn";
import { AdminIcon } from "./admin-icons";

const VISIBLE_MS = 4000;

export function Toast({
  tone,
  children,
  onDone,
}: {
  tone: "ok" | "error";
  children: React.ReactNode;
  onDone: () => void;
}) {
  // Dismisses itself; a timer (not animationend) so it also works with reduced motion.
  const dismiss = useEffectEvent(onDone);
  useEffect(() => {
    const timer = window.setTimeout(dismiss, VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "anim-toast fixed right-5 bottom-24 z-50 flex max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-semibold shadow-lg shadow-ink/10",
        tone === "ok" ? "border-green-700/25 text-green-900" : "border-delta/30 text-delta-dark",
      )}
    >
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full text-white",
          tone === "ok" ? "bg-green-700" : "bg-delta",
        )}
      >
        <AdminIcon name={tone === "ok" ? "check" : "alert"} className="size-3.5" />
      </span>
      <span className="pt-0.5">{children}</span>
    </div>
  );
}
