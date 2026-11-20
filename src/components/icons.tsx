export type IconName =
  | "arrow"
  | "diagonal"
  | "shield"
  | "hygiene"
  | "tools"
  | "van"
  | "pin"
  | "phone"
  | "whatsapp"
  | "instagram";

export function Icon({ name, className = "icon" }: { name: IconName; className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}

export function IconLibrary() {
  return (
    <svg className="icon-library" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <symbol id="i-arrow" viewBox="0 0 24 24">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </symbol>
        <symbol id="i-diagonal" viewBox="0 0 24 24">
          <path d="M6 18 18 6M6 6h12v12" />
        </symbol>
        <symbol id="i-shield" viewBox="0 0 24 24">
          <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
          <path d="m8 12 3 3 5-6" />
        </symbol>
        <symbol id="i-hygiene" viewBox="0 0 24 24">
          <path d="M12 3.2c2.6 3.5 5.8 6.6 5.8 10a5.8 5.8 0 0 1-11.6 0c0-3.4 3.2-6.5 5.8-10Z" />
          <path d="M9.2 14.4a3.1 3.1 0 0 0 2.5 1.5" />
        </symbol>
        <symbol id="i-tools" viewBox="0 0 24 24">
          <path d="M8.6 9.4h6.8l.7 10.2H7.9l.7-10.2Z" />
          <path d="M10.2 9.4V6.3a1.8 1.8 0 0 1 3.6 0v3.1" />
          <path d="M12 4.5V2.8M9.8 13.4h4.4" />
        </symbol>
        <symbol id="i-van" viewBox="0 0 24 24">
          <path d="M3 16V9.2A1.2 1.2 0 0 1 4.2 8H13v4h5.1a2 2 0 0 1 1.6.8l1.6 2.1c.2.3.3.6.3.9V16" />
          <path d="M3 16h18" />
          <circle cx="7.2" cy="16.8" r="1.6" />
          <circle cx="16.8" cy="16.8" r="1.6" />
        </symbol>
        <symbol id="i-pin" viewBox="0 0 24 24">
          <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </symbol>
        <symbol id="i-phone" viewBox="0 0 24 24">
          <path d="M8 4.5h3.2l1 3.2-1.8 1.1a12 12 0 0 0 5 5l1.1-1.8 3.2 1V16a2 2 0 0 1-2.2 2A14.5 14.5 0 0 1 6 6.7 2 2 0 0 1 8 4.5Z" />
        </symbol>
        <symbol id="i-whatsapp" viewBox="0 0 24 24">
          <path d="M12 20.5a8.5 8.5 0 0 1-7.3-4.2L3.2 20.8l4.6-1.2A8.5 8.5 0 1 1 12 20.5Z" />
          <path d="M8.7 10.4c.2 1.7 1.6 3.1 3.3 3.4.5.1.9 0 1.2-.3l.6-.6" />
        </symbol>
        <symbol id="i-instagram" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="5" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="17.2" cy="6.9" r=".8" />
        </symbol>
      </defs>
    </svg>
  );
}
