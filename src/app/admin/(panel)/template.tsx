// A template re-mounts on every navigation, so each page enters with the same animation.
export default function PanelTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="anim-fade-up">{children}</div>;
}
