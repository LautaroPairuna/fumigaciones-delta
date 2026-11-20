"use client";

import { useEffect, useRef, useState } from "react";
import { MotionToggle } from "@/components/motion-toggle";

type Poster = {
  src: string;
  width: number;
  height: number;
  loading?: "lazy";
  fetchPriority?: "high";
};

type NetworkInformation = EventTarget & { saveData?: boolean };

// Decorative background video: downloads and plays only while visible, never with reduced
// motion or Save-Data, and can always be paused (WCAG 2.2.2).
export function AmbientBackdrop({
  className,
  poster,
  video,
  toggleClassName,
}: {
  className: string;
  poster: Poster;
  video: { id: string; src: string };
  toggleClassName: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pausedByUser = useRef(false);
  const syncRef = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    let inView = false;
    let loaded = false;
    let playPending = false;

    const isAllowed = () => !reducedMotion.matches && !connection?.saveData;
    const shouldPlay = () => isAllowed() && inView && !document.hidden && !pausedByUser.current;

    function sync() {
      if (!element) return;
      setAllowed(isAllowed());
      if (!shouldPlay()) {
        element.pause();
        return;
      }
      if (!loaded) {
        element.src = video.src;
        element.muted = true;
        element.load();
        loaded = true;
      }
      if (playPending || !element.paused) return;
      playPending = true;
      element
        .play()
        .then(() => {
          if (!shouldPlay()) element.pause();
        })
        .catch(() => {
          pausedByUser.current = true;
        })
        .finally(() => {
          playPending = false;
        });
    }
    syncRef.current = sync;

    const onPlay = () => {
      element.classList.add("is-playing");
      setPlaying(true);
    };
    const onPause = () => {
      element.classList.remove("is-playing");
      setPlaying(false);
    };
    element.addEventListener("play", onPlay);
    element.addEventListener("pause", onPause);
    document.addEventListener("visibilitychange", sync);
    connection?.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { threshold: 0.1 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      element.removeEventListener("play", onPlay);
      element.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", sync);
      connection?.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, [video.src]);

  function toggle() {
    pausedByUser.current = playing;
    syncRef.current();
  }

  return (
    <>
      <div className={className} aria-hidden="true">
        <img
          src={poster.src}
          alt=""
          width={poster.width}
          height={poster.height}
          loading={poster.loading}
          fetchPriority={poster.fetchPriority}
        />
        <video
          ref={videoRef}
          id={video.id}
          muted
          loop
          playsInline
          preload="none"
          poster={poster.src}
          tabIndex={-1}
        />
      </div>
      {allowed && (
        <MotionToggle
          playing={playing}
          label="video de fondo"
          onToggle={toggle}
          className={toggleClassName}
        />
      )}
    </>
  );
}
