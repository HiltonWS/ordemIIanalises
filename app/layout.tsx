import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ordem2 Research Hub",
  description: "Playtest research and versioning hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="mx-auto min-h-screen max-w-6xl px-6 py-8">
          <header className="mb-8 border-b border-zinc-800 pb-4">
            <h1 className="text-2xl font-semibold">Ordem2 Research Hub</h1>
            <nav className="mt-3 flex gap-4 text-sm">
              <Link href="/">Dashboard</Link>
              <Link href="/search">Search</Link>
              <Link href="/entities">Entities</Link>
              <Link href="/sources">Sources</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
