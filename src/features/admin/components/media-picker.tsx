"use client";

import { useRef, useState } from "react";
import type { MediaItem } from "@/features/media/service";
import { AdminIcon } from "./admin-icons";
import { Button, formatBytes } from "./ui";
import { ACCEPT, type UploadKind, uploadMedia } from "./upload";

export function UploadButton({
  kind,
  onUploaded,
  label,
}: {
  kind: UploadKind;
  onUploaded: (item: MediaItem) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      const item = await uploadMedia(file, kind, setProgress);
      onUploaded(item);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo subir el archivo");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const processing = progress !== null && progress >= 1;
  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <Button
        variant="secondary"
        icon="upload"
        loading={progress !== null}
        onClick={() => inputRef.current?.click()}
      >
        {progress === null
          ? (label ?? (kind === "image" ? "Subir imagen" : "Subir video"))
          : processing
            ? kind === "video"
              ? "Optimizando video…"
              : "Optimizando…"
            : `Subiendo ${Math.round(progress * 100)} %`}
      </Button>
      {progress !== null ? (
        <div
          role="progressbar"
          aria-label="Progreso de la subida"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={processing ? undefined : Math.round(progress * 100)}
          className="h-1.5 w-full overflow-hidden rounded-full bg-sand"
        >
          <div
            className={`h-full rounded-full bg-delta transition-[width] duration-300 ${processing ? "w-full animate-pulse" : ""}`}
            style={processing ? undefined : { width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="m-0 text-sm text-delta-dark">
          {error}
        </p>
      ) : null}
      <p className="m-0 text-xs text-muted">
        {kind === "image"
          ? "JPG, PNG, WebP o AVIF hasta 20 MB. Se convierte a WebP de hasta 2560 px."
          : "MP4, MOV, WebM o MKV hasta 300 MB. Se recorta a 40 s, sin sonido, a 1280 px."}
      </p>
    </div>
  );
}

export function MediaPicker({
  kind,
  library,
  onLibraryChange,
  onPick,
  label,
}: {
  kind: UploadKind;
  library: MediaItem[];
  onLibraryChange: (items: MediaItem[]) => void;
  onPick: (item: MediaItem) => void;
  label: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const items = library.filter((item) => item.kind === kind);

  function pick(item: MediaItem) {
    onPick(item);
    dialogRef.current?.close();
  }

  return (
    <>
      <Button
        variant="secondary"
        icon={kind === "image" ? "image" : "video"}
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${kind}-picker-title`}
        className="m-auto w-[min(920px,calc(100%-32px))] rounded-2xl border border-line bg-white p-0 shadow-2xl shadow-ink/20 backdrop:bg-ink/55 backdrop:backdrop-blur-[2px]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
          <h2 id={`${kind}-picker-title`} className="m-0 font-display text-xl font-semibold">
            {kind === "image" ? "Elegir imagen" : "Elegir video"}
          </h2>
          <Button
            variant="ghost"
            icon="x"
            aria-label="Cerrar"
            className="px-2.5"
            onClick={() => dialogRef.current?.close()}
          />
        </div>
        <div className="flex flex-col gap-5 p-6">
          <UploadButton
            kind={kind}
            onUploaded={(item) => {
              onLibraryChange([item, ...library]);
              pick(item);
            }}
          />
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line py-10 text-center">
              <AdminIcon
                name={kind === "image" ? "image" : "video"}
                className="size-7 text-muted/60"
              />
              <p className="m-0 text-sm text-muted">
                Todavía no hay {kind === "image" ? "imágenes" : "videos"} subidos.
              </p>
            </div>
          ) : (
            <ul className="m-0 grid max-h-[55vh] list-none grid-cols-2 gap-3 overflow-y-auto p-0 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="anim-fade-up"
                  style={{ "--i": Math.min(index, 12) } as React.CSSProperties}
                >
                  <button
                    type="button"
                    onClick={() => pick(item)}
                    className="lift flex w-full cursor-pointer flex-col gap-1.5 rounded-xl border border-line bg-white p-2 text-left hover:border-delta"
                  >
                    <img
                      src={item.poster?.src ?? item.src}
                      alt=""
                      width={item.width}
                      height={item.height}
                      loading="lazy"
                      className="aspect-video w-full rounded-lg bg-sand object-contain"
                    />
                    <span className="truncate text-xs font-semibold">{item.originalName}</span>
                    <span className="text-xs text-muted">
                      {item.width}×{item.height} · {formatBytes(item.bytes)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  );
}
