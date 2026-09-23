import type { Metadata } from "next";
import "./globals.css";
import "./auth.css";
import "./landing.css";
import AppHeaderWrapper from "./components/AppHeaderWrapper";

export const metadata: Metadata = {
  title: "LRR — Local Roadside Rescue",
  description: "Fast, verified roadside assistance across Nigeria. One WhatsApp message away.",
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
    <html lang="en">
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
