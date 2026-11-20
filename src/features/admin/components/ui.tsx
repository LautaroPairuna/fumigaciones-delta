import { cn } from "@/lib/cn";
import { AdminIcon, type AdminIconName } from "./admin-icons";

export const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] font-normal text-ink shadow-[inset_0_1px_0_rgb(28_18_20/0.03)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted/60 hover:border-muted/40 focus:border-delta focus:shadow-[0_0_0_4px_rgb(196_18_28/0.12)] aria-invalid:border-delta aria-invalid:bg-delta/[0.03]";

const variants = {
  primary: "bg-delta text-white shadow-sm shadow-delta/30 hover:bg-delta-dark active:scale-[0.98]",
  secondary:
    "border border-line bg-white text-ink hover:border-delta/60 hover:text-delta-dark active:scale-[0.98]",
  danger: "border border-delta/25 bg-white text-delta-dark hover:border-delta hover:bg-delta/5",
  ghost: "text-muted hover:bg-sand hover:text-ink",
};

export function Button({
  variant = "primary",
  icon,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: keyof typeof variants;
  icon?: AdminIconName;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold whitespace-nowrap transition-[background-color,border-color,color,scale] duration-150 disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className,
      )}
    >
      {loading ? (
        <AdminIcon name="loader" className="animate-spin" />
      ) : icon ? (
        <AdminIcon name={icon} />
      ) : null}
      {children}
    </button>
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
