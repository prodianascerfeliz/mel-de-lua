'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Proposta = {
  id: string
  valor_total: number
  duracao_dias: number
  tipo_experiencia: string[]
  roteiro_completo: { texto: string }
  checklist_mala: { inclusoes: string }
  teaser_ia: string
  status: string
  agencia: { nome_fantasia: string }
}

type Padrinho = {
  id: string
  nome: string
  aprovado: boolean | null
  comentarios: string
}

export default function PainelCasal() {
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [padrinhos, setPadrinhos] = useState<Padrinho[]>([])
  const [casal, setCasal] = useState<{nome1: string, nome2: string} | null>(null)
  const [propostaSelecionada, setPropostaSelecionada] = useState<string | null>(null)
  const [confirmarModal, setConfirmarModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [escolhendo, setEscolhendo] = useState(false)
  const [aba, setAba] = useState<'propostas' | 'padrinhos'>('propostas')
  const [casalId, setCasalId] = useState<string | null>(null)
  const [novoPadrinho, setNovoPadrinho] = useState({ nome: '', email: '' })
  const [adicionando, setAdicionando] = useState(false)
  const [msgPadrinho, setMsgPadrinho] = useState('')
  const router = useRouter()

  useEffect(() => { carregarDados() }, [])

  const carregarDados = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/casal/login'); return }

    // Busca casal pelo e-mail do usuário
    const { data: casalData } = await supabase
      .from('casais').select('id, nome_parceiro_1, nome_parceiro_2')
      .eq('email', user.email).single()

    if (!casalData) { setLoading(false); return }
    setCasalId(casalData.id)
    setCasal({ nome1: casalData.nome_parceiro_1, nome2: casalData.nome_parceiro_2 })

    // Busca briefing do casal
    const { data: briefing } = await supabase
      .from('briefings').select('id').eq('casal_id', casalData.id).single()

    if (briefing) {
      // Busca propostas — SEM o campo destino (privacidade)
      const { data: ps } = await supabase
        .from('propostas')
        .select('id, valor_total, duracao_dias, tipo_experiencia, roteiro_completo, checklist_mala, teaser_ia, status, agencia:agencia_id(nome_fantasia)')
        .eq('briefing_id', briefing.id)
        .in('status', ['aguardando_casal', 'aprovada'])
        .order('criado_em', { ascending: false })

      if (ps) setPropostas(ps as unknown as Proposta[])

      // Busca padrinhos
      const { data: pads } = await supabase
        .from('padrinhos').select('id, nome, aprovado, comentarios')
        .eq('casal_id', casalData.id)

      if (pads) setPadrinhos(pads)
    }

    setLoading(false)
  }

  const handleAdicionarPadrinho = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!casalId || !casal) return
    setAdicionando(true)
    setMsgPadrinho('')
    try {
      const res = await fetch('/api/padrinhos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          casalId,
          nome: novoPadrinho.nome,
          email: novoPadrinho.email,
          nome1: casal.nome1,
          nome2: casal.nome2,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setMsgPadrinho('Convite enviado com sucesso!')
        setNovoPadrinho({ nome: '', email: '' })
        // Recarregar padrinhos
        const { data: pads } = await supabase.from('padrinhos').select('id, nome, aprovado, comentarios').eq('casal_id', casalId)
        if (pads) setPadrinhos(pads)
      } else {
        setMsgPadrinho('Erro ao enviar convite. Tente novamente.')
      }
    } catch { setMsgPadrinho('Erro ao enviar convite.') }
    setAdicionando(false)
  }

  const handleRemoverPadrinho = async (id: string) => {
    await fetch(`/api/padrinhos?id=${id}`, { method: 'DELETE' })
    setPadrinhos(ps => ps.filter(p => p.id !== id))
  }

  const padrinhosPendentes = padrinhos.filter(p => p.aprovado === null).length
  const padrinhosAprovaram = padrinhos.length > 0 && padrinhos.every(p => p.aprovado === true)
  const podeRevelar = padrinhosAprovaram || padrinhos.length === 0

  const handleEscolher = async () => {
    if (!propostaSelecionada || !podeRevelar) return
    setEscolhendo(true)

    await supabase.from('propostas')
      .update({ status: 'aprovada' })
      .eq('id', propostaSelecionada)

    // Recusa as outras
    const outras = propostas.filter(p => p.id !== propostaSelecionada).map(p => p.id)
    if (outras.length > 0) {
      await supabase.from('propostas').update({ status: 'recusada' }).in('id', outras)
    }

    router.push(`/casal/reveal?proposta=${propostaSelecionada}`)
  }

  const tipoIcons: Record<string, string> = {
    'Aventura': '🧗', 'Relaxamento': '🏖️', 'Gastronômica': '🍷',
    'Cultural': '🏛️', 'Romântica': '💕', 'Natureza': '🌿',
    'Urbana': '🌆', 'Mista': '✨',
  }

  if (loading) return (
    <main style={{backgroundColor:'#060d1a',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',fontSize:'14px'}}>Carregando...</div>
    </main>
  )

  return (
    <main style={{backgroundColor:'#060d1a',minHeight:'100vh',fontFamily:"'Georgia', serif"}}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        .proposta-card { transition: border-color 0.2s, background-color 0.2s; cursor: pointer; }
        .proposta-card:hover { border-color: rgba(46,134,193,0.35)!important; }
        .proposta-card.selecionada { border-color: #2E86C1!important; background-color: rgba(46,134,193,0.08)!important; }
        .btn-reveal:hover:not(:disabled) { background-color: #1a6fa8!important; }
        .btn-reveal:disabled { opacity: 0.4; cursor: not-allowed; }
        @media(max-width:768px) {
          .painel-inner { padding: 24px 16px!important; }
          .proposta-meta { flex-direction: column!important; gap: 8px!important; }
        }
      `}</style>

      {/* HEADER */}
      <header style={{height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',backgroundColor:'rgba(6,13,26,0.95)',borderBottom:'1px solid rgba(255,255,255,0.06)',position:'sticky',top:0,zIndex:100}}>
        <a href="/" style={{textDecoration:'none'}}>
          <div style={{fontSize:'18px',fontWeight:300,letterSpacing:'0.35em',color:'#FFFFFF'}}>Mel de Lua</div>
        </a>
        {casal && (
          <span style={{fontSize:'13px',color:'rgba(255,255,255,0.45)',fontFamily:'sans-serif'}}>
            {casal.nome1} & {casal.nome2}
          </span>
        )}
        <button onClick={async()=>{await supabase.auth.signOut();router.push('/casal/login')}}
          style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',background:'none',border:'1px solid rgba(255,255,255,0.1)',padding:'7px 16px',cursor:'pointer',letterSpacing:'0.1em'}}>
          Sair
        </button>
      </header>

      <div className="painel-inner" style={{maxWidth:'860px',margin:'0 auto',padding:'48px 32px'}}>

        {/* Saudação */}
        <div style={{marginBottom:'40px',animation:'fadeUp 0.8s ease forwards'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
            <div style={{width:'24px',height:'1px',backgroundColor:'#F0A500'}}/>
            <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>As propostas chegaram</span>
          </div>
          <h1 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:400,color:'#FFFFFF',margin:'0 0 12px',letterSpacing:'-0.02em'}}>
            {casal ? `${casal.nome1} & ${casal.nome2}` : 'Bem-vindos'}
          </h1>
          <p style={{fontSize:'16px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',fontWeight:300,lineHeight:1.7,margin:0}}>
            As agências criaram propostas especiais para vocês. Escolham a que mais combina — o destino será revelado depois. ✨
          </p>
        </div>

        {/* ABAS */}
        <div style={{display:'flex',gap:'0',borderBottom:'1px solid rgba(255,255,255,0.06)',marginBottom:'32px'}}>
          {([
            {id:'propostas', label:'✈️ Propostas'},
            {id:'padrinhos', label:'🤫 Padrinhos'},
          ] as {id: 'propostas'|'padrinhos', label:string}[]).map(item => (
            <button key={item.id} onClick={()=>setAba(item.id)}
              style={{padding:'12px 24px',background:'none',border:'none',cursor:'pointer',fontSize:'13px',fontFamily:'sans-serif',letterSpacing:'0.08em',
                color: aba===item.id ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
                borderBottom: aba===item.id ? '2px solid #2E86C1' : '2px solid transparent',
                transition:'all 0.15s'}}>
              {item.label}
            </button>
          ))}
        </div>

        {/* ADICIONAR PADRINHOS - quando não tem nenhum */}
        {padrinhos.length === 0 && (
          <div style={{backgroundColor:'rgba(240,165,0,0.05)',border:'1px solid rgba(240,165,0,0.15)',padding:'16px 20px',marginBottom:'24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <span style={{fontSize:'16px'}}>🤫</span>
              <span style={{fontSize:'13px',color:'rgba(255,255,255,0.55)',fontFamily:'sans-serif'}}>Vocês ainda não cadastraram padrinhos para guardar o segredo</span>
            </div>
            <button onClick={() => setAba('padrinhos')} style={{backgroundColor:'rgba(240,165,0,0.15)',border:'1px solid rgba(240,165,0,0.3)',color:'#F0A500',padding:'8px 20px',fontSize:'11px',letterSpacing:'0.15em',fontFamily:'sans-serif',cursor:'pointer',textTransform:'uppercase'}}>
              Adicionar padrinhos
            </button>
          </div>
        )}

        {/* STATUS DOS PADRINHOS */}
        {padrinhos.length > 0 && (
          <div style={{backgroundColor:'rgba(240,165,0,0.07)',border:'1px solid rgba(240,165,0,0.2)',padding:'20px 24px',marginBottom:'36px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',marginBottom:padrinhos.some(p=>p.comentarios) ? '16px' : '0'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}>
                <span style={{fontSize:'16px'}}>🤫</span>
                <span style={{fontSize:'13px',color:'rgba(255,255,255,0.7)',fontFamily:'sans-serif'}}>
                  {padrinhosAprovaram
                    ? 'Os padrinhos aprovaram! Vocês podem revelar o destino.'
                    : `Aguardando ${padrinhosPendentes} padrinho${padrinhosPendentes>1?'s':''} aprovar...`}
                </span>
                <a onClick={() => setAba('padrinhos')} style={{fontSize:'11px',color:'rgba(46,134,193,0.7)',fontFamily:'sans-serif',textDecoration:'none',border:'1px solid rgba(46,134,193,0.2)',padding:'4px 12px',letterSpacing:'0.08em'}}>
                  + Gerenciar
                </a>
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                {padrinhos.map(p => (
                  <div key={p.id} style={{
                    width:'32px',height:'32px',borderRadius:'50%',
                    backgroundColor: p.aprovado===true ? 'rgba(61,214,140,0.2)' : p.aprovado===false ? 'rgba(255,107,107,0.2)' : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${p.aprovado===true ? '#3DD68C' : p.aprovado===false ? '#ff6b6b' : 'rgba(255,255,255,0.2)'}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:'13px',
                  }} title={p.nome}>
                    {p.aprovado===true ? '✓' : p.aprovado===false ? '✗' : '?'}
                  </div>
                ))}
              </div>
            </div>
            {/* Comentários dos padrinhos */}
            {padrinhos.filter(p=>p.comentarios && p.aprovado).map(p => (
              <div key={p.id} style={{borderTop:'1px solid rgba(240,165,0,0.1)',paddingTop:'12px',marginTop:'12px'}}>
                <p style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',fontFamily:'sans-serif',margin:'0 0 4px'}}>
                  <strong style={{color:'rgba(255,255,255,0.7)'}}>{p.nome}</strong> disse:
                </p>
                <p style={{fontSize:'14px',fontStyle:'italic',color:'rgba(255,255,255,0.6)',margin:0,lineHeight:1.7}}>
                  "{p.comentarios}"
                </p>
              </div>
            ))}
          </div>
        )}

        {/* PROPOSTAS */}
        {aba === 'propostas' && (
          <>
          {propostas.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 20px'}}>
            <div style={{fontSize:'40px',marginBottom:'16px',animation:'pulse 2s ease-in-out infinite'}}>⏳</div>
            <p style={{color:'rgba(255,255,255,0.35)',fontFamily:'sans-serif',fontSize:'16px',lineHeight:1.8}}>
              As agências estão preparando propostas incríveis para vocês.<br/>Em breve chegam aqui!
            </p>
          </div>
        ) : (
          <>
            <div style={{display:'flex',flexDirection:'column',gap:'20px',marginBottom:'32px'}}>
              {propostas.map((p, i) => (
                <div key={p.id}
                  className={`proposta-card${propostaSelecionada===p.id?' selecionada':''}`}
                  onClick={() => setPropostaSelecionada(p.id)}
                  style={{
                    backgroundColor:'rgba(255,255,255,0.03)',
                    border:`1px solid ${propostaSelecionada===p.id ? '#2E86C1' : 'rgba(255,255,255,0.08)'}`,
                    padding:'28px',position:'relative',
                    animation:`fadeUp 0.6s ease ${i*0.1}s forwards`,opacity:0,
                  }}>

                  {/* Selecionada badge */}
                  {propostaSelecionada===p.id && (
                    <div style={{position:'absolute',top:'16px',right:'16px',backgroundColor:'#2E86C1',padding:'4px 12px',fontSize:'10px',letterSpacing:'0.2em',color:'#FFFFFF',fontFamily:'sans-serif',textTransform:'uppercase'}}>
                      Selecionada
                    </div>
                  )}

                  {/* Cabeçalho da proposta */}
                  <div style={{marginBottom:'20px'}}>
                    <div style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',letterSpacing:'0.2em',fontFamily:'sans-serif',textTransform:'uppercase',marginBottom:'6px'}}>
                      Proposta {i+1} · {p.agencia?.nome_fantasia || 'Agência parceira'}
                    </div>
                    <div className="proposta-meta" style={{display:'flex',gap:'20px',flexWrap:'wrap',alignItems:'center'}}>
                      <div>
                        <span style={{fontSize:'32px',fontWeight:300,color:'#FFFFFF',letterSpacing:'-0.02em'}}>
                          R$ {p.valor_total?.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                        <span style={{fontSize:'12px',backgroundColor:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.6)',padding:'5px 12px',fontFamily:'sans-serif'}}>
                          📅 {p.duracao_dias} dias
                        </span>
                        {p.tipo_experiencia?.map(t => (
                          <span key={t} style={{fontSize:'12px',backgroundColor:'rgba(46,134,193,0.12)',color:'rgba(255,255,255,0.7)',padding:'5px 12px',fontFamily:'sans-serif',border:'1px solid rgba(46,134,193,0.2)'}}>
                            {tipoIcons[t] || '✨'} {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mensagem da agência */}
                  {p.teaser_ia && (
                    <div style={{borderLeft:'2px solid #F0A500',paddingLeft:'16px',marginBottom:'20px'}}>
                      <p style={{fontSize:'15px',fontStyle:'italic',color:'rgba(255,255,255,0.65)',lineHeight:1.8,margin:0}}>
                        "{p.teaser_ia}"
                      </p>
                    </div>
                  )}

                  {/* Roteiro resumido */}
                  {p.roteiro_completo?.texto && (
                    <div style={{marginBottom:'16px'}}>
                      <p style={{fontSize:'11px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'8px'}}>Roteiro</p>
                      <p style={{fontSize:'14px',color:'rgba(255,255,255,0.55)',fontFamily:'sans-serif',fontWeight:300,lineHeight:1.8,margin:0,whiteSpace:'pre-line'}}>
                        {p.roteiro_completo.texto}
                      </p>
                    </div>
                  )}

                  {/* Inclusões */}
                  {p.checklist_mala?.inclusoes && (
                    <div>
                      <p style={{fontSize:'11px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'8px'}}>Inclui</p>
                      <p style={{fontSize:'14px',color:'rgba(255,255,255,0.55)',fontFamily:'sans-serif',fontWeight:300,lineHeight:1.8,margin:0}}>
                        {p.checklist_mala.inclusoes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* BOTÃO DE REVELAR */}
            <div style={{textAlign:'center',padding:'32px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
              {!podeRevelar && (
                <p style={{fontSize:'13px',color:'rgba(240,165,0,0.7)',fontFamily:'sans-serif',marginBottom:'16px'}}>
                  🤫 Aguardando aprovação dos padrinhos para revelar o destino
                </p>
              )}
              {!propostaSelecionada && podeRevelar && (
                <p style={{fontSize:'13px',color:'rgba(255,255,255,0.35)',fontFamily:'sans-serif',marginBottom:'16px'}}>
                  Selecione uma proposta acima para continuar
                </p>
              )}
              <button
                disabled={!propostaSelecionada || !podeRevelar || escolhendo}
                onClick={() => setConfirmarModal(true)}
                className="btn-reveal"
                style={{
                  backgroundColor:'#2E86C1',color:'#FFFFFF',
                  padding:'18px 56px',fontSize:'13px',
                  letterSpacing:'0.2em',border:'none',
                  textTransform:'uppercase',fontFamily:'sans-serif',
                  transition:'background-color 0.2s',
                  cursor: propostaSelecionada && podeRevelar ? 'pointer' : 'not-allowed',
                }}>
                {escolhendo ? 'Revelando...' : '✨ Revelar o destino'}
              </button>
              <p style={{fontSize:'11px',color:'rgba(255,255,255,0.2)',marginTop:'12px',fontFamily:'sans-serif'}}>
                Após escolher, o destino será revelado para sempre
              </p>
            </div>
          </>
        )}
          </>
        )}
      </div>

      {/* ABA PADRINHOS */}
      {aba === 'padrinhos' && (
        <div style={{maxWidth:'860px',margin:'0 auto',padding:'0 32px 80px'}}>
          <div style={{marginBottom:'28px'}}>
            <h2 style={{fontSize:'22px',fontWeight:400,color:'#FFFFFF',margin:'0 0 8px',letterSpacing:'-0.01em'}}>Guardiões do segredo</h2>
            <p style={{fontSize:'14px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',lineHeight:1.7,margin:0}}>
              Escolha pessoas de confiança que conhecem bem vocês. Elas vão ver o destino antes e precisam assinar um termo de responsabilidade antes de aprovar.
            </p>
          </div>

          {/* Lista de padrinhos */}
          {padrinhos.length > 0 && (
            <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'32px'}}>
              {padrinhos.map(p => (
                <div key={p.id} style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
                  <div>
                    <div style={{fontSize:'15px',color:'#FFFFFF',marginBottom:'2px'}}>{p.nome}</div>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      {p.aprovado === true && <span style={{fontSize:'11px',color:'#3DD68C',fontFamily:'sans-serif'}}>✓ Aprovado</span>}
                      {p.aprovado === false && <span style={{fontSize:'11px',color:'#ff6b6b',fontFamily:'sans-serif'}}>✗ Recusado</span>}
                      {p.aprovado === null && <span style={{fontSize:'11px',color:'rgba(240,165,0,0.8)',fontFamily:'sans-serif'}}>⏳ Aguardando assinatura</span>}
                    </div>
                  </div>
                  {p.aprovado === null && (
                    <button onClick={() => handleRemoverPadrinho(p.id)}
                      style={{background:'none',border:'1px solid rgba(255,107,107,0.3)',color:'#ff8080',padding:'5px 14px',fontSize:'11px',fontFamily:'sans-serif',cursor:'pointer',letterSpacing:'0.1em'}}>
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Formulário novo padrinho */}
          {padrinhos.length < 3 && (
            <div style={{backgroundColor:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',padding:'28px'}}>
              <p style={{fontSize:'11px',letterSpacing:'0.3em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'20px'}}>
                Adicionar padrinho/madrinha ({padrinhos.length}/3)
              </p>
              <form onSubmit={handleAdicionarPadrinho} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                  <div>
                    <label style={{display:'block',fontSize:'11px',letterSpacing:'0.15em',color:'rgba(255,255,255,0.35)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'6px'}}>Nome completo *</label>
                    <input type="text" value={novoPadrinho.nome} onChange={e=>setNovoPadrinho({...novoPadrinho,nome:e.target.value})} required
                      placeholder="Nome como aparecerá no convite"
                      style={{width:'100%',padding:'11px 14px',backgroundColor:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#FFFFFF',fontSize:'14px',fontFamily:'sans-serif',boxSizing:'border-box'}}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:'11px',letterSpacing:'0.15em',color:'rgba(255,255,255,0.35)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'6px'}}>E-mail *</label>
                    <input type="email" value={novoPadrinho.email} onChange={e=>setNovoPadrinho({...novoPadrinho,email:e.target.value})} required
                      placeholder="email@exemplo.com"
                      style={{width:'100%',padding:'11px 14px',backgroundColor:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#FFFFFF',fontSize:'14px',fontFamily:'sans-serif',boxSizing:'border-box'}}/>
                  </div>
                </div>
                {msgPadrinho && (
                  <div style={{padding:'10px 14px',backgroundColor:msgPadrinho.includes('sucesso')?'rgba(61,214,140,0.1)':'rgba(220,60,60,0.1)',border:`1px solid ${msgPadrinho.includes('sucesso')?'rgba(61,214,140,0.3)':'rgba(220,60,60,0.3)'}`,fontSize:'13px',color:msgPadrinho.includes('sucesso')?'#3DD68C':'#ff8080',fontFamily:'sans-serif'}}>
                    {msgPadrinho}
                  </div>
                )}
                <button type="submit" disabled={adicionando}
                  style={{backgroundColor:'#2E86C1',color:'#FFFFFF',padding:'12px 32px',fontSize:'11px',letterSpacing:'0.18em',border:'none',textTransform:'uppercase',fontFamily:'sans-serif',cursor:adicionando?'wait':'pointer',alignSelf:'flex-start',opacity:adicionando?0.7:1}}>
                  {adicionando ? 'Enviando convite...' : '🤫 Enviar convite'}
                </button>
              </form>
            </div>
          )}

          {padrinhos.length >= 3 && (
            <div style={{textAlign:'center',padding:'20px',color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',fontSize:'13px'}}>
              Máximo de 3 padrinhos atingido.
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO */}
      {confirmarModal && (
        <div style={{position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:'24px'}}>
          <div style={{backgroundColor:'#0A1628',border:'1px solid rgba(255,255,255,0.1)',padding:'40px',maxWidth:'420px',width:'100%',textAlign:'center'}}>
            <div style={{fontSize:'40px',marginBottom:'20px'}}>✈️</div>
            <h3 style={{fontSize:'22px',fontWeight:400,color:'#FFFFFF',marginBottom:'12px',letterSpacing:'-0.01em'}}>
              Prontos para o reveal?
            </h3>
            <p style={{fontSize:'14px',color:'rgba(255,255,255,0.5)',fontFamily:'sans-serif',lineHeight:1.8,marginBottom:'28px'}}>
              Depois de confirmar, o destino será revelado. Esse momento é único — certifiquem-se de que estão juntos!
            </p>
            <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
              <button onClick={() => setConfirmarModal(false)}
                style={{padding:'12px 28px',background:'none',border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.5)',fontSize:'12px',letterSpacing:'0.15em',fontFamily:'sans-serif',cursor:'pointer',textTransform:'uppercase'}}>
                Esperar
              </button>
              <button onClick={() => { setConfirmarModal(false); handleEscolher() }}
                style={{padding:'12px 28px',backgroundColor:'#2E86C1',border:'none',color:'#FFFFFF',fontSize:'12px',letterSpacing:'0.15em',fontFamily:'sans-serif',cursor:'pointer',textTransform:'uppercase'}}>
                Sim, revelar! ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
