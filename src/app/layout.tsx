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
    default: "Vaony — Online Tutoring in Exact Sciences, Engineering & Math",
    template: "%s | Vaony",
  },
  description:
    "One-on-one online tutoring in mathematics, physics, programming, CNC, fluid mechanics and more. Learn with qualified engineers and specialists.",
  openGraph: {
    siteName: "Vaony",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
