"use client";

import { useState, useTransition } from "react";
import { deleteMediaAction } from "@/features/admin/actions";
import type { MediaItem } from "@/features/media/service";
import { AdminIcon } from "./admin-icons";
import { UploadButton } from "./media-picker";
import { Toast } from "./toast";
import { Button, formatBytes } from "./ui";

export function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string; id: number } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  function remove(item: MediaItem) {
    if (!window.confirm(`¿Eliminar «${item.originalName}»? No se puede deshacer.`)) return;
    startTransition(async () => {
      const result = await deleteMediaAction(item.id);
      if (result.ok) {
        setItems((current) => current.filter((other) => other.id !== item.id));
        setMessage({ tone: "ok", text: `Se eliminó «${item.originalName}».`, id: Date.now() });
      } else {
        setMessage({ tone: "error", text: result.error, id: Date.now() });
      }
    });
  }

  const added = (item: MediaItem) => {
    setItems((current) => [item, ...current]);
    setMessage({
      tone: "ok",
      text: `Se subió «${item.originalName}». Ya podés elegirlo desde cualquier sección.`,
      id: Date.now(),
    });
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <h1 className="m-0 font-display text-[28px] leading-tight font-semibold tracking-[-0.02em]">
          Imágenes y videos
        </h1>
        <p className="mt-2 mb-0 text-muted">
          Lo que subas queda optimizado para la web. Para usarlo, elegilo desde la sección que
          corresponda.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-4">
          <UploadButton kind="image" onUploaded={added} />
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <UploadButton kind="video" onUploaded={added} />
        </div>
      </div>
      {message ? (
        <Toast key={message.id} tone={message.tone} onDone={() => setMessage(null)}>
          {message.text}
        </Toast>
      ) : null}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-white py-14 text-center">
          <AdminIcon name="images" className="size-8 text-muted/60" />
          <p className="m-0 font-semibold">Todavía no subiste archivos</p>
          <p className="m-0 text-sm text-muted">Usá los botones de arriba para empezar.</p>
        </div>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="lift anim-fade-up flex flex-col gap-2 rounded-xl border border-line bg-white p-3"
              style={{ "--i": Math.min(index, 12) } as React.CSSProperties}
            >
              {item.kind === "video" ? (
                <video
                  src={item.src}
                  poster={item.poster?.src}
                  muted
                  loop
                  playsInline
                  controls
                  preload="none"
                  className="aspect-video w-full rounded-lg bg-ink object-cover"
                />
              ) : (
                <img
                  src={item.src}
                  alt=""
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  className="aspect-video w-full rounded-lg bg-sand object-contain"
                />
              )}
              <p className="m-0 truncate text-sm font-semibold">{item.originalName}</p>
              <p className="m-0 text-xs text-muted">
                {item.kind === "video" ? "Video" : "Imagen"} · {item.width}×{item.height} ·{" "}
                {formatBytes(item.bytes)}
              </p>
              <Button
                variant="danger"
                icon="trash"
                disabled={pending}
                onClick={() => remove(item)}
                aria-label={`Eliminar ${item.originalName}`}
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
