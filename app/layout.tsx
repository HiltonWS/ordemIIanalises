import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arquivo do Playtest — OP2",
  description: "Índice privado, pesquisável e versionado do playtest de Ordem Paranormal RPG 2.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
