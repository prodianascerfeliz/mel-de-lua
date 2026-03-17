import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const PROMPT_RECOMENDACAO = `Você é o motor de recomendação de destinos do Mel de Lua — uma plataforma premium de lua de mel.

Sua missão: analisar o perfil de um casal e recomendar 2 destinos SURPREENDENTES, não óbvios, que façam sentido profundo com quem eles são — mas que eles jamais imaginariam sozinhos.

## FILOSOFIA
- Evite destinos hipados ou óbvios (Paris, Maldivas, Cancún, Fernando de Noronha) EXCETO se forem genuinamente a melhor escolha para esse casal específico
- Pense em destinos que causem um "UAU, nunca pensei nisso!" no reveal
- A recomendação deve ter uma lógica emocional — cada destino precisa ter uma razão clara ligada à história e personalidade DO CASAL
- Destinos exóticos, pouco turísticos, que surpreendam mesmo viajantes experientes

## EXEMPLOS DE DESTINOS PARA CONSIDERAR (não se limite a eles)
Ilhas Faroé, Geórgia (país), Açores, Uzbekistão, Eslovênia, Socotra, Tromsø, Andaman, Atacama, Malta, Ilha de Páscoa, Bhutan, Madeira, Lofoten, Capadócia, Jordânia, Omã, Montenegro, Albânia, Kosovo, Arménia, Tasmânia, Réunion, Maurícia fora de época, Sri Lanka interior, Laos, Myanmar, Butão, Quirguistão, Tanzânia interior, Etiópia, Marrocos profundo, Ilhas Canárias (La Palma/El Hierro), Azores São Jorge, Alentejo profundo, Sicília interior, Sardenha selvagem, Croácia fora de temporada, Eslovênia, Kosovo, Albânia Riviera

## FORMATO DE RESPOSTA
Responda APENAS com um JSON válido, sem texto antes ou depois, sem markdown:

{
  "recomendacao_1": {
    "destino": "Nome do destino",
    "pais": "País",
    "titulo": "Frase poética que capture a essência (ex: 'O fim do mundo que parece feito para dois')",
    "justificativa": "2-3 frases explicando POR QUE esse destino faz sentido para ESSE casal específico, conectando com a história e perfil deles",
    "experiencias": ["3 a 4 experiências concretas que o casal viveria lá, conectadas ao perfil"],
    "melhor_epoca": "Meses ideais para visitar",
    "perfil_viagem": "Aventura / Relaxamento / Cultural / Gastronômica / Romântica / Mista",
    "nivel_exclusividade": "Raro e pouco turístico / Especial mas acessível / Clássico repaginado"
  },
  "recomendacao_2": {
    "destino": "Nome do destino",
    "pais": "País",
    "titulo": "Frase poética",
    "justificativa": "2-3 frases conectadas ao perfil do casal",
    "experiencias": ["3 a 4 experiências concretas"],
    "melhor_epoca": "Meses ideais",
    "perfil_viagem": "tipo",
    "nivel_exclusividade": "nível"
  },
  "resumo_casal": "Parágrafo de 3-4 frases descrevendo o perfil desse casal de forma narrativa e envolvente, para as agências entenderem quem são eles antes de precificar"
}`

export async function POST(req: NextRequest) {
  try {
    const { briefingId, respostas } = await req.json()

    if (!briefingId || !respostas) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: PROMPT_RECOMENDACAO,
        messages: [{
          role: 'user',
          content: `Analise este perfil de casal e gere as 2 recomendações de destino:\n\n${JSON.stringify(respostas, null, 2)}`,
        }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Erro na API de IA' }, { status: 500 })
    }

    const data = await response.json()
    const texto = data.content?.[0]?.text ?? ''

    // Parse do JSON retornado
    const jsonMatch = texto.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Formato inválido retornado pela IA' }, { status: 500 })
    }

    const recomendacoes = JSON.parse(jsonMatch[0])

    // Salva as recomendações no briefing
    await supabase.from('briefings')
      .update({ resumo_ia: JSON.stringify(recomendacoes) })
      .eq('id', briefingId)

    return NextResponse.json({ recomendacoes })

  } catch (error) {
    console.error('Erro no motor de recomendação:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
