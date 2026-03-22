'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_EMAILS = ['prodianascerfeliz@gmail.com','vanda.almeida@dimensa.com.br']

export default function LoginAdmin() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      setErro('Acesso não autorizado.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/admin/painel')
  }

  return (
    <main style={{backgroundColor:'#060d1a',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Georgia', serif",position:'relative',overflow:'hidden',padding:'24px'}}>
      <style>{`
        @keyframes aurora1{0%{transform:translateX(-20%) scale(1);opacity:.2}50%{transform:translateX(10%) scale(1.1);opacity:.35}100%{transform:translateX(-20%) scale(1);opacity:.2}}
        input:focus{outline:none;border-color:rgba(46,134,193,0.6)!important;}
        .btn:hover{background-color:#1a6fa8!important;}
      `}</style>
      <div style={{position:'fixed',inset:0,pointerEvents:'none'}}>
        <div style={{position:'absolute',top:'-30%',left:'-20%',width:'80vw',height:'80vh',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(46,134,193,0.25) 0%,transparent 70%)',animation:'aurora1 14s ease-in-out infinite',filter:'blur(80px)'}}/>
      </div>

      <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'36px'}}>
          <div style={{fontSize:'18px',fontWeight:300,letterSpacing:'0.35em',color:'#FFFFFF',marginBottom:'14px'}}>Mel de Lua</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px'}}>
            <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
            <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Painel administrativo</span>
            <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
          </div>
        </div>

        <div style={{backgroundColor:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',padding:'36px',backdropFilter:'blur(12px)'}}>
          <h1 style={{fontSize:'22px',fontWeight:400,color:'#FFFFFF',marginBottom:'24px',letterSpacing:'-0.01em'}}>Acesso restrito</h1>
          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'18px'}}>
            <div>
              <label style={{display:'block',fontSize:'11px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'7px'}}>E-mail</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                style={{width:'100%',padding:'11px 14px',backgroundColor:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#FFFFFF',fontSize:'14px',fontFamily:'sans-serif',boxSizing:'border-box',transition:'border-color 0.2s'}}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:'11px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'7px'}}>Senha</label>
              <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} required
                style={{width:'100%',padding:'11px 14px',backgroundColor:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#FFFFFF',fontSize:'14px',fontFamily:'sans-serif',boxSizing:'border-box',transition:'border-color 0.2s'}}/>
            </div>
            {erro && <div style={{padding:'10px 14px',backgroundColor:'rgba(220,60,60,0.15)',border:'1px solid rgba(220,60,60,0.3)',fontSize:'13px',color:'#ff8080',fontFamily:'sans-serif'}}>{erro}</div>}
            <button type="submit" disabled={loading} className="btn"
              style={{backgroundColor:'#2E86C1',color:'#FFFFFF',padding:'13px',fontSize:'11px',letterSpacing:'0.2em',border:'none',textTransform:'uppercase',fontFamily:'sans-serif',cursor:loading?'wait':'pointer',transition:'background-color 0.2s',marginTop:'6px'}}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
