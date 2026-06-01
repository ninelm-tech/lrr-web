import type { Metadata } from "next";
import "./globals.css";
import "./auth.css";
import "./landing.css";
import AppHeaderWrapper from "./components/AppHeaderWrapper";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ background: "#F6FAFF" }}>
        <AppHeaderWrapper />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
      </body>
    </html>
  );
}
