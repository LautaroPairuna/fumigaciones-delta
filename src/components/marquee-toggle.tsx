"use client";

import { useState } from "react";
import { MotionToggle } from "@/components/motion-toggle";

export function MarqueeToggle({ trackId, className }: { trackId: string; className: string }) {
  const [playing, setPlaying] = useState(true);

  function toggle() {
    const next = !playing;
    document.getElementById(trackId)?.classList.toggle("is-paused", !next);
    setPlaying(next);
  }

  return (
    <MotionToggle
      playing={playing}
      label="reseñas en movimiento"
      onToggle={toggle}
      tone="light"
      className={className}
    />
  );
}
