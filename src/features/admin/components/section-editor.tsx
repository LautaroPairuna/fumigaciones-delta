"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { iconNames } from "@/components/icons";
import { resetSection, saveSection } from "@/features/admin/actions";
import type { Field, SectionMeta } from "@/features/admin/section-fields";
import type { MediaItem } from "@/features/media/service";
import { AdminIcon, sectionIcons } from "./admin-icons";
import { MediaPicker } from "./media-picker";
import { Toast } from "./toast";
import { Button, inputClass } from "./ui";

type Value = Record<string, unknown>;
type Errors = Record<string, string>;

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const ICON_LABELS: Record<(typeof iconNames)[number], string> = {
  arrow: "Flecha",
  diagonal: "Flecha diagonal",
  shield: "Escudo",
  hygiene: "Higiene",
  tools: "Herramientas",
  van: "Camioneta",
  pin: "Ubicación",
  phone: "Teléfono",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  bug: "Insecto",
  rat: "Roedor",
  paw: "Huella",
  bed: "Cama",
  squirrel: "Comadreja",
  wind: "Viento",
  house: "Casa",
  utensils: "Cubiertos",
  factory: "Fábrica",
  badge: "Certificado",
  calendar: "Calendario",
  scale: "Balanza",
  bat: "Murciélago",
  settings: "Engranaje",
};

function errorFor(errors: Errors, path: string): string | undefined {
  if (errors[path]) return errors[path];
  const nested = Object.keys(errors).find((key) => key.startsWith(`${path}.`));
  return nested ? errors[nested] : undefined;
}

export function SectionEditor({
  meta,
  initial,
  isCustom,
  initialLibrary,
}: {
  meta: SectionMeta;
  initial: Value;
  isCustom: boolean;
  initialLibrary: MediaItem[];
}) {
  const router = useRouter();
  const [value, setValue] = useState<Value>(initial);
  const [library, setLibrary] = useState(initialLibrary);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string; id: number } | null>(
    null,
  );
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // After a rejected save, takes the user to the first field the server flagged.
  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    const first = formRef.current?.querySelector<HTMLElement>(
      "[aria-invalid='true'], [role='alert']",
    );
    first?.scrollIntoView({ block: "center", behavior: "smooth" });
    if (first instanceof HTMLInputElement || first instanceof HTMLTextAreaElement) {
      first.focus({ preventScroll: true });
    }
  }, [errors]);

  // Warns before leaving with unsaved edits; only listens while there are changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function update(next: Value) {
    setValue(next);
    setDirty(true);
  }

  function save() {
    startTransition(async () => {
      const result = await saveSection(meta.key, value);
      if (result.ok) {
        setErrors({});
        setDirty(false);
        setStatus({
          tone: "ok",
          text: "Guardado. Los cambios ya están publicados.",
          id: Date.now(),
        });
        router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
        setStatus({ tone: "error", text: result.error, id: Date.now() });
      }
    });
  }

  function reset() {
    if (!window.confirm("¿Volver al contenido original de esta sección? Se pierden los cambios.")) {
      return;
    }
    startTransition(async () => {
      const result = await resetSection(meta.key);
      if (result.ok) {
        setDirty(false);
        router.refresh();
        window.location.reload();
      } else {
        setStatus({ tone: "error", text: result.error, id: Date.now() });
      }
    });
  }

  return (
    <form
      ref={formRef}
      className="mx-auto flex max-w-3xl flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      noValidate
    >
      <header className="flex flex-col gap-4">
        <nav aria-label="Ruta" className="text-sm">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 font-semibold text-muted no-underline hover:text-delta-dark"
          >
            <AdminIcon name="arrowLeft" className="size-4" />
            Inicio
          </Link>
        </nav>
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-delta text-white shadow-sm shadow-delta/30">
            <AdminIcon name={sectionIcons[meta.key]} className="size-[22px]" />
          </span>
          <div>
            <h1 className="m-0 font-display text-[28px] leading-tight font-semibold tracking-[-0.02em]">
              {meta.title}
            </h1>
            <p className="mt-1 mb-0 text-muted">{meta.description}</p>
          </div>
        </div>
      </header>

      <FieldList
        fields={meta.fields}
        value={value}
        onChange={update}
        path=""
        errors={errors}
        library={library}
        onLibraryChange={setLibrary}
      />

      <div className="sticky bottom-0 z-20 -mx-5 mt-2 border-t border-line bg-paper/90 px-5 py-4 backdrop-blur-md lg:-mx-10 lg:px-10">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3">
          <Button type="submit" icon="check" loading={pending}>
            {pending ? "Guardando…" : "Guardar y publicar"}
          </Button>
          {isCustom ? (
            <Button variant="ghost" icon="restore" onClick={reset} disabled={pending}>
              Restaurar original
            </Button>
          ) : null}
          {dirty ? (
            <span className="anim-fade-in ml-auto inline-flex items-center gap-2 text-sm font-semibold text-muted">
              <span
                aria-hidden="true"
                className="anim-pulse-dot size-2 rounded-full bg-amber-500"
              />
              Cambios sin guardar
            </span>
          ) : null}
        </div>
      </div>
      {status ? (
        <Toast key={status.id} tone={status.tone} onDone={() => setStatus(null)}>
          {status.text}
        </Toast>
      ) : null}
    </form>
  );
}

type FieldProps = {
  value: Value;
  onChange: (next: Value) => void;
  path: string;
  errors: Errors;
  library: MediaItem[];
  onLibraryChange: (items: MediaItem[]) => void;
};

function FieldList({ fields, ...props }: FieldProps & { fields: Field[] }) {
  return (
    <div className="flex flex-col gap-5">
      {fields.map((field) => (
        <FieldControl key={field.name} field={field} {...props} />
      ))}
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  path,
  errors,
  library,
  onLibraryChange,
}: FieldProps & { field: Field }) {
  const id = useId();
  const fieldPath = path ? `${path}.${field.name}` : field.name;
  const error = errorFor(errors, fieldPath);
  const current = value[field.name];
  const set = (next: unknown) => onChange({ ...value, [field.name]: next });
  const describedBy = [field.hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
    .filter(Boolean)
    .join(" ");

  const label = (
    <label htmlFor={id} className="text-sm font-bold">
      {field.label}
    </label>
  );
  const hint = field.hint ? (
    <p id={`${id}-hint`} className="m-0 text-xs text-muted">
      {field.hint}
    </p>
  ) : null;
  const errorText = error ? (
    <p id={`${id}-error`} role="alert" className="m-0 text-sm font-semibold text-delta-dark">
      {error}
    </p>
  ) : null;
  const common = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  };

  switch (field.kind) {
    case "text":
    case "textarea": {
      const text = typeof current === "string" ? current : "";
      const counter = (
        <span className="text-xs text-muted tabular-nums">
          {text.length}/{field.max}
        </span>
      );
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            {label}
            {counter}
          </div>
          {hint}
          {field.kind === "text" ? (
            <input
              {...common}
              type="text"
              value={text}
              maxLength={field.max}
              onChange={(event) => set(event.target.value)}
              className={inputClass}
            />
          ) : (
            <textarea
              {...common}
              value={text}
              rows={field.rows ?? 3}
              maxLength={field.max}
              onChange={(event) => set(event.target.value)}
              className={`${inputClass} resize-y`}
            />
          )}
          {errorText}
        </div>
      );
    }
    case "boolean":
      return (
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2.5 text-sm font-semibold">
            <input
              {...common}
              type="checkbox"
              checked={current === true}
              onChange={(event) => set(event.target.checked)}
              className="size-4 accent-delta"
            />
            {field.label}
          </label>
          {errorText}
        </div>
      );
    case "month":
    case "icon": {
      const options =
        field.kind === "month"
          ? MONTHS.map((name, index) => ({ value: String(index), label: name }))
          : iconNames.map((name) => ({ value: name, label: ICON_LABELS[name] }));
      return (
        <div className="flex flex-col gap-1.5">
          {label}
          {hint}
          <select
            {...common}
            value={String(current ?? "")}
            onChange={(event) =>
              set(field.kind === "month" ? Number(event.target.value) : event.target.value)
            }
            className={`${inputClass} max-w-xs`}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errorText}
        </div>
      );
    }
    case "image":
    case "video": {
      const media = current as
        | { src: string; width: number; height: number; poster?: { src: string } }
        | null
        | undefined;
      const preview = field.kind === "video" ? media?.poster?.src : media?.src;
      return (
        <fieldset
          className="m-0 flex flex-col gap-3 rounded-xl border border-line bg-white p-4"
          aria-describedby={describedBy || undefined}
        >
          <legend className="px-1 text-sm font-bold">{field.label}</legend>
          {hint}
          <div className="flex flex-wrap items-center gap-4">
            {preview ? (
              field.kind === "video" && media ? (
                <video
                  src={media.src}
                  poster={preview}
                  muted
                  loop
                  playsInline
                  controls
                  preload="none"
                  className="aspect-video w-full max-w-sm rounded-lg bg-ink object-cover"
                />
              ) : (
                <img
                  src={preview}
                  alt=""
                  className="max-h-48 w-auto max-w-[240px] rounded-lg bg-sand object-contain"
                />
              )
            ) : (
              <div className="grid h-32 w-48 place-items-center rounded-lg bg-sand text-xs text-muted">
                Sin {field.kind === "image" ? "imagen" : "video"}
              </div>
            )}
            <MediaPicker
              kind={field.kind}
              library={library}
              onLibraryChange={onLibraryChange}
              label={media ? "Cambiar" : "Elegir"}
              onPick={(item) =>
                set(
                  field.kind === "image"
                    ? { src: item.src, width: item.width, height: item.height }
                    : { src: item.src, poster: item.poster },
                )
              }
            />
          </div>
          {error ? (
            <p
              id={`${id}-error`}
              role="alert"
              className="m-0 text-sm font-semibold text-delta-dark"
            >
              {error}
            </p>
          ) : null}
        </fieldset>
      );
    }
    case "stringList": {
      const items = Array.isArray(current) ? (current as string[]) : [];
      return (
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-1.5 p-0 text-sm font-bold">{field.label}</legend>
          {hint}
          {items.map((item, index) => {
            const itemError = errors[`${fieldPath}.${index}`];
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: plain strings have no identity; position is the key
              <div key={index} className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    aria-label={`${field.itemLabel} ${index + 1}`}
                    aria-invalid={itemError ? true : undefined}
                    value={item}
                    maxLength={field.itemMax}
                    onChange={(event) =>
                      set(items.map((old, i) => (i === index ? event.target.value : old)))
                    }
                    className={inputClass}
                  />
                  <Button
                    variant="ghost"
                    icon="x"
                    aria-label={`Quitar ${field.itemLabel.toLowerCase()} ${index + 1}`}
                    onClick={() => set(items.filter((_, i) => i !== index))}
                    className="px-3"
                  />
                </div>
                {itemError ? (
                  <p role="alert" className="m-0 text-sm font-semibold text-delta-dark">
                    {itemError}
                  </p>
                ) : null}
              </div>
            );
          })}
          {items.length < field.max ? (
            <div>
              <Button variant="secondary" icon="plus" onClick={() => set([...items, ""])}>
                Agregar {field.itemLabel.toLowerCase()}
              </Button>
            </div>
          ) : null}
          {errors[fieldPath] ? (
            <p role="alert" className="m-0 text-sm font-semibold text-delta-dark">
              {errors[fieldPath]}
            </p>
          ) : null}
        </fieldset>
      );
    }
    case "group":
      return (
        <fieldset className="m-0 flex flex-col gap-4 rounded-xl border border-line bg-white p-4">
          <legend className="px-1 text-sm font-bold">{field.label}</legend>
          <FieldList
            fields={field.fields}
            value={(current as Value) ?? {}}
            onChange={set}
            path={fieldPath}
            errors={errors}
            library={library}
            onLibraryChange={onLibraryChange}
          />
        </fieldset>
      );
    case "list": {
      const items = Array.isArray(current) ? (current as Value[]) : [];
      const move = (from: number, to: number) => {
        const next = [...items];
        const [moved] = next.splice(from, 1);
        if (moved) next.splice(to, 0, moved);
        set(next);
      };
      return (
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="mb-1.5 p-0 text-sm font-bold">{field.label}</legend>
          {items.map((item, index) => {
            const title = String(item[field.titleField] ?? "").trim();
            const itemPath = `${fieldPath}.${index}`;
            const itemHasError = Object.keys(errors).some(
              (key) => key === itemPath || key.startsWith(`${itemPath}.`),
            );
            return (
              <details
                // biome-ignore lint/suspicious/noArrayIndexKey: items are edited in place; reordering re-renders all of them
                key={index}
                open={itemHasError || !title}
                className={`group rounded-xl border bg-white transition-colors ${itemHasError ? "border-delta" : "border-line hover:border-muted/40"}`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 truncate text-sm font-semibold">
                    {field.itemLabel} {index + 1}
                    {title ? <span className="font-normal text-muted"> · {title}</span> : null}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-muted transition-transform group-open:rotate-180"
                  >
                    ▾
                  </span>
                </summary>
                <div className="details-body flex flex-col gap-4 border-t border-line p-4">
                  <FieldList
                    fields={field.fields}
                    value={item}
                    onChange={(next) => set(items.map((old, i) => (i === index ? next : old)))}
                    path={itemPath}
                    errors={errors}
                    library={library}
                    onLibraryChange={onLibraryChange}
                  />
                  <div className="flex flex-wrap gap-2 border-t border-line pt-3">
                    <Button
                      variant="ghost"
                      icon="arrowUp"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    >
                      Subir
                    </Button>
                    <Button
                      variant="ghost"
                      icon="arrowDown"
                      disabled={index === items.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      Bajar
                    </Button>
                    <Button
                      variant="danger"
                      icon="trash"
                      className="ml-auto"
                      onClick={() => set(items.filter((_, i) => i !== index))}
                    >
                      Eliminar {field.itemLabel.toLowerCase()}
                    </Button>
                  </div>
                </div>
              </details>
            );
          })}
          {items.length < field.max ? (
            <div>
              <Button
                variant="secondary"
                icon="plus"
                onClick={() => set([...items, structuredClone(field.newItem)])}
              >
                Agregar {field.itemLabel.toLowerCase()}
              </Button>
            </div>
          ) : (
            <p className="m-0 text-xs text-muted">Máximo {field.max}.</p>
          )}
          {errors[fieldPath] ? (
            <p role="alert" className="m-0 text-sm font-semibold text-delta-dark">
              {errors[fieldPath]}
            </p>
          ) : null}
        </fieldset>
      );
    }
  }
}
