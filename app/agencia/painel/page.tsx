'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Briefing = {
  id: string
  perfil_ia: string
  status: string
  criado_em: string
  data_casamento?: string
  orcamento?: string
  preferencia_tipo?: string
}

type Proposta = {
  id: string
  destino: string
  valor_total: number
  status: string
  criado_em: string
  briefing_id: string
}

export default function PainelAgencia() {
  const [aba, setAba] = useState<'briefings' | 'propostas' | 'historico' | 'perfil'>('briefings')
  const [briefings, setBriefings] = useState<Briefing[]>([])
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [agencia, setAgencia] = useState<{nome: string, email: string} | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    verificarSessao()
  }, [])

  const verificarSessao = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agencia/login'); return }

    const { data: ag } = await supabase.from('agencias').select('nome_fantasia, email').eq('email', user.email).single()
    if (ag) setAgencia({ nome: ag.nome_fantasia, email: ag.email })

    await carregarDados(user.id)
    setLoading(false)
  }

  const carregarDados = async (agenciaId: string) => {
    // Busca briefings disponíveis com resumo gerado pela IA
    const { data: bs } = await supabase
      .from('briefings')
      .select('id, status, criado_em, respostas')
      .in('status', ['aguardando_agencias', 'em_andamento'])
      .order('criado_em', { ascending: false })

    if (bs) {
      setBriefings(bs.map(b => {
        // Tenta extrair resumo_casal das recomendações da IA salvas no briefing
        let resumo = 'Perfil sendo preparado...'
        try {
          const rec = typeof b.respostas?.resumo_ia === 'string'
            ? JSON.parse(b.respostas.resumo_ia)
            : b.respostas?.resumo_ia
          if (rec?.resumo_casal) resumo = rec.resumo_casal
        } catch {}
        return {
          id: b.id,
          perfil_ia: resumo,
          status: b.status,
          criado_em: b.criado_em,
          data_casamento: b.respostas?.data_casamento,
          orcamento: b.respostas?.orcamento,
          preferencia_tipo: b.respostas?.preferencia_tipo,
        }
      }))
    }

    // Busca propostas da agência
    const { data: ps } = await supabase
      .from('propostas')
      .select('id, destino, valor_total, status, criado_em, briefing_id')
      .eq('agencia_id', agenciaId)
      .order('criado_em', { ascending: false })

    if (ps) setPropostas(ps)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/agencia/login')
  }

  const statusLabel: Record<string, { label: string, color: string }> = {
    aguardando_agencias: { label: 'Novo', color: '#3DD68C' },
    em_andamento: { label: 'Em andamento', color: '#F0A500' },
    aguardando_casal: { label: 'Aguardando casal', color: '#2E86C1' },
    aprovada: { label: 'Aprovada ✓', color: '#3DD68C' },
    recusada: { label: 'Recusada', color: '#ff6b6b' },
    fechada: { label: 'Fechada', color: '#9A8FBC' },
  }

  if (loading) return (
    <main style={{backgroundColor: '#060d1a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', fontSize: '14px'}}>Carregando...</div>
    </main>
  )

  return (
    <main style={{backgroundColor: '#060d1a', minHeight: '100vh', fontFamily: "'Georgia', serif"}}>
      <style>{`
        .aba-btn:hover { background-color: rgba(255,255,255,0.05) !important; }
        .card:hover { border-color: rgba(46,134,193,0.3) !important; }
        .btn-proposta:hover { background-color: #1a6fa8 !important; }
        @media (max-width: 768px) {
          .painel-layout { flex-direction: column !important; }
          .sidebar { width: 100% !important; flex-direction: row !important; overflow-x: auto !important; padding: 12px !important; }
          .sidebar-item { white-space: nowrap !important; }
          .content-area { padding: 20px 16px !important; }
        }
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
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          {agencia && (
            <span style={{fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif'}}>{agencia.nome}</span>
          )}
          <button onClick={handleLogout} style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif',
            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            padding: '7px 16px', cursor: 'pointer', letterSpacing: '0.1em',
          }}>Sair</button>
        </div>
      </header>

      <div className="painel-layout" style={{display: 'flex', minHeight: 'calc(100vh - 64px)'}}>

        {/* SIDEBAR */}
        <aside className="sidebar" style={{
          width: '220px', flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {[
            { id: 'briefings', label: 'Briefings', icon: '📋', count: briefings.length },
            { id: 'propostas', label: 'Minhas propostas', icon: '✈️', count: propostas.filter(p => p.status !== 'fechada').length },
            { id: 'historico', label: 'Viagens fechadas', icon: '🏆', count: propostas.filter(p => p.status === 'fechada').length },
            { id: 'perfil', label: 'Perfil', icon: '⚙️', count: 0 },
          ].map(item => (
            <button
              key={item.id}
              className="aba-btn sidebar-item"
              onClick={() => setAba(item.id as typeof aba)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                backgroundColor: aba === item.id ? 'rgba(46,134,193,0.15)' : 'transparent',
                borderLeft: aba === item.id ? '2px solid #2E86C1' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{fontSize: '16px'}}>{item.icon}</span>
              <span style={{fontSize: '13px', color: aba === item.id ? '#FFFFFF' : 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', flex: 1}}>{item.label}</span>
              {item.count > 0 && (
                <span style={{fontSize: '11px', backgroundColor: aba === item.id ? '#2E86C1' : 'rgba(255,255,255,0.1)', color: '#FFFFFF', padding: '2px 7px', borderRadius: '10px', fontFamily: 'sans-serif'}}>{item.count}</span>
              )}
            </button>
          ))}
        </aside>

        {/* CONTEÚDO */}
        <div className="content-area" style={{flex: 1, padding: '32px 40px', overflowY: 'auto'}}>

          {/* ABA: BRIEFINGS */}
          {aba === 'briefings' && (
            <div>
              <div style={{marginBottom: '28px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                  <div style={{width: '24px', height: '1px', backgroundColor: '#F0A500'}} />
                  <span style={{fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>Disponíveis</span>
                </div>
                <h2 style={{fontSize: '28px', fontWeight: 400, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em'}}>Briefings de casais</h2>
                <p style={{fontSize: '14px', color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif', marginTop: '8px', marginBottom: 0}}>
                  Cada casal teve a história coletada pela Mel. Crie uma proposta para os que mais combinam com vocês.
                </p>
              </div>

              {briefings.length === 0 ? (
                <div style={{textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif'}}>
                  Nenhum briefing disponível no momento.
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  {briefings.map(b => (
                    <div key={b.id} className="card" style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      padding: '24px 28px', transition: 'border-color 0.2s',
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px'}}>
                        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                          {b.data_casamento && (
                            <span style={{fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', backgroundColor: 'rgba(255,255,255,0.06)', padding: '4px 10px'}}>
                              📅 {b.data_casamento}
                            </span>
                          )}
                          {b.orcamento && (
                            <span style={{fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', backgroundColor: 'rgba(255,255,255,0.06)', padding: '4px 10px'}}>
                              💰 {b.orcamento}
                            </span>
                          )}
                          {b.preferencia_tipo && (
                            <span style={{fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', backgroundColor: 'rgba(255,255,255,0.06)', padding: '4px 10px'}}>
                              🗺️ {b.preferencia_tipo}
                            </span>
                          )}
                        </div>
                        <span style={{fontSize: '11px', color: statusLabel[b.status]?.color || '#FFFFFF', fontFamily: 'sans-serif', letterSpacing: '0.1em'}}>
                          ● {statusLabel[b.status]?.label || b.status}
                        </span>
                      </div>

                      <p style={{fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontWeight: 300, margin: '0 0 20px'}}>
                        {b.perfil_ia}
                      </p>

                      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                        <a href={`/agencia/proposta?briefing=${b.id}`} className="btn-proposta" style={{
                          backgroundColor: '#2E86C1', color: '#FFFFFF',
                          padding: '10px 28px', fontSize: '11px',
                          letterSpacing: '0.18em', textDecoration: 'none',
                          textTransform: 'uppercase', fontFamily: 'sans-serif',
                          transition: 'background-color 0.2s',
                          display: 'inline-block',
                        }}>
                          Enviar proposta
                        </a>
                        <span style={{fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontFamily: 'sans-serif'}}>
                          {new Date(b.criado_em).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA: PROPOSTAS */}
          {aba === 'propostas' && (
            <div>
              <div style={{marginBottom: '28px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                  <div style={{width: '24px', height: '1px', backgroundColor: '#F0A500'}} />
                  <span style={{fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>Acompanhamento</span>
                </div>
                <h2 style={{fontSize: '28px', fontWeight: 400, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em'}}>Minhas propostas</h2>
              </div>

              {propostas.filter(p => p.status !== 'fechada').length === 0 ? (
                <div style={{textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif'}}>
                  Nenhuma proposta enviada ainda.
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {propostas.filter(p => p.status !== 'fechada').map(p => (
                    <div key={p.id} className="card" style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      padding: '20px 24px',
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', flexWrap: 'wrap', gap: '12px',
                    }}>
                      <div>
                        <div style={{fontSize: '16px', color: '#FFFFFF', fontWeight: 400, marginBottom: '4px'}}>{p.destino}</div>
                        <div style={{fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif'}}>
                          R$ {p.valor_total?.toLocaleString('pt-BR')} · {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '12px', color: statusLabel[p.status]?.color || '#FFFFFF',
                        fontFamily: 'sans-serif', letterSpacing: '0.1em',
                      }}>
                        ● {statusLabel[p.status]?.label || p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA: HISTÓRICO */}
          {aba === 'historico' && (
            <div>
              <div style={{marginBottom: '28px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                  <div style={{width: '24px', height: '1px', backgroundColor: '#F0A500'}} />
                  <span style={{fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>Histórico</span>
                </div>
                <h2 style={{fontSize: '28px', fontWeight: 400, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em'}}>Viagens fechadas</h2>
              </div>

              {propostas.filter(p => p.status === 'fechada').length === 0 ? (
                <div style={{textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif'}}>
                  Nenhuma viagem fechada ainda. Em breve!
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {propostas.filter(p => p.status === 'fechada').map(p => (
                    <div key={p.id} className="card" style={{
                      backgroundColor: 'rgba(61,214,140,0.05)',
                      border: '1px solid rgba(61,214,140,0.15)',
                      padding: '20px 24px',
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', flexWrap: 'wrap', gap: '12px',
                    }}>
                      <div>
                        <div style={{fontSize: '16px', color: '#FFFFFF', fontWeight: 400, marginBottom: '4px'}}>{p.destino}</div>
                        <div style={{fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif'}}>
                          R$ {p.valor_total?.toLocaleString('pt-BR')} · {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <span style={{fontSize: '12px', color: '#3DD68C', fontFamily: 'sans-serif', letterSpacing: '0.1em'}}>
                        ● Fechada ✓
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA: PERFIL */}
          {aba === 'perfil' && (
            <div>
              <div style={{marginBottom: '28px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                  <div style={{width: '24px', height: '1px', backgroundColor: '#F0A500'}} />
                  <span style={{fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>Configurações</span>
                </div>
                <h2 style={{fontSize: '28px', fontWeight: 400, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em'}}>Perfil da agência</h2>
              </div>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '28px', maxWidth: '480px',
              }}>
                <p style={{color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', fontSize: '14px', lineHeight: 1.8}}>
                  {agencia?.nome && <><strong style={{color: '#FFFFFF'}}>{agencia.nome}</strong><br/></>}
                  {agencia?.email && <span>{agencia.email}</span>}
                </p>
                <p style={{color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', fontSize: '13px', marginTop: '20px'}}>
                  Edição completa do perfil em breve. Para atualizações, entre em contato com o suporte.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
