import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers/providers";
import { ClientOnly } from "./components/ClientOnly";
import { Toaster } from "./pages/dashboard/components/ui/toast/toaster";

export const metadata: Metadata = {
  title: "Botecagem",
  description: "Painel de cadastros com QR WhatsApp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <Providers>
          {children}
        </Providers>

        <ClientOnly>
          <Toaster />
        </ClientOnly>
      </body>
    </html>
  );
}
