import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Lua de Mel Personalizada com IA | Mel de Lua",
  description:
    "Conte sua história para a Mel e receba propostas de lua de mel únicas, com destino surpresa revelado no momento certo. Gratuito para casais.",
  alternates: { canonical: "https://www.meldelua.com.br" },
  openGraph: {
    title: "Mel de Lua — A lua de mel dos sonhos de vocês",
    description:
      "Inteligência artificial que entende cada casal e conecta às melhores agências do Brasil. Destino surpresa. Reveal inesquecível.",
    url: "https://www.meldelua.com.br",
  },
};

export default function Home() {
  return <HomeClient />;
}
