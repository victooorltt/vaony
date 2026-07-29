import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Vaony — Clases online de ciencias exactas, ingeniería y matemáticas",
    template: "%s | Vaony",
  },
  description:
    "Clases particulares online de matemáticas, física, programación, CNC, mecánica de fluidos y más. Aprende con ingenieros y especialistas cualificados.",
  openGraph: {
    siteName: "Vaony",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${sora.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
