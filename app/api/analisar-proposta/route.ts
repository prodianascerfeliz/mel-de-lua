import { NextRequest, NextResponse } from 'next/server'

const CHECKLIST = [
  { id: 'destino_datas', label: 'Destino e datas de ida e volta' },
  { id: 'valor_discriminado', label: 'Valor total discriminado (aéreo, hospedagem, passeios)' },
  { id: 'inclusoes_exclusoes', label: 'Inclusões e exclusões claramente listadas' },
  { id: 'cancelamento', label: 'Condições de cancelamento' },
  { id: 'validade', label: 'Validade do orçamento' },
  { id: 'dados_agencia', label: 'Dados da agência (CNPJ e responsável)' },
  { id: 'seguro', label: 'Informação sobre seguro viagem' },
  { id: 'visto', label: 'Visto e documentos necessários' },
]

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64 } = await req.json()

    if (!pdfBase64) {
      return NextResponse.json({ error: 'PDF não enviado' }, { status: 400 })
    }

    const prompt = `Você é um especialista em análise de propostas de viagem. Analise este PDF de orçamento de uma agência de viagens e verifique se contém cada um dos seguintes itens obrigatórios:

${CHECKLIST.map((item, i) => `${i + 1}. ${item.label}`).join('\n')}

Para cada item, responda se está PRESENTE ou AUSENTE no documento, e se ausente, dê uma sugestão do que está faltando.

Responda APENAS com JSON válido neste formato:
{
  "itens": [
    { "id": "destino_datas", "presente": true, "observacao": "" },
    { "id": "valor_discriminado", "presente": false, "observacao": "O PDF lista apenas o valor total sem discriminar aéreo, hospedagem e passeios separadamente" },
    ...
  ],
  "aprovado": true,
  "resumo": "Frase curta sobre a qualidade geral do orçamento"
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
            },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return NextResponse.json({ error: 'Erro na análise do PDF' }, { status: 500 })
    }

    const data = await response.json()
    const texto = data.content?.[0]?.text ?? ''

    const jsonMatch = texto.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Formato inválido retornado pela IA' }, { status: 500 })
    }

    const resultado = JSON.parse(jsonMatch[0])
    return NextResponse.json({ resultado, checklist: CHECKLIST })

  } catch (error) {
    console.error('Erro na análise:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
