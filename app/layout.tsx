import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "LRR — Lagos Roadside Rescue",
  description: "Fast, verified roadside assistance across Lagos. One WhatsApp message away.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className="min-h-full flex flex-col"
        style={{ background: "#F6FAFF", fontFamily: "var(--font-inter), Inter, Arial, sans-serif" }}
      >
        <AppHeaderWrapper />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
      </body>
    </html>
  );
}
