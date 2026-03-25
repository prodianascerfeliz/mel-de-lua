'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'assistant' | 'user'
  content: string
}

function AvatarMel({ size = 32 }: { size?: number }) {
  return (
    <div style={{width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #1B3A6B 0%, #2E86C1 100%)', border: '1px solid rgba(46,134,193,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
      <span style={{fontFamily: "'Georgia', serif", fontSize: size * 0.45, fontWeight: 400, color: '#FFFFFF', letterSpacing: '-0.02em', fontStyle: 'italic'}}>M</span>
    </div>
  )
}

export default function ComecaClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const startChat = async () => {
    setStarted(true)
    setLoading(true)
    const res = await fetch('/api/briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], sessionId, isFirst: true }),
    })
    const data = await res.json()
    setMessages([{ role: 'assistant', content: data.reply }])
    setLoading(false)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading || completed) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    const res = await fetch('/api/briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updated, sessionId, isFirst: false }),
    })
    const data = await res.json()
    setMessages([...updated, { role: 'assistant', content: data.reply }])
    if (data.completed) setCompleted(true)
    setLoading(false)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  return (
    <main style={{backgroundColor: '#060d1a', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Georgia', serif", position: 'relative', overflow: 'hidden'}}>
      <style>{`
        @keyframes aurora1 { 0%{transform:translateX(-20%) translateY(0%) scale(1);opacity:0.3} 50%{transform:translateX(10%) translateY(-15%) scale(1.1);opacity:0.5} 100%{transform:translateX(-20%) translateY(0%) scale(1);opacity:0.3} }
        @keyframes aurora2 { 0%{transform:translateX(20%) translateY(10%) scale(1.1);opacity:0.2} 50%{transform:translateX(-10%) translateY(-5%) scale(0.9);opacity:0.35} 100%{transform:translateX(20%) translateY(10%) scale(1.1);opacity:0.2} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .msg-bubble{animation:fadeIn 0.35s ease forwards}
        .typing-dot{animation:pulse 1.2s ease-in-out infinite}
        .typing-dot:nth-child(2){animation-delay:0.2s}
        .typing-dot:nth-child(3){animation-delay:0.4s}
        .fade-up{animation:fadeUp 0.8s ease forwards}
        .send-btn:hover:not(:disabled){background-color:#1a6fa8 !important}
        textarea:focus{outline:none}
        textarea{resize:none}
        textarea::placeholder{color:rgba(255,255,255,0.25)}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(46,134,193,0.3);border-radius:2px}
      `}</style>

      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}>
        <div style={{position:'absolute',top:'-30%',left:'-20%',width:'80vw',height:'80vh',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(46,134,193,0.35) 0%,transparent 70%)',animation:'aurora1 14s ease-in-out infinite',filter:'blur(80px)'}} />
        <div style={{position:'absolute',bottom:'-20%',right:'-15%',width:'70vw',height:'70vh',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(0,160,140,0.25) 0%,transparent 70%)',animation:'aurora2 18s ease-in-out infinite',filter:'blur(90px)'}} />
      </div>

      <header style={{position:'fixed',top:0,left:0,right:0,zIndex:100,height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 48px',backgroundColor:'rgba(6,13,26,0.85)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <a href="/" style={{textDecoration:'none',display:'flex',alignItems:'center'}}>
          <span style={{fontSize:'18px',fontWeight:300,letterSpacing:'0.35em',color:'#FFFFFF',fontFamily:"'Georgia', serif"}}>Mel de Lua</span>
        </a>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <AvatarMel size={36} />
          <div>
            <div style={{fontSize:'13px',color:'#FFFFFF',fontFamily:'sans-serif',fontWeight:400}}>Mel</div>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#3DD68C'}} />
              <span style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',letterSpacing:'0.05em'}}>online</span>
            </div>
          </div>
        </div>
        <div style={{width:'120px'}} />
      </header>

      {!started && (
        <div className="fade-up" style={{position:'relative',zIndex:10,flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 48px 80px'}}>
          <AvatarMel size={80} />
          <div style={{display:'flex',alignItems:'center',gap:'12px',margin:'28px 0 16px'}}>
            <div style={{width:'24px',height:'1px',backgroundColor:'#F0A500'}} />
            <span style={{fontSize:'10px',letterSpacing:'0.45em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Briefing do casal</span>
            <div style={{width:'24px',height:'1px',backgroundColor:'#F0A500'}} />
          </div>
          <h1 style={{fontSize:'clamp(28px,3.5vw,48px)',fontWeight:400,color:'#FFFFFF',lineHeight:1.25,marginBottom:'16px',letterSpacing:'-0.02em',maxWidth:'560px'}}>
            Oi! Eu sou a Mel.<br />Vou conhecer a história de vocês.
          </h1>
          <p style={{fontSize:'17px',fontWeight:300,color:'rgba(255,255,255,0.45)',fontFamily:'sans-serif',lineHeight:1.8,maxWidth:'460px',marginBottom:'44px'}}>
            Em alguns minutos de conversa, monto o perfil perfeito do casal para as agências criarem propostas que fazem sentido para vocês.
          </p>
          <button onClick={startChat} style={{backgroundColor:'#2E86C1',color:'#FFFFFF',padding:'18px 56px',fontSize:'12px',letterSpacing:'0.2em',border:'none',textTransform:'uppercase',fontFamily:'sans-serif',cursor:'pointer',transition:'background-color 0.2s'}}>
            Começar conversa
          </button>
          <p style={{fontSize:'11px',color:'rgba(255,255,255,0.2)',marginTop:'18px',fontFamily:'sans-serif',letterSpacing:'0.08em'}}>
            Leva cerca de 5 minutos · Totalmente gratuito
          </p>
        </div>
      )}

      {started && (
        <div style={{position:'relative',zIndex:10,flex:1,display:'flex',flexDirection:'column',paddingTop:'64px',maxWidth:'760px',width:'100%',margin:'0 auto'}}>
          <div style={{flex:1,overflowY:'auto',padding:'32px 24px 16px',display:'flex',flexDirection:'column',gap:'16px'}}>
            {messages.map((msg, i) => (
              <div key={i} className="msg-bubble" style={{display:'flex',justifyContent:msg.role==='user'?'flex-end':'flex-start',gap:'10px',alignItems:'flex-end'}}>
                {msg.role === 'assistant' && <AvatarMel size={28} />}
                <div style={{maxWidth:'78%',padding:'13px 18px',borderRadius:msg.role==='user'?'18px 18px 4px 18px':'4px 18px 18px 18px',backgroundColor:msg.role==='user'?'#2E86C1':'rgba(255,255,255,0.07)',border:msg.role==='assistant'?'1px solid rgba(255,255,255,0.08)':'none',backdropFilter:'blur(8px)'}}>
                  <p style={{margin:0,fontSize:'16px',lineHeight:1.75,color:msg.role==='user'?'#FFFFFF':'rgba(255,255,255,0.88)',fontFamily:msg.role==='user'?'sans-serif':"'Georgia', serif",fontWeight:300,whiteSpace:'pre-wrap'}}>{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="msg-bubble" style={{display:'flex',gap:'10px',alignItems:'flex-end'}}>
                <AvatarMel size={28} />
                <div style={{padding:'13px 18px',borderRadius:'4px 18px 18px 18px',backgroundColor:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',gap:'5px',alignItems:'center'}}>
                  <div className="typing-dot" style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'rgba(255,255,255,0.5)'}} />
                  <div className="typing-dot" style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'rgba(255,255,255,0.5)'}} />
                  <div className="typing-dot" style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'rgba(255,255,255,0.5)'}} />
                </div>
              </div>
            )}
            {completed && (
              <div className="msg-bubble" style={{textAlign:'center',padding:'24px',borderTop:'1px solid rgba(255,255,255,0.06)',marginTop:'8px'}}>
                <div style={{fontSize:'24px',marginBottom:'8px'}}>🎉</div>
                <p style={{color:'rgba(255,255,255,0.5)',fontFamily:'sans-serif',fontSize:'14px',margin:0}}>Briefing salvo! Em breve as agências entrarão em contato.</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{padding:'12px 24px 28px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
            <div style={{display:'flex',gap:'10px',alignItems:'flex-end',backgroundColor:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:'10px 14px',backdropFilter:'blur(8px)'}}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px' }}
                onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()} }}
                placeholder={completed?'Conversa encerrada':'Digite sua resposta...'}
                disabled={completed}
                rows={1}
                style={{flex:1,background:'transparent',border:'none',color:'#FFFFFF',fontSize:'16px',fontFamily:'sans-serif',fontWeight:300,lineHeight:1.6,maxHeight:'120px',overflowY:'auto'}}
              />
              <button onClick={sendMessage} disabled={!input.trim()||loading||completed} className="send-btn"
                style={{backgroundColor:input.trim()&&!loading&&!completed?'#2E86C1':'rgba(46,134,193,0.15)',border:'none',borderRadius:'8px',width:'38px',height:'38px',cursor:input.trim()&&!loading&&!completed?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'background-color 0.2s',color:'#FFFFFF',fontSize:'18px'}}>
                ↑
              </button>
            </div>
            <p style={{fontSize:'11px',color:'rgba(255,255,255,0.15)',textAlign:'center',marginTop:'8px',fontFamily:'sans-serif',letterSpacing:'0.05em'}}>
              Enter para enviar · Shift+Enter para nova linha
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
