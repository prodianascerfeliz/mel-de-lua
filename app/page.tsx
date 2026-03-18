'use client'

import { useState } from 'react'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [contatoModal, setContatoModal] = useState(false)
  const [contatoForm, setContatoForm] = useState({nome:'',email:'',mensagem:''})
  const [contatoEnviado, setContatoEnviado] = useState(false)

  return (
    <main style={{backgroundColor: '#E8F4FD', color: '#0A1628', minHeight: '100vh', fontFamily: "'Georgia', serif"}}>

      <style>{`
        @keyframes aurora1 {
          0%   { transform: translateX(-20%) translateY(0%) scale(1); opacity: 0.3; }
          50%  { transform: translateX(10%) translateY(-15%) scale(1.1); opacity: 0.5; }
          100% { transform: translateX(-20%) translateY(0%) scale(1); opacity: 0.3; }
        }
        @keyframes aurora2 {
          0%   { transform: translateX(20%) translateY(10%) scale(1.1); opacity: 0.25; }
          50%  { transform: translateX(-10%) translateY(-5%) scale(0.9); opacity: 0.4; }
          100% { transform: translateX(20%) translateY(10%) scale(1.1); opacity: 0.25; }
        }
        @keyframes aurora3 {
          0%   { transform: translateX(0%) translateY(-20%) rotate(15deg) scale(1); opacity: 0.2; }
          50%  { transform: translateX(-15%) translateY(10%) rotate(-8deg) scale(1.2); opacity: 0.4; }
          100% { transform: translateX(0%) translateY(-20%) rotate(15deg) scale(1); opacity: 0.2; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.18; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-title { animation: fadeUp 1.2s ease forwards; }
        .hero-sub   { animation: fadeUp 1.2s ease 0.3s forwards; opacity: 0; }
        .hero-cta   { animation: fadeUp 1.2s ease 0.6s forwards; opacity: 0; }

        /* MOBILE MENU */
        .mobile-menu {
          display: none;
          flex-direction: column;
          position: fixed;
          top: 70px; left: 0; right: 0;
          background: rgba(6,13,26,0.98);
          padding: 24px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          z-index: 99;
          gap: 20px;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a {
          font-size: 16px; color: rgba(255,255,255,0.7);
          text-decoration: none; font-family: sans-serif;
          letter-spacing: 0.1em; padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .hamburger   { display: flex !important; }
          .hero-section {
            padding: 80px 28px 60px !important;
            min-height: auto !important;
          }
          .hero-title h1 { font-size: clamp(40px, 11vw, 64px) !important; }
          .hero-sub p    { font-size: 16px !important; }
          .hero-cta      { flex-direction: column !important; align-items: stretch !important; }
          .hero-cta a    { text-align: center !important; }
          .numbers-grid  { grid-template-columns: 1fr !important; }
          .numbers-item  { border-right: none !important; border-bottom: 1px solid rgba(10,22,40,0.1) !important; }
          .how-grid      { grid-template-columns: 1fr !important; }
          .how-item      { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; }
          .how-header    { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .godparents-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .footer-inner  { flex-direction: column !important; gap: 16px !important; text-align: center !important; }
          .cta-section   { padding: 64px 28px !important; }
          .section-pad   { padding: 72px 28px !important; }
          .header-inner  { padding: 0 24px !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      {/* HEADER */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 100, height: '70px',
        backgroundColor: 'rgba(6,13,26,0.85)',
        backdropFilter: 'blur(16px)',
      }}>
        <div className="header-inner" style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 64px',
        }}>
          <div style={{fontSize: '20px', fontWeight: 300, letterSpacing: '0.35em', color: '#FFFFFF'}}>
            Mel de Lua
          </div>

          {/* Nav desktop */}
          <nav className="nav-desktop" style={{display: 'flex', gap: '48px', fontSize: '12px', letterSpacing: '0.15em', fontFamily: 'sans-serif'}}>
            <a href="#como-funciona" style={{textDecoration: 'none', color: 'rgba(255,255,255,0.6)'}}>Como funciona</a>
            <a href="#agencias" style={{textDecoration: 'none', color: 'rgba(255,255,255,0.6)'}}>Para agências</a>
          </nav>

          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <a href="/comecar" className="nav-desktop" style={{
              fontSize: '11px', letterSpacing: '0.2em', fontFamily: 'sans-serif',
              border: '1px solid rgba(255,255,255,0.4)', color: '#FFFFFF',
              padding: '10px 28px', textDecoration: 'none', textTransform: 'uppercase',
            }}>
              Começar
            </a>

            {/* Hamburguer */}
            <button
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'flex', flexDirection: 'column', gap: '5px',
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              }}
            >
              <span style={{width: '22px', height: '2px', backgroundColor: '#FFFFFF', display: 'block', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none'}} />
              <span style={{width: '22px', height: '2px', backgroundColor: '#FFFFFF', display: 'block', opacity: menuOpen ? 0 : 1, transition: 'all 0.2s'}} />
              <span style={{width: '22px', height: '2px', backgroundColor: '#FFFFFF', display: 'block', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'}} />
            </button>
          </div>
        </div>
      </header>

      {/* MENU MOBILE */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a>
        <a href="#agencias" onClick={() => setMenuOpen(false)}>Para agências</a>
        <a href="/comecar" style={{
          backgroundColor: '#2E86C1', color: '#FFFFFF !important',
          padding: '14px 24px', textAlign: 'center',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          fontSize: '13px', marginTop: '8px',
          border: 'none !important',
        }}>Começar</a>
      </div>

      {/* HERO */}
      <section className="hero-section" style={{
        backgroundColor: '#060d1a',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '120px 48px 80px',
        paddingTop: 'calc(70px + 60px)',
      }}>
        {/* Aurora */}
        <div style={{position: 'absolute', top: '-30%', left: '-20%', width: '80vw', height: '80vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(46,134,193,0.4) 0%, transparent 70%)', animation: 'aurora1 14s ease-in-out infinite', filter: 'blur(80px)', pointerEvents: 'none'}} />
        <div style={{position: 'absolute', bottom: '-20%', right: '-15%', width: '70vw', height: '70vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,180,160,0.3) 0%, transparent 70%)', animation: 'aurora2 18s ease-in-out infinite', filter: 'blur(90px)', pointerEvents: 'none'}} />
        <div style={{position: 'absolute', top: '20%', right: '-10%', width: '60vw', height: '60vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(100,60,180,0.25) 0%, transparent 70%)', animation: 'aurora3 22s ease-in-out infinite', filter: 'blur(80px)', pointerEvents: 'none'}} />
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '48px 48px', animation: 'shimmer 6s ease-in-out infinite', pointerEvents: 'none'}} />

        <div style={{position: 'relative', zIndex: 10, maxWidth: '800px', width: '100%'}}>
          <div className="hero-sub" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '36px'}}>
            <div style={{width: '28px', height: '1px', backgroundColor: '#F0A500'}} />
            <span style={{fontSize: '10px', letterSpacing: '0.45em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>A plataforma de lua de mel do Brasil</span>
            <div style={{width: '28px', height: '1px', backgroundColor: '#F0A500'}} />
          </div>

          <div className="hero-title">
            <h1 style={{
              fontSize: 'clamp(44px, 8vw, 100px)',
              fontWeight: 400, lineHeight: 1.05,
              color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '28px',
            }}>
              A lua de mel<br />
              dos <em style={{color: 'transparent', WebkitTextStroke: '1.5px rgba(46,180,200,0.9)', fontStyle: 'italic'}}>sonhos</em><br />
              de vocês
            </h1>
          </div>

          <div style={{width: '48px', height: '1px', backgroundColor: '#F0A500', margin: '0 auto 28px'}} />

          <p className="hero-sub" style={{
            fontSize: '17px', fontWeight: 300, lineHeight: 1.85,
            color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif',
            marginBottom: '44px', maxWidth: '480px', margin: '0 auto 44px',
          }}>
            Vocês contam a história. Nossa IA cria o perfil do casal.
            Agências competem. O destino é uma surpresa até o reveal.
          </p>

          <div className="hero-cta" style={{display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'}}>
            <a href="/comecar" style={{
              backgroundColor: '#2E86C1', color: '#FFFFFF',
              padding: '18px 52px', fontSize: '12px',
              letterSpacing: '0.2em', textDecoration: 'none',
              textTransform: 'uppercase', fontFamily: 'sans-serif',
              minWidth: '220px',
            }}>
              Começar nossa história
            </a>
            <a href="#como-funciona" style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.45)',
              textDecoration: 'none', letterSpacing: '0.08em',
              fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              Ver como funciona <span style={{color: '#F0A500', fontSize: '16px'}}>↓</span>
            </a>
          </div>

          <p style={{fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '24px', letterSpacing: '0.12em', fontFamily: 'sans-serif'}}>
            Gratuito para casais · Sem compromisso
          </p>
        </div>

        <div style={{position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)'}}>
          <div style={{width: '1px', height: '40px', background: 'linear-gradient(to bottom, transparent, rgba(240,165,0,0.5))'}} />
        </div>
      </section>

      {/* NÚMEROS */}
      <section style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid rgba(10,22,40,0.1)'}} className="numbers-grid" >
        {[
          {num: '3', label: 'propostas exclusivas', desc: 'Agências curadas competem pelo casal'},
          {num: '100%', label: 'personalizado', desc: 'Nenhuma viagem igual à outra'},
          {num: '0', label: 'trabalho para vocês', desc: 'A IA e as agências fazem tudo'},
        ].map((item, i) => (
          <div key={item.num} className="numbers-item" style={{
            padding: '52px 40px', textAlign: 'center',
            borderRight: i < 2 ? '1px solid rgba(10,22,40,0.1)' : 'none',
            backgroundColor: '#E8F4FD',
          }}>
            <div style={{fontSize: '64px', fontWeight: 300, color: '#0A1628', lineHeight: 1, letterSpacing: '-0.03em'}}>{item.num}</div>
            <div style={{fontSize: '10px', letterSpacing: '0.3em', color: '#2E86C1', marginTop: '12px', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>{item.label}</div>
            <div style={{fontSize: '14px', color: '#1B3A6B', fontFamily: 'sans-serif', fontWeight: 300}}>{item.desc}</div>
          </div>
        ))}
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{backgroundColor: '#0A1628'}}>
        <div className="section-pad how-header" style={{
          padding: '80px 72px 56px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
              <div style={{width: '28px', height: '1px', backgroundColor: '#F0A500'}} />
              <span style={{fontSize: '10px', letterSpacing: '0.45em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>O processo</span>
            </div>
            <h2 style={{fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 400, color: '#FFFFFF', lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0}}>Como funciona</h2>
          </div>
          <p style={{fontSize: '14px', color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif', maxWidth: '260px', textAlign: 'right', lineHeight: 1.8, margin: 0}}>
            Do briefing ao reveal — cuidado por nós e pelas melhores agências do Brasil.
          </p>
        </div>

        <div className="how-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)'}}>
          {[
            {num: '01', title: 'Vocês contam a história', desc: 'Nossa IA conduz uma conversa sobre o casal — como se conheceram, o que amam, como viajam juntos.'},
            {num: '02', title: 'Os padrinhos guardam o segredo', desc: 'Pessoas escolhidas por vocês recebem o destino antes e aprovam a proposta da agência.'},
            {num: '03', title: 'Agências competem', desc: 'Agências curadas criam propostas únicas. Vocês veem valor e estilo, sem saber o destino.'},
            {num: '04', title: 'O reveal', desc: 'Vocês escolhem. O destino é revelado. Esse momento é feito para ser filmado e compartilhado.'},
          ].map((item, i) => (
            <div key={item.num} className="how-item" style={{
              padding: '40px 32px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{fontSize: '48px', fontWeight: 300, color: 'rgba(46,134,193,0.2)', lineHeight: 1, marginBottom: '24px', letterSpacing: '-0.02em'}}>{item.num}</div>
              <div style={{width: '20px', height: '2px', backgroundColor: '#F0A500', marginBottom: '20px'}} />
              <h3 style={{fontSize: '16px', fontWeight: 400, color: '#FFFFFF', lineHeight: 1.4, margin: '0 0 12px'}}>{item.title}</h3>
              <p style={{fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.9, fontFamily: 'sans-serif', fontWeight: 300, margin: 0}}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PADRINHOS */}
      <section className="section-pad" style={{backgroundColor: '#E8F4FD', padding: '100px 72px'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div className="godparents-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '72px', alignItems: 'center'}}>
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
                <div style={{width: '28px', height: '1px', backgroundColor: '#F0A500'}} />
                <span style={{fontSize: '10px', letterSpacing: '0.45em', color: '#2E86C1', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>Diferencial exclusivo</span>
              </div>
              <h2 style={{fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 400, lineHeight: 1.15, marginBottom: '24px', color: '#0A1628', letterSpacing: '-0.02em'}}>
                Os padrinhos fazem<br />parte da história
              </h2>
              <div style={{width: '36px', height: '2px', backgroundColor: '#2E86C1', marginBottom: '24px'}} />
              <p style={{fontSize: '17px', fontWeight: 300, color: '#1B3A6B', lineHeight: 1.9, marginBottom: '24px', fontFamily: 'sans-serif'}}>
                Vocês escolhem 1 a 3 pessoas de confiança. Elas recebem um convite especial para guardar o segredo do destino.
              </p>
              <p style={{fontSize: '18px', fontStyle: 'italic', color: '#0A1628', lineHeight: 1.6, borderLeft: '3px solid #F0A500', paddingLeft: '20px', margin: 0}}>
                "Vocês foram escolhidos para guardar o segredo."
              </p>
            </div>

            <div style={{backgroundColor: '#0A1628', padding: '40px', position: 'relative'}}>
              <div style={{position: 'absolute', top: '0', left: '40px', width: '64px', height: '2px', backgroundColor: '#F0A500'}} />
              <div style={{display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px'}}>
                <div style={{width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#2E86C1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '17px', fontFamily: 'Georgia, serif', fontStyle: 'italic'}}>M</div>
                <div>
                  <div style={{fontSize: '15px', color: '#FFFFFF', fontWeight: 400}}>Marina Costa</div>
                  <div style={{fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', fontFamily: 'sans-serif'}}>Madrinha da noiva</div>
                </div>
              </div>
              <p style={{fontSize: '16px', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: '24px'}}>
                "Eles adoram acordar cedo para ver o sol nascer. Ele sempre quis mergulhar. Ela ama vinhos e gastronomia local."
              </p>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <div style={{width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#F0A500'}} />
                <span style={{fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>Proposta aprovada</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-section" style={{
        backgroundColor: '#060d1a', minHeight: '440px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 40px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{position: 'absolute', top: '-40%', left: '20%', width: '60vw', height: '80vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(46,134,193,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none'}} />
        <div style={{position: 'relative', zIndex: 10, maxWidth: '680px', width: '100%'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '28px'}}>
            <div style={{width: '28px', height: '1px', backgroundColor: '#F0A500'}} />
            <span style={{fontSize: '10px', letterSpacing: '0.45em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>O início de tudo</span>
            <div style={{width: '28px', height: '1px', backgroundColor: '#F0A500'}} />
          </div>
          <h2 style={{fontSize: 'clamp(28px, 5vw, 60px)', fontWeight: 400, color: '#FFFFFF', lineHeight: 1.15, margin: '0 auto 36px', letterSpacing: '-0.02em'}}>
            A história de vocês merece uma viagem à altura
          </h2>
          <a href="/comecar" style={{
            backgroundColor: '#2E86C1', color: '#FFFFFF',
            padding: '18px 52px', fontSize: '12px',
            letterSpacing: '0.2em', textDecoration: 'none',
            textTransform: 'uppercase', display: 'inline-block',
            fontFamily: 'sans-serif', minWidth: '220px',
          }}>
            Começar nossa história
          </a>
          <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '18px', letterSpacing: '0.1em', fontFamily: 'sans-serif'}}>
            Completamente gratuito para casais
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop: '1px solid rgba(46,134,193,0.15)', padding: '32px 40px', backgroundColor: '#E8F4FD'}}>
        <div className="footer-inner" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'}}>
          <div style={{fontSize: '18px', fontWeight: 300, letterSpacing: '0.3em', color: '#0A1628'}}>Mel de Lua</div>
          <div style={{fontSize: '12px', color: '#1B3A6B', letterSpacing: '0.05em', fontFamily: 'sans-serif'}}>2026 Mel de Lua · Todos os direitos reservados</div>
          <div style={{display: 'flex', gap: '28px', fontSize: '12px', color: '#1B3A6B', fontFamily: 'sans-serif'}}>
            <a href="#" style={{textDecoration: 'none', color: 'inherit'}}>Para agências</a>
            <button onClick={()=>setContatoModal(true)} style={{background:'none',border:'none',cursor:'pointer',color:'inherit',fontSize:'12px',fontFamily:'sans-serif',padding:0}}>Contato</button>
            <a href="/legal" style={{textDecoration: 'none', color: 'inherit'}}>Privacidade</a>
            <a href="/legal" style={{textDecoration: 'none', color: 'inherit'}}>Termos</a>
          </div>
        </div>
      </footer>


      {/* MODAL CONTATO */}
      {contatoModal && (
        <div style={{position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:'24px'}}
          onClick={()=>setContatoModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{backgroundColor:'#0A1628',border:'1px solid rgba(255,255,255,0.1)',padding:'40px',maxWidth:'480px',width:'100%',position:'relative'}}>
            <button onClick={()=>setContatoModal(false)} style={{position:'absolute',top:'16px',right:'16px',background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:'20px',cursor:'pointer'}}>✕</button>
            {!contatoEnviado ? (
              <>
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
                  <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
                  <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Fale conosco</span>
                </div>
                <h2 style={{fontSize:'24px',fontWeight:400,color:'#FFFFFF',marginBottom:'8px',letterSpacing:'-0.01em',fontFamily:"Georgia, serif"}}>Como podemos ajudar?</h2>
                <p style={{fontSize:'13px',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif',marginBottom:'28px',lineHeight:1.7}}>Responderemos pelo e-mail ou WhatsApp em até 24h.</p>
                <div style={{display:'flex',flexDirection:'column',gap:'16px',marginBottom:'24px'}}>
                  <div>
                    <label style={{display:'block',fontSize:'11px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'6px'}}>Nome</label>
                    <input type="text" value={contatoForm.nome} onChange={e=>setContatoForm({...contatoForm,nome:e.target.value})}
                      placeholder="Seu nome"
                      style={{width:'100%',padding:'11px 14px',backgroundColor:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#FFFFFF',fontSize:'14px',fontFamily:'sans-serif',boxSizing:'border-box'}}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:'11px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'6px'}}>E-mail</label>
                    <input type="email" value={contatoForm.email} onChange={e=>setContatoForm({...contatoForm,email:e.target.value})}
                      placeholder="seu@email.com"
                      style={{width:'100%',padding:'11px 14px',backgroundColor:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#FFFFFF',fontSize:'14px',fontFamily:'sans-serif',boxSizing:'border-box'}}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:'11px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'6px'}}>Mensagem</label>
                    <textarea value={contatoForm.mensagem} onChange={e=>setContatoForm({...contatoForm,mensagem:e.target.value})}
                      rows={4} placeholder="Como podemos ajudar?"
                      style={{width:'100%',padding:'11px 14px',backgroundColor:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#FFFFFF',fontSize:'14px',fontFamily:'sans-serif',boxSizing:'border-box',resize:'none'}}/>
                  </div>
                </div>
                <div style={{display:'flex',gap:'12px',alignItems:'center',flexWrap:'wrap'}}>
                  <button
                    onClick={()=>{
                      const msg = encodeURIComponent(`Olá! Sou ${contatoForm.nome} (${contatoForm.email}).\n\n${contatoForm.mensagem}`)
                      window.open(`https://wa.me/5511993580581?text=${msg}`,'_blank')
                      setContatoEnviado(true)
                    }}
                    style={{backgroundColor:'#25D366',color:'#FFFFFF',padding:'11px 24px',fontSize:'12px',letterSpacing:'0.15em',border:'none',fontFamily:'sans-serif',cursor:'pointer',textTransform:'uppercase'}}>
                    💬 WhatsApp
                  </button>
                  <a href={`mailto:kuboferreira@gmail.com?subject=Contato Mel de Lua — ${contatoForm.nome}&body=${encodeURIComponent(contatoForm.mensagem)}`}
                    style={{backgroundColor:'rgba(46,134,193,0.15)',color:'#FFFFFF',padding:'11px 24px',fontSize:'12px',letterSpacing:'0.15em',border:'1px solid rgba(46,134,193,0.3)',fontFamily:'sans-serif',textDecoration:'none',textTransform:'uppercase'}}>
                    ✉️ E-mail
                  </a>
                </div>
              </>
            ) : (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:'48px',marginBottom:'16px'}}>💛</div>
                <h3 style={{fontSize:'22px',fontWeight:400,color:'#FFFFFF',marginBottom:'12px',fontFamily:"Georgia, serif"}}>Mensagem enviada!</h3>
                <p style={{fontSize:'14px',color:'rgba(255,255,255,0.5)',fontFamily:'sans-serif',lineHeight:1.8,marginBottom:'24px'}}>Responderemos em breve pelo canal escolhido.</p>
                <button onClick={()=>{setContatoModal(false);setContatoEnviado(false);setContatoForm({nome:'',email:'',mensagem:''})}}
                  style={{background:'none',border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.5)',padding:'10px 24px',fontSize:'12px',letterSpacing:'0.15em',fontFamily:'sans-serif',cursor:'pointer'}}>
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
