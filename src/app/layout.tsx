import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Controle de Demandas - Cadastro e Legalização",
  description: "Sistema interno para controle de demandas do Setor de Cadastro e Legalização.",
  icons: {
    icon: "/brand/favicon.png",
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
