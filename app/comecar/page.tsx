import type { Metadata } from "next";
import ComecaClient from "./ComecaClient";

export const metadata: Metadata = {
  title: "Começar Minha Lua de Mel | Mel de Lua",
  description:
    "Converse com a Mel, nossa assistente de IA, e monte o perfil perfeito do casal para receber propostas de lua de mel personalizadas e surpreendentes.",
  alternates: { canonical: "https://www.meldelua.com.br/comecar" },
  robots: { index: true, follow: false },
};

export default function ComecaPage() {
  return <ComecaClient />;
}
