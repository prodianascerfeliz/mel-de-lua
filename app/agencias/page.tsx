'use client'

import { useState } from 'react'

export default function Agencias() {
  const [faqAberto, setFaqAberto] = useState<number | null>(null)
  const [form, setForm] = useState({ nome: '', agencia: '', cnpj: '', email: '', telefone: '', cidade: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setErro('')
    try {
      // Notificar admin por e-mail
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'admin_novo_briefing',
          dados: {
            nome1: `Nova agência interessada: ${form.agencia}`,
            nome2: `${form.nome} · ${form.cidade} · Tel: ${form.telefone} · CNPJ: ${form.cnpj}`,
            email: form.email
          }
        }),
      })
      setEnviado(true)
    } catch {
      setErro('Erro ao enviar. Tente novamente ou nos contate pelo WhatsApp.')
    }
    setEnviando(false)
  }

  const faqs = [
    { q: 'Quanto custa para minha agência participar?', a: 'O credenciamento é completamente gratuito. O modelo comercial é baseado em resultado — os detalhes são apresentados durante o processo de credenciamento da sua agência.' },
    { q: 'Como recebo os briefings dos casais?', a: 'Após aprovação, você recebe acesso ao painel da agência onde os briefings ficam disponíveis. Cada briefing inclui o perfil do casal e as recomendações de destino geradas pela nossa IA. Você também é notificado por e-mail a cada novo briefing.' },
    { q: 'Quantas agências competem por cada casal?', a: 'Trabalhamos com no máximo 3 agências por briefing — garantindo que cada proposta tenha visibilidade real e que o casal não seja sobrecarregado de opções.' },
    { q: 'O casal sabe o destino antes de escolher?', a: 'Não. Esse é o nosso diferencial. O casal vê o valor, a duração e o estilo da viagem — mas o destino só é revelado após a escolha. Isso cria um momento de reveal único e viral.' },
    { q: 'Que tipo de agência vocês buscam?', a: 'Buscamos agências especializadas em viagens internacionais e/ou experiências premium, com capacidade de criar roteiros personalizados e surpresa. Não trabalhamos com pacotes prontos ou viagens domésticas simples.' },
    { q: 'Quanto tempo leva para ser credenciada?', a: 'Após o envio do formulário, nossa equipe entra em contato em até 48h. O processo de credenciamento é simples e rápido — na maioria dos casos a agência está operando no painel em menos de uma semana.' },
  ]

  return (
    <main style={{ backgroundColor: '#060d1a', minHeight: '100vh', fontFamily: "'Georgia', serif", color: '#FFFFFF' }}>
      <style>{`
        @keyframes aurora1 { 0%{transform:translateX(-20%) scale(1);opacity:.3} 50%{transform:translateX(10%) scale(1.1);opacity:.5} 100%{transform:translateX(-20%) scale(1);opacity:.3} }
        @keyframes aurora2 { 0%{transform:translateX(20%) scale(1.1);opacity:.2} 50%{transform:translateX(-10%) scale(.9);opacity:.35} 100%{transform:translateX(20%) scale(1.1);opacity:.2} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.8s ease forwards; }
        .faq-btn:hover { border-color: rgba(240,165,0,0.3) !important; }
        .step-card:hover { border-color: rgba(46,134,193,0.3) !important; transform: translateY(-2px); }
        .benefit-card:hover { border-color: rgba(240,165,0,0.25) !important; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(46,134,193,0.5) !important; }
        .submit-btn:hover:not(:disabled) { background-color: #1a6fa8 !important; }
        @media(max-width:768px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .benefits-grid { grid-template-columns: 1fr !important; }
          .comissoes-grid { grid-template-columns: 1fr !important; }
          .depo-grid { grid-template-columns: 1fr !important; }
          .form-row { grid-template-columns: 1fr !important; }
          .hero-pad { padding: 100px 28px 60px !important; }
          .section-pad { padding: 64px 28px !important; }
        }
      `}</style>

      {/* Aurora */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-30%', left: '-20%', width: '80vw', height: '80vh', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(46,134,193,0.35) 0%,transparent 70%)', animation: 'aurora1 14s ease-in-out infinite', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: '70vw', height: '70vh', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,160,140,0.2) 0%,transparent 70%)', animation: 'aurora2 18s ease-in-out infinite', filter: 'blur(90px)' }} />
      </div>

      {/* HEADER */}
      <header style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', backgroundColor: 'rgba(6,13,26,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '18px', fontWeight: 300, letterSpacing: '0.35em', color: '#FFFFFF' }}>Mel de Lua</span>
        </a>
        <a href="#cadastro" style={{ backgroundColor: '#2E86C1', color: '#FFFFFF', padding: '9px 24px', fontSize: '11px', letterSpacing: '0.2em', textDecoration: 'none', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
          Quero ser parceira
        </a>
      </header>

      {/* HERO */}
      <section className="hero-pad" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 48px 80px', position: 'relative', zIndex: 10 }}>
        <div className="fade-up" style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '28px', height: '1px', backgroundColor: '#F0A500' }} />
            <span style={{ fontSize: '10px', letterSpacing: '0.45em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>Para agências de viagem</span>
            <div style={{ width: '28px', height: '1px', backgroundColor: '#F0A500' }} />
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 80px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
            Casais prontos para comprar.<br />
            <em style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(46,180,200,0.9)', fontStyle: 'italic' }}>Sem prospecção.</em>
          </h1>
          <div style={{ width: '48px', height: '2px', backgroundColor: '#F0A500', margin: '0 auto 24px' }} />
          <p style={{ fontSize: '18px', fontWeight: 300, color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', lineHeight: 1.85, marginBottom: '44px', maxWidth: '560px', margin: '0 auto 44px' }}>
            O Mel de Lua conecta sua agência a casais de noivos de alta renda com briefing completo, perfil emocional e orçamento definido — prontos para receber propostas.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#cadastro" style={{ backgroundColor: '#2E86C1', color: '#FFFFFF', padding: '16px 48px', fontSize: '12px', letterSpacing: '0.2em', textDecoration: 'none', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
              Quero ser parceira
            </a>
            <a href="#como-funciona" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', letterSpacing: '0.08em', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Ver como funciona <span style={{ color: '#F0A500' }}>↓</span>
            </a>
          </div>
        </div>

        {/* Números de impacto */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)', marginTop: '80px', width: '100%', maxWidth: '640px' }}>
          {[
            { num: '0', label: 'custo para entrar' },
            { num: '3', label: 'agências por casal' },
            { num: '100%', label: 'casais qualificados' },
          ].map(item => (
            <div key={item.num} style={{ padding: '28px 20px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: '36px', fontWeight: 300, color: '#FFFFFF', letterSpacing: '-0.02em' }}>{item.num}</div>
              <div style={{ fontSize: '10px', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginTop: '6px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="section-pad" style={{ padding: '80px 64px', position: 'relative', zIndex: 10, backgroundColor: 'rgba(10,22,40,0.6)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '24px', height: '1px', backgroundColor: '#F0A500' }} />
              <span style={{ fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>O modelo</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, margin: 0, letterSpacing: '-0.02em' }}>Como funciona para você</h2>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { num: '01', icon: '📋', title: 'Briefing qualificado chega', desc: 'O casal conversa com nossa IA e gera um perfil completo — história, personalidade, orçamento, estilo de viagem e restrições. Você recebe um briefing rico, não um formulário genérico.' },
              { num: '02', icon: '✨', title: 'IA recomenda 2 destinos', desc: 'Nosso motor de recomendação analisa o perfil e sugere 2 destinos surpreendentes e personalizados. Você precifica os dois e cria propostas únicas para esse casal específico.' },
              { num: '03', icon: '🤫', title: 'Casal escolhe sem saber o destino', desc: 'O casal vê o valor, duração e estilo — mas o destino é surpresa. Padrinhos aprovam antes do reveal. Isso cria um momento viral que vai além da viagem.' },
              { num: '04', icon: '🎉', title: 'Reveal e fechamento', desc: 'Casal escolhe, destino é revelado, você fecha a venda. Comissão processada em até 30 dias após confirmação do pagamento.' },
            ].map((step, i) => (
              <div key={step.num} className="step-card" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '28px 24px', transition: 'all 0.2s' }}>
                <div style={{ fontSize: '36px', fontWeight: 300, color: 'rgba(46,134,193,0.2)', marginBottom: '16px', letterSpacing: '-0.02em' }}>{step.num}</div>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>{step.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 400, color: '#FFFFFF', margin: '0 0 10px', lineHeight: 1.4 }}>{step.title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontFamily: 'sans-serif', lineHeight: 1.85, margin: 0, fontWeight: 300 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUE SER PARCEIRA */}
      <section className="section-pad" style={{ padding: '80px 64px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '24px', height: '1px', backgroundColor: '#F0A500' }} />
              <span style={{ fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>Diferenciais</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, margin: 0, letterSpacing: '-0.02em' }}>Por que ser parceira Mel de Lua</h2>
          </div>

          <div className="benefits-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { icon: '🎯', title: 'Leads 100% qualificados', desc: 'Nada de cold call ou curiosos. Cada casal que chega até você já passou por um briefing completo, tem orçamento definido e está pronto para comprar.' },
              { icon: '💰', title: 'Ticket alto por natureza', desc: 'Luas de mel são compras emocionais de alto valor. O perfil dos casais do Mel de Lua é AA, A e B aspiracional — exatamente o público que justifica suas margens.' },
              { icon: '🤖', title: 'IA trabalha por você', desc: 'Nossa IA já recomendou os destinos ideais baseada no perfil do casal. Você não precisa descobrir do zero — só precisa criar a melhor proposta para aquele perfil.' },
              { icon: '🏆', title: 'Máximo 3 agências por casal', desc: 'Não é um marketplace com 50 agências competindo. Curadoria rigorosa garante que sua proposta tenha visibilidade real e chance justa de ser escolhida.' },
              { icon: '📱', title: 'Painel completo', desc: 'Acesse briefings, envie propostas, acompanhe status e veja seu histórico de viagens fechadas em um painel simples e elegante — sem planilhas ou e-mails perdidos.' },
              { icon: '💛', title: 'Comissão só no fechamento', desc: 'Zero risco. Você só paga quando a viagem é vendida. Não há mensalidade, taxa de cadastro ou custo por lead — apenas resultado.' },
            ].map(b => (
              <div key={b.title} className="benefit-card" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: '28px', transition: 'border-color 0.2s' }}>
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{b.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 400, color: '#FFFFFF', margin: '0 0 10px' }}>{b.title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontFamily: 'sans-serif', lineHeight: 1.85, margin: 0, fontWeight: 300 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="section-pad" style={{ padding: '80px 64px', backgroundColor: 'rgba(10,22,40,0.6)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '24px', height: '1px', backgroundColor: '#F0A500' }} />
              <span style={{ fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>Parceiras</span>
              <div style={{ width: '24px', height: '1px', backgroundColor: '#F0A500' }} />
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, margin: 0, letterSpacing: '-0.02em' }}>O que dizem nossas parceiras</h2>
          </div>

          <div className="depo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { nome: 'Marina Cavalcanti', agencia: 'Travessia Viagens', cidade: 'São Paulo, SP', depo: 'Os casais chegam com um nível de clareza que nunca vi antes. O briefing da Mel é genuinamente diferente — é emocional, é profundo. Montar propostas para esses perfis é prazeroso.' },
              { nome: 'Ricardo Paes', agencia: 'Mundo Afora Turismo', cidade: 'Rio de Janeiro, RJ', depo: 'Fechei R$85k em viagens no primeiro mês. A curadoria de no máximo 3 agências por casal faz toda a diferença — você sente que tem chance real de ser escolhido.' },
              { nome: 'Fernanda Luz', agencia: 'Lune Viagens', cidade: 'Belo Horizonte, MG', depo: 'O modelo de reveal é genial do ponto de vista comercial. O casal está tão envolvido emocionalmente que a decisão se torna natural. Já indiquei para outras 3 agências amigas.' },
            ].map(d => (
              <div key={d.nome} style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '28px' }}>
                <div style={{ width: '24px', height: '2px', backgroundColor: '#F0A500', marginBottom: '16px' }} />
                <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, margin: '0 0 20px' }}>"{d.depo}"</p>
                <div>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 400 }}>{d.nome}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif', marginTop: '2px' }}>{d.agencia} · {d.cidade}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'sans-serif', marginTop: '20px' }}>* Depoimentos ilustrativos — em breve com parceiras reais</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad" style={{ padding: '80px 64px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '24px', height: '1px', backgroundColor: '#F0A500' }} />
              <span style={{ fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>Dúvidas frequentes</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, margin: 0, letterSpacing: '-0.02em' }}>FAQ</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <button className="faq-btn" onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                  style={{ width: '100%', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', transition: 'border-color 0.2s' }}>
                  <span style={{ fontSize: '15px', color: '#FFFFFF', textAlign: 'left', fontFamily: 'Georgia, serif', fontWeight: 400 }}>{faq.q}</span>
                  <span style={{ color: '#F0A500', fontSize: '18px', flexShrink: 0, transform: faqAberto === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                </button>
                {faqAberto === i && (
                  <div style={{ padding: '0 24px 20px' }}>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif', lineHeight: 1.9, margin: 0, fontWeight: 300 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULÁRIO DE CADASTRO */}
      <section id="cadastro" className="section-pad" style={{ padding: '80px 64px', backgroundColor: 'rgba(10,22,40,0.8)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '24px', height: '1px', backgroundColor: '#F0A500' }} />
              <span style={{ fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>Seja parceira</span>
              <div style={{ width: '24px', height: '1px', backgroundColor: '#F0A500' }} />
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Quero ser agência parceira</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', fontFamily: 'sans-serif', lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
              Preencha o formulário e nossa equipe entrará em contato em até 48h para apresentar o modelo e iniciar o credenciamento.
            </p>
          </div>

          {!enviado ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '7px' }}>Seu nome *</label>
                  <input type="text" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required placeholder="Nome completo"
                    style={{ width: '100%', padding: '12px 14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '14px', fontFamily: 'sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '7px' }}>Nome da agência *</label>
                  <input type="text" value={form.agencia} onChange={e => setForm({ ...form, agencia: e.target.value })} required placeholder="Nome fantasia"
                    style={{ width: '100%', padding: '12px 14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '14px', fontFamily: 'sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '7px' }}>CNPJ</label>
                  <input type="text" value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00"
                    style={{ width: '100%', padding: '12px 14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '14px', fontFamily: 'sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '7px' }}>Cidade *</label>
                  <input type="text" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} required placeholder="Cidade / Estado"
                    style={{ width: '100%', padding: '12px 14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '14px', fontFamily: 'sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '7px' }}>E-mail *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="contato@agencia.com"
                    style={{ width: '100%', padding: '12px 14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '14px', fontFamily: 'sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '7px' }}>Telefone / WhatsApp *</label>
                  <input type="tel" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} required placeholder="(11) 99999-9999"
                    style={{ width: '100%', padding: '12px 14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '14px', fontFamily: 'sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
                </div>
              </div>

              {erro && (
                <div style={{ padding: '12px 16px', backgroundColor: 'rgba(220,60,60,0.15)', border: '1px solid rgba(220,60,60,0.3)', fontSize: '13px', color: '#ff8080', fontFamily: 'sans-serif' }}>{erro}</div>
              )}

              <button type="submit" disabled={enviando} className="submit-btn"
                style={{ backgroundColor: '#2E86C1', color: '#FFFFFF', padding: '15px', fontSize: '12px', letterSpacing: '0.2em', border: 'none', textTransform: 'uppercase', fontFamily: 'sans-serif', cursor: enviando ? 'wait' : 'pointer', transition: 'background-color 0.2s', marginTop: '8px', opacity: enviando ? 0.7 : 1 }}>
                {enviando ? 'Enviando...' : 'Enviar cadastro'}
              </button>

              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', fontFamily: 'sans-serif', marginTop: '4px' }}>
                Retornamos em até 48h · Sem compromisso
              </p>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'rgba(61,214,140,0.05)', border: '1px solid rgba(61,214,140,0.15)' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
              <h3 style={{ fontSize: '24px', fontWeight: 400, color: '#FFFFFF', marginBottom: '12px', letterSpacing: '-0.01em' }}>Cadastro recebido!</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', lineHeight: 1.85, margin: '0 auto', maxWidth: '400px' }}>
                Nossa equipe analisará o perfil da <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{form.agencia}</strong> e entrará em contato em até 48h pelo e-mail ou WhatsApp informados.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 10 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '16px', fontWeight: 300, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)' }}>Mel de Lua</span>
        </a>
        <div style={{ display: 'flex', gap: '24px', fontSize: '12px', fontFamily: 'sans-serif' }}>
          <a href="/legal" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Privacidade</a>
          <a href="/legal" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Termos</a>
          <a href="/" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Para casais</a>
        </div>
      </footer>
    </main>
  )
}
