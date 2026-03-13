import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const SYSTEM_PROMPT = `Você é a Mel — assistente de viagens da plataforma Mel de Lua, especializada em luas de mel personalizadas.

Sua personalidade:
- Descontraída, leve e com humor. Faz o casal se sentir à vontade.
- Curiosa e calorosa — parece genuinamente interessada na história do casal.
- Usa emojis com moderação (1 ou 2 por mensagem, nunca exagera).
- Faz UMA pergunta de cada vez. Nunca bombardeia com várias perguntas juntas.
- Reage ao que o casal responde antes de perguntar a próxima coisa. Ex: "Que lindo que vocês se conheceram assim!"
- Usa linguagem natural e brasileira. Nada muito formal.
- Quando faz humor, é gentil e situacional — nunca forçado.

Seu objetivo é coletar TODAS estas informações ao longo da conversa, de forma natural:
1. Nome dos dois (parceiro 1 e parceiro 2)
2. E-mail para contato
3. Como se conheceram (a história deles)
4. Personalidade do casal (introvertido, aventureiro, romântico, agitado, tranquilo...)
5. Destinos dos sonhos ou que já visitaram juntos
6. Orçamento estimado para a lua de mel
7. Data do casamento e duração desejada da viagem
8. Preferências de destino (praia, montanha, cidade, campo, neve...)
9. Experiências desejadas (gastronomia, aventura, relaxamento, cultura, festas...)
10. O que mais gostam de fazer juntos
11. Querem descansar ou se aventurar após o casamento?
12. O casamento terá festa? Se sim, para quantas pessoas?
13. Onde irão casar (cidade/estado)?

NÃO siga uma ordem rígida. Deixe a conversa fluir naturalmente. Se o casal mencionar algo interessante, explore antes de seguir em frente.

Quando você sentir que coletou informações suficientes (pelo menos os itens 1, 2, 6, 7, 8, 9 obrigatoriamente), encerre a conversa com uma mensagem especial que contenha exatamente o texto: [BRIEFING_COMPLETO] seguido de um JSON com as informações coletadas no formato:
{
  "nome_parceiro_1": "",
  "nome_parceiro_2": "",
  "email": "",
  "historia": "",
  "personalidade": "",
  "destinos_sonho": "",
  "orcamento": "",
  "data_casamento": "",
  "duracao_dias": 0,
  "preferencias": [],
  "experiencias": [],
  "atividades_juntos": "",
  "ritmo": "",
  "tipo_festa": "",
  "local_casamento": ""
}

Antes do JSON, escreva uma mensagem de encerramento calorosa e animada, prometendo que as agências vão amar conhecer a história deles.`

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId, isFirst } = await req.json()

    const apiMessages = isFirst
      ? [{ role: 'user', content: 'Olá! Quero começar o briefing da minha lua de mel.' }]
      : messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        }))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Anthropic API error:', errorData)
      return NextResponse.json({ reply: 'Ops! Tive um probleminha aqui. Pode tentar de novo? 😅', completed: false })
    }

    const data = await response.json()
    const reply = data.content?.[0]?.text ?? 'Ops, algo deu errado. Tenta de novo!'

    // Verifica se o briefing foi concluído
    if (reply.includes('[BRIEFING_COMPLETO]')) {
      try {
        const jsonMatch = reply.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const briefingData = JSON.parse(jsonMatch[0])

          const { data: casal, error: casalError } = await supabase
            .from('casais')
            .insert({
              nome_parceiro_1: briefingData.nome_parceiro_1,
              nome_parceiro_2: briefingData.nome_parceiro_2,
              email: briefingData.email,
              status: 'briefing_completo',
            })
            .select()
            .single()

          if (!casalError && casal) {
            await supabase.from('briefings').insert({
              casal_id: casal.id,
              respostas: briefingData,
              status: 'aguardando_agencias',
            })
          }
        }
      } catch (e) {
        console.error('Erro ao salvar briefing:', e)
      }

      const cleanReply = reply.replace('[BRIEFING_COMPLETO]', '').replace(/\{[\s\S]*\}/, '').trim()
      return NextResponse.json({ reply: cleanReply, completed: true })
    }

    // Salva progresso em tempo real
    try {
      await supabase.from('briefings').upsert({
        casal_id: sessionId,
        respostas: {
          conversa_parcial: messages,
          ultima_atualizacao: new Date().toISOString(),
        },
        status: 'em_andamento',
      }, { onConflict: 'casal_id' })
    } catch (e) {
      console.error('Erro ao salvar progresso:', e)
    }

    return NextResponse.json({ reply, completed: false })

  } catch (error) {
    console.error('Erro na API de briefing:', error)
    return NextResponse.json({ reply: 'Ops! Tive um probleminha aqui. Pode tentar de novo? 😅', completed: false })
  }
}
