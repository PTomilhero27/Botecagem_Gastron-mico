import type { Metadata } from "next";
import AuthGate from "./AuthGate";

export const metadata: Metadata = {
  title: "Painel Botecagem",
  description: "Painel de cadastros com QR WhatsApp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <AuthGate />
        {children}
        </body>
    </html>
  );
}
