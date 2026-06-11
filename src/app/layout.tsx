import type { Metadata } from "next";
import Script from "next/script";
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">{`
          (() => {
            const key = "cadastro-theme";
            const root = document.documentElement;
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            let theme = "light";

            try {
              const stored = localStorage.getItem(key);
              if (stored === "dark" || stored === "light") {
                theme = stored;
              } else if (prefersDark) {
                theme = "dark";
              }
            } catch {
              theme = prefersDark ? "dark" : "light";
            }

            root.classList.toggle("dark", theme === "dark");
            root.style.colorScheme = theme;
          })();
        `}</Script>
        {children}
      </body>
    </html>
  );
}
