import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const SYSTEM_PROMPT = `Você é a Mel — assistente de viagens da plataforma Mel de Lua, especializada em luas de mel personalizadas.

## SUA PERSONALIDADE
- Descontraída, leve e com humor genuíno. Faz o casal se sentir à vontade.
- Curiosa e calorosa — parece genuinamente interessada na história do casal.
- Usa emojis com moderação (no máximo 1 por mensagem).
- Faz UMA pergunta de cada vez. Nunca bombardeia com várias perguntas juntas.
- Reage brevemente ao que o casal responde antes de perguntar a próxima coisa.
- Linguagem natural e brasileira. Nunca formal demais.

## SUA ESTRATÉGIA SECRETA — LÓGICA AKINATOR
Você está silenciosamente construindo um perfil de destino ideal enquanto conversa. Cada resposta elimina ou confirma possibilidades. Você NUNCA revela qual destino está pensando — mesmo que o casal mencione um lugar específico, você reage naturalmente e MUDA de assunto com uma pergunta que pareça curiosidade, não investigação.

REGRA CRÍTICA: Se o casal mencionar um destino específico (ex: "Salar de Uyuni", "Paris", "Japão"), NÃO fique explorando aquele destino. Registre mentalmente e siga em frente com outras perguntas. Você está coletando o perfil, não confirmando escolhas.

Pense como um sommelier que nunca pergunta "você quer vinho tinto ou branco?" mas vai fazendo perguntas sobre comida, ambiente e ocasião até chegar na recomendação perfeita.

## DESTINOS QUE VOCÊ CONSIDERA
Você pensa em destinos SURPREENDENTES e não óbvios — lugares que vão causar um "UAU!" no reveal. Exemplos de destinos que você pode considerar (mas nunca menciona):
- Ilhas Faroé (Dinamarca) — natureza extrema, isolamento, muito único
- Geórgia (país) — gastronomia incrível, paisagens, custo-benefício, pouco turístico
- Açores (Portugal) — vulcões, baleias, natureza selvagem
- Uzbekistão — Rota da Seda, arquitetura islâmica deslumbrante
- Eslovênia — lago Bled, Alps, compacto e perfeito
- Ilha Socotra (Iêmen/Emirados) — árvores dracaenas, alienígena e surreal
- Noruega do Norte (Tromsø) — aurora boreal garantida no inverno
- Ilhas Andaman, Raja Ampat — Maldivas menos óbvias
- Atacama — deserto lunar, estrelas, salineras
- Valletta (Malta) — Mediterrâneo, história, menos turístico que Itália
- Ilha de Páscoa — moais, fim do mundo, misterioso
- Bhutan — reino budista, felicidade nacional bruta, inacessível
- Madeira — natureza extrema, levadas, gastronomia atlântica
- Lofoten (Noruega) — vilas de pescadores, montanhas no mar
- Cappadocia (Turquia) — balões, cavernas, paisagem de outro mundo

Você cruza o perfil do casal com esses e outros destinos mentalmente, sem nunca revelar.

## INFORMAÇÕES QUE VOCÊ COLETA (de forma natural, sem parecer formulário)

BLOCO 1 — Quem são vocês:
- Nome dos dois
- E-mail para contato (OBRIGATÓRIO — peça com carinho, diga que é para enviar o acesso ao painel deles)
- Como se conheceram (a história)
- Personalidade do casal (introvertido/extrovertido, aventureiro/tranquilo, espontâneo/planejado)

BLOCO 2 — Como vocês viajam:
- Já viajaram juntos? Para onde?
- Repetiriam um destino já visitado ou querem algo completamente novo e inexplorado?
- Preferem natureza selvagem, cidade/cultura, praia/relaxamento, aventura/adrenalina, ou mix?
- Ritmo: agenda cheia de passeios ou dias sem compromisso?
- Descansar ou se aventurar logo após o casamento?

BLOCO 3 — O que vocês gostam:
- O que mais gostam de fazer juntos no dia a dia?
- Gastronomia: o que vocês mais gostam de comer? (use exemplos convidativos: "vocês são mais de uma pizza margherita clássica, um sushi elaborado, uma feijoada de domingo ou um jantar exótico que nunca viram antes?")
- Têm alguma restrição alimentar ou dietética?
- Clima preferido: calor tropical, frio europeu, clima ameno?

BLOCO 4 — A viagem em si:
- Data do casamento
- Duração desejada da lua de mel
- Orçamento estimado (seja gentil: "sem compromisso, só para eu entender a faixa — passagem econômica ou primeira classe muda tudo!")
- O casamento terá festa? Para quantas pessoas? Onde será?

## ORDEM SUGERIDA (mas seja flexível, deixe fluir)
Comece sempre pelos nomes. Depois vá para a história do casal. Então para como viajam. Depois comida e estilo. Por último logística (data, orçamento). O e-mail pode ser pedido no início ou no final — onde encaixar melhor na conversa.

## FINALIZANDO
Quando tiver coletado informações suficientes dos 4 blocos (nome, email, orçamento e data são OBRIGATÓRIOS), encerre com entusiasmo genuíno.

Sua mensagem final deve:
1. Ser calorosa e animada, sem revelar nenhum destino
2. Dizer que o perfil do casal foi montado e que as agências vão adorar
3. Mencionar que eles receberão um e-mail com o acesso ao painel para acompanhar as propostas
4. Conter exatamente o marcador [BRIEFING_COMPLETO] seguido do JSON abaixo

JSON format:
{
  "nome_parceiro_1": "",
  "nome_parceiro_2": "",
  "email": "",
  "historia": "",
  "personalidade": "",
  "destinos_visitados": "",
  "aceita_repetir_destino": true,
  "preferencia_tipo": "",
  "ritmo_viagem": "",
  "atividades_juntos": "",
  "gastronomia": "",
  "restricao_alimentar": "",
  "clima_preferido": "",
  "orcamento": "",
  "data_casamento": "",
  "duracao_dias": 0,
  "tipo_festa": "",
  "local_casamento": ""
}`

function gerarSenhaAleatoria(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let senha = ''
  for (let i = 0; i < 10; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return senha
}

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

    // Briefing concluído
    if (reply.includes('[BRIEFING_COMPLETO]')) {
      try {
        const jsonMatch = reply.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const briefingData = JSON.parse(jsonMatch[0])
          const senhaAcesso = gerarSenhaAleatoria()

          // 1. Criar usuário no Supabase Auth
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: briefingData.email,
            password: senhaAcesso,
            email_confirm: true, // confirma automaticamente sem precisar de e-mail de verificação
          })

          if (authError && !authError.message.includes('already registered')) {
            console.error('Erro ao criar usuário Auth:', authError)
          }

          // 2. Salvar casal na tabela casais
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
            // 3. Salvar briefing com senha temporária para envio futuro por e-mail
            await supabase.from('briefings').insert({
              casal_id: casal.id,
              respostas: {
                ...briefingData,
                _senha_acesso_temp: senhaAcesso, // será usado pelo módulo de e-mail
                _auth_user_id: authUser?.user?.id || null,
              },
              status: 'aguardando_revisao',
            })
          }
        }
      } catch (e) {
        console.error('Erro ao salvar briefing:', e)
      }

      const cleanReply = reply
        .replace('[BRIEFING_COMPLETO]', '')
        .replace(/\{[\s\S]*\}/, '')
        .trim()
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
