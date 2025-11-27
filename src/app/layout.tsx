import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets : ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets : ["latin"],
});

export const metadata: Metadata = {
  title      : "DevEvent",
  description: "El calendario de eventos para desarrolladores de habla hispana 🌎.",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
