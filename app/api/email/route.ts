import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY!
const FROM_EMAIL = 'Mel de Lua <ola@meldelua.com.br>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mel-de-lua.vercel.app'

// ——— HELPER: enviar e-mail via Resend ———
async function enviarEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
    throw new Error(`Resend error: ${err}`)
  }
  return res.json()
}

// ——— ESTILOS BASE ———
const baseStyle = `
  body { margin:0; padding:0; background:#f5f5f5; font-family: Georgia, serif; }
  .wrapper { max-width:600px; margin:0 auto; background:#060d1a; }
  .header { padding:32px 40px; border-bottom:1px solid rgba(255,255,255,0.06); }
  .logo { font-size:18px; font-weight:300; letter-spacing:0.35em; color:#FFFFFF; }
  .gold-line { display:flex; align-items:center; gap:12px; margin-top:8px; }
  .gold-bar { width:20px; height:1px; background:#F0A500; }
  .gold-text { font-size:9px; letter-spacing:0.4em; color:#F0A500; text-transform:uppercase; font-family:sans-serif; }
  .body { padding:40px; }
  .title { font-size:28px; font-weight:400; color:#FFFFFF; line-height:1.2; margin:0 0 16px; letter-spacing:-0.02em; }
  .text { font-size:14px; color:rgba(255,255,255,0.55); line-height:1.9; margin:0 0 16px; font-family:sans-serif; font-weight:300; }
  .highlight { background:rgba(46,134,193,0.1); border:1px solid rgba(46,134,193,0.2); padding:20px 24px; margin:24px 0; }
  .highlight-label { font-size:9px; letter-spacing:0.3em; color:#2E86C1; text-transform:uppercase; font-family:sans-serif; margin-bottom:6px; }
  .highlight-value { font-size:18px; color:#FFFFFF; font-family:monospace; letter-spacing:0.1em; }
  .btn { display:inline-block; background:#2E86C1; color:#FFFFFF; padding:14px 40px; font-size:11px; letter-spacing:0.2em; text-decoration:none; text-transform:uppercase; font-family:sans-serif; margin:8px 0; }
  .divider { border:none; border-top:1px solid rgba(255,255,255,0.06); margin:28px 0; }
  .footer { padding:24px 40px; border-top:1px solid rgba(255,255,255,0.06); }
  .footer-text { font-size:11px; color:rgba(255,255,255,0.2); font-family:sans-serif; line-height:1.8; }
  .gold-accent { color:#F0A500; }
  .secret-box { background:rgba(240,165,0,0.07); border:2px solid rgba(240,165,0,0.3); padding:28px; text-align:center; margin:24px 0; }
  .secret-emoji { font-size:40px; margin-bottom:12px; }
  .secret-title { font-size:22px; font-weight:400; color:#FFFFFF; margin:0 0 8px; }
  .secret-sub { font-size:13px; color:rgba(255,255,255,0.5); font-family:sans-serif; line-height:1.8; margin:0; }
`

function emailBase(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyle}</style></head><body><div class="wrapper">${content}<div class="footer"><p class="footer-text">Mel de Lua · A lua de mel dos sonhos de vocês<br><a href="${BASE_URL}/legal" style="color:rgba(255,255,255,0.2)">Política de Privacidade</a> · <a href="${BASE_URL}/legal" style="color:rgba(255,255,255,0.2)">Termos de Uso</a></p></div></div></body></html>`
}

function header() {
  return `<div class="header"><div class="logo">Mel de Lua</div><div class="gold-line"><div class="gold-bar"></div><span class="gold-text">A lua de mel dos seus sonhos</span><div class="gold-bar"></div></div></div>`
}

// ——— TEMPLATES ———

// 1. Boas-vindas do casal com senha
function emailBoasVindasCasal(nome1: string, nome2: string, email: string, senha: string) {
  return emailBase(`${header()}<div class="body">
    <p class="text" style="margin-bottom:8px">Oi, <strong style="color:#FFFFFF">${nome1} & ${nome2}</strong>!</p>
    <h1 class="title">Seu briefing foi recebido com sucesso 🎉</h1>
    <p class="text">A Mel adorou conhecer a história de vocês. Agora nosso time vai revisar o perfil e logo as agências parceiras receberão o briefing para criar propostas incríveis.</p>
    <p class="text">Enquanto isso, acessem o painel de vocês para acompanhar tudo:</p>
    <div class="highlight">
      <div class="highlight-label">E-mail de acesso</div>
      <div class="highlight-value" style="font-size:14px;font-family:sans-serif">${email}</div>
      <div class="highlight-label" style="margin-top:16px">Senha de acesso</div>
      <div class="highlight-value">${senha}</div>
    </div>
    <a href="${BASE_URL}/casal/login" class="btn">Acessar nosso painel</a>
    <hr class="divider">
    <p class="text" style="font-size:12px">Recomendamos que alterem a senha no primeiro acesso. Em caso de dúvidas, respondam este e-mail.</p>
  </div>`)
}

// 2. Propostas chegaram
function emailPropostasDisponiveis(nome1: string, nome2: string) {
  return emailBase(`${header()}<div class="body">
    <p class="text" style="margin-bottom:8px">Oi, <strong style="color:#FFFFFF">${nome1} & ${nome2}</strong>!</p>
    <h1 class="title">As propostas chegaram ✈️</h1>
    <p class="text">As agências parceiras analisaram o perfil de vocês e prepararam propostas especiais. Cada uma foi criada pensando na história de vocês — e o destino ainda é surpresa!</p>
    <p class="text">Acessem o painel, leiam as propostas com calma e, quando estiverem prontos, façam o reveal juntos.</p>
    <a href="${BASE_URL}/casal/login" class="btn">Ver nossas propostas</a>
    <hr class="divider">
    <p class="text" style="font-size:12px;color:rgba(255,255,255,0.3)">Lembrem: o destino só é revelado após vocês escolherem uma proposta e os padrinhos aprovarem. 🤫</p>
  </div>`)
}

// 3. Lembrete reveal
function emailLembreteReveal(nome1: string, nome2: string) {
  return emailBase(`${header()}<div class="body">
    <p class="text" style="margin-bottom:8px">Oi, <strong style="color:#FFFFFF">${nome1} & ${nome2}</strong>!</p>
    <h1 class="title">Os padrinhos aprovaram! 🎊</h1>
    <p class="text">Temos uma novidade — os padrinhos de vocês já aprovaram a proposta escolhida. Isso significa que vocês já podem fazer o <span class="gold-accent">reveal do destino</span>!</p>
    <p class="text">Escolham um momento especial para abrir juntos — esse instante foi feito para ser inesquecível.</p>
    <a href="${BASE_URL}/casal/login" class="btn">✨ Fazer o reveal agora</a>
  </div>`)
}

// 4. Convite padrinho
function emailConvitePadrinho(nomePadrinho: string, nome1: string, nome2: string, tokenUrl: string) {
  return emailBase(`${header()}<div class="body">
    <p class="text" style="margin-bottom:8px">Oi, <strong style="color:#FFFFFF">${nomePadrinho}</strong>!</p>
    <h1 class="title">Você foi escolhido para guardar um segredo 🤫</h1>
    <p class="text"><strong style="color:#FFFFFF">${nome1} & ${nome2}</strong> escolheram você como uma das pessoas de confiança para conhecer o destino da lua de mel deles — antes de todo mundo.</p>
    <div class="secret-box">
      <div class="secret-emoji">🤫</div>
      <div class="secret-title">O segredo é seu agora</div>
      <p class="secret-sub">Ao acessar o portal, você verá o destino escolhido para eles e poderá deixar uma mensagem especial. O casal só descobre na hora do reveal!</p>
    </div>
    <a href="${tokenUrl}" class="btn">Aceitar o convite</a>
    <hr class="divider">
    <p class="text" style="font-size:12px;color:rgba(255,255,255,0.3)">Este link é exclusivo para você. Por favor, não compartilhe com ${nome1} ou ${nome2}. 💛</p>
  </div>`)
}

// 5. Agência — novo briefing
function emailAgenciaNovoBriefing(nomeAgencia: string) {
  return emailBase(`${header()}<div class="body">
    <h1 class="title">Novo briefing disponível 📋</h1>
    <p class="text">Olá, <strong style="color:#FFFFFF">${nomeAgencia}</strong>!</p>
    <p class="text">Um novo casal completou o briefing e está aguardando propostas. O perfil já está disponível no painel — incluindo as recomendações de destino geradas pela nossa IA.</p>
    <p class="text">Analise o perfil com atenção e crie uma proposta que surpreenda. Lembre que o destino deve ser mantido em segredo até o reveal do casal!</p>
    <a href="${BASE_URL}/agencia/login" class="btn">Ver briefing e criar proposta</a>
    <hr class="divider">
    <p class="text" style="font-size:12px;color:rgba(255,255,255,0.3)">Propostas enviadas rapidamente têm maior destaque. Boa sorte! ✈️</p>
  </div>`)
}

// 6. Agência — proposta escolhida
function emailAgenciaPropostaEscolhida(nomeAgencia: string, destino: string, nomeCasal: string) {
  return emailBase(`${header()}<div class="body">
    <h1 class="title">Parabéns — proposta escolhida! 🎉</h1>
    <p class="text">Olá, <strong style="color:#FFFFFF">${nomeAgencia}</strong>!</p>
    <p class="text">Ótima notícia: <strong style="color:#FFFFFF">${nomeCasal}</strong> escolheu a proposta de vocês para a lua de mel em <span class="gold-accent">${destino}</span>!</p>
    <p class="text">Nossa equipe entrará em contato em breve para alinhar os próximos passos e processar a comissão. Enquanto isso, já podem iniciar o contato com o casal para organizar os detalhes da viagem.</p>
    <a href="${BASE_URL}/agencia/login" class="btn">Ver detalhes no painel</a>
    <hr class="divider">
    <p class="text" style="font-size:12px;color:rgba(255,255,255,0.3)">A comissão será processada conforme os termos acordados. Obrigado por fazer parte do Mel de Lua! 💛</p>
  </div>`)
}

// 7. Admin — novo briefing para revisar
function emailAdminNovoBriefing(nome1: string, nome2: string, email: string) {
  return emailBase(`${header()}<div class="body">
    <h1 class="title">Novo briefing aguardando revisão</h1>
    <p class="text">Um novo casal completou o briefing com a Mel e está aguardando sua revisão antes de ser liberado para as agências.</p>
    <div class="highlight">
      <div class="highlight-label">Casal</div>
      <div class="highlight-value" style="font-size:16px;font-family:sans-serif">${nome1} & ${nome2}</div>
      <div class="highlight-label" style="margin-top:12px">E-mail</div>
      <div class="highlight-value" style="font-size:14px;font-family:sans-serif">${email}</div>
    </div>
    <a href="${BASE_URL}/admin/painel" class="btn">Revisar briefing no admin</a>
  </div>`)
}

// ——— HANDLER PRINCIPAL ———
export async function POST(req: NextRequest) {
  try {
    const { tipo, dados } = await req.json()

    switch (tipo) {

      case 'boas_vindas_casal': {
        const { nome1, nome2, email, senha } = dados
        await enviarEmail(email, '🍯 Seu briefing foi recebido — acesse o painel', emailBoasVindasCasal(nome1, nome2, email, senha))
        break
      }

      case 'propostas_disponiveis': {
        const { nome1, nome2, email } = dados
        await enviarEmail(email, '✈️ As propostas de lua de mel chegaram!', emailPropostasDisponiveis(nome1, nome2))
        break
      }

      case 'lembrete_reveal': {
        const { nome1, nome2, email } = dados
        await enviarEmail(email, '🎊 Os padrinhos aprovaram — hora do reveal!', emailLembreteReveal(nome1, nome2))
        break
      }

      case 'convite_padrinho': {
        const { nomePadrinho, nome1, nome2, emailPadrinho, token } = dados
        const tokenUrl = `${BASE_URL}/padrinhos?token=${token}`
        await enviarEmail(emailPadrinho, `🤫 ${nome1} & ${nome2} escolheram você para guardar um segredo`, emailConvitePadrinho(nomePadrinho, nome1, nome2, tokenUrl))
        break
      }

      case 'agencia_novo_briefing': {
        const { nomeAgencia, emailAgencia } = dados
        await enviarEmail(emailAgencia, '📋 Novo briefing disponível no Mel de Lua', emailAgenciaNovoBriefing(nomeAgencia))
        break
      }

      case 'agencia_proposta_escolhida': {
        const { nomeAgencia, emailAgencia, destino, nomeCasal } = dados
        await enviarEmail(emailAgencia, `🎉 Sua proposta foi escolhida — ${destino}`, emailAgenciaPropostaEscolhida(nomeAgencia, destino, nomeCasal))
        break
      }

      case 'admin_novo_briefing': {
        const { nome1, nome2, email } = dados
        const adminEmail = process.env.ADMIN_EMAIL || 'prodianascerfeliz@gmail.com'
        await enviarEmail(adminEmail, `📋 Novo briefing para revisar — ${nome1} & ${nome2}`, emailAdminNovoBriefing(nome1, nome2, email))
        break
      }

      default:
        return NextResponse.json({ error: 'Tipo de e-mail inválido' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
    return NextResponse.json({ error: 'Erro ao enviar e-mail' }, { status: 500 })
  }
}
