export default function Home() {
  return (
    <main style={{backgroundColor: '#FAF7F2', color: '#1a1410', minHeight: '100vh', fontFamily: 'Inter, sans-serif'}}>

      {/* HEADER */}
      <header style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 64px', borderBottom: '1px solid #e8e0d5', position: 'sticky', top: 0, backgroundColor: '#FAF7F2', zIndex: 100, height: '70px'}}>
        <div style={{fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 300, letterSpacing: '0.3em', color: '#8B6914'}}>
          Mel de Lua
        </div>
        <nav style={{display: 'flex', gap: '48px', fontSize: '13px', letterSpacing: '0.12em', color: '#8a7a6a'}}>
          <a href="#como-funciona" style={{textDecoration: 'none', color: 'inherit'}}>Como funciona</a>
          <a href="#agencias" style={{textDecoration: 'none', color: 'inherit'}}>Para agências</a>
        </nav>
        <a href="/comecar" style={{fontSize: '12px', letterSpacing: '0.15em', border: '1px solid #8B6914', color: '#8B6914', padding: '10px 24px', textDecoration: 'none', textTransform: 'uppercase'}}>
          Começar
        </a>
      </header>

      {/* HERO */}
      <section style={{display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 70px)', overflow: 'hidden'}}>

        {/* TEXTO */}
        <div style={{padding: '48px 56px 48px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <p style={{fontSize: '11px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '28px'}}>
            A plataforma de lua de mel do Brasil
          </p>
          <h1 style={{fontFamily: 'Georgia, serif', fontSize: 'clamp(52px, 5.5vw, 82px)', fontWeight: 400, lineHeight: 1.08, marginBottom: '28px', color: '#1a1410'}}>
            A lua de mel
            <br />
            dos <em style={{color: '#8B6914', fontStyle: 'italic'}}>sonhos</em>
            <br />
            de vocês
          </h1>
          <div style={{width: '56px', height: '1px', backgroundColor: '#C9A84C', marginBottom: '28px'}} />
          <p style={{fontSize: '19px', fontFamily: 'Georgia, serif', fontWeight: 300, lineHeight: 1.85, color: '#5a4a3a', marginBottom: '40px'}}>
            Vocês contam a história de vocês.<br/>
            Nossa IA cria o perfil do casal.<br/>
            As melhores agências competem para criar<br/>
            a viagem perfeita — e o destino é uma<br/>
            surpresa até o reveal.
          </p>
          <div style={{display: 'flex', gap: '28px', alignItems: 'center'}}>
            <a href="/comecar" style={{backgroundColor: '#8B6914', color: '#FAF7F2', padding: '16px 48px', fontSize: '13px', letterSpacing: '0.18em', textDecoration: 'none', textTransform: 'uppercase'}}>
              Começar nossa história
            </a>
            <a href="#como-funciona" style={{fontSize: '14px', color: '#8a7a6a', textDecoration: 'none', letterSpacing: '0.05em'}}>
              Ver como funciona
            </a>
          </div>
          <p style={{fontSize: '13px', color: '#b0a090', marginTop: '22px', letterSpacing: '0.08em'}}>
            Gratuito para casais · Sem compromisso
          </p>
        </div>

        {/* IMAGEM */}
        <div style={{position: 'relative', overflow: 'hidden', borderLeft: '2px solid #C9A84C'}}>
          <img
            src="/hero.png"
            alt="Mel de Lua"
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center'}}
          />
        </div>
      </section>

      {/* DIVISOR */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 64px', gap: '20px'}}>
        <div style={{flex: 1, height: '1px', backgroundColor: '#e8e0d5'}} />
        <div style={{fontSize: '18px', color: '#C9A84C', letterSpacing: '0.4em'}}>* * *</div>
        <div style={{flex: 1, height: '1px', backgroundColor: '#e8e0d5'}} />
      </div>

      {/* NUMEROS */}
      <section style={{padding: '72px 64px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '900px', margin: '0 auto', textAlign: 'center'}}>
        {[
          {num: '3', label: 'propostas exclusivas'},
          {num: '100%', label: 'personalizado'},
          {num: '0', label: 'trabalho para vocês'},
        ].map((item) => (
          <div key={item.num}>
            <div style={{fontFamily: 'Georgia, serif', fontSize: '64px', fontWeight: 300, color: '#8B6914', lineHeight: 1}}>{item.num}</div>
            <div style={{fontSize: '11px', letterSpacing: '0.25em', color: '#8a7a6a', marginTop: '12px', textTransform: 'uppercase'}}>{item.label}</div>
          </div>
        ))}
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{backgroundColor: '#F3EDE3', padding: '100px 64px'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '72px'}}>
            <p style={{fontSize: '11px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '16px'}}>O processo</p>
            <h2 style={{fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 400, color: '#1a1410'}}>Como funciona</h2>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '48px'}}>
            {[
              {num: '01', title: 'Vocês contam a história', desc: 'Nossa IA conduz uma conversa sobre o casal — como se conheceram, o que amam, como viajam juntos.'},
              {num: '02', title: 'Os padrinhos guardam o segredo', desc: 'Pessoas escolhidas por vocês recebem o destino antes e aprovam a proposta da agência.'},
              {num: '03', title: 'Agências competem', desc: 'Agências curadas criam propostas únicas. Vocês veem valor e estilo, sem saber o destino.'},
              {num: '04', title: 'O reveal', desc: 'Vocês escolhem. O destino é revelado. Esse momento é feito para ser filmado e compartilhado.'},
            ].map((item) => (
              <div key={item.num}>
                <div style={{fontFamily: 'Georgia, serif', fontSize: '48px', fontWeight: 300, color: '#d4c4a8', lineHeight: 1, marginBottom: '20px'}}>{item.num}</div>
                <div style={{width: '24px', height: '1px', backgroundColor: '#C9A84C', marginBottom: '16px'}} />
                <h3 style={{fontSize: '16px', fontWeight: 400, color: '#1a1410', marginBottom: '12px', lineHeight: 1.4, fontFamily: 'Georgia, serif'}}>{item.title}</h3>
                <p style={{fontSize: '14px', color: '#7a6a5a', lineHeight: 1.8, fontWeight: 300}}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PADRINHOS */}
      <section style={{padding: '100px 64px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center'}}>
        <div>
          <p style={{fontSize: '11px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '20px'}}>Diferencial exclusivo</p>
          <h2 style={{fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 400, lineHeight: 1.3, marginBottom: '24px', color: '#1a1410'}}>
            Os padrinhos fazem parte da história
          </h2>
          <div style={{width: '40px', height: '1px', backgroundColor: '#C9A84C', marginBottom: '24px'}} />
          <p style={{fontSize: '18px', fontFamily: 'Georgia, serif', fontWeight: 300, color: '#5a4a3a', lineHeight: 1.9, marginBottom: '20px'}}>
            Vocês escolhem 1 a 3 pessoas de confiança. Elas recebem um convite especial para guardar o segredo do destino.
          </p>
          <p style={{fontSize: '17px', fontStyle: 'italic', color: '#C9A84C', fontFamily: 'Georgia, serif', lineHeight: 1.6}}>
            "Vocês foram escolhidos para guardar o segredo."
          </p>
        </div>
        <div style={{backgroundColor: '#F3EDE3', border: '1px solid #e2d8c8', padding: '48px', position: 'relative'}}>
          <div style={{position: 'absolute', top: '-1px', left: '48px', width: '72px', height: '2px', backgroundColor: '#C9A84C'}} />
          <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px'}}>
            <div style={{width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FAF7F2', fontSize: '18px', fontFamily: 'Georgia, serif'}}>M</div>
            <div>
              <div style={{fontSize: '16px', color: '#1a1410', fontWeight: 400}}>Marina Costa</div>
              <div style={{fontSize: '12px', color: '#8a7a6a', letterSpacing: '0.05em'}}>Madrinha da noiva</div>
            </div>
          </div>
          <p style={{fontSize: '17px', fontFamily: 'Georgia, serif', fontWeight: 300, color: '#5a4a3a', lineHeight: 1.9, marginBottom: '28px', fontStyle: 'italic'}}>
            "Eles adoram acordar cedo para ver o sol nascer. Ele sempre quis mergulhar. Ela ama vinhos e gastronomia local."
          </p>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <div style={{width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#C9A84C'}} />
            <span style={{fontSize: '11px', letterSpacing: '0.2em', color: '#8a7a6a', textTransform: 'uppercase'}}>Proposta aprovada</span>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{position: 'relative', overflow: 'hidden', minHeight: '560px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <img src="/hero.png" alt="" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.22)'}} />
        <div style={{position: 'absolute', inset: 0, backgroundColor: 'rgba(26,20,16,0.55)'}} />
        <div style={{position: 'relative', zIndex: 10, padding: '80px 48px'}}>
          <p style={{fontSize: '11px', letterSpacing: '0.4em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '28px'}}>O início de tudo</p>
          <h2 style={{fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4.5vw, 60px)', fontWeight: 400, color: '#FAF7F2', lineHeight: 1.2, maxWidth: '680px', margin: '0 auto'}}>
            A história de vocês merece uma viagem à altura
          </h2>
          <div style={{width: '48px', height: '1px', backgroundColor: '#C9A84C', margin: '32px auto 44px'}} />
          <a href="/comecar" style={{backgroundColor: 'transparent', color: '#C9A84C', padding: '16px 52px', fontSize: '13px', letterSpacing: '0.2em', textDecoration: 'none', textTransform: 'uppercase', border: '1px solid #C9A84C', display: 'inline-block'}}>
            Começar nossa história
          </a>
          <p style={{fontSize: '12px', color: '#7a6a5a', marginTop: '20px', letterSpacing: '0.1em'}}>Completamente gratuito para casais</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop: '1px solid #e8e0d5', padding: '40px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 300, letterSpacing: '0.25em', color: '#8B6914'}}>Mel de Lua</div>
        <div style={{fontSize: '12px', color: '#b0a090', letterSpacing: '0.05em'}}>2025 Mel de Lua · Todos os direitos reservados</div>
        <div style={{display: 'flex', gap: '32px', fontSize: '12px', color: '#8a7a6a', letterSpacing: '0.05em'}}>
          <a href="#" style={{textDecoration: 'none', color: 'inherit'}}>Para agências</a>
          <a href="#" style={{textDecoration: 'none', color: 'inherit'}}>Contato</a>
        </div>
      </footer>

    </main>
  )
}
