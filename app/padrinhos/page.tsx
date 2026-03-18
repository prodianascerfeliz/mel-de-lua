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
    destino: string; duracao_dias: number; valor_total: number
    tipo_experiencia: string[]; roteiro_completo: { texto: string }
    teaser_ia: string; agencia: { nome_fantasia: string }
  } | null
}

function PortalContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [dados, setDados] = useState<DadosPortal | null>(null)
  const [fase, setFase] = useState<'carregando' | 'invalido' | 'aceite' | 'portal' | 'aprovado'>('carregando')
  const [assinatura, setAssinatura] = useState('')
  const [assinaturaConfirmada, setAssinaturaConfirmada] = useState(false)
  const [checkboxes, setCheckboxes] = useState({ sigilo: false, responsabilidade: false, combinado: false, naoCompartilhar: false })
  const [comentario, setComentario] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => { if (token) carregarPorToken(); else setFase('invalido') }, [token])

  const carregarPorToken = async () => {
    const { data: padrinho } = await supabase
      .from('padrinhos').select('id, nome, aprovado, comentarios, casal_id')
      .eq('token_acesso', token).single()

    if (!padrinho) { setFase('invalido'); return }

    const { data: casal } = await supabase
      .from('casais').select('nome_parceiro_1, nome_parceiro_2, id').eq('id', padrinho.casal_id).single()

    const { data: briefing } = await supabase
      .from('briefings').select('respostas, id').eq('casal_id', padrinho.casal_id).single()

    const { data: proposta } = await supabase
      .from('propostas')
      .select('destino, duracao_dias, valor_total, tipo_experiencia, roteiro_completo, teaser_ia, agencia:agencia_id(nome_fantasia)')
      .eq('briefing_id', briefing?.id)
      .in('status', ['aguardando_casal', 'aprovada'])
      .order('criado_em', { ascending: false })
      .limit(1).single()

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
      setFase('aceite') // Começa pelo aceite de responsabilidade
    }
  }

  const todosCheckboxes = Object.values(checkboxes).every(Boolean)
  const nomeCorreto = assinatura.trim().toLowerCase() === dados?.padrinho.nome.toLowerCase()

  const handleConfirmarAceite = async () => {
    if (!todosCheckboxes || !nomeCorreto || !dados) return
    setAssinaturaConfirmada(true)

    // Salvar assinatura digital no banco
    await supabase.from('padrinhos').update({
      comentarios: `[ACEITE_DIGITAL: ${assinatura} - ${new Date().toISOString()}]`
    }).eq('id', dados.padrinho.id)

    setFase('portal')
  }

  const handleAprovar = async () => {
    if (!dados) return
    setSalvando(true)
    await supabase.from('padrinhos')
      .update({ aprovado: true, comentarios: comentario })
      .eq('id', dados.padrinho.id)
    setFase('aprovado')
    setSalvando(false)
  }

  const handleCompartilhar = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: 'Portal do Padrinho — Mel de Lua', url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  if (fase === 'carregando') return (
    <main style={estiloMain}><div style={{color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif'}}>🤫 Preparando seu convite...</div></main>
  )

  if (fase === 'invalido') return (
    <main style={estiloMain}>
      <div style={{textAlign:'center',maxWidth:'400px',padding:'0 24px'}}>
        <div style={{fontSize:'48px',marginBottom:'20px'}}>🔒</div>
        <h2 style={{fontSize:'24px',fontWeight:400,color:'#FFFFFF',marginBottom:'12px',fontFamily:"Georgia,serif"}}>Link inválido</h2>
        <p style={{fontSize:'14px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',lineHeight:1.8}}>Este link não é válido ou já expirou. Verifique o e-mail original.</p>
      </div>
    </main>
  )

  if (!dados) return null
  const { casal, historia, proposta, padrinho } = dados
  const nomesCasal = `${casal.nome_parceiro_1} & ${casal.nome_parceiro_2}`

  // ——— TELA DE ACEITE DE RESPONSABILIDADE ———
  if (fase === 'aceite') return (
    <main style={{...estiloMain, justifyContent:'flex-start', overflow:'auto', paddingTop:'0'}}>
      <style>{estilosCSS}</style>
      <Aurora/>
      <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:'620px',margin:'0 auto',padding:'60px 24px 80px'}}>

        <div style={{textAlign:'center',marginBottom:'40px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🤫</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'16px'}}>
            <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
            <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Convite especial</span>
            <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
          </div>
          <h1 style={{fontSize:'clamp(24px,4vw,36px)',fontWeight:400,color:'#FFFFFF',margin:'0 0 12px',letterSpacing:'-0.02em'}}>
            {padrinho.nome}, você foi escolhido
          </h1>
          <p style={{fontSize:'15px',color:'rgba(255,255,255,0.5)',fontFamily:'sans-serif',lineHeight:1.85,margin:0}}>
            <strong style={{color:'rgba(255,255,255,0.8)'}}>{nomesCasal}</strong> escolheram você para guardar um segredo muito especial e ser guardião(ã) da lua de mel deles.
          </p>
        </div>

        {/* Termo de responsabilidade */}
        <div style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',padding:'28px',marginBottom:'24px'}}>
          <p style={{fontSize:'11px',letterSpacing:'0.3em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'16px'}}>Termo de responsabilidade</p>
          <p style={{fontSize:'14px',color:'rgba(255,255,255,0.6)',fontFamily:'sans-serif',lineHeight:1.9,marginBottom:'20px'}}>
            Ao aceitar este convite, você assume o papel de <strong style={{color:'rgba(255,255,255,0.85)'}}>Guardião(ã) da Lua de Mel</strong> de {nomesCasal}. Isso significa que você:
          </p>

          {[
            { key: 'sigilo', label: `Manterá total sigilo sobre o destino da viagem até o momento do reveal com o casal` },
            { key: 'responsabilidade', label: `Será co-responsável pela aprovação da proposta escolhida, confirmando que ela combina com o perfil do casal` },
            { key: 'combinado', label: `Garante, com base no conhecimento que tem do casal, que o destino faz sentido para ${casal.nome_parceiro_1} e ${casal.nome_parceiro_2}` },
            { key: 'naoCompartilhar', label: `Não compartilhará nenhuma informação sobre o destino ou a proposta com o casal antes do reveal` },
          ].map(item => (
            <label key={item.key} style={{display:'flex',gap:'12px',alignItems:'flex-start',marginBottom:'14px',cursor:'pointer'}}>
              <div onClick={() => setCheckboxes({...checkboxes, [item.key]: !checkboxes[item.key as keyof typeof checkboxes]})}
                style={{width:'20px',height:'20px',border:`2px solid ${checkboxes[item.key as keyof typeof checkboxes] ? '#2E86C1' : 'rgba(255,255,255,0.2)'}`,backgroundColor:checkboxes[item.key as keyof typeof checkboxes] ? '#2E86C1' : 'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'2px',cursor:'pointer',transition:'all 0.15s'}}>
                {checkboxes[item.key as keyof typeof checkboxes] && <span style={{color:'#FFFFFF',fontSize:'12px'}}>✓</span>}
              </div>
              <span style={{fontSize:'13px',color:'rgba(255,255,255,0.65)',fontFamily:'sans-serif',lineHeight:1.7}}>{item.label}</span>
            </label>
          ))}
        </div>

        {/* Assinatura digital */}
        <div style={{backgroundColor:'rgba(46,134,193,0.06)',border:'1px solid rgba(46,134,193,0.15)',padding:'24px',marginBottom:'24px'}}>
          <p style={{fontSize:'11px',letterSpacing:'0.3em',color:'#2E86C1',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'8px'}}>Assinatura digital</p>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',fontFamily:'sans-serif',marginBottom:'14px',lineHeight:1.7}}>
            Para confirmar sua identidade, digite seu nome completo exatamente como cadastrado:
          </p>
          <input
            type="text" value={assinatura} onChange={e => setAssinatura(e.target.value)}
            placeholder={padrinho.nome}
            style={{width:'100%',padding:'12px 14px',backgroundColor:'rgba(255,255,255,0.05)',border:`1px solid ${assinatura && nomeCorreto ? 'rgba(61,214,140,0.5)' : assinatura ? 'rgba(220,60,60,0.4)' : 'rgba(255,255,255,0.1)'}`,color:'#FFFFFF',fontSize:'15px',fontFamily:'Georgia,serif',boxSizing:'border-box',transition:'border-color 0.2s',letterSpacing:'0.02em'}}
          />
          {assinatura && !nomeCorreto && (
            <p style={{fontSize:'12px',color:'#ff8080',fontFamily:'sans-serif',marginTop:'6px'}}>O nome não corresponde. Digite exatamente: {padrinho.nome}</p>
          )}
          {assinatura && nomeCorreto && (
            <p style={{fontSize:'12px',color:'#3DD68C',fontFamily:'sans-serif',marginTop:'6px'}}>✓ Assinatura confirmada</p>
          )}
        </div>

        <button
          onClick={handleConfirmarAceite}
          disabled={!todosCheckboxes || !nomeCorreto}
          style={{width:'100%',backgroundColor: todosCheckboxes && nomeCorreto ? '#2E86C1' : 'rgba(255,255,255,0.05)',color:'#FFFFFF',padding:'16px',fontSize:'12px',letterSpacing:'0.2em',border:'none',textTransform:'uppercase',fontFamily:'sans-serif',cursor: todosCheckboxes && nomeCorreto ? 'pointer' : 'not-allowed',opacity: todosCheckboxes && nomeCorreto ? 1 : 0.4,transition:'all 0.2s'}}>
          ✓ Aceito e quero ver o segredo
        </button>
        <p style={{fontSize:'11px',color:'rgba(255,255,255,0.2)',fontFamily:'sans-serif',textAlign:'center',marginTop:'10px'}}>
          Sua assinatura digital fica registrada com data e hora
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

        <div style={{textAlign:'center',marginBottom:'40px'}}>
          <div style={{fontSize:'36px',marginBottom:'16px'}}>🤫</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'12px'}}>
            <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
            <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Você é guardião(ã) deste segredo</span>
            <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
          </div>
          <h2 style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:400,color:'#FFFFFF',margin:'0 0 8px',letterSpacing:'-0.02em'}}>A lua de mel de {nomesCasal}</h2>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',margin:0}}>Apenas você e os outros padrinhos sabem o que vem a seguir</p>
        </div>

        {/* Destino */}
        {proposta && (
          <div style={{backgroundColor:'rgba(240,165,0,0.07)',border:'2px solid rgba(240,165,0,0.3)',padding:'32px',textAlign:'center',marginBottom:'24px',position:'relative'}}>
            <div style={{position:'absolute',top:'-10px',left:'50%',transform:'translateX(-50%)',backgroundColor:'#060d1a',padding:'2px 14px'}}>
              <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>O segredo</span>
            </div>
            <p style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',letterSpacing:'0.2em',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'10px'}}>O destino escolhido</p>
            <h3 style={{fontSize:'clamp(32px,8vw,64px)',fontWeight:400,color:'#FFFFFF',margin:'0 0 16px',letterSpacing:'-0.03em'}}>{proposta.destino}</h3>
            <div style={{display:'flex',justifyContent:'center',gap:'10px',flexWrap:'wrap',marginBottom:'14px'}}>
              <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',backgroundColor:'rgba(255,255,255,0.06)',padding:'4px 12px',fontFamily:'sans-serif'}}>📅 {proposta.duracao_dias} dias</span>
              <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',backgroundColor:'rgba(255,255,255,0.06)',padding:'4px 12px',fontFamily:'sans-serif'}}>✈️ {proposta.agencia?.nome_fantasia}</span>
              <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',backgroundColor:'rgba(255,255,255,0.06)',padding:'4px 12px',fontFamily:'sans-serif'}}>💰 R$ {proposta.valor_total?.toLocaleString('pt-BR')}</span>
            </div>
            {proposta.teaser_ia && (
              <p style={{fontSize:'14px',fontStyle:'italic',color:'rgba(255,255,255,0.55)',lineHeight:1.85,margin:0,maxWidth:'480px',marginLeft:'auto',marginRight:'auto'}}>"{proposta.teaser_ia}"</p>
            )}
          </div>
        )}

        {/* História do casal */}
        {historia && (
          <div style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'24px',marginBottom:'16px'}}>
            <p style={{fontSize:'10px',letterSpacing:'0.3em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'12px'}}>A história deles</p>
            <p style={{fontSize:'14px',fontStyle:'italic',color:'rgba(255,255,255,0.65)',lineHeight:1.9,margin:0}}>"{historia}"</p>
          </div>
        )}

        {/* Roteiro */}
        {proposta?.roteiro_completo?.texto && (
          <div style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'24px',marginBottom:'16px'}}>
            <p style={{fontSize:'10px',letterSpacing:'0.3em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'12px'}}>Roteiro da viagem</p>
            <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',fontFamily:'sans-serif',fontWeight:300,lineHeight:1.9,margin:0,whiteSpace:'pre-line'}}>{proposta.roteiro_completo.texto}</p>
          </div>
        )}

        {/* Comentário */}
        <div style={{backgroundColor:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'24px',marginBottom:'24px'}}>
          <p style={{fontSize:'10px',letterSpacing:'0.3em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'6px'}}>Deixe uma mensagem sobre o casal</p>
          <p style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',marginBottom:'14px',lineHeight:1.7}}>Por que esse destino combina com {casal.nome_parceiro_1} e {casal.nome_parceiro_2}?</p>
          <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={3}
            placeholder="Compartilhe algo especial que reforce sua aprovação..."
            style={{width:'100%',padding:'12px 14px',backgroundColor:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#FFFFFF',fontSize:'14px',fontFamily:'sans-serif',boxSizing:'border-box',resize:'none',lineHeight:1.7}}/>
        </div>

        {/* Compartilhar */}
        <div style={{backgroundColor:'rgba(46,134,193,0.06)',border:'1px solid rgba(46,134,193,0.15)',padding:'16px 20px',marginBottom:'24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'10px'}}>
          <div>
            <p style={{fontSize:'12px',color:'rgba(255,255,255,0.7)',fontFamily:'sans-serif',margin:'0 0 2px'}}>Compartilhar com outros padrinhos</p>
            <p style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',margin:0}}>Envie o link para quem também guarda o segredo</p>
          </div>
          <button onClick={handleCompartilhar} style={{padding:'8px 20px',backgroundColor:'rgba(46,134,193,0.2)',border:'1px solid rgba(46,134,193,0.4)',color:'#FFFFFF',fontSize:'11px',letterSpacing:'0.15em',fontFamily:'sans-serif',cursor:'pointer',textTransform:'uppercase',transition:'all 0.2s'}}>
            {copiado ? '✓ Copiado!' : '🔗 Compartilhar'}
          </button>
        </div>

        {/* Botão aprovar */}
        <div style={{textAlign:'center'}}>
          <button onClick={handleAprovar} disabled={salvando}
            style={{backgroundColor:'#2E86C1',color:'#FFFFFF',padding:'16px 56px',fontSize:'12px',letterSpacing:'0.2em',border:'none',textTransform:'uppercase',fontFamily:'sans-serif',cursor:salvando?'wait':'pointer',opacity:salvando?0.7:1,transition:'all 0.2s'}}>
            {salvando ? 'Salvando...' : '✅ Aprovar a lua de mel deles'}
          </button>
          <p style={{fontSize:'11px',color:'rgba(255,255,255,0.2)',fontFamily:'sans-serif',marginTop:'10px'}}>Sua aprovação libera o reveal para o casal</p>
        </div>
      </div>
    </main>
  )

  // ——— JÁ APROVADO ———
  return (
    <main style={estiloMain}>
      <style>{estilosCSS}</style>
      <Aurora/>
      <div style={{position:'relative',zIndex:10,textAlign:'center',maxWidth:'480px',padding:'0 24px'}}>
        <div style={{fontSize:'48px',marginBottom:'20px'}}>🎉</div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'14px'}}>
          <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
          <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Segredo guardado</span>
          <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
        </div>
        <h2 style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:400,color:'#FFFFFF',marginBottom:'12px',letterSpacing:'-0.02em'}}>Você já aprovou! ✓</h2>
        <p style={{fontSize:'14px',color:'rgba(255,255,255,0.5)',fontFamily:'sans-serif',lineHeight:1.85,marginBottom:'8px'}}>Você está guardando o segredo da lua de mel de</p>
        <p style={{fontSize:'22px',fontWeight:400,color:'#FFFFFF',marginBottom:'8px'}}>{nomesCasal}</p>
        {proposta && <p style={{fontSize:'24px',color:'#F0A500',marginBottom:'24px'}}>→ {proposta.destino} ✈️</p>}
        {comentario && (
          <div style={{backgroundColor:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',padding:'16px',marginBottom:'24px',textAlign:'left'}}>
            <p style={{fontSize:'10px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'6px'}}>Seu comentário</p>
            <p style={{fontSize:'13px',fontStyle:'italic',color:'rgba(255,255,255,0.6)',lineHeight:1.8,margin:0}}>"{comentario}"</p>
          </div>
        )}
        <button onClick={handleCompartilhar} style={{background:'none',border:'1px solid rgba(46,134,193,0.3)',color:'rgba(255,255,255,0.6)',padding:'10px 24px',fontSize:'11px',letterSpacing:'0.15em',fontFamily:'sans-serif',cursor:'pointer',textTransform:'uppercase'}}>
          {copiado ? '✓ Copiado!' : '🔗 Compartilhar com outros padrinhos'}
        </button>
      </div>
    </main>
  )
}

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

const estilosCSS = `
  @keyframes aurora1{0%{transform:translateX(-20%) scale(1);opacity:.25}50%{transform:translateX(10%) scale(1.1);opacity:.4}100%{transform:translateX(-20%) scale(1);opacity:.25}}
  @keyframes aurora2{0%{transform:translateX(20%) scale(1.1);opacity:.2}50%{transform:translateX(-10%) scale(.9);opacity:.35}100%{transform:translateX(20%) scale(1.1);opacity:.2}}
  textarea:focus,input:focus{outline:none;border-color:rgba(46,134,193,0.5)!important;}
  @media(max-width:768px){.portal-inner{padding:40px 16px 60px!important;}}
`

export default function PadrinhoPage() {
  return (
    <Suspense fallback={<div style={{backgroundColor:'#060d1a',minHeight:'100vh'}}/>}>
      <PortalContent/>
    </Suspense>
  )
}
