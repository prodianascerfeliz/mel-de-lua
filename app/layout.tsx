import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://www.meldelua.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Mel de Lua — Lua de Mel Personalizada com IA",
    template: "%s | Mel de Lua",
  },
  description:
    "Planeje a lua de mel dos seus sonhos com inteligência artificial. A Mel entende a história do casal e conecta você às melhores agências do Brasil para uma viagem surpreendente e personalizada.",
  keywords: [
    "lua de mel personalizada",
    "lua de mel com IA",
    "planejamento lua de mel Brasil",
    "destinos lua de mel surpresa",
    "pacote lua de mel premium",
    "agência lua de mel",
    "lua de mel inteligência artificial",
    "honeymoon personalizado",
    "viagem casamento",
    "lua de mel reveal",
  ],
  authors: [{ name: "Mel de Lua", url: BASE_URL }],
  creator: "Mel de Lua",
  publisher: "Mel de Lua",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE_URL,
    siteName: "Mel de Lua",
    title: "Mel de Lua — Lua de Mel Personalizada com IA",
    description:
      "A plataforma que usa inteligência artificial para criar a lua de mel perfeita para cada casal. Destinos surpresa, propostas exclusivas e um reveal inesquecível.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Mel de Lua — Sua lua de mel começa aqui",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mel de Lua — Lua de Mel Personalizada com IA",
    description:
      "A plataforma que usa inteligência artificial para criar a lua de mel perfeita. Destinos surpresa e um reveal inesquecível.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@meldelua",
  },
  alternates: {
    canonical: BASE_URL,
    languages: { "pt-BR": BASE_URL },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  verification: {
    google: "QkKzy4_TpzueOFqSOtJJU2WJ--lcT8hIgOzEIPTL9Xc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#060d1a" />
        <meta name="geo.region" content="BR" />
        <meta name="geo.country" content="Brazil" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Mel de Lua",
              url: BASE_URL,
              logo: `${BASE_URL}/favicon.svg`,
              description:
                "Plataforma de lua de mel personalizada com inteligência artificial. Conectamos casais de noivos a agências de viagem especializadas para criar experiências únicas e inesquecíveis.",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+55-11-99358-0581",
                contactType: "customer service",
                areaServed: "BR",
                availableLanguage: "Portuguese",
              },
              foundingDate: "2026",
              areaServed: { "@type": "Country", name: "Brazil" },
              serviceType: "Planejamento de Lua de Mel",
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
