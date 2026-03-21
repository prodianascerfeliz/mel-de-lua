'use client'

export default function NotFound() {
  return (
    <main style={{
      backgroundColor: '#060d1a', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Georgia', serif", textAlign: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '40px 24px',
    }}>
      <style>{`
        @keyframes aurora1 {
          0%   { transform: translateX(-20%) scale(1); opacity: .25; }
          50%  { transform: translateX(10%) scale(1.1); opacity: .4; }
          100% { transform: translateX(-20%) scale(1); opacity: .25; }
        }
        @keyframes aurora2 {
          0%   { transform: translateX(20%) scale(1.1); opacity: .2; }
          50%  { transform: translateX(-10%) scale(.9); opacity: .35; }
          100% { transform: translateX(20%) scale(1.1); opacity: .2; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .moon { animation: float 4s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.8s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.8s ease 0.2s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.8s ease 0.4s forwards; opacity: 0; }
        .btn-home:hover { background-color: #1a6fa8 !important; }
        .btn-back:hover { color: rgba(255,255,255,0.7) !important; }
      `}</style>

      {/* Aurora */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-30%', left: '-20%', width: '80vw', height: '80vh', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(46,134,193,0.3) 0%,transparent 70%)', animation: 'aurora1 14s ease-in-out infinite', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '70vw', height: '70vh', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,160,140,0.2) 0%,transparent 70%)', animation: 'aurora2 18s ease-in-out infinite', filter: 'blur(90px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '560px', width: '100%' }}>

        {/* Luna flutuante */}
        <div className="moon" style={{ marginBottom: '32px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80" style={{ margin: '0 auto', display: 'block' }}>
            <circle cx="42" cy="40" r="28" fill="#F0A500" opacity="0.9"/>
            <circle cx="54" cy="34" r="24" fill="#060d1a"/>
            <circle cx="34" cy="28" r="4" fill="#FFD57A" opacity="0.4"/>
          </svg>
        </div>

        {/* 404 */}
        <div className="fade-up" style={{
          fontSize: 'clamp(80px, 20vw, 140px)',
          fontWeight: 300, color: 'transparent',
          WebkitTextStroke: '1px rgba(46,134,193,0.5)',
          letterSpacing: '-0.04em', lineHeight: 1,
          marginBottom: '8px',
        }}>
          404
        </div>

        {/* Linha dourada */}
        <div style={{ width: '48px', height: '2px', backgroundColor: '#F0A500', margin: '16px auto 24px' }} />

        {/* Título */}
        <h1 className="fade-up-2" style={{
          fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 400,
          color: '#FFFFFF', margin: '0 0 16px', letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}>
          Esse destino não existe no mapa
        </h1>

        {/* Descrição */}
        <p className="fade-up-3" style={{
          fontSize: '16px', color: 'rgba(255,255,255,0.45)',
          fontFamily: 'sans-serif', fontWeight: 300,
          lineHeight: 1.85, marginBottom: '40px',
        }}>
          A página que vocês procuram se perdeu em algum lugar entre os destinos surpreendentes da Mel.
          Mas a lua de mel dos sonhos ainda está aqui.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" className="btn-home" style={{
            backgroundColor: '#2E86C1', color: '#FFFFFF',
            padding: '14px 40px', fontSize: '11px',
            letterSpacing: '0.2em', textDecoration: 'none',
            textTransform: 'uppercase', fontFamily: 'sans-serif',
            transition: 'background-color 0.2s',
          }}>
            Voltar ao início
          </a>
          <a href="/comecar" className="btn-back" style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none', letterSpacing: '0.08em',
            fontFamily: 'sans-serif', display: 'flex',
            alignItems: 'center', gap: '8px',
            transition: 'color 0.2s',
          }}>
            Começar meu briefing <span style={{ color: '#F0A500' }}>→</span>
          </a>
        </div>

        {/* Logo */}
        <div style={{ marginTop: '60px' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '14px', fontWeight: 300, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.2)' }}>
              Mel de Lua
            </span>
          </a>
        </div>
      </div>
    </main>
  )
}
