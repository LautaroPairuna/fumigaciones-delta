import { AdminNav } from "@/features/admin/components/admin-nav";
import { requireAdmin } from "@/lib/auth";

export default async function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      <AdminNav name={session.user.name} email={session.user.email} />
      <main
        id="contenido"
        tabIndex={-1}
        className="min-w-0 px-5 py-8 outline-none lg:px-10 lg:py-10"
      >
        {children}
      </main>
    </div>
  );
}
