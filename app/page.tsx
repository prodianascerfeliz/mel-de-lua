export default function Home() {
  return (
    <main style={{backgroundColor: '#E8F4FD', color: '#0A1628', minHeight: '100vh', fontFamily: "'Georgia', serif"}}>

      <style>{`
        @keyframes aurora1 {
          0%   { transform: translateX(-20%) translateY(0%) rotate(0deg) scale(1); opacity: 0.5; }
          33%  { transform: translateX(10%) translateY(-15%) rotate(8deg) scale(1.1); opacity: 0.7; }
          66%  { transform: translateX(-5%) translateY(10%) rotate(-5deg) scale(0.95); opacity: 0.4; }
          100% { transform: translateX(-20%) translateY(0%) rotate(0deg) scale(1); opacity: 0.5; }
        }
        @keyframes aurora2 {
          0%   { transform: translateX(20%) translateY(10%) rotate(0deg) scale(1.1); opacity: 0.4; }
          33%  { transform: translateX(-10%) translateY(-5%) rotate(-10deg) scale(0.9); opacity: 0.6; }
          66%  { transform: translateX(15%) translateY(20%) rotate(6deg) scale(1.15); opacity: 0.35; }
          100% { transform: translateX(20%) translateY(10%) rotate(0deg) scale(1.1); opacity: 0.4; }
        }
        @keyframes aurora3 {
          0%   { transform: translateX(0%) translateY(-20%) rotate(15deg) scale(1); opacity: 0.3; }
          50%  { transform: translateX(-15%) translateY(10%) rotate(-8deg) scale(1.2); opacity: 0.55; }
          100% { transform: translateX(0%) translateY(-20%) rotate(15deg) scale(1); opacity: 0.3; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-title {
          animation: fadeUp 1.2s ease forwards;
        }
        .hero-sub {
          animation: fadeUp 1.2s ease 0.3s forwards;
          opacity: 0;
        }
        .hero-cta {
          animation: fadeUp 1.2s ease 0.6s forwards;
          opacity: 0;
        }
        .btn-primary:hover {
          background-color: #1a6fa8 !important;
        }
      `}</style>

      {/* HEADER */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 64px', borderBottom: '1px solid rgba(10,22,40,0.1)',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '70px',
        backgroundColor: 'rgba(10,22,40,0.6)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{fontSize: '20px', fontWeight: 300, letterSpacing: '0.35em', color: '#FFFFFF'}}>
          Mel de Lua
        </div>
        <nav style={{display: 'flex', gap: '48px', fontSize: '12px', letterSpacing: '0.15em', fontFamily: 'sans-serif'}}>
          <a href="#como-funciona" style={{textDecoration: 'none', color: 'rgba(255,255,255,0.6)'}}>Como funciona</a>
          <a href="#agencias" style={{textDecoration: 'none', color: 'rgba(255,255,255,0.6)'}}>Para agências</a>
        </nav>
        <a href="/comecar" style={{
          fontSize: '11px', letterSpacing: '0.2em', fontFamily: 'sans-serif',
          border: '1px solid rgba(255,255,255,0.4)', color: '#FFFFFF',
          padding: '10px 28px', textDecoration: 'none', textTransform: 'uppercase',
        }}>
          Começar
        </a>
      </header>

      {/* HERO — aurora boreal + texto centralizado */}
      <section style={{
        backgroundColor: '#060d1a',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '120px 48px 80px',
      }}>

        {/* AURORA 1 — azul esverdeado */}
        <div style={{
          position: 'absolute',
          top: '-30%', left: '-20%',
          width: '90vw', height: '90vh',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(46,134,193,0.55) 0%, rgba(20,80,140,0.3) 40%, transparent 70%)',
          animation: 'aurora1 14s ease-in-out infinite',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        {/* AURORA 2 — teal */}
        <div style={{
          position: 'absolute',
          bottom: '-20%', right: '-15%',
          width: '80vw', height: '80vh',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,180,160,0.45) 0%, rgba(0,120,120,0.2) 40%, transparent 70%)',
          animation: 'aurora2 18s ease-in-out infinite',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }} />

        {/* AURORA 3 — roxo profundo */}
        <div style={{
          position: 'absolute',
          top: '20%', right: '-10%',
          width: '60vw', height: '60vh',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(100,60,180,0.4) 0%, rgba(60,20,120,0.15) 50%, transparent 70%)',
          animation: 'aurora3 22s ease-in-out infinite',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />

        {/* Grade de pontos decorativa */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          animation: 'shimmer 6s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* CONTEÚDO */}
        <div style={{position: 'relative', zIndex: 10, maxWidth: '800px'}}>

          {/* Label */}
          <div className="hero-sub" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '16px', marginBottom: '40px',
          }}>
            <div style={{width: '32px', height: '1px', backgroundColor: '#F0A500'}} />
            <span style={{fontSize: '10px', letterSpacing: '0.5em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>
              A plataforma de lua de mel do Brasil
            </span>
            <div style={{width: '32px', height: '1px', backgroundColor: '#F0A500'}} />
          </div>

          {/* TÍTULO */}
          <h1 className="hero-title" style={{
            fontSize: 'clamp(52px, 7vw, 100px)',
            fontWeight: 400, lineHeight: 1.05,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            marginBottom: '32px',
          }}>
            A lua de mel<br />
            dos <em style={{
              color: 'transparent',
              WebkitTextStroke: '1.5px rgba(46,180,200,0.9)',
              fontStyle: 'italic',
            }}>sonhos</em><br />
            de vocês
          </h1>

          {/* Linha dourada */}
          <div style={{width: '60px', height: '1px', backgroundColor: '#F0A500', margin: '0 auto 32px'}} />

          {/* Subtítulo */}
          <p className="hero-sub" style={{
            fontSize: '18px', fontWeight: 300, lineHeight: 1.85,
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'sans-serif', marginBottom: '48px',
            maxWidth: '520px', margin: '0 auto 48px',
          }}>
            Vocês contam a história. Nossa IA cria o perfil do casal.
            Agências competem. O destino é uma surpresa até o reveal.
          </p>

          {/* CTAs */}
          <div className="hero-cta" style={{display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'}}>
            <a href="/comecar" className="btn-primary" style={{
              backgroundColor: '#2E86C1', color: '#FFFFFF',
              padding: '18px 56px', fontSize: '12px',
              letterSpacing: '0.2em', textDecoration: 'none',
              textTransform: 'uppercase', fontFamily: 'sans-serif',
              transition: 'background-color 0.2s',
            }}>
              Começar nossa história
            </a>
            <a href="#como-funciona" style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.45)',
              textDecoration: 'none', letterSpacing: '0.08em',
              fontFamily: 'sans-serif',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              Ver como funciona <span style={{color: '#F0A500', fontSize: '16px'}}>↓</span>
            </a>
          </div>

          <p style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.2)',
            marginTop: '28px', letterSpacing: '0.12em', fontFamily: 'sans-serif',
          }}>
            Gratuito para casais · Sem compromisso
          </p>
        </div>

        {/* Indicador de scroll */}
        <div style={{
          position: 'absolute', bottom: '36px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        }}>
          <div style={{width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, rgba(240,165,0,0.6))'}} />
        </div>
      </section>

      {/* NÚMEROS */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        borderBottom: '1px solid rgba(10,22,40,0.1)',
      }}>
        {[
          {num: '3', label: 'propostas exclusivas', desc: 'Agências curadas competem pelo casal'},
          {num: '100%', label: 'personalizado', desc: 'Nenhuma viagem igual à outra'},
          {num: '0', label: 'trabalho para vocês', desc: 'A IA e as agências fazem tudo'},
        ].map((item, i) => (
          <div key={item.num} style={{
            padding: '56px 48px', textAlign: 'center',
            borderRight: i < 2 ? '1px solid rgba(10,22,40,0.1)' : 'none',
            backgroundColor: '#E8F4FD',
          }}>
            <div style={{fontSize: '68px', fontWeight: 300, color: '#0A1628', lineHeight: 1, letterSpacing: '-0.03em'}}>{item.num}</div>
            <div style={{fontSize: '10px', letterSpacing: '0.3em', color: '#2E86C1', marginTop: '12px', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>{item.label}</div>
            <div style={{fontSize: '14px', color: '#1B3A6B', fontFamily: 'sans-serif', fontWeight: 300}}>{item.desc}</div>
          </div>
        ))}
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{backgroundColor: '#0A1628', padding: '100px 72px'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px'}}>
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
                <div style={{width: '32px', height: '1px', backgroundColor: '#F0A500'}} />
                <span style={{fontSize: '10px', letterSpacing: '0.45em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>O processo</span>
              </div>
              <h2 style={{fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 400, color: '#FFFFFF', lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0}}>Como funciona</h2>
            </div>
            <p style={{fontSize: '14px', color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif', maxWidth: '260px', textAlign: 'right', lineHeight: 1.8, margin: 0}}>
              Do briefing ao reveal — cuidado por nós e pelas melhores agências do Brasil.
            </p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: 'rgba(255,255,255,0.06)'}}>
            {[
              {num: '01', title: 'Vocês contam a história', desc: 'Nossa IA conduz uma conversa sobre o casal — como se conheceram, o que amam, como viajam juntos.'},
              {num: '02', title: 'Os padrinhos guardam o segredo', desc: 'Pessoas escolhidas por vocês recebem o destino antes e aprovam a proposta da agência.'},
              {num: '03', title: 'Agências competem', desc: 'Agências curadas criam propostas únicas. Vocês veem valor e estilo, sem saber o destino.'},
              {num: '04', title: 'O reveal', desc: 'Vocês escolhem. O destino é revelado. Esse momento é feito para ser filmado e compartilhado.'},
            ].map((item) => (
              <div key={item.num} style={{backgroundColor: '#0A1628', padding: '40px 32px'}}>
                <div style={{fontSize: '48px', fontWeight: 300, color: 'rgba(46,134,193,0.2)', lineHeight: 1, marginBottom: '24px', letterSpacing: '-0.02em'}}>{item.num}</div>
                <div style={{width: '20px', height: '2px', backgroundColor: '#F0A500', marginBottom: '20px'}} />
                <h3 style={{fontSize: '16px', fontWeight: 400, color: '#FFFFFF', lineHeight: 1.4, margin: '0 0 12px'}}>{item.title}</h3>
                <p style={{fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.9, fontFamily: 'sans-serif', fontWeight: 300, margin: 0}}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PADRINHOS */}
      <section style={{backgroundColor: '#E8F4FD', padding: '100px 72px'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center'}}>
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
              <div style={{width: '32px', height: '1px', backgroundColor: '#F0A500'}} />
              <span style={{fontSize: '10px', letterSpacing: '0.45em', color: '#2E86C1', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>Diferencial exclusivo</span>
            </div>
            <h2 style={{fontSize: 'clamp(32px, 3.5vw, 52px)', fontWeight: 400, lineHeight: 1.1, marginBottom: '28px', color: '#0A1628', letterSpacing: '-0.02em'}}>
              Os padrinhos fazem<br />parte da história
            </h2>
            <div style={{width: '40px', height: '2px', backgroundColor: '#2E86C1', marginBottom: '28px'}} />
            <p style={{fontSize: '18px', fontWeight: 300, color: '#1B3A6B', lineHeight: 1.9, marginBottom: '24px', fontFamily: 'sans-serif'}}>
              Vocês escolhem 1 a 3 pessoas de confiança. Elas recebem um convite especial para guardar o segredo do destino.
            </p>
            <p style={{fontSize: '19px', fontStyle: 'italic', color: '#0A1628', lineHeight: 1.6, borderLeft: '3px solid #F0A500', paddingLeft: '20px', margin: 0}}>
              "Vocês foram escolhidos para guardar o segredo."
            </p>
          </div>

          <div style={{backgroundColor: '#0A1628', padding: '48px', position: 'relative'}}>
            <div style={{position: 'absolute', top: '0', left: '48px', width: '72px', height: '2px', backgroundColor: '#F0A500'}} />
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px'}}>
              <div style={{width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#2E86C1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '18px'}}>M</div>
              <div>
                <div style={{fontSize: '16px', color: '#FFFFFF', fontWeight: 400}}>Marina Costa</div>
                <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', fontFamily: 'sans-serif'}}>Madrinha da noiva</div>
              </div>
            </div>
            <p style={{fontSize: '17px', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: '28px'}}>
              "Eles adoram acordar cedo para ver o sol nascer. Ele sempre quis mergulhar. Ela ama vinhos e gastronomia local."
            </p>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F0A500'}} />
              <span style={{fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>Proposta aprovada</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{backgroundColor: '#060d1a', minHeight: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 72px', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '-40%', left: '20%', width: '60vw', height: '80vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(46,134,193,0.2) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none'}} />
        <div style={{position: 'relative', zIndex: 10}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px'}}>
            <div style={{width: '32px', height: '1px', backgroundColor: '#F0A500'}} />
            <span style={{fontSize: '10px', letterSpacing: '0.45em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif'}}>O início de tudo</span>
            <div style={{width: '32px', height: '1px', backgroundColor: '#F0A500'}} />
          </div>
          <h2 style={{fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 400, color: '#FFFFFF', lineHeight: 1.1, maxWidth: '680px', margin: '0 auto 40px', letterSpacing: '-0.02em'}}>
            A história de vocês merece uma viagem à altura
          </h2>
          <a href="/comecar" style={{backgroundColor: '#2E86C1', color: '#FFFFFF', padding: '18px 56px', fontSize: '11px', letterSpacing: '0.22em', textDecoration: 'none', textTransform: 'uppercase', display: 'inline-block', fontFamily: 'sans-serif'}}>
            Começar nossa história
          </a>
          <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '20px', letterSpacing: '0.1em', fontFamily: 'sans-serif'}}>
            Completamente gratuito para casais
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop: '1px solid rgba(46,134,193,0.15)', padding: '36px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E8F4FD'}}>
        <div style={{fontSize: '18px', fontWeight: 300, letterSpacing: '0.3em', color: '#0A1628'}}>Mel de Lua</div>
        <div style={{fontSize: '12px', color: '#1B3A6B', letterSpacing: '0.05em', fontFamily: 'sans-serif'}}>2026 Mel de Lua · Todos os direitos reservados</div>
        <div style={{display: 'flex', gap: '32px', fontSize: '12px', color: '#1B3A6B', fontFamily: 'sans-serif'}}>
          <a href="#" style={{textDecoration: 'none', color: 'inherit'}}>Para agências</a>
          <a href="#" style={{textDecoration: 'none', color: 'inherit'}}>Contato</a>
        </div>
      </footer>

    </main>
  )
}
