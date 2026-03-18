'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_EMAILS = ['prodianascerfeliz@gmail.com']

type Aba = 'overview' | 'casais' | 'agencias' | 'propostas' | 'comissoes' | 'cadastrar'

type Casal = { id: string; nome_parceiro_1: string; nome_parceiro_2: string; email: string; status: string; criado_em: string }
type Briefing = { id: string; casal_id: string; status: string; respostas: Record<string, unknown>; resumo_ia?: string }
type Agencia = { id: string; nome_fantasia: string; responsavel: string; email: string; status: string; nota_media: number; total_viagens_fechadas: number; criado_em: string }
type Proposta = { id: string; destino: string; valor_total: number; status: string; criado_em: string; agencia: { nome_fantasia: string }; briefing: { casal: { nome_parceiro_1: string; nome_parceiro_2: string } } }
type Comissao = { id: string; valor_viagem: number; percentual: number; valor_comissao: number; status: string; criado_em: string; proposta: { destino: string; agencia: { nome_fantasia: string } } }

export default function PainelAdmin() {
  const [aba, setAba] = useState<Aba>('overview')
  const [casais, setCasais] = useState<Casal[]>([])
  const [agencias, setAgencias] = useState<Agencia[]>([])
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [comissoes, setComissoes] = useState<Comissao[]>([])
  const [briefings, setBriefings] = useState<Briefing[]>([])
  const [loading, setLoading] = useState(true)
  const [novaAgencia, setNovaAgencia] = useState({ nome_fantasia: '', responsavel: '', email: '', telefone: '' })
  const [salvandoAgencia, setSalvandoAgencia] = useState(false)
  const [msgAgencia, setMsgAgencia] = useState('')
  const [briefingModal, setBriefingModal] = useState<Briefing | null>(null)
  const [recomendacoes, setRecomendacoes] = useState<Record<string, unknown> | null>(null)
  const [gerandoRec, setGerandoRec] = useState(false)
  const [abaModal, setAbaModal] = useState<'bruto' | 'recomendacoes'>('bruto')
  const router = useRouter()

  useEffect(() => { verificarAdmin() }, [])

  const verificarAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      router.push('/admin/login'); return
    }
    await Promise.all([carregarCasais(), carregarAgencias(), carregarPropostas(), carregarComissoes(), carregarBriefings()])
    setLoading(false)
  }

  const carregarCasais = async () => {
    const { data } = await supabase.from('casais').select('*').order('criado_em', { ascending: false })
    if (data) setCasais(data)
  }

  const carregarBriefings = async () => {
    const { data } = await supabase.from('briefings').select('id, casal_id, status, respostas').order('criado_em', { ascending: false })
    if (data) setBriefings(data)
  }

  const carregarAgencias = async () => {
    const { data } = await supabase.from('agencias').select('*').order('criado_em', { ascending: false })
    if (data) setAgencias(data)
  }

  const carregarPropostas = async () => {
    const { data } = await supabase
      .from('propostas')
      .select('id, destino, valor_total, status, criado_em, agencia:agencia_id(nome_fantasia), briefing:briefing_id(casal:casal_id(nome_parceiro_1, nome_parceiro_2))')
      .order('criado_em', { ascending: false })
    if (data) setPropostas(data as unknown as Proposta[])
  }

  const carregarComissoes = async () => {
    const { data } = await supabase
      .from('comissoes')
      .select('id, valor_viagem, percentual, valor_comissao, status, criado_em, proposta:proposta_id(destino, agencia:agencia_id(nome_fantasia))')
      .order('criado_em', { ascending: false })
    if (data) setComissoes(data as unknown as Comissao[])
  }

  const toggleStatusAgencia = async (id: string, statusAtual: string) => {
    const novoStatus = statusAtual === 'ativo' ? 'suspenso' : 'ativo'
    await supabase.from('agencias').update({ status: novoStatus }).eq('id', id)
    setAgencias(ag => ag.map(a => a.id === id ? { ...a, status: novoStatus } : a))
  }

  const handleCadastrarAgencia = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvandoAgencia(true)
    setMsgAgencia('')
    const { error } = await supabase.from('agencias').insert({ ...novaAgencia, status: 'ativo', nota_media: 0, total_viagens_fechadas: 0 })
    if (error) {
      setMsgAgencia('Erro ao cadastrar. Verifique os dados.')
    } else {
      setMsgAgencia('Agência cadastrada com sucesso!')
      setNovaAgencia({ nome_fantasia: '', responsavel: '', email: '', telefone: '' })
      carregarAgencias()
    }
    setSalvandoAgencia(false)
  }

  const gerarRecomendacoes = async (briefing: Briefing) => {
    setGerandoRec(true)
    try {
      const res = await fetch('/api/recomendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefingId: briefing.id, respostas: briefing.respostas }),
      })
      const data = await res.json()
      if (data.recomendacoes) {
        setRecomendacoes(data.recomendacoes)
        setAbaModal('recomendacoes')
        // Atualiza o briefing local com resumo_ia
        setBriefings(bs => bs.map(b => b.id === briefing.id ? { ...b, resumo_ia: JSON.stringify(data.recomendacoes) } : b))
      }
    } catch (e) { console.error(e) }
    setGerandoRec(false)
  }

  const aprovarBriefing = async (briefingId: string) => {
    await supabase.from('briefings').update({ status: 'aguardando_agencias' }).eq('id', briefingId)
    setBriefings(bs => bs.map(b => b.id === briefingId ? { ...b, status: 'aguardando_agencias' } : b))
  }

  const atualizarStatusComissao = async (id: string, status: string) => {
    await supabase.from('comissoes').update({ status }).eq('id', id)
    setComissoes(cs => cs.map(c => c.id === id ? { ...c, status } : c))
  }

  // Métricas
  const receitaTotal = comissoes.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor_comissao, 0)
  const receitaPendente = comissoes.filter(c => c.status === 'pendente').reduce((s, c) => s + c.valor_comissao, 0)
  const propostasAprovadas = propostas.filter(p => p.status === 'aprovada' || p.status === 'fechada').length

  const statusCor: Record<string, string> = {
    ativo: '#3DD68C', suspenso: '#ff6b6b', pendente: '#F0A500',
    pago: '#3DD68C', aguardando_casal: '#2E86C1', aprovada: '#3DD68C',
    recusada: '#ff6b6b', fechada: '#9A8FBC', briefing_completo: '#2E86C1',
    em_andamento: '#F0A500',
  }

  const nav = [
    { id: 'overview', label: 'Visão geral', icon: '📊' },
    { id: 'casais', label: 'Casais', icon: '💑', count: casais.length },
    { id: 'agencias', label: 'Agências', icon: '🏢', count: agencias.length },
    { id: 'propostas', label: 'Propostas', icon: '✈️', count: propostas.length },
    { id: 'comissoes', label: 'Comissões', icon: '💰', count: comissoes.filter(c=>c.status==='pendente').length },
    { id: 'cadastrar', label: 'Nova agência', icon: '➕' },
  ]

  if (loading) return (
    <main style={{backgroundColor:'#060d1a',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',fontSize:'14px'}}>Carregando painel...</div>
    </main>
  )

  return (
    <main style={{backgroundColor:'#060d1a',minHeight:'100vh',fontFamily:"'Georgia', serif"}}>
      <style>{`
        .nav-btn:hover{background-color:rgba(255,255,255,0.05)!important;}
        .card-hover:hover{border-color:rgba(46,134,193,0.25)!important;}
        .btn-sm:hover{opacity:.8;}
        input:focus,textarea:focus{outline:none;border-color:rgba(46,134,193,0.5)!important;}
        @media(max-width:768px){
          .layout{flex-direction:column!important;}
          .sidebar{width:100%!important;flex-direction:row!important;overflow-x:auto!important;padding:8px!important;}
          .nav-btn{white-space:nowrap!important;padding:8px 12px!important;}
          .content{padding:20px 16px!important;}
          .grid-3{grid-template-columns:1fr!important;}
          .grid-2{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* HEADER */}
      <header style={{height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',backgroundColor:'rgba(6,13,26,0.98)',borderBottom:'1px solid rgba(255,255,255,0.06)',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <span style={{fontSize:'16px',fontWeight:300,letterSpacing:'0.3em',color:'#FFFFFF'}}>Mel de Lua</span>
          <span style={{fontSize:'10px',letterSpacing:'0.35em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif',backgroundColor:'rgba(240,165,0,0.1)',padding:'3px 10px'}}>Admin</span>
        </div>
        <button onClick={async()=>{await supabase.auth.signOut();router.push('/admin/login')}}
          style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',fontFamily:'sans-serif',background:'none',border:'1px solid rgba(255,255,255,0.08)',padding:'6px 14px',cursor:'pointer',letterSpacing:'0.1em'}}>
          Sair
        </button>
      </header>

      <div className="layout" style={{display:'flex',minHeight:'calc(100vh - 60px)'}}>

        {/* SIDEBAR */}
        <aside className="sidebar" style={{width:'200px',flexShrink:0,borderRight:'1px solid rgba(255,255,255,0.06)',padding:'24px 12px',display:'flex',flexDirection:'column',gap:'2px'}}>
          {nav.map(item => (
            <button key={item.id} onClick={()=>setAba(item.id as Aba)} className="nav-btn"
              style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 12px',background:'none',border:'none',cursor:'pointer',textAlign:'left',width:'100%',backgroundColor:aba===item.id?'rgba(46,134,193,0.12)':'transparent',borderLeft:aba===item.id?'2px solid #2E86C1':'2px solid transparent',transition:'all 0.15s'}}>
              <span style={{fontSize:'14px'}}>{item.icon}</span>
              <span style={{fontSize:'12px',color:aba===item.id?'#FFFFFF':'rgba(255,255,255,0.45)',fontFamily:'sans-serif',flex:1}}>{item.label}</span>
              {item.count! > 0 && <span style={{fontSize:'10px',backgroundColor:aba===item.id?'#2E86C1':'rgba(255,255,255,0.08)',color:'#FFFFFF',padding:'1px 6px',borderRadius:'8px',fontFamily:'sans-serif'}}>{item.count}</span>}
            </button>
          ))}
        </aside>

        {/* CONTEÚDO */}
        <div className="content" style={{flex:1,padding:'32px 36px',overflowY:'auto'}}>

          {/* ——— OVERVIEW ——— */}
          {aba === 'overview' && (
            <div>
              <Titulo label="Dashboard" titulo="Visão geral"/>
              <div className="grid-3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'32px'}}>
                {[
                  {label:'Casais cadastrados',valor:casais.length,sub:`${casais.filter(c=>c.status==='briefing_completo').length} com briefing`,cor:'#2E86C1'},
                  {label:'Propostas enviadas',valor:propostas.length,sub:`${propostasAprovadas} aprovadas`,cor:'#F0A500'},
                  {label:'Agências ativas',valor:agencias.filter(a=>a.status==='ativo').length,sub:`${agencias.length} total`,cor:'#3DD68C'},
                  {label:'Receita confirmada',valor:`R$ ${receitaTotal.toLocaleString('pt-BR')}`,sub:'comissões pagas',cor:'#3DD68C'},
                  {label:'Receita pendente',valor:`R$ ${receitaPendente.toLocaleString('pt-BR')}`,sub:'aguardando pagamento',cor:'#F0A500'},
                  {label:'Ticket médio',valor: comissoes.length > 0 ? `R$ ${Math.round(comissoes.reduce((s,c)=>s+c.valor_viagem,0)/comissoes.length).toLocaleString('pt-BR')}` : '—',sub:'por viagem',cor:'#9A8FBC'},
                ].map(m => (
                  <div key={m.label} className="card-hover" style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'20px',transition:'border-color 0.2s'}}>
                    <div style={{fontSize:'10px',letterSpacing:'0.25em',color:'rgba(255,255,255,0.35)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'8px'}}>{m.label}</div>
                    <div style={{fontSize:'28px',fontWeight:300,color:m.cor,letterSpacing:'-0.02em',lineHeight:1}}>{m.valor}</div>
                    <div style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',marginTop:'6px'}}>{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Últimas atividades */}
              <div style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'24px'}}>
                <p style={{fontSize:'11px',letterSpacing:'0.3em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'16px'}}>Atividade recente</p>
                {[...casais.slice(0,3).map(c=>({tipo:'casal',texto:`${c.nome_parceiro_1} & ${c.nome_parceiro_2} se cadastraram`,data:c.criado_em})),
                  ...propostas.slice(0,3).map(p=>({tipo:'proposta',texto:`Proposta para ${p.destino} enviada por ${p.agencia?.nome_fantasia}`,data:p.criado_em})),
                ].sort((a,b)=>new Date(b.data).getTime()-new Date(a.data).getTime()).slice(0,6).map((item,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <span style={{fontSize:'16px'}}>{item.tipo==='casal'?'💑':'✈️'}</span>
                    <span style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',fontFamily:'sans-serif',flex:1}}>{item.texto}</span>
                    <span style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',fontFamily:'sans-serif'}}>{new Date(item.data).toLocaleDateString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ——— CASAIS ——— */}
          {aba === 'casais' && (
            <div>
              <Titulo label="Gestão" titulo="Casais"/>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {casais.length === 0 && <Vazio texto="Nenhum casal cadastrado ainda."/>}
                {casais.map(c => (
                  <div key={c.id} className="card-hover" style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px',transition:'border-color 0.2s'}}>
                    <div>
                      <div style={{fontSize:'15px',color:'#FFFFFF',fontWeight:400,marginBottom:'4px'}}>{c.nome_parceiro_1} & {c.nome_parceiro_2}</div>
                      <div style={{fontSize:'12px',color:'rgba(255,255,255,0.35)',fontFamily:'sans-serif'}}>{c.email} · {new Date(c.criado_em).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
                      <span style={{fontSize:'11px',color:statusCor[c.status]||'#FFFFFF',fontFamily:'sans-serif',letterSpacing:'0.1em'}}>● {c.status?.replace(/_/g,' ')}</span>
                      {briefings.find(b => b.casal_id === c.id)?.status === 'aguardando_revisao' && (
                        <button
                          onClick={() => aprovarBriefing(briefings.find(b => b.casal_id === c.id)!.id)}
                          className="btn-sm"
                          style={{fontSize:'11px',fontFamily:'sans-serif',border:'1px solid rgba(61,214,140,0.3)',color:'#3DD68C',backgroundColor:'rgba(61,214,140,0.06)',padding:'5px 14px',cursor:'pointer',letterSpacing:'0.08em'}}>
                          ✓ Liberar para agências
                        </button>
                      )}
                      {briefings.find(b => b.casal_id === c.id)?.status === 'aguardando_agencias' && (
                        <span style={{fontSize:'11px',color:'#3DD68C',fontFamily:'sans-serif'}}>✓ Liberado</span>
                      )}
                      {briefings.find(b => b.casal_id === c.id) && (
                        <button
                          onClick={() => {
                          setBriefingModal(briefings.find(b => b.casal_id === c.id)!)
                          setAbaModal('bruto')
                          // Carrega recomendações salvas se existirem
                          const bf = briefings.find(b => b.casal_id === c.id)
                          if (bf?.resumo_ia) {
                            try { setRecomendacoes(JSON.parse(bf.resumo_ia as string)) } catch { setRecomendacoes(null) }
                          } else { setRecomendacoes(null) }
                        }}
                          className="btn-sm"
                          style={{fontSize:'11px',fontFamily:'sans-serif',border:'1px solid rgba(240,165,0,0.3)',color:'#F0A500',backgroundColor:'rgba(240,165,0,0.06)',padding:'5px 14px',cursor:'pointer',letterSpacing:'0.08em'}}>
                          📋 Ver briefing
                        </button>
                      )}
                      <a href="/casal/painel" target="_blank" className="btn-sm" style={{fontSize:'11px',color:'rgba(46,134,193,0.7)',fontFamily:'sans-serif',textDecoration:'none',border:'1px solid rgba(46,134,193,0.2)',padding:'4px 12px',cursor:'pointer',transition:'opacity 0.2s'}}>
                        Ver painel
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ——— AGÊNCIAS ——— */}
          {aba === 'agencias' && (
            <div>
              <Titulo label="Gestão" titulo="Agências"/>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {agencias.length === 0 && <Vazio texto="Nenhuma agência cadastrada ainda."/>}
                {agencias.map(a => (
                  <div key={a.id} className="card-hover" style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'18px 22px',transition:'border-color 0.2s'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'12px'}}>
                      <div>
                        <div style={{fontSize:'15px',color:'#FFFFFF',fontWeight:400,marginBottom:'4px'}}>{a.nome_fantasia}</div>
                        <div style={{fontSize:'12px',color:'rgba(255,255,255,0.35)',fontFamily:'sans-serif',marginBottom:'8px'}}>{a.responsavel} · {a.email}</div>
                        <div style={{display:'flex',gap:'12px'}}>
                          <span style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif'}}>⭐ {a.nota_media?.toFixed(1) || '—'}</span>
                          <span style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif'}}>✈️ {a.total_viagens_fechadas} viagens</span>
                          <span style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif'}}>Desde {new Date(a.criado_em).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <span style={{fontSize:'11px',color:statusCor[a.status]||'#FFFFFF',fontFamily:'sans-serif',letterSpacing:'0.1em'}}>● {a.status}</span>
                        <button onClick={()=>toggleStatusAgencia(a.id, a.status)} className="btn-sm"
                          style={{fontSize:'11px',fontFamily:'sans-serif',border:`1px solid ${a.status==='ativo'?'rgba(255,107,107,0.3)':'rgba(61,214,140,0.3)'}`,color:a.status==='ativo'?'#ff8080':'#3DD68C',backgroundColor:'transparent',padding:'5px 14px',cursor:'pointer',transition:'opacity 0.2s'}}>
                          {a.status === 'ativo' ? 'Suspender' : 'Reativar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ——— PROPOSTAS ——— */}
          {aba === 'propostas' && (
            <div>
              <Titulo label="Gestão" titulo="Todas as propostas"/>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {propostas.length === 0 && <Vazio texto="Nenhuma proposta enviada ainda."/>}
                {propostas.map(p => (
                  <div key={p.id} className="card-hover" style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px',transition:'border-color 0.2s'}}>
                    <div>
                      <div style={{fontSize:'15px',color:'#FFFFFF',fontWeight:400,marginBottom:'4px'}}>{p.destino}</div>
                      <div style={{fontSize:'12px',color:'rgba(255,255,255,0.35)',fontFamily:'sans-serif'}}>
                        {p.agencia?.nome_fantasia} → {p.briefing?.casal?.nome_parceiro_1} & {p.briefing?.casal?.nome_parceiro_2} · R$ {p.valor_total?.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                      <span style={{fontSize:'11px',color:statusCor[p.status]||'#FFFFFF',fontFamily:'sans-serif',letterSpacing:'0.1em'}}>● {p.status?.replace(/_/g,' ')}</span>
                      <span style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',fontFamily:'sans-serif'}}>{new Date(p.criado_em).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ——— COMISSÕES ——— */}
          {aba === 'comissoes' && (
            <div>
              <Titulo label="Financeiro" titulo="Comissões"/>
              <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'28px'}}>
                <div style={{backgroundColor:'rgba(61,214,140,0.07)',border:'1px solid rgba(61,214,140,0.15)',padding:'18px'}}>
                  <div style={{fontSize:'10px',letterSpacing:'0.25em',color:'rgba(255,255,255,0.35)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'6px'}}>Receita confirmada</div>
                  <div style={{fontSize:'28px',fontWeight:300,color:'#3DD68C'}}>R$ {receitaTotal.toLocaleString('pt-BR')}</div>
                </div>
                <div style={{backgroundColor:'rgba(240,165,0,0.07)',border:'1px solid rgba(240,165,0,0.15)',padding:'18px'}}>
                  <div style={{fontSize:'10px',letterSpacing:'0.25em',color:'rgba(255,255,255,0.35)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'6px'}}>Pendente de recebimento</div>
                  <div style={{fontSize:'28px',fontWeight:300,color:'#F0A500'}}>R$ {receitaPendente.toLocaleString('pt-BR')}</div>
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {comissoes.length === 0 && <Vazio texto="Nenhuma comissão registrada ainda."/>}
                {comissoes.map(c => (
                  <div key={c.id} className="card-hover" style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px',transition:'border-color 0.2s'}}>
                    <div>
                      <div style={{fontSize:'14px',color:'#FFFFFF',marginBottom:'4px'}}>{c.proposta?.destino} · {c.proposta?.agencia?.nome_fantasia}</div>
                      <div style={{fontSize:'12px',color:'rgba(255,255,255,0.35)',fontFamily:'sans-serif'}}>
                        Viagem R$ {c.valor_viagem?.toLocaleString('pt-BR')} · {c.percentual}% · Comissão <strong style={{color:'rgba(255,255,255,0.6)'}}>R$ {c.valor_comissao?.toLocaleString('pt-BR')}</strong>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <span style={{fontSize:'11px',color:statusCor[c.status]||'#FFFFFF',fontFamily:'sans-serif',letterSpacing:'0.1em'}}>● {c.status}</span>
                      {c.status === 'pendente' && (
                        <button onClick={()=>atualizarStatusComissao(c.id,'pago')} className="btn-sm"
                          style={{fontSize:'11px',fontFamily:'sans-serif',border:'1px solid rgba(61,214,140,0.3)',color:'#3DD68C',backgroundColor:'transparent',padding:'5px 14px',cursor:'pointer',transition:'opacity 0.2s'}}>
                          Marcar pago
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ——— CADASTRAR AGÊNCIA ——— */}
          {aba === 'cadastrar' && (
            <div>
              <Titulo label="Agências" titulo="Cadastrar nova agência"/>
              <div style={{maxWidth:'520px'}}>
                <form onSubmit={handleCadastrarAgencia} style={{display:'flex',flexDirection:'column',gap:'20px'}}>
                  {[
                    {label:'Nome fantasia', key:'nome_fantasia', placeholder:'Ex: Roteiros do Mundo'},
                    {label:'Responsável', key:'responsavel', placeholder:'Nome completo'},
                    {label:'E-mail', key:'email', placeholder:'agencia@exemplo.com'},
                    {label:'Telefone', key:'telefone', placeholder:'(11) 99999-9999'},
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{display:'block',fontSize:'11px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'7px'}}>{f.label}</label>
                      <input
                        type={f.key==='email'?'email':'text'}
                        value={novaAgencia[f.key as keyof typeof novaAgencia]}
                        onChange={e=>setNovaAgencia({...novaAgencia,[f.key]:e.target.value})}
                        required={f.key!=='telefone'}
                        placeholder={f.placeholder}
                        style={{width:'100%',padding:'12px 14px',backgroundColor:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#FFFFFF',fontSize:'14px',fontFamily:'sans-serif',boxSizing:'border-box',transition:'border-color 0.2s'}}
                      />
                    </div>
                  ))}

                  {msgAgencia && (
                    <div style={{padding:'11px 14px',backgroundColor:msgAgencia.includes('sucesso')?'rgba(61,214,140,0.1)':'rgba(220,60,60,0.1)',border:`1px solid ${msgAgencia.includes('sucesso')?'rgba(61,214,140,0.3)':'rgba(220,60,60,0.3)'}`,fontSize:'13px',color:msgAgencia.includes('sucesso')?'#3DD68C':'#ff8080',fontFamily:'sans-serif'}}>
                      {msgAgencia}
                    </div>
                  )}

                  <button type="submit" disabled={salvandoAgencia}
                    style={{backgroundColor:'#2E86C1',color:'#FFFFFF',padding:'13px',fontSize:'11px',letterSpacing:'0.2em',border:'none',textTransform:'uppercase',fontFamily:'sans-serif',cursor:salvandoAgencia?'wait':'pointer',transition:'background-color 0.2s',maxWidth:'240px'}}>
                    {salvandoAgencia ? 'Cadastrando...' : 'Cadastrar agência'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    {/* MODAL BRIEFING */}
      {briefingModal && (
        <div style={{position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:'24px'}}
          onClick={() => setBriefingModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{backgroundColor:'#0A1628',border:'1px solid rgba(255,255,255,0.1)',maxWidth:'680px',width:'100%',maxHeight:'85vh',display:'flex',flexDirection:'column',position:'relative'}}>

            {/* Header do modal */}
            <div style={{padding:'24px 28px 0',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
              <button onClick={() => setBriefingModal(null)} style={{position:'absolute',top:'16px',right:'16px',background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:'20px',cursor:'pointer'}}>✕</button>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
                <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
                <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Briefing do casal</span>
              </div>
              {/* Abas */}
              <div style={{display:'flex',gap:'0'}}>
                {(['bruto', 'recomendacoes'] as const).map(tab => (
                  <button key={tab} onClick={() => setAbaModal(tab)}
                    style={{padding:'10px 20px',background:'none',border:'none',cursor:'pointer',fontSize:'12px',fontFamily:'sans-serif',letterSpacing:'0.1em',
                      color: abaModal === tab ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
                      borderBottom: abaModal === tab ? '2px solid #2E86C1' : '2px solid transparent',
                      transition:'all 0.15s'}}>
                    {tab === 'bruto' ? '📋 Respostas brutas' : `✨ Recomendações IA${recomendacoes ? ' ✓' : ''}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Conteúdo scrollável */}
            <div style={{overflowY:'auto',flex:1,padding:'24px 28px'}}>

              {/* ABA BRUTA */}
              {abaModal === 'bruto' && (
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                  {Object.entries(briefingModal.respostas || {}).map(([key, value]) => {
                    if (!value || key === 'conversa_parcial') return null
                    const labels: Record<string, string> = {
                      nome_parceiro_1: 'Parceiro 1', nome_parceiro_2: 'Parceiro 2',
                      email: 'E-mail', historia: 'História', personalidade: 'Personalidade',
                      destinos_visitados: 'Destinos visitados', aceita_repetir_destino: 'Aceita repetir destino',
                      preferencia_tipo: 'Preferência de destino', ritmo_viagem: 'Ritmo de viagem',
                      atividades_juntos: 'Atividades juntos', gastronomia: 'Gastronomia',
                      restricao_alimentar: 'Restrição alimentar', clima_preferido: 'Clima preferido',
                      orcamento: 'Orçamento', data_casamento: 'Data do casamento',
                      duracao_dias: 'Duração (dias)', tipo_festa: 'Tipo de festa',
                      local_casamento: 'Local do casamento',
                    }
                    return (
                      <div key={key} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',paddingBottom:'10px'}}>
                        <div style={{fontSize:'10px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'4px'}}>{labels[key] || key}</div>
                        <div style={{fontSize:'14px',color:'rgba(255,255,255,0.8)',fontFamily:'sans-serif',lineHeight:1.7}}>{String(value)}</div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ABA RECOMENDAÇÕES */}
              {abaModal === 'recomendacoes' && (
                <div>
                  {!recomendacoes ? (
                    <div style={{textAlign:'center',padding:'48px 20px'}}>
                      <div style={{fontSize:'32px',marginBottom:'16px'}}>✨</div>
                      <p style={{color:'rgba(255,255,255,0.5)',fontFamily:'sans-serif',fontSize:'14px',lineHeight:1.8,marginBottom:'24px'}}>
                        O motor de IA vai analisar o perfil do casal e gerar 2 destinos surpreendentes com justificativa completa.
                      </p>
                      <button onClick={() => gerarRecomendacoes(briefingModal)} disabled={gerandoRec}
                        style={{backgroundColor:'#2E86C1',color:'#FFFFFF',padding:'13px 36px',fontSize:'12px',letterSpacing:'0.2em',border:'none',fontFamily:'sans-serif',cursor:gerandoRec?'wait':'pointer',opacity:gerandoRec?0.7:1}}>
                        {gerandoRec ? '⏳ Gerando recomendações...' : '✨ Gerar recomendações'}
                      </button>
                      {gerandoRec && <p style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',marginTop:'12px'}}>Pode levar alguns segundos...</p>}
                    </div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:'24px'}}>
                      {/* Resumo do casal */}
                      {(recomendacoes as Record<string,unknown>).resumo_casal && (
                        <div style={{backgroundColor:'rgba(46,134,193,0.08)',border:'1px solid rgba(46,134,193,0.2)',padding:'18px'}}>
                          <div style={{fontSize:'10px',letterSpacing:'0.3em',color:'#2E86C1',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'8px'}}>Perfil do casal (para as agências)</div>
                          <p style={{fontSize:'14px',color:'rgba(255,255,255,0.75)',fontFamily:'sans-serif',lineHeight:1.85,margin:0}}>{String((recomendacoes as Record<string,unknown>).resumo_casal)}</p>
                        </div>
                      )}

                      {/* Destino 1 */}
                      {([1,2] as const).map(n => {
                        const rec = (recomendacoes as Record<string,unknown>)[`recomendacao_${n}`] as Record<string,unknown>
                        if (!rec) return null
                        return (
                          <div key={n} style={{border:'1px solid rgba(240,165,0,0.2)',padding:'20px',position:'relative'}}>
                            <div style={{position:'absolute',top:'-10px',left:'16px',backgroundColor:'#0A1628',padding:'2px 10px'}}>
                              <span style={{fontSize:'10px',letterSpacing:'0.3em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Destino {n}</span>
                            </div>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'8px',marginBottom:'12px'}}>
                              <div>
                                <h3 style={{fontSize:'22px',fontWeight:400,color:'#FFFFFF',margin:'0 0 4px',letterSpacing:'-0.01em'}}>{String(rec.destino)}</h3>
                                <p style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',margin:0}}>{String(rec.pais)}</p>
                              </div>
                              <span style={{fontSize:'11px',color:'rgba(240,165,0,0.8)',fontFamily:'sans-serif',backgroundColor:'rgba(240,165,0,0.08)',padding:'4px 10px',border:'1px solid rgba(240,165,0,0.2)'}}>{String(rec.nivel_exclusividade)}</span>
                            </div>
                            <p style={{fontSize:'15px',fontStyle:'italic',color:'rgba(255,255,255,0.6)',marginBottom:'12px',lineHeight:1.6}}>"{String(rec.titulo)}"</p>
                            <p style={{fontSize:'13px',color:'rgba(255,255,255,0.65)',fontFamily:'sans-serif',lineHeight:1.8,marginBottom:'14px'}}>{String(rec.justificativa)}</p>
                            <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'10px'}}>
                              <span style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',backgroundColor:'rgba(255,255,255,0.05)',padding:'3px 10px'}}>🗓 {String(rec.melhor_epoca)}</span>
                              <span style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',backgroundColor:'rgba(255,255,255,0.05)',padding:'3px 10px'}}>✈️ {String(rec.perfil_viagem)}</span>
                            </div>
                            {Array.isArray(rec.experiencias) && (
                              <div>
                                <div style={{fontSize:'10px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.25)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'6px'}}>Experiências</div>
                                {(rec.experiencias as string[]).map((exp, i) => (
                                  <div key={i} style={{display:'flex',gap:'8px',marginBottom:'4px'}}>
                                    <span style={{color:'#F0A500',fontSize:'12px',flexShrink:0}}>→</span>
                                    <span style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',fontFamily:'sans-serif',lineHeight:1.6}}>{exp}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {/* Botão regenerar */}
                      <button onClick={() => gerarRecomendacoes(briefingModal)} disabled={gerandoRec}
                        style={{background:'none',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.35)',padding:'9px 20px',fontSize:'11px',letterSpacing:'0.15em',fontFamily:'sans-serif',cursor:'pointer',alignSelf:'flex-start'}}>
                        {gerandoRec ? '⏳ Gerando...' : '↺ Gerar novamente'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer com ações */}
            <div style={{padding:'16px 28px',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:'12px',flexShrink:0,flexWrap:'wrap'}}>
              {briefingModal.status === 'aguardando_revisao' && (
                <button
                  onClick={() => { aprovarBriefing(briefingModal.id); setBriefingModal(null) }}
                  disabled={!recomendacoes}
                  title={!recomendacoes ? 'Gere as recomendações antes de liberar' : ''}
                  style={{backgroundColor: recomendacoes ? 'rgba(61,214,140,0.1)' : 'rgba(255,255,255,0.03)',border:`1px solid ${recomendacoes ? 'rgba(61,214,140,0.3)' : 'rgba(255,255,255,0.1)'}`,color: recomendacoes ? '#3DD68C' : 'rgba(255,255,255,0.2)',padding:'10px 24px',fontSize:'12px',letterSpacing:'0.15em',fontFamily:'sans-serif',cursor: recomendacoes ? 'pointer' : 'not-allowed',textTransform:'uppercase'}}>
                  ✓ Liberar para agências
                </button>
              )}
              <button onClick={() => setBriefingModal(null)}
                style={{background:'none',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.4)',padding:'10px 24px',fontSize:'12px',letterSpacing:'0.15em',fontFamily:'sans-serif',cursor:'pointer',textTransform:'uppercase'}}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function Titulo({ label, titulo }: { label: string; titulo: string }) {
  return (
    <div style={{marginBottom:'24px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
        <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
        <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>{label}</span>
      </div>
      <h2 style={{fontSize:'26px',fontWeight:400,color:'#FFFFFF',margin:0,letterSpacing:'-0.01em'}}>{titulo}</h2>
    </div>
  )
}

function Vazio({ texto }: { texto: string }) {
  return <div style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.25)',fontFamily:'sans-serif',fontSize:'14px'}}>{texto}</div>
}
