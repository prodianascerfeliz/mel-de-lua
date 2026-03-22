'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type RecIA = {
  resumo_casal?: string
  recomendacao_1?: { destino: string; pais: string; titulo: string; justificativa: string; melhor_epoca: string; perfil_viagem: string; nivel_exclusividade: string }
  recomendacao_2?: { destino: string; pais: string; titulo: string; justificativa: string; melhor_epoca: string; perfil_viagem: string; nivel_exclusividade: string }
}

type FichaOrcamento = {
  destino: string
  aeroporto_partida: string
  aeroporto_chegada: string
  data_ida: string
  data_volta: string
  cidades_hospedagem: string
  categoria_hotel: string
  regime_hospedagem: string
  translados: string
  passeios: string
  refeicoes: string
  seguro_viagem: boolean
  visto_taxas: string
  valor_total: string
  observacoes: string
}

const fichaVazia = (): FichaOrcamento => ({
  destino: '', aeroporto_partida: 'GRU — São Paulo/Guarulhos',
  aeroporto_chegada: '', data_ida: '', data_volta: '',
  cidades_hospedagem: '', categoria_hotel: '5 estrelas',
  regime_hospedagem: 'Café da manhã incluso', translados: '',
  passeios: '', refeicoes: '', seguro_viagem: true,
  visto_taxas: '', valor_total: '', observacoes: '',
})

function FormularioProposta() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const briefingId = searchParams.get('briefing')

  const [agenciaId, setAgenciaId] = useState<string | null>(null)
  const [rec, setRec] = useState<RecIA | null>(null)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [fichaAtiva, setFichaAtiva] = useState<1 | 2>(1)
  const [ficha1, setFicha1] = useState<FichaOrcamento>(fichaVazia())
  const [ficha2, setFicha2] = useState<FichaOrcamento>(fichaVazia())
  const [mensagemCasal, setMensagemCasal] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { verificarSessao() }, [])

  const verificarSessao = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agencia/login'); return }
    setAgenciaId(user.id)

    if (briefingId) {
      const { data: b } = await supabase.from('briefings')
        .select('resumo_ia, respostas').eq('id', briefingId).single()
      if (b) {
        try {
          if (b.resumo_ia) setRec(JSON.parse(b.resumo_ia) as RecIA)
        } catch {}
        if (b.respostas) {
          setRespostas(b.respostas as Record<string, string>)
          // Pré-calcular datas se tiver data_casamento e duracao_dias
          const dataCasamento = b.respostas.data_casamento as string
          const duracao = parseInt(b.respostas.duracao_dias as string) || 10
          if (dataCasamento) {
            try {
              const partes = dataCasamento.split('/')
              const dataBase = partes.length === 3
                ? new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]))
                : new Date(dataCasamento)
              dataBase.setDate(dataBase.getDate() + 1)
              const dataIda = dataBase.toISOString().split('T')[0]
              dataBase.setDate(dataBase.getDate() + duracao)
              const dataVolta = dataBase.toISOString().split('T')[0]
              setFicha1(f => ({ ...f, data_ida: dataIda, data_volta: dataVolta }))
              setFicha2(f => ({ ...f, data_ida: dataIda, data_volta: dataVolta }))
            } catch {}
          }
          // Pré-preencher destinos das recomendações
          if (b.resumo_ia) {
            try {
              const r = JSON.parse(b.resumo_ia) as RecIA
              if (r.recomendacao_1) setFicha1(f => ({ ...f, destino: `${r.recomendacao_1!.destino}, ${r.recomendacao_1!.pais}`, aeroporto_chegada: r.recomendacao_1!.destino }))
              if (r.recomendacao_2) setFicha2(f => ({ ...f, destino: `${r.recomendacao_2!.destino}, ${r.recomendacao_2!.pais}`, aeroporto_chegada: r.recomendacao_2!.destino }))
            } catch {}
          }
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agenciaId || !briefingId) return
    setEnviando(true)
    setErro('')

    // Envia as duas propostas
    const propostas = [ficha1, ficha2].filter(f => f.valor_total)
    for (const ficha of propostas) {
      await supabase.from('propostas').insert({
        briefing_id: briefingId,
        agencia_id: agenciaId,
        destino: ficha.destino,
        valor_total: parseFloat(ficha.valor_total.replace(/\D/g, '')) / 100,
        duracao_dias: ficha.data_ida && ficha.data_volta
          ? Math.round((new Date(ficha.data_volta).getTime() - new Date(ficha.data_ida).getTime()) / 86400000)
          : 0,
        tipo_experiencia: [],
        roteiro_completo: {
          aeroporto_partida: ficha.aeroporto_partida,
          aeroporto_chegada: ficha.aeroporto_chegada,
          data_ida: ficha.data_ida,
          data_volta: ficha.data_volta,
          cidades_hospedagem: ficha.cidades_hospedagem,
          categoria_hotel: ficha.categoria_hotel,
          regime_hospedagem: ficha.regime_hospedagem,
          translados: ficha.translados,
          passeios: ficha.passeios,
          refeicoes: ficha.refeicoes,
          seguro_viagem: ficha.seguro_viagem,
          visto_taxas: ficha.visto_taxas,
          observacoes: ficha.observacoes,
        },
        checklist_mala: {},
        teaser_ia: mensagemCasal,
        status: 'aguardando_casal',
      })
    }

    setEnviado(true)
    setEnviando(false)
  }

  const Campo = ({ label, obrigatorio = false, children }: { label: string; obrigatorio?: boolean; children: React.ReactNode }) => (
    <div>
      <label style={{ display: 'block', fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '7px' }}>
        {label} {obrigatorio && <span style={{ color: '#F0A500' }}>*</span>}
      </label>
      {children}
    </div>
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFFFFF', fontSize: '14px', fontFamily: 'sans-serif',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle, resize: 'vertical', lineHeight: 1.7,
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle, cursor: 'pointer',
    backgroundColor: '#0d1e35',
  }

  const fichaAtual = fichaAtiva === 1 ? ficha1 : ficha2
  const setFichaAtual = fichaAtiva === 1 ? setFicha1 : setFicha2
  const destRec = fichaAtiva === 1 ? rec?.recomendacao_1 : rec?.recomendacao_2

  if (enviado) return (
    <main style={{ backgroundColor: '#060d1a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>✈️</div>
        <h2 style={{ fontSize: '28px', fontWeight: 400, color: '#FFFFFF', marginBottom: '16px', letterSpacing: '-0.01em', fontFamily: 'Georgia, serif' }}>Proposta enviada!</h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', lineHeight: 1.8, marginBottom: '32px' }}>
          O casal receberá sua proposta em breve. Você será notificado quando fizerem uma escolha.
        </p>
        <a href="/agencia/painel" style={{ backgroundColor: '#2E86C1', color: '#FFFFFF', padding: '14px 40px', fontSize: '12px', letterSpacing: '0.18em', textDecoration: 'none', textTransform: 'uppercase', fontFamily: 'sans-serif', display: 'inline-block' }}>
          Voltar ao painel
        </a>
      </div>
    </main>
  )

  return (
    <main style={{ backgroundColor: '#060d1a', minHeight: '100vh', fontFamily: "'Georgia', serif" }}>
      <style>{`
        input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(46,134,193,0.5) !important; }
        .submit-btn:hover { background-color: #1a6fa8 !important; }
        .tab-btn:hover { border-color: rgba(255,255,255,0.2) !important; }
        option { background: #0d1e35; }
        @media(max-width:768px) { .grid-2 { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* HEADER */}
      <header style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', backgroundColor: 'rgba(6,13,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '18px', fontWeight: 300, letterSpacing: '0.35em', color: '#FFFFFF' }}>Mel de Lua</div>
        </a>
        <a href="/agencia/painel" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', textDecoration: 'none', letterSpacing: '0.1em' }}>← Voltar ao painel</a>
      </header>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Título */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '20px', height: '1px', backgroundColor: '#F0A500' }} />
            <span style={{ fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>Ficha de orçamento</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>Criar proposta para o casal</h1>
        </div>

        {/* Perfil do casal */}
        {rec?.resumo_casal && (
          <div style={{ backgroundColor: 'rgba(46,134,193,0.08)', border: '1px solid rgba(46,134,193,0.2)', padding: '20px', marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#2E86C1', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px' }}>Perfil do casal</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', fontFamily: 'sans-serif', lineHeight: 1.85, margin: 0, fontStyle: 'italic' }}>"{rec.resumo_casal}"</p>
          </div>
        )}

        {/* Ficha resumida do casal */}
        {Object.keys(respostas).length > 0 && (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: '20px', marginBottom: '28px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '14px' }}>Dados do casal</p>
            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Orçamento', valor: respostas.orcamento },
                { label: 'Data do casamento', valor: respostas.data_casamento },
                { label: 'Duração desejada', valor: respostas.duracao_dias ? `${respostas.duracao_dias} dias` : null },
                { label: 'Preferência', valor: respostas.preferencia_tipo },
                { label: 'Ritmo', valor: respostas.ritmo_viagem },
                { label: 'Clima', valor: respostas.clima_preferido },
                { label: 'Gastronomia', valor: respostas.gastronomia },
                { label: 'Restrição alimentar', valor: respostas.restricao_alimentar || 'Nenhuma' },
              ].filter(i => i.valor).map(item => (
                <div key={item.label} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontFamily: 'sans-serif' }}>{String(item.valor)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Abas dos destinos */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '0' }}>
              {([1, 2] as const).map(n => {
                const d = n === 1 ? rec?.recomendacao_1 : rec?.recomendacao_2
                const f = n === 1 ? ficha1 : ficha2
                return (
                  <button key={n} type="button" onClick={() => setFichaAtiva(n)} className="tab-btn"
                    style={{
                      padding: '12px 20px', background: 'none', cursor: 'pointer', fontFamily: 'sans-serif',
                      fontSize: '13px', flex: 1, textAlign: 'left',
                      backgroundColor: fichaAtiva === n ? 'rgba(46,134,193,0.12)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${fichaAtiva === n ? '#2E86C1' : 'rgba(255,255,255,0.08)'}`,
                      borderBottom: fichaAtiva === n ? '1px solid rgba(46,134,193,0.12)' : '1px solid rgba(255,255,255,0.08)',
                      color: fichaAtiva === n ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                      transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: '10px', color: fichaAtiva === n ? '#F0A500' : 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Destino {n} {f.valor_total ? '✓' : ''}
                    </div>
                    <div>{d ? `${d.destino}, ${d.pais}` : `Orçamento ${n}`}</div>
                  </button>
                )
              })}
            </div>

            {/* Ficha de orçamento */}
            <div style={{ border: '1px solid rgba(46,134,193,0.2)', borderTop: 'none', padding: '28px', backgroundColor: 'rgba(255,255,255,0.02)' }}>

              {/* Destino recomendado */}
              {destRec && (
                <div style={{ backgroundColor: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.15)', padding: '14px 18px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 400 }}>{destRec.destino}, {destRec.pais}</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', marginLeft: '12px' }}>✈️ {destRec.melhor_epoca}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'rgba(240,165,0,0.8)', fontFamily: 'sans-serif', backgroundColor: 'rgba(240,165,0,0.08)', padding: '3px 10px' }}>{destRec.nivel_exclusividade}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Destino e aeroportos */}
                <Campo label="Destino *" obrigatorio>
                  <input type="text" value={fichaAtual.destino} onChange={e => setFichaAtual(f => ({ ...f, destino: e.target.value }))} required placeholder="Ex: Socotra, Iêmen" style={inputStyle} />
                </Campo>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Campo label="Aeroporto de partida">
                    <input type="text" value={fichaAtual.aeroporto_partida} onChange={e => setFichaAtual(f => ({ ...f, aeroporto_partida: e.target.value }))} placeholder="GRU — São Paulo/Guarulhos" style={inputStyle} />
                  </Campo>
                  <Campo label="Aeroporto de chegada">
                    <input type="text" value={fichaAtual.aeroporto_chegada} onChange={e => setFichaAtual(f => ({ ...f, aeroporto_chegada: e.target.value }))} placeholder="Ex: SCT — Socotra" style={inputStyle} />
                  </Campo>
                </div>

                {/* Datas */}
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Campo label="Data de ida *" obrigatorio>
                    <input type="date" value={fichaAtual.data_ida} onChange={e => setFichaAtual(f => ({ ...f, data_ida: e.target.value }))} required style={inputStyle} />
                  </Campo>
                  <Campo label="Data de volta *" obrigatorio>
                    <input type="date" value={fichaAtual.data_volta} onChange={e => setFichaAtual(f => ({ ...f, data_volta: e.target.value }))} required style={inputStyle} />
                  </Campo>
                </div>

                {/* Hospedagem */}
                <Campo label="Cidades de hospedagem *" obrigatorio>
                  <textarea value={fichaAtual.cidades_hospedagem} onChange={e => setFichaAtual(f => ({ ...f, cidades_hospedagem: e.target.value }))} required rows={2}
                    placeholder="Ex: 4 noites Hadibo, 3 noites Qalansiyah, 2 noites Detwah" style={textareaStyle} />
                </Campo>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Campo label="Categoria do hotel">
                    <select value={fichaAtual.categoria_hotel} onChange={e => setFichaAtual(f => ({ ...f, categoria_hotel: e.target.value }))} style={selectStyle}>
                      {['3 estrelas', '4 estrelas', '5 estrelas', 'Boutique/Charme', 'Resort', 'Eco-lodge'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </Campo>
                  <Campo label="Regime de hospedagem">
                    <select value={fichaAtual.regime_hospedagem} onChange={e => setFichaAtual(f => ({ ...f, regime_hospedagem: e.target.value }))} style={selectStyle}>
                      {['Café da manhã incluso', 'Meia pensão (café + jantar)', 'Pensão completa', 'All inclusive', 'Somente hospedagem'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </Campo>
                </div>

                {/* Translados */}
                <Campo label="Translados incluídos">
                  <textarea value={fichaAtual.translados} onChange={e => setFichaAtual(f => ({ ...f, translados: e.target.value }))} rows={2}
                    placeholder="Ex: Transfer aeroporto-hotel, traslados entre cidades, transfers para passeios" style={textareaStyle} />
                </Campo>

                {/* Passeios */}
                <Campo label="Passeios incluídos">
                  <textarea value={fichaAtual.passeios} onChange={e => setFichaAtual(f => ({ ...f, passeios: e.target.value }))} rows={3}
                    placeholder="Liste os passeios incluídos&#10;Ex:&#10;- Trekking na floresta de Dragão de Socotra&#10;- Snorkeling nas praias de Arher&#10;- Visita ao mercado local com guia gastronômico" style={textareaStyle} />
                </Campo>

                {/* Refeições */}
                <Campo label="Refeições inclusas (além do regime)">
                  <textarea value={fichaAtual.refeicoes} onChange={e => setFichaAtual(f => ({ ...f, refeicoes: e.target.value }))} rows={2}
                    placeholder="Ex: Jantar de boas-vindas no dia 1, almoço típico no dia 3" style={textareaStyle} />
                </Campo>

                {/* Seguro e visto */}
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Campo label="Seguro viagem">
                    <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                      {[true, false].map(v => (
                        <label key={String(v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="radio" checked={fichaAtual.seguro_viagem === v} onChange={() => setFichaAtual(f => ({ ...f, seguro_viagem: v }))}
                            style={{ accentColor: '#2E86C1' }} />
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontFamily: 'sans-serif' }}>{v ? 'Incluso' : 'Não incluso'}</span>
                        </label>
                      ))}
                    </div>
                  </Campo>
                  <Campo label="Visto e taxas">
                    <input type="text" value={fichaAtual.visto_taxas} onChange={e => setFichaAtual(f => ({ ...f, visto_taxas: e.target.value }))}
                      placeholder="Ex: Visto on arrival incluso, taxa de turismo $50" style={inputStyle} />
                  </Campo>
                </div>

                {/* Valor total */}
                <Campo label="Valor total do pacote (R$) *" obrigatorio>
                  <input type="text" value={fichaAtual.valor_total} onChange={e => setFichaAtual(f => ({ ...f, valor_total: e.target.value }))}
                    placeholder="Ex: 48.500" style={{ ...inputStyle, fontSize: '18px', fontWeight: 300, letterSpacing: '0.02em' }} />
                </Campo>

                {/* Observações */}
                <Campo label="Observações e diferenciais">
                  <textarea value={fichaAtual.observacoes} onChange={e => setFichaAtual(f => ({ ...f, observacoes: e.target.value }))} rows={3}
                    placeholder="Diferenciais da sua proposta, condições especiais, validade do orçamento..." style={textareaStyle} />
                </Campo>
              </div>
            </div>
          </div>

          {/* Mensagem ao casal */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '7px' }}>
              Mensagem especial para o casal
            </label>
            <textarea value={mensagemCasal} onChange={e => setMensagemCasal(e.target.value)} rows={3}
              placeholder="Uma mensagem pessoal explicando por que essas experiências fazem sentido para eles, sem revelar os destinos..."
              style={textareaStyle} />
          </div>

          {erro && <div style={{ padding: '12px 16px', backgroundColor: 'rgba(220,60,60,0.15)', border: '1px solid rgba(220,60,60,0.3)', fontSize: '13px', color: '#ff8080', fontFamily: 'sans-serif' }}>{erro}</div>}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="submit" disabled={enviando} className="submit-btn"
              style={{ backgroundColor: '#2E86C1', color: '#FFFFFF', padding: '15px 48px', fontSize: '12px', letterSpacing: '0.2em', border: 'none', textTransform: 'uppercase', fontFamily: 'sans-serif', cursor: enviando ? 'wait' : 'pointer', transition: 'background-color 0.2s', opacity: enviando ? 0.7 : 1 }}>
              {enviando ? 'Enviando...' : '✈️ Enviar proposta'}
            </button>
            <a href="/agencia/painel" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', textDecoration: 'none' }}>Cancelar</a>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontFamily: 'sans-serif', margin: 0 }}>
              {ficha1.valor_total && ficha2.valor_total ? 'Ambos os destinos serão enviados' : ficha1.valor_total || ficha2.valor_total ? '1 destino será enviado' : 'Preencha ao menos um destino'}
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}

export default function PropostaPage() {
  return (
    <Suspense fallback={<div style={{ backgroundColor: '#060d1a', minHeight: '100vh' }} />}>
      <FormularioProposta />
    </Suspense>
  )
}
