import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminIcon } from "@/features/admin/components/admin-icons";
import { LoginForm } from "@/features/admin/components/login-form";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Ingresar" };

const highlights = [
  "Textos, servicios y preguntas frecuentes",
  "Fotos del equipo y videos de fondo",
  "Los cambios se publican al guardar",
];

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <img
          src="/media/inicio-fondo-poster.jpg"
          alt=""
          className="anim-fade-in absolute inset-0 size-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[linear-gradient(160deg,rgb(28_18_20/0.55),rgb(28_18_20/0.92)_70%)]" />
        <div className="anim-fade-up relative flex items-center gap-3">
          <img src="/media/delta-icon.svg" alt="" width={44} height={44} />
          <span className="flex flex-col leading-none font-display">
            <span className="text-[11px] font-extrabold tracking-[0.24em] text-white/70">
              FUMIGACIONES
            </span>
            <span className="text-2xl font-semibold tracking-tight">DELTA</span>
          </span>
        </div>
        <div className="relative max-w-md">
          <h2
            className="anim-fade-up m-0 font-display text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            El contenido del sitio, en tus manos.
          </h2>
          <ul className="m-0 mt-8 flex list-none flex-col gap-3 p-0">
            {highlights.map((item, index) => (
              <li
                key={item}
                className="anim-fade-up flex items-center gap-3 text-[15px] text-white/85"
                style={{ "--i": index + 2 } as React.CSSProperties}
              >
                <span className="grid size-6 place-items-center rounded-full bg-delta text-white">
                  <AdminIcon name="check" className="size-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative m-0 text-xs text-white/50">© Fumigaciones Delta · La Plata</p>
      </aside>

      <main id="contenido" className="flex flex-col items-center justify-center px-6 py-12">
        <div className="anim-scale-in w-full max-w-[380px]">
          <img
            src="/media/delta-icon.svg"
            alt=""
            width={52}
            height={52}
            className="mb-6 lg:hidden"
          />
          <h1 className="m-0 font-display text-[28px] leading-tight font-semibold tracking-[-0.02em]">
            Ingresá al panel
          </h1>
          <p className="mt-2 mb-8 text-[15px] text-muted">
            Usá el email y la contraseña de administrador.
          </p>
          <LoginForm />
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6 text-sm">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 font-semibold text-muted no-underline transition-colors hover:text-delta-dark"
            >
              <AdminIcon name="arrowLeft" className="size-4" />
              Volver al sitio
            </a>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <AdminIcon name="shield" className="size-4 text-green-700" />
              Conexión protegida
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
