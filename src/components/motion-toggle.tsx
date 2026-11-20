import { cn } from "@/lib/cn";

const tones = {
  dark: "size-10 border-white/40 bg-ink/55 text-white hover:bg-ink/80 focus-visible:outline-white",
  light: "size-9 border-line bg-white/90 text-ink hover:bg-white focus-visible:outline-delta-dark",
};

export function MotionToggle({
  playing,
  label,
  onToggle,
  tone = "dark",
  className,
}: {
  playing: boolean;
  label: string;
  onToggle: () => void;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${playing ? "Pausar" : "Reproducir"} ${label}`}
      className={cn(
        "absolute z-10 grid cursor-pointer place-items-center rounded-full border backdrop-blur-sm transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 motion-reduce:hidden",
        tones[tone],
        className,
      )}
    >
      {playing ? (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="currentColor">
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
        </svg>
      )}
    </button>
  );
}
