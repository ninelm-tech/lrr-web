import type { Metadata } from "next";
import { Inter, DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import "./auth.css";
import "./landing.css";
import AppHeaderWrapper from "./components/AppHeaderWrapper";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LRR — Lagos Roadside Rescue",
  description: "Fast, verified roadside assistance across Lagos. One WhatsApp message away.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable} ${fraunces.variable}`}>
      <body
        className="min-h-full flex flex-col"
        style={{ background: "#F6FAFF", fontFamily: "var(--font-inter), Arial, sans-serif" }}
      >
        <AppHeaderWrapper />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
      </body>
    </html>
  );
}
