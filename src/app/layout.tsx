import type { Metadata, Viewport } from "next";
import { Archivo, Manrope } from "next/font/google";
import { site } from "@/config/site";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.brand,
  icons: {
    icon: [
      { url: "/media/delta-mark.svg", type: "image/svg+xml" },
      { url: "/media/delta-mark.png", type: "image/png" },
    ],
    apple: "/media/delta-mark.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f4f2",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`theme-delta ${archivo.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
