import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mel de Lua",
  description: "A lua de mel dos seus sonhos",
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}