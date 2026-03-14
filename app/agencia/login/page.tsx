'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginAgencia() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('E-mail ou senha incorretos. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/agencia/painel')
  }

  return (
    <main style={{
      backgroundColor: '#060d1a', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Georgia', serif", position: 'relative', overflow: 'hidden',
      padding: '24px',
    }}>
      <style>{`
        @keyframes aurora1 {
          0%   { transform: translateX(-20%) scale(1); opacity: 0.25; }
          50%  { transform: translateX(10%) scale(1.1); opacity: 0.4; }
          100% { transform: translateX(-20%) scale(1); opacity: 0.25; }
        }
        @keyframes aurora2 {
          0%   { transform: translateX(20%) scale(1.1); opacity: 0.2; }
          50%  { transform: translateX(-10%) scale(0.9); opacity: 0.35; }
          100% { transform: translateX(20%) scale(1.1); opacity: 0.2; }
        }
        input:focus { outline: none; border-color: rgba(46,134,193,0.6) !important; }
        .btn-login:hover { background-color: #1a6fa8 !important; }
      `}</style>

      {/* Aurora */}
      <div style={{position: 'fixed', inset: 0, pointerEvents: 'none'}}>
        <div style={{position: 'absolute', top: '-30%', left: '-20%', width: '80vw', height: '80vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(46,134,193,0.3) 0%, transparent 70%)', animation: 'aurora1 14s ease-in-out infinite', filter: 'blur(80px)'}} />
        <div style={{position: 'absolute', bottom: '-20%', right: '-15%', width: '70vw', height: '70vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,160,140,0.2) 0%, transparent 70%)', animation: 'aurora2 18s ease-in-out infinite', filter: 'blur(90px)'}} />
      </div>

      <div style={{position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px'}}>

        {/* Logo */}
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <a href="/" style={{textDecoration: 'none'}}>
            <div style={{fontSize: '22px', fontWeight: 300, letterSpacing: '0.35em', color: '#FFFFFF'}}>Mel de Lua</div>
          </a>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px'}}>
            <div style={{width: '24px', height: '1px', backgroundColor: '#F0A500'}} />
            <span style={{fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>Painel da agência</span>
            <div style={{width: '24px', height: '1px', backgroundColor: '#F0A500'}} />
          </div>
        </div>

        {/* Card de login */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '2px', padding: '40px',
          backdropFilter: 'blur(12px)',
        }}>
          <h1 style={{fontSize: '24px', fontWeight: 400, color: '#FFFFFF', marginBottom: '8px', letterSpacing: '-0.01em'}}>
            Bem-vinda de volta
          </h1>
          <p style={{fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', marginBottom: '32px', fontWeight: 300}}>
            Acesse sua conta para ver os briefings e enviar propostas.
          </p>

          <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div>
              <label style={{display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px'}}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="agencia@exemplo.com"
                style={{
                  width: '100%', padding: '12px 16px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF', fontSize: '15px',
                  fontFamily: 'sans-serif', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            <div>
              <label style={{display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px'}}>
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '12px 16px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF', fontSize: '15px',
                  fontFamily: 'sans-serif', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            {erro && (
              <div style={{
                padding: '12px 16px', backgroundColor: 'rgba(220,60,60,0.15)',
                border: '1px solid rgba(220,60,60,0.3)',
                fontSize: '13px', color: '#ff8080', fontFamily: 'sans-serif',
              }}>
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-login"
              style={{
                backgroundColor: '#2E86C1', color: '#FFFFFF',
                padding: '15px', fontSize: '12px',
                letterSpacing: '0.2em', border: 'none',
                textTransform: 'uppercase', fontFamily: 'sans-serif',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'background-color 0.2s', marginTop: '8px',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p style={{textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '24px', fontFamily: 'sans-serif'}}>
          Problemas para acessar? <a href="mailto:contato@meldelua.com.br" style={{color: 'rgba(46,134,193,0.7)', textDecoration: 'none'}}>Fale conosco</a>
        </p>
      </div>
    </main>
  )
}
