import type { CSSProperties } from "react";

export function reveal(order = 0, kind: "rise" | "fade" = "rise") {
  return {
    "data-reveal": kind,
    style: { "--reveal-order": order } as CSSProperties,
  };
}
