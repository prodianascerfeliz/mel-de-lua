import type { Metadata } from "next";
import AgenciasClient from "./AgenciasClient";

export const metadata: Metadata = {
  title: "Seja Agência Parceira | Mel de Lua",
  description:
    "Receba briefings de casais qualificados com orçamento definido e perfil completo. Zero custo de entrada. Comissão apenas sobre viagens fechadas. Máximo 3 agências por casal.",
  alternates: { canonical: "https://www.meldelua.com.br/agencias" },
  openGraph: {
    title: "Agências parceiras — Mel de Lua",
    description:
      "Leads 100% qualificados. Máximo 3 agências por casal. Comissão só no fechamento.",
    url: "https://www.meldelua.com.br/agencias",
  },
};

export default function AgenciasPage() {
  return <AgenciasClient />;
}
