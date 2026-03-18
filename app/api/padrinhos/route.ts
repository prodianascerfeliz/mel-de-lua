import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.meldelua.com.br'

export async function POST(req: NextRequest) {
  try {
    const { casalId, nome, email } = await req.json()

    if (!casalId || !nome || !email) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Gerar token único
    const token = randomBytes(32).toString('hex')

    // Buscar dados do casal
    const { data: casal } = await supabase
      .from('casais')
      .select('nome_parceiro_1, nome_parceiro_2')
      .eq('id', casalId)
      .single()

    // Salvar padrinho no banco
    const { data: padrinho, error } = await supabase
      .from('padrinhos')
      .insert({
        casal_id: casalId,
        nome,
        email,
        token_acesso: token,
        aprovado: null,
        comentarios: '',
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar padrinho:', error)
      return NextResponse.json({ error: 'Erro ao cadastrar padrinho' }, { status: 500 })
    }

    // Disparar e-mail de convite
    await fetch(`${BASE_URL}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'convite_padrinho',
        dados: {
          nomePadrinho: nome,
          nome1: casal?.nome_parceiro_1 || 'O casal',
          nome2: casal?.nome_parceiro_2 || '',
          emailPadrinho: email,
          token,
        },
      }),
    })

    return NextResponse.json({ ok: true, padrinhoId: padrinho.id, token })

  } catch (error) {
    console.error('Erro na API de padrinhos:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const casalId = searchParams.get('casalId')
  if (!casalId) return NextResponse.json({ error: 'casalId obrigatório' }, { status: 400 })

  const { data } = await supabase
    .from('padrinhos')
    .select('id, nome, email, aprovado, comentarios, criado_em')
    .eq('casal_id', casalId)
    .order('criado_em', { ascending: true })

  return NextResponse.json({ padrinhos: data || [] })
}
