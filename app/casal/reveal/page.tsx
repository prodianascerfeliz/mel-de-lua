'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useSearchParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Proposta = {
  destino: string
  duracao_dias: number
  valor_total: number
  tipo_experiencia: string[]
  roteiro_completo: { texto: string }
  teaser_ia: string
  agencia: { nome_fantasia: string }
}

function RevealContent() {
  const searchParams = useSearchParams()
  const propostaId = searchParams.get('proposta')

  const [fase, setFase] = useState<'contagem' | 'envelope' | 'reveal' | 'celebracao'>('contagem')
  const [contagem, setContagem] = useState(3)
  const [proposta, setProposta] = useState<Proposta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (propostaId) carregarProposta()
  }, [propostaId])

  const carregarProposta = async () => {
    const { data } = await supabase
      .from('propostas')
      .select('destino, duracao_dias, valor_total, tipo_experiencia, roteiro_completo, teaser_ia, agencia:agencia_id(nome_fantasia)')
      .eq('id', propostaId)
      .single()
    if (data) setProposta(data as unknown as Proposta)
    setLoading(false)
  }

  // Contagem regressiva
  useEffect(() => {
    if (fase !== 'contagem') return
    if (contagem <= 0) { setFase('envelope'); return }
    const t = setTimeout(() => setContagem(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [fase, contagem])

  if (loading) return (
    <main style={{backgroundColor:'#060d1a',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',fontSize:'14px'}}>Preparando o reveal...</div>
    </main>
  )

  return (
    <main style={{
      backgroundColor:'#060d1a', minHeight:'100vh',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      fontFamily:"'Georgia', serif", overflow:'hidden',
      position:'relative', padding:'24px',
    }}>
      <style>{`
        @keyframes aurora1 { 0%{transform:translateX(-20%) scale(1);opacity:.3} 50%{transform:translateX(10%) scale(1.15);opacity:.55} 100%{transform:translateX(-20%) scale(1);opacity:.3} }
        @keyframes aurora2 { 0%{transform:translateX(20%) scale(1.1);opacity:.25} 50%{transform:translateX(-10%) scale(.9);opacity:.45} 100%{transform:translateX(20%) scale(1.1);opacity:.25} }
        @keyframes aurora3 { 0%{transform:translateX(0%) translateY(-20%) rotate(15deg) scale(1);opacity:.2} 50%{transform:translateX(-15%) translateY(10%) rotate(-8deg) scale(1.2);opacity:.4} 100%{transform:translateX(0%) translateY(-20%) rotate(15deg) scale(1);opacity:.2} }
        @keyframes countPulse { 0%{transform:scale(0.5);opacity:0} 30%{transform:scale(1.2);opacity:1} 70%{transform:scale(1);opacity:1} 100%{transform:scale(0.8);opacity:0} }
        @keyframes envelopeShake { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-3deg)} 40%{transform:rotate(3deg)} 60%{transform:rotate(-2deg)} 80%{transform:rotate(2deg)} }
        @keyframes envelopeOpen { from{transform:scaleY(1)} to{transform:scaleY(0)} }
        @keyframes revealSlide { from{opacity:0;transform:translateY(40px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes starPop { 0%{transform:scale(0) rotate(0deg);opacity:0} 60%{transform:scale(1.3) rotate(180deg);opacity:1} 100%{transform:scale(1) rotate(360deg);opacity:1} }
        @keyframes confetti { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes shimmer { 0%,100%{opacity:.06} 50%{opacity:.15} }
        .count-num { animation: countPulse 0.9s ease forwards; }
        .envelope-shake { animation: envelopeShake 0.6s ease 0.5s; }
        .reveal-card { animation: revealSlide 1s cubic-bezier(0.22,1,0.36,1) forwards; }
        .star { animation: starPop 0.5s ease forwards; }
        .confetti-piece { animation: confetti linear forwards; }
      `}</style>

      {/* Aurora intensa */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}>
        <div style={{position:'absolute',top:'-30%',left:'-20%',width:'80vw',height:'80vh',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(46,134,193,0.45) 0%,transparent 70%)',animation:'aurora1 10s ease-in-out infinite',filter:'blur(70px)'}}/>
        <div style={{position:'absolute',bottom:'-20%',right:'-15%',width:'70vw',height:'70vh',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(0,180,160,0.35) 0%,transparent 70%)',animation:'aurora2 14s ease-in-out infinite',filter:'blur(80px)'}}/>
        <div style={{position:'absolute',top:'20%',right:'-10%',width:'60vw',height:'60vh',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(120,80,200,0.3) 0%,transparent 70%)',animation:'aurora3 18s ease-in-out infinite',filter:'blur(80px)'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)',backgroundSize:'48px 48px',animation:'shimmer 6s ease-in-out infinite'}}/>
      </div>

      {/* FASE 1: CONTAGEM */}
      {fase === 'contagem' && (
        <div style={{position:'relative',zIndex:10,textAlign:'center'}}>
          <p style={{fontSize:'13px',letterSpacing:'0.4em',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'40px'}}>
            O destino vai ser revelado em...
          </p>
          {contagem > 0 ? (
            <div key={contagem} className="count-num" style={{fontSize:'clamp(120px,25vw,200px)',fontWeight:300,color:'#FFFFFF',lineHeight:1,letterSpacing:'-0.04em'}}>
              {contagem}
            </div>
          ) : (
            <div className="count-num" style={{fontSize:'clamp(60px,12vw,100px)',fontWeight:300,color:'#F0A500',lineHeight:1,letterSpacing:'-0.02em'}}>
              ✨
            </div>
          )}
        </div>
      )}

      {/* FASE 2: ENVELOPE */}
      {fase === 'envelope' && (
        <div style={{position:'relative',zIndex:10,textAlign:'center'}}>
          <p style={{fontSize:'13px',letterSpacing:'0.4em',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'48px'}}>
            O destino está aqui dentro...
          </p>
          <div
            className="envelope-shake"
            onClick={() => setFase('reveal')}
            style={{
              cursor:'pointer',
              display:'inline-flex',flexDirection:'column',alignItems:'center',
              padding:'40px 48px',
              backgroundColor:'rgba(240,165,0,0.08)',
              border:'2px solid rgba(240,165,0,0.4)',
              transition:'all 0.3s',
            }}
          >
            <div style={{fontSize:'72px',marginBottom:'16px'}}>✉️</div>
            <p style={{fontSize:'14px',color:'rgba(255,255,255,0.6)',fontFamily:'sans-serif',margin:'0 0 20px',letterSpacing:'0.05em'}}>
              Toque para abrir
            </p>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#F0A500',animation:'countPulse 1s ease-in-out infinite'}}/>
              <span style={{fontSize:'11px',letterSpacing:'0.3em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Toque aqui</span>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#F0A500',animation:'countPulse 1s ease-in-out 0.2s infinite'}}/>
            </div>
          </div>
        </div>
      )}

      {/* FASE 3: REVEAL */}
      {fase === 'reveal' && proposta && (
        <div className="reveal-card" style={{position:'relative',zIndex:10,textAlign:'center',maxWidth:'640px',width:'100%'}}>

          {/* Estrelas decorativas */}
          <div style={{display:'flex',justifyContent:'center',gap:'16px',marginBottom:'24px'}}>
            {['⭐','✨','🌟','✨','⭐'].map((s,i) => (
              <span key={i} className="star" style={{fontSize:'20px',animationDelay:`${i*0.1}s`,opacity:0}}>{s}</span>
            ))}
          </div>

          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'16px'}}>
            <div style={{width:'32px',height:'1px',backgroundColor:'#F0A500'}}/>
            <span style={{fontSize:'10px',letterSpacing:'0.5em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>O destino dos sonhos de vocês</span>
            <div style={{width:'32px',height:'1px',backgroundColor:'#F0A500'}}/>
          </div>

          <h1 style={{
            fontSize:'clamp(44px,10vw,88px)',fontWeight:400,
            color:'#FFFFFF',lineHeight:1.05,letterSpacing:'-0.03em',
            marginBottom:'8px',
          }}>
            {proposta.destino}
          </h1>

          <div style={{width:'48px',height:'2px',backgroundColor:'#F0A500',margin:'20px auto 28px'}}/>

          <div style={{display:'flex',justifyContent:'center',gap:'16px',flexWrap:'wrap',marginBottom:'28px'}}>
            <span style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',fontFamily:'sans-serif',backgroundColor:'rgba(255,255,255,0.06)',padding:'8px 16px'}}>
              📅 {proposta.duracao_dias} dias
            </span>
            <span style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',fontFamily:'sans-serif',backgroundColor:'rgba(255,255,255,0.06)',padding:'8px 16px'}}>
              ✈️ {proposta.agencia?.nome_fantasia}
            </span>
          </div>

          {proposta.teaser_ia && (
            <div style={{borderLeft:'2px solid #F0A500',paddingLeft:'20px',textAlign:'left',marginBottom:'32px',maxWidth:'480px',margin:'0 auto 32px'}}>
              <p style={{fontSize:'16px',fontStyle:'italic',color:'rgba(255,255,255,0.65)',lineHeight:1.9,margin:0}}>
                "{proposta.teaser_ia}"
              </p>
            </div>
          )}

          <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
            <button
              onClick={() => setFase('celebracao')}
              style={{backgroundColor:'#2E86C1',color:'#FFFFFF',padding:'16px 44px',fontSize:'12px',letterSpacing:'0.2em',border:'none',textTransform:'uppercase',fontFamily:'sans-serif',cursor:'pointer'}}>
              🥂 Celebrar!
            </button>
            <a href="/casal/painel" style={{padding:'16px 28px',background:'none',border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.5)',fontSize:'12px',letterSpacing:'0.15em',fontFamily:'sans-serif',textDecoration:'none',textTransform:'uppercase',display:'inline-flex',alignItems:'center'}}>
              Ver detalhes
            </a>
          </div>
        </div>
      )}

      {/* FASE 4: CELEBRAÇÃO */}
      {fase === 'celebracao' && proposta && (
        <div style={{position:'relative',zIndex:10,textAlign:'center',maxWidth:'560px',width:'100%'}}>
          {/* Confetti */}
          {Array.from({length: 20}).map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              position:'fixed',
              left: `${Math.random()*100}%`,
              top: '-20px',
              width:'8px', height:'8px',
              backgroundColor:['#F0A500','#2E86C1','#3DD68C','#FFFFFF','#ff6b9d'][i%5],
              borderRadius: i%2===0 ? '50%' : '0',
              animationDuration: `${2+Math.random()*3}s`,
              animationDelay: `${Math.random()*2}s`,
              transform: 'rotate(0deg)',
            }}/>
          ))}

          <div style={{fontSize:'64px',marginBottom:'24px'}}>🥂</div>

          <h2 style={{fontSize:'clamp(28px,5vw,44px)',fontWeight:400,color:'#FFFFFF',marginBottom:'16px',letterSpacing:'-0.02em'}}>
            Que comecem as aventuras!
          </h2>

          <p style={{fontSize:'16px',color:'rgba(255,255,255,0.5)',fontFamily:'sans-serif',lineHeight:1.8,marginBottom:'12px'}}>
            Em breve a <strong style={{color:'rgba(255,255,255,0.8)'}}>{proposta.agencia?.nome_fantasia}</strong> entrará em contato para organizar todos os detalhes da viagem para
          </p>

          <p style={{fontSize:'clamp(28px,6vw,48px)',fontWeight:400,color:'#F0A500',marginBottom:'32px',letterSpacing:'-0.02em'}}>
            {proposta.destino} ✈️
          </p>

          <div style={{backgroundColor:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',padding:'24px',textAlign:'left',marginBottom:'28px'}}>
            <p style={{fontSize:'11px',letterSpacing:'0.3em',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'12px'}}>Resumo da viagem</p>
            <div style={{display:'flex',gap:'20px',flexWrap:'wrap'}}>
              <div>
                <p style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',margin:'0 0 4px',letterSpacing:'0.1em',textTransform:'uppercase'}}>Duração</p>
                <p style={{fontSize:'16px',color:'#FFFFFF',margin:0}}>{proposta.duracao_dias} dias</p>
              </div>
              <div>
                <p style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',margin:'0 0 4px',letterSpacing:'0.1em',textTransform:'uppercase'}}>Investimento</p>
                <p style={{fontSize:'16px',color:'#FFFFFF',margin:0}}>R$ {proposta.valor_total?.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>

          <a href="/" style={{fontSize:'13px',color:'rgba(255,255,255,0.3)',fontFamily:'sans-serif',textDecoration:'none',letterSpacing:'0.1em'}}>
            Voltar ao início
          </a>
        </div>
      )}
    </main>
  )
}

export default function RevealPage() {
  return (
    <Suspense fallback={<div style={{backgroundColor:'#060d1a',minHeight:'100vh'}}/>}>
      <RevealContent/>
    </Suspense>
  )
}
