"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AdminIcon } from "./admin-icons";
import { Button, inputClass } from "./ui";

export function LoginForm() {
  const router = useRouter();
  const id = useId();
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  function fail(message: string) {
    setError(message);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    formRef.current?.animate(
      [
        { translate: "0" },
        { translate: "-6px" },
        { translate: "6px" },
        { translate: "-4px" },
        { translate: "4px" },
        { translate: "0" },
      ],
      { duration: 400, easing: "ease-in-out" },
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    if (!email || !password) {
      fail("Completá el email y la contraseña.");
      return;
    }
    setPending(true);
    setError("");
    const { error: signInError } = await authClient.signIn.email({ email, password });
    if (signInError) {
      setPending(false);
      fail(
        signInError.status === 429
          ? "Demasiados intentos. Esperá 15 minutos y volvé a probar."
          : "Email o contraseña incorrectos.",
      );
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  const trackCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(event.getModifierState("CapsLock"));

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-email`} className="text-sm font-bold">
          Email
        </label>
        <div className="relative">
          <AdminIcon
            name="mail"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="nombre@fumigdelta.com"
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-password`} className="text-sm font-bold">
          Contraseña
        </label>
        <div className="relative">
          <AdminIcon
            name="lock"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            id={`${id}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            onKeyDown={trackCapsLock}
            onKeyUp={trackCapsLock}
            onBlur={() => setCapsLock(false)}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              [error ? `${id}-error` : "", capsLock ? `${id}-caps` : ""]
                .filter(Boolean)
                .join(" ") || undefined
            }
            className={`${inputClass} pr-12 pl-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            aria-controls={`${id}-password`}
            className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:bg-sand hover:text-ink"
          >
            <AdminIcon name={showPassword ? "eyeOff" : "eye"} />
          </button>
        </div>
        {capsLock ? (
          <p id={`${id}-caps`} className="anim-fade-in m-0 text-xs font-semibold text-amber-800">
            Bloq Mayús está activado.
          </p>
        ) : null}
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="m-0 flex items-start gap-2 rounded-lg border border-delta/20 bg-delta/[0.06] px-3 py-2.5 text-sm font-semibold text-delta-dark"
        >
          <AdminIcon name="alert" className="mt-px size-4" />
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={pending} className="min-h-11 text-[15px]">
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}
