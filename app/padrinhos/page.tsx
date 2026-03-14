'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useSearchParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type DadosPortal = {
  padrinho: { id: string; nome: string; aprovado: boolean | null; comentarios: string }
  casal: { nome_parceiro_1: string; nome_parceiro_2: string }
  historia: string
  proposta: {
    destino: string
    duracao_dias: number
    valor_total: number
    tipo_experiencia: string[]
    roteiro_completo: { texto: string }
    teaser_ia: string
    agencia: { nome_fantasia: string }
  } | null
}

function PortalContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [dados, setDados] = useState<DadosPortal | null>(null)
  const [fase, setFase] = useState<'carregando' | 'invalido' | 'entrada' | 'portal' | 'aprovado'>('carregando')
  const [comentario, setComentario] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (token) carregarPorToken()
    else setFase('invalido')
  }, [token])

  const carregarPorToken = async () => {
    const { data: padrinho } = await supabase
      .from('padrinhos')
      .select('id, nome, aprovado, comentarios, casal_id')
      .eq('token_acesso', token)
      .single()

    if (!padrinho) { setFase('invalido'); return }

    const { data: casal } = await supabase
      .from('casais')
      .select('nome_parceiro_1, nome_parceiro_2, id')
      .eq('id', padrinho.casal_id)
      .single()

    const { data: briefing } = await supabase
      .from('briefings')
      .select('respostas, id')
      .eq('casal_id', padrinho.casal_id)
      .single()

    // Busca proposta aprovada ou aguardando casal
    const { data: proposta } = await supabase
      .from('propostas')
      .select('destino, duracao_dias, valor_total, tipo_experiencia, roteiro_completo, teaser_ia, agencia:agencia_id(nome_fantasia)')
      .eq('briefing_id', briefing?.id)
      .in('status', ['aguardando_casal', 'aprovada'])
      .order('criado_em', { ascending: false })
      .limit(1)
      .single()

    setDados({
      padrinho: { id: padrinho.id, nome: padrinho.nome, aprovado: padrinho.aprovado, comentarios: padrinho.comentarios || '' },
      casal: casal!,
      historia: briefing?.respostas?.historia || '',
      proposta: proposta as unknown as DadosPortal['proposta'] || null,
    })

    if (padrinho.aprovado === true) {
      setComentario(padrinho.comentarios || '')
      setFase('aprovado')
    } else {
      setFase('entrada')
    }
  }

  const handleAprovar = async () => {
    if (!dados) return
    setSalvando(true)

    await supabase.from('padrinhos')
      .update({ aprovado: true, comentarios: comentario })
      .eq('id', dados.padrinho.id)

    setDados(d => d ? { ...d, padrinho: { ...d.padrinho, aprovado: true, comentarios: comentario } } : d)
    setSalvando(false)
    setFase('aprovado')
  }

  const handleCompartilhar = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: `Lua de mel de ${dados?.casal.nome_parceiro_1} & ${dados?.casal.nome_parceiro_2}`,
        text: '🤫 Estou guardando um segredo incrível...',
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  // ——— ESTADOS VISUAIS ———

  if (fase === 'carregando') return (
    <main style={estiloMain}>
      <div style={{color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',fontSize:'14px',textAlign:'center'}}>
        <div style={{fontSize:'32px',marginBottom:'16px'}}>🤫</div>
        Carregando seu convite especial...
      </div>
    </main>
  )

  if (fase === 'invalido') return (
    <main style={estiloMain}>
      <div style={{textAlign:'center',maxWidth:'400px'}}>
        <div style={{fontSize:'48px',marginBottom:'20px'}}>🔒</div>
        <h2 style={{fontSize:'24px',fontWeight:400,color:'#FFFFFF',marginBottom:'12px',fontFamily:"Georgia, serif"}}>Link inválido</h2>
        <p style={{fontSize:'14px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',lineHeight:1.8}}>
          Este link não é válido ou já expirou. Se você recebeu um convite, verifique o e-mail original.
        </p>
      </div>
    </main>
  )

  if (!dados) return null

  const { casal, historia, proposta, padrinho } = dados
  const nomesCasal = `${casal.nome_parceiro_1} & ${casal.nome_parceiro_2}`

  // ——— TELA DE ENTRADA ———
  if (fase === 'entrada') return (
    <main style={{...estiloMain, justifyContent:'flex-start', paddingTop:'0', overflow:'auto'}}>
      <style>{estilosCSS}</style>
      <Aurora/>

      {/* Hero de entrada */}
      <div style={{
        width:'100%', backgroundColor:'#060d1a',
        minHeight:'100vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        textAlign:'center', padding:'80px 32px',
        position:'relative', zIndex:10,
      }}>
        <div style={{fontSize:'48px',marginBottom:'28px'}}>🤫</div>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
          <div style={{width:'24px',height:'1px',backgroundColor:'#F0A500'}}/>
          <span style={{fontSize:'10px',letterSpacing:'0.45em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Convite especial</span>
          <div style={{width:'24px',height:'1px',backgroundColor:'#F0A500'}}/>
        </div>
        <h1 style={{fontSize:'clamp(28px,5vw,52px)',fontWeight:400,color:'#FFFFFF',lineHeight:1.15,marginBottom:'16px',letterSpacing:'-0.02em',maxWidth:'600px'}}>
          {padrinho.nome}, você foi escolhido para guardar um segredo
        </h1>
        <div style={{width:'40px',height:'2px',backgroundColor:'#F0A500',margin:'0 auto 20px'}}/>
        <p style={{fontSize:'17px',color:'rgba(255,255,255,0.5)',fontFamily:'sans-serif',fontWeight:300,lineHeight:1.85,maxWidth:'480px',marginBottom:'40px'}}>
          <strong style={{color:'rgba(255,255,255,0.8)'}}>{nomesCasal}</strong> escolheram você como alguém de confiança para conhecer o destino da lua de mel deles — antes de todo mundo.
        </p>
        <button onClick={() => setFase('portal')} style={estiloBtn}>
          Aceitar o convite ✨
        </button>
        <p style={{fontSize:'11px',color:'rgba(255,255,255,0.2)',marginTop:'16px',fontFamily:'sans-serif',letterSpacing:'0.08em'}}>
          O segredo fica entre vocês até o reveal
        </p>
      </div>
    </main>
  )

  // ——— PORTAL PRINCIPAL ———
  if (fase === 'portal') return (
    <main style={{...estiloMain, justifyContent:'flex-start', overflow:'auto', paddingTop:'0'}}>
      <style>{estilosCSS}</style>
      <Aurora/>

      <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:'720px',margin:'0 auto',padding:'60px 24px 80px'}}>

        {/* Cabeçalho */}
        <div style={{textAlign:'center',marginBottom:'48px'}}>
          <div style={{fontSize:'36px',marginBottom:'16px'}}>🤫</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'16px'}}>
            <div style={{width:'24px',height:'1px',backgroundColor:'#F0A500'}}/>
            <span style={{fontSize:'10px',letterSpacing:'0.45em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Você é guardião deste segredo</span>
            <div style={{width:'24px',height:'1px',backgroundColor:'#F0A500'}}/>
          </div>
          <h2 style={{fontSize:'clamp(24px,4vw,40px)',fontWeight:400,color:'#FFFFFF',margin:'0 0 8px',letterSpacing:'-0.02em'}}>
            A lua de mel de {nomesCasal}
          </h2>
          <p style={{fontSize:'14px',color:'rgba(255,255,255,0.35)',fontFamily:'sans-serif',margin:0}}>
            Apenas você e os outros padrinhos sabem o que vem a seguir
          </p>
        </div>

        {/* O DESTINO — destaque máximo */}
        {proposta && (
          <div style={{
            backgroundColor:'rgba(240,165,0,0.07)',
            border:'2px solid rgba(240,165,0,0.3)',
            padding:'36px 32px', textAlign:'center', marginBottom:'32px',
            position:'relative',
          }}>
            <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%) translateY(-50%)',backgroundColor:'#060d1a',padding:'4px 16px'}}>
              <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>O segredo</span>
            </div>
            <p style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',letterSpacing:'0.2em',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'12px'}}>O destino escolhido</p>
            <h3 style={{fontSize:'clamp(36px,8vw,72px)',fontWeight:400,color:'#FFFFFF',margin:'0 0 16px',letterSpacing:'-0.03em'}}>
              {proposta.destino}
            </h3>
            <div style={{display:'flex',justifyContent:'center',gap:'12px',flexWrap:'wrap',marginBottom:'16px'}}>
              <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',backgroundColor:'rgba(255,255,255,0.06)',padding:'5px 14px',fontFamily:'sans-serif'}}>
                📅 {proposta.duracao_dias} dias
              </span>
              <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',backgroundColor:'rgba(255,255,255,0.06)',padding:'5px 14px',fontFamily:'sans-serif'}}>
                ✈️ {proposta.agencia?.nome_fantasia}
              </span>
              <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',backgroundColor:'rgba(255,255,255,0.06)',padding:'5px 14px',fontFamily:'sans-serif'}}>
                💰 R$ {proposta.valor_total?.toLocaleString('pt-BR')}
              </span>
            </div>
            {proposta.teaser_ia && (
              <p style={{fontSize:'14px',fontStyle:'italic',color:'rgba(255,255,255,0.55)',lineHeight:1.8,margin:'0',maxWidth:'480px',marginLeft:'auto',marginRight:'auto'}}>
                "{proposta.teaser_ia}"
              </p>
            )}
          </div>
        )}

        {/* HISTÓRIA DO CASAL */}
        {historia && (
          <div style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'28px',marginBottom:'24px'}}>
            <p style={{fontSize:'11px',letterSpacing:'0.3em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'14px'}}>A história deles</p>
            <p style={{fontSize:'15px',color:'rgba(255,255,255,0.65)',fontStyle:'italic',lineHeight:1.9,margin:0}}>
              "{historia}"
            </p>
          </div>
        )}

        {/* ROTEIRO */}
        {proposta?.roteiro_completo?.texto && (
          <div style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'28px',marginBottom:'24px'}}>
            <p style={{fontSize:'11px',letterSpacing:'0.3em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'14px'}}>Roteiro da viagem</p>
            <p style={{fontSize:'14px',color:'rgba(255,255,255,0.6)',fontFamily:'sans-serif',fontWeight:300,lineHeight:1.9,margin:0,whiteSpace:'pre-line'}}>
              {proposta.roteiro_completo.texto}
            </p>
          </div>
        )}

        {/* COMENTÁRIO */}
        <div style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'28px',marginBottom:'28px'}}>
          <p style={{fontSize:'11px',letterSpacing:'0.3em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'8px'}}>
            Deixe uma mensagem sobre o casal
          </p>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.35)',fontFamily:'sans-serif',marginBottom:'16px',lineHeight:1.7}}>
            Compartilhe algo especial sobre {nomesCasal} — seu comentário será exibido para eles no painel.
          </p>
          <textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            rows={4}
            placeholder={`O que você sabe sobre ${casal.nome_parceiro_1} e ${casal.nome_parceiro_2} que faz esse destino ser perfeito para eles?`}
            style={{
              width:'100%',padding:'13px 16px',
              backgroundColor:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.1)',
              color:'#FFFFFF',fontSize:'14px',fontFamily:'sans-serif',
              boxSizing:'border-box',resize:'vertical',lineHeight:1.7,
            }}
          />
        </div>

        {/* COMPARTILHAR */}
        <div style={{backgroundColor:'rgba(46,134,193,0.06)',border:'1px solid rgba(46,134,193,0.15)',padding:'20px 24px',marginBottom:'28px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px'}}>
          <div>
            <p style={{fontSize:'13px',color:'rgba(255,255,255,0.7)',fontFamily:'sans-serif',margin:'0 0 4px'}}>Compartilhar este portal</p>
            <p style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',margin:0}}>Envie para outros padrinhos que também guardam o segredo</p>
          </div>
          <button onClick={handleCompartilhar} style={{
            padding:'10px 24px',backgroundColor:'rgba(46,134,193,0.2)',
            border:'1px solid rgba(46,134,193,0.4)',color:'#FFFFFF',
            fontSize:'12px',letterSpacing:'0.15em',fontFamily:'sans-serif',
            cursor:'pointer',textTransform:'uppercase',transition:'all 0.2s',
          }}>
            {copiado ? '✓ Link copiado!' : '🔗 Compartilhar'}
          </button>
        </div>

        {/* BOTÃO APROVAR */}
        <div style={{textAlign:'center'}}>
          <button
            onClick={handleAprovar}
            disabled={salvando}
            style={{...estiloBtn, width:'100%', maxWidth:'400px', opacity: salvando ? 0.6 : 1}}>
            {salvando ? 'Salvando...' : '✅ Aprovar a lua de mel deles'}
          </button>
          <p style={{fontSize:'11px',color:'rgba(255,255,255,0.2)',marginTop:'12px',fontFamily:'sans-serif'}}>
            Sua aprovação libera o reveal para o casal
          </p>
        </div>

      </div>
    </main>
  )

  // ——— JÁ APROVADO ———
  return (
    <main style={estiloMain}>
      <style>{estilosCSS}</style>
      <Aurora/>
      <div style={{position:'relative',zIndex:10,textAlign:'center',maxWidth:'520px',padding:'0 24px'}}>
        <div style={{fontSize:'56px',marginBottom:'24px'}}>🎉</div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'16px'}}>
          <div style={{width:'24px',height:'1px',backgroundColor:'#F0A500'}}/>
          <span style={{fontSize:'10px',letterSpacing:'0.45em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Segredo guardado</span>
          <div style={{width:'24px',height:'1px',backgroundColor:'#F0A500'}}/>
        </div>
        <h2 style={{fontSize:'clamp(24px,4vw,40px)',fontWeight:400,color:'#FFFFFF',marginBottom:'16px',letterSpacing:'-0.02em'}}>
          Você já aprovou!
        </h2>
        <p style={{fontSize:'15px',color:'rgba(255,255,255,0.5)',fontFamily:'sans-serif',lineHeight:1.85,marginBottom:'12px'}}>
          Você está guardando o segredo da lua de mel de
        </p>
        <p style={{fontSize:'24px',fontWeight:400,color:'#FFFFFF',marginBottom:'8px',letterSpacing:'-0.01em'}}>
          {nomesCasal}
        </p>
        {proposta && (
          <p style={{fontSize:'28px',color:'#F0A500',marginBottom:'28px',letterSpacing:'-0.01em'}}>
            → {proposta.destino} ✈️
          </p>
        )}
        {comentario && (
          <div style={{backgroundColor:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',padding:'20px',marginBottom:'28px',textAlign:'left'}}>
            <p style={{fontSize:'11px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'8px'}}>Seu comentário</p>
            <p style={{fontSize:'14px',fontStyle:'italic',color:'rgba(255,255,255,0.6)',lineHeight:1.8,margin:0}}>"{comentario}"</p>
          </div>
        )}
        <button onClick={handleCompartilhar} style={{...estiloBtn, backgroundColor:'transparent', border:'1px solid rgba(46,134,193,0.4)', color:'rgba(255,255,255,0.7)'}}>
          {copiado ? '✓ Link copiado!' : '🔗 Compartilhar com outros padrinhos'}
        </button>
      </div>
    </main>
  )
}

// ——— COMPONENTES E ESTILOS AUXILIARES ———

function Aurora() {
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}>
      <div style={{position:'absolute',top:'-30%',left:'-20%',width:'80vw',height:'80vh',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(46,134,193,0.35) 0%,transparent 70%)',animation:'aurora1 14s ease-in-out infinite',filter:'blur(80px)'}}/>
      <div style={{position:'absolute',bottom:'-20%',right:'-15%',width:'70vw',height:'70vh',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(0,160,140,0.25) 0%,transparent 70%)',animation:'aurora2 18s ease-in-out infinite',filter:'blur(90px)'}}/>
    </div>
  )
}

const estiloMain: React.CSSProperties = {
  backgroundColor:'#060d1a', minHeight:'100vh',
  display:'flex', flexDirection:'column',
  alignItems:'center', justifyContent:'center',
  fontFamily:"'Georgia', serif", position:'relative',
  overflow:'hidden', padding:'24px',
}

const estiloBtn: React.CSSProperties = {
  backgroundColor:'#2E86C1', color:'#FFFFFF',
  padding:'16px 48px', fontSize:'12px',
  letterSpacing:'0.2em', border:'none',
  textTransform:'uppercase', fontFamily:'sans-serif',
  cursor:'pointer', display:'inline-block',
  transition:'background-color 0.2s',
}

const estilosCSS = `
  @keyframes aurora1 { 0%{transform:translateX(-20%) scale(1);opacity:.25} 50%{transform:translateX(10%) scale(1.1);opacity:.4} 100%{transform:translateX(-20%) scale(1);opacity:.25} }
  @keyframes aurora2 { 0%{transform:translateX(20%) scale(1.1);opacity:.2} 50%{transform:translateX(-10%) scale(.9);opacity:.35} 100%{transform:translateX(20%) scale(1.1);opacity:.2} }
  textarea:focus { outline:none; border-color:rgba(46,134,193,0.5)!important; }
  @media(max-width:768px) { .portal-inner { padding: 40px 16px 60px!important; } }
`

export default function PadrinhoPage() {
  return (
    <Suspense fallback={<div style={{backgroundColor:'#060d1a',minHeight:'100vh'}}/>}>
      <PortalContent/>
    </Suspense>
  )
}
