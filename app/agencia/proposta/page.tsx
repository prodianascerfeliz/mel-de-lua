'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TIPOS_EXPERIENCIA = ['Aventura', 'Relaxamento', 'Gastronômica', 'Cultural', 'Romântica', 'Natureza', 'Urbana', 'Mista']

function FormularioProposta() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const briefingId = searchParams.get('briefing')

  const [agenciaId, setAgenciaId] = useState<string | null>(null)
  const [briefingDados, setBriefingDados] = useState<{resumo_ia: string, respostas: Record<string, unknown>} | null>(null)
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const [form, setForm] = useState({
    destino: '',
    valor_total: '',
    duracao_dias: '',
    tipo_experiencia: [] as string[],
    roteiro: '',
    inclusoes: '',
    mensagem_casal: '',
    fotos_urls: '',
  })

  useEffect(() => {
    verificarSessao()
  }, [])

  const verificarSessao = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agencia/login'); return }
    setAgenciaId(user.id)

    if (briefingId) {
      const { data: b } = await supabase.from('briefings').select('resumo_ia, respostas').eq('id', briefingId).single()
      if (b) setBriefingDados({ resumo_ia: b.resumo_ia || '', respostas: b.respostas || {} })
    }
  }

  const toggleTipo = (tipo: string) => {
    setForm(f => ({
      ...f,
      tipo_experiencia: f.tipo_experiencia.includes(tipo)
        ? f.tipo_experiencia.filter(t => t !== tipo)
        : [...f.tipo_experiencia, tipo],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agenciaId || !briefingId) return
    setLoading(true)

    const { error } = await supabase.from('propostas').insert({
      briefing_id: briefingId,
      agencia_id: agenciaId,
      destino: form.destino,
      valor_total: parseFloat(form.valor_total.replace(/\D/g, '')) / 100,
      duracao_dias: parseInt(form.duracao_dias),
      tipo_experiencia: form.tipo_experiencia,
      roteiro_completo: { texto: form.roteiro },
      checklist_mala: { inclusoes: form.inclusoes },
      teaser_ia: form.mensagem_casal,
      status: 'aguardando_casal',
    })

    if (!error) {
      setEnviado(true)
    } else {
      alert('Erro ao enviar proposta. Tente novamente.')
    }
    setLoading(false)
  }

  if (enviado) return (
    <main style={{backgroundColor: '#060d1a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'}}>
      <div style={{textAlign: 'center', maxWidth: '480px'}}>
        <div style={{fontSize: '48px', marginBottom: '24px'}}>✈️</div>
        <h2 style={{fontSize: '28px', fontWeight: 400, color: '#FFFFFF', marginBottom: '16px', letterSpacing: '-0.01em', fontFamily: 'Georgia, serif'}}>
          Proposta enviada!
        </h2>
        <p style={{fontSize: '15px', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', lineHeight: 1.8, marginBottom: '32px'}}>
          O casal receberá sua proposta em breve. Você será notificado quando eles fizerem uma escolha.
        </p>
        <a href="/agencia/painel" style={{
          backgroundColor: '#2E86C1', color: '#FFFFFF',
          padding: '14px 40px', fontSize: '12px',
          letterSpacing: '0.18em', textDecoration: 'none',
          textTransform: 'uppercase', fontFamily: 'sans-serif',
          display: 'inline-block',
        }}>
          Voltar ao painel
        </a>
      </div>
    </main>
  )

  return (
    <main style={{backgroundColor: '#060d1a', minHeight: '100vh', fontFamily: "'Georgia', serif"}}>
      <style>{`
        input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(46,134,193,0.5) !important; }
        .tipo-btn:hover { border-color: rgba(46,134,193,0.4) !important; }
        .submit-btn:hover { background-color: #1a6fa8 !important; }
      `}</style>

      {/* HEADER */}
      <header style={{
        height: '64px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 32px',
        backgroundColor: 'rgba(6,13,26,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <a href="/" style={{textDecoration: 'none'}}>
          <div style={{fontSize: '18px', fontWeight: 300, letterSpacing: '0.35em', color: '#FFFFFF'}}>Mel de Lua</div>
        </a>
        <a href="/agencia/painel" style={{fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', textDecoration: 'none', letterSpacing: '0.1em'}}>
          ← Voltar ao painel
        </a>
      </header>

      <div style={{maxWidth: '760px', margin: '0 auto', padding: '48px 24px'}}>

        <div style={{marginBottom: '36px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
            <div style={{width: '24px', height: '1px', backgroundColor: '#F0A500'}} />
            <span style={{fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>Nova proposta</span>
          </div>
          <h1 style={{fontSize: '32px', fontWeight: 400, color: '#FFFFFF', margin: '0 0 12px', letterSpacing: '-0.01em'}}>
            Criar proposta para o casal
          </h1>
          {briefingDados && (
            <div style={{marginTop: '24px'}}>
              {/* Perfil narrativo gerado pela IA */}
              {(() => {
                let rec: Record<string,unknown> | null = null
                try { rec = typeof briefingDados.resumo_ia === 'string' && briefingDados.resumo_ia ? JSON.parse(briefingDados.resumo_ia) : null } catch {}
                const r = briefingDados.respostas || {}
                return (
                  <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    {/* Resumo narrativo */}
                    {rec?.resumo_casal && (
                      <div style={{backgroundColor:'rgba(46,134,193,0.08)',border:'1px solid rgba(46,134,193,0.2)',padding:'18px 20px'}}>
                        <p style={{fontSize:'10px',letterSpacing:'0.3em',color:'#2E86C1',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'8px'}}>Perfil do casal</p>
                        <p style={{fontSize:'14px',color:'rgba(255,255,255,0.75)',fontWeight:300,lineHeight:1.85,margin:0,fontStyle:'italic'}}>"{String(rec.resumo_casal)}"</p>
                      </div>
                    )}

                    {/* Ficha estruturada */}
                    <div style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',padding:'20px'}}>
                      <p style={{fontSize:'10px',letterSpacing:'0.3em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'16px'}}>Ficha do casal</p>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                        {[
                          {label:'Orçamento', valor: r.orcamento},
                          {label:'Data do casamento', valor: r.data_casamento},
                          {label:'Duração desejada', valor: r.duracao_dias ? `${r.duracao_dias} dias` : null},
                          {label:'Preferência de destino', valor: r.preferencia_tipo},
                          {label:'Ritmo de viagem', valor: r.ritmo_viagem},
                          {label:'Clima preferido', valor: r.clima_preferido},
                          {label:'Gastronomia', valor: r.gastronomia},
                          {label:'Restrição alimentar', valor: r.restricao_alimentar || 'Nenhuma'},
                          {label:'Local do casamento', valor: r.local_casamento},
                          {label:'Tipo de festa', valor: r.tipo_festa},
                        ].filter(i => i.valor).map(item => (
                          <div key={item.label} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',paddingBottom:'10px'}}>
                            <div style={{fontSize:'10px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'4px'}}>{item.label}</div>
                            <div style={{fontSize:'14px',color:'rgba(255,255,255,0.8)',fontFamily:'sans-serif'}}>{String(item.valor)}</div>
                          </div>
                        ))}
                      </div>
                      {r.atividades_juntos && (
                        <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'12px',marginTop:'4px'}}>
                          <div style={{fontSize:'10px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'4px'}}>O que gostam de fazer juntos</div>
                          <div style={{fontSize:'14px',color:'rgba(255,255,255,0.8)',fontFamily:'sans-serif',lineHeight:1.7}}>{String(r.atividades_juntos)}</div>
                        </div>
                      )}
                    </div>

                    {/* Destinos recomendados pela IA */}
                    {rec && (rec.recomendacao_1 || rec.recomendacao_2) && (
                      <div style={{backgroundColor:'rgba(240,165,0,0.05)',border:'1px solid rgba(240,165,0,0.2)',padding:'20px'}}>
                        <p style={{fontSize:'10px',letterSpacing:'0.3em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'16px'}}>Destinos recomendados pela IA Mel de Lua</p>
                        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                          {([rec.recomendacao_1, rec.recomendacao_2] as Record<string,unknown>[]).filter(Boolean).map((dest, i) => dest && (
                            <div key={i} style={{borderLeft:'2px solid rgba(240,165,0,0.4)',paddingLeft:'14px'}}>
                              <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'8px',marginBottom:'6px'}}>
                                <span style={{fontSize:'16px',fontWeight:400,color:'#FFFFFF',fontFamily:'Georgia,serif'}}>{String(dest.destino)}, {String(dest.pais)}</span>
                                <span style={{fontSize:'11px',color:'rgba(240,165,0,0.7)',fontFamily:'sans-serif',backgroundColor:'rgba(240,165,0,0.08)',padding:'2px 10px'}}>{String(dest.nivel_exclusividade)}</span>
                              </div>
                              <p style={{fontSize:'13px',fontStyle:'italic',color:'rgba(255,255,255,0.5)',margin:'0 0 6px',lineHeight:1.6}}>"{String(dest.titulo)}"</p>
                              <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',fontFamily:'sans-serif',lineHeight:1.7,margin:'0 0 8px',fontWeight:300}}>{String(dest.justificativa)}</p>
                              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                                <span style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',backgroundColor:'rgba(255,255,255,0.05)',padding:'3px 10px'}}>🗓 {String(dest.melhor_epoca)}</span>
                                <span style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',backgroundColor:'rgba(255,255,255,0.05)',padding:'3px 10px'}}>✈️ {String(dest.perfil_viagem)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '28px'}}>

          {/* Destino */}
          <div>
            <label style={{display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px'}}>
              Destino *
            </label>
            <input
              type="text"
              value={form.destino}
              onChange={e => setForm({...form, destino: e.target.value})}
              required
              placeholder="Ex: Ilhas Faroé, Dinamarca"
              style={{
                width: '100%', padding: '13px 16px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFFFFF', fontSize: '15px', fontFamily: 'sans-serif',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* Valor e Duração */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
            <div>
              <label style={{display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px'}}>
                Valor total (R$) *
              </label>
              <input
                type="text"
                value={form.valor_total}
                onChange={e => setForm({...form, valor_total: e.target.value})}
                required
                placeholder="Ex: 18.500"
                style={{
                  width: '100%', padding: '13px 16px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF', fontSize: '15px', fontFamily: 'sans-serif',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
              />
            </div>
            <div>
              <label style={{display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px'}}>
                Duração (dias) *
              </label>
              <input
                type="number"
                value={form.duracao_dias}
                onChange={e => setForm({...form, duracao_dias: e.target.value})}
                required
                min="1"
                placeholder="Ex: 10"
                style={{
                  width: '100%', padding: '13px 16px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF', fontSize: '15px', fontFamily: 'sans-serif',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
              />
            </div>
          </div>

          {/* Tipo de experiência */}
          <div>
            <label style={{display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '12px'}}>
              Tipo de experiência *
            </label>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
              {TIPOS_EXPERIENCIA.map(tipo => (
                <button
                  key={tipo}
                  type="button"
                  className="tipo-btn"
                  onClick={() => toggleTipo(tipo)}
                  style={{
                    padding: '8px 16px', fontSize: '12px',
                    fontFamily: 'sans-serif', cursor: 'pointer',
                    backgroundColor: form.tipo_experiencia.includes(tipo) ? 'rgba(46,134,193,0.25)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${form.tipo_experiencia.includes(tipo) ? 'rgba(46,134,193,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    color: form.tipo_experiencia.includes(tipo) ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.15s',
                  }}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Roteiro */}
          <div>
            <label style={{display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px'}}>
              Roteiro resumido *
            </label>
            <textarea
              value={form.roteiro}
              onChange={e => setForm({...form, roteiro: e.target.value})}
              required
              rows={5}
              placeholder="Dia 1: Chegada em Torshavn, check-in no hotel...&#10;Dia 2: Visita às falésias de Vestmanna..."
              style={{
                width: '100%', padding: '13px 16px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFFFFF', fontSize: '14px', fontFamily: 'sans-serif',
                boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.7,
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* Inclusões */}
          <div>
            <label style={{display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px'}}>
              O que está incluído *
            </label>
            <textarea
              value={form.inclusoes}
              onChange={e => setForm({...form, inclusoes: e.target.value})}
              required
              rows={3}
              placeholder="Passagens aéreas, hospedagem 5 estrelas, transfers, seguro viagem..."
              style={{
                width: '100%', padding: '13px 16px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFFFFF', fontSize: '14px', fontFamily: 'sans-serif',
                boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.7,
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* Mensagem ao casal */}
          <div>
            <label style={{display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px'}}>
              Mensagem especial para o casal
            </label>
            <textarea
              value={form.mensagem_casal}
              onChange={e => setForm({...form, mensagem_casal: e.target.value})}
              rows={3}
              placeholder="Uma mensagem pessoal sobre por que você escolheu esse destino para eles..."
              style={{
                width: '100%', padding: '13px 16px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFFFFF', fontSize: '14px', fontFamily: 'sans-serif',
                boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.7,
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* Fotos */}
          <div>
            <label style={{display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px'}}>
              URLs de fotos do destino
            </label>
            <input
              type="text"
              value={form.fotos_urls}
              onChange={e => setForm({...form, fotos_urls: e.target.value})}
              placeholder="https://... (separe múltiplos links com vírgula)"
              style={{
                width: '100%', padding: '13px 16px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFFFFF', fontSize: '14px', fontFamily: 'sans-serif',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div style={{borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', display: 'flex', gap: '16px', alignItems: 'center'}}>
            <button
              type="submit"
              disabled={loading || form.tipo_experiencia.length === 0}
              className="submit-btn"
              style={{
                backgroundColor: '#2E86C1', color: '#FFFFFF',
                padding: '15px 48px', fontSize: '12px',
                letterSpacing: '0.2em', border: 'none',
                textTransform: 'uppercase', fontFamily: 'sans-serif',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'background-color 0.2s',
                opacity: form.tipo_experiencia.length === 0 ? 0.5 : 1,
              }}
            >
              {loading ? 'Enviando...' : 'Enviar proposta'}
            </button>
            <a href="/agencia/painel" style={{fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', textDecoration: 'none'}}>
              Cancelar
            </a>
          </div>

        </form>
      </div>
    </main>
  )
}

export default function PropostaPage() {
  return (
    <Suspense fallback={<div style={{backgroundColor: '#060d1a', minHeight: '100vh'}} />}>
      <FormularioProposta />
    </Suspense>
  )
}
