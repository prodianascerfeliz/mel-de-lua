'use client'

import { useState } from 'react'

type Doc = 'privacidade' | 'termos' | 'cookies'

export default function Legal() {
  const [doc, setDoc] = useState<Doc>('privacidade')

  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <main style={{backgroundColor:'#060d1a',minHeight:'100vh',fontFamily:"'Georgia', serif",color:'#FFFFFF'}}>
      <style>{`
        @keyframes aurora1{0%{transform:translateX(-20%) scale(1);opacity:.15}50%{transform:translateX(10%) scale(1.1);opacity:.25}100%{transform:translateX(-20%) scale(1);opacity:.15}}
        .doc-btn:hover{border-color:rgba(46,134,193,0.4)!important;color:#FFFFFF!important;}
        h2{font-size:20px;font-weight:400;color:#FFFFFF;margin:32px 0 12px;letter-spacing:-0.01em;}
        h3{font-size:16px;font-weight:400;color:rgba(255,255,255,0.8);margin:24px 0 8px;}
        p{font-size:14px;color:rgba(255,255,255,0.55);line-height:1.9;margin:0 0 12px;font-family:sans-serif;font-weight:300;}
        ul{margin:0 0 16px;padding-left:20px;}
        ul li{font-size:14px;color:rgba(255,255,255,0.55);line-height:1.9;font-family:sans-serif;font-weight:300;margin-bottom:4px;}
        a{color:rgba(46,134,193,0.8);text-decoration:none;}
        a:hover{text-decoration:underline;}
        hr{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:28px 0;}
        @media(max-width:768px){.layout{flex-direction:column!important;}.sidebar{width:100%!important;flex-direction:row!important;overflow-x:auto!important;gap:8px!important;}.doc-btn{white-space:nowrap!important;}.content{padding:28px 20px!important;}}
      `}</style>

      {/* Aurora sutil */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}>
        <div style={{position:'absolute',top:'-30%',left:'-20%',width:'80vw',height:'80vh',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(46,134,193,0.2) 0%,transparent 70%)',animation:'aurora1 14s ease-in-out infinite',filter:'blur(80px)'}}/>
      </div>

      {/* HEADER */}
      <header style={{height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',backgroundColor:'rgba(6,13,26,0.95)',borderBottom:'1px solid rgba(255,255,255,0.06)',position:'sticky',top:0,zIndex:100}}>
        <a href="/" style={{textDecoration:'none'}}>
          <span style={{fontSize:'18px',fontWeight:300,letterSpacing:'0.35em',color:'#FFFFFF'}}>Mel de Lua</span>
        </a>
        <a href="/" style={{fontSize:'12px',color:'rgba(255,255,255,0.35)',fontFamily:'sans-serif',textDecoration:'none',letterSpacing:'0.1em'}}>← Voltar ao início</a>
      </header>

      <div className="layout" style={{display:'flex',maxWidth:'1100px',margin:'0 auto',position:'relative',zIndex:10}}>

        {/* SIDEBAR */}
        <aside className="sidebar" style={{width:'220px',flexShrink:0,padding:'40px 20px',display:'flex',flexDirection:'column',gap:'4px',position:'sticky',top:'64px',height:'fit-content'}}>
          <p style={{fontSize:'10px',letterSpacing:'0.35em',color:'#F0A500',textTransform:'uppercase',marginBottom:'12px',marginTop:0}}>Documentos</p>
          {([
            {id:'privacidade', label:'Política de Privacidade', icon:'🔒'},
            {id:'termos', label:'Termos de Uso', icon:'📄'},
            {id:'cookies', label:'Política de Cookies', icon:'🍪'},
          ] as {id:Doc,label:string,icon:string}[]).map(item => (
            <button key={item.id} onClick={() => setDoc(item.id)} className="doc-btn"
              style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 14px',background:'none',border:`1px solid ${doc===item.id?'rgba(46,134,193,0.4)':'rgba(255,255,255,0.06)'}`,cursor:'pointer',textAlign:'left',width:'100%',backgroundColor:doc===item.id?'rgba(46,134,193,0.08)':'transparent',transition:'all 0.15s'}}>
              <span style={{fontSize:'14px'}}>{item.icon}</span>
              <span style={{fontSize:'12px',color:doc===item.id?'#FFFFFF':'rgba(255,255,255,0.4)',fontFamily:'sans-serif',lineHeight:1.4}}>{item.label}</span>
            </button>
          ))}
        </aside>

        {/* CONTEÚDO */}
        <div className="content" style={{flex:1,padding:'40px 48px 80px'}}>

          {/* ——— POLÍTICA DE PRIVACIDADE ——— */}
          {doc === 'privacidade' && (
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
                <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
                <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Documento legal</span>
              </div>
              <h1 style={{fontSize:'32px',fontWeight:400,margin:'0 0 8px',letterSpacing:'-0.02em'}}>Política de Privacidade</h1>
              <p style={{fontSize:'12px',color:'rgba(255,255,255,0.25)',fontFamily:'sans-serif',marginBottom:'32px'}}>Última atualização: {hoje}</p>
              <hr/>

              <h2>1. Quem somos</h2>
              <p>O <strong style={{color:'rgba(255,255,255,0.8)'}}>Mel de Lua</strong> é uma plataforma digital que conecta casais de noivos a agências de viagem especializadas em lua de mel personalizada. Nosso serviço utiliza inteligência artificial para criar perfis de viagem únicos e surpreendentes para cada casal.</p>
              <p>Para dúvidas sobre esta política, entre em contato pelo e-mail: <a href="mailto:privacidade@meldelua.com.br">privacidade@meldelua.com.br</a></p>

              <hr/>
              <h2>2. Quais dados coletamos</h2>
              <h3>2.1 Dados fornecidos pelo casal</h3>
              <ul>
                <li>Nome dos parceiros</li>
                <li>Endereço de e-mail</li>
                <li>Data do casamento</li>
                <li>Preferências de viagem, gastronomia e estilo de vida</li>
                <li>História do relacionamento (compartilhada voluntariamente)</li>
                <li>Orçamento estimado para a viagem</li>
              </ul>
              <h3>2.2 Dados fornecidos pelos padrinhos</h3>
              <ul>
                <li>Nome e e-mail (fornecidos pelo casal)</li>
                <li>Comentários sobre o casal (opcionais)</li>
              </ul>
              <h3>2.3 Dados técnicos coletados automaticamente</h3>
              <ul>
                <li>Endereço IP</li>
                <li>Tipo de navegador e dispositivo</li>
                <li>Páginas acessadas e tempo de navegação</li>
                <li>Cookies (detalhados na nossa Política de Cookies)</li>
              </ul>

              <hr/>
              <h2>3. Como usamos seus dados</h2>
              <ul>
                <li>Criar o perfil do casal para envio às agências parceiras</li>
                <li>Gerar recomendações de destino personalizadas via inteligência artificial</li>
                <li>Enviar comunicações relacionadas ao serviço (acesso ao painel, propostas recebidas)</li>
                <li>Melhorar a qualidade do nosso serviço e da inteligência artificial</li>
                <li>Cumprir obrigações legais</li>
              </ul>
              <p>Nunca vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing.</p>

              <hr/>
              <h2>4. Compartilhamento de dados</h2>
              <p>Seus dados são compartilhados <strong style={{color:'rgba(255,255,255,0.8)'}}>apenas</strong> com:</p>
              <ul>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Agências parceiras curadas</strong> — recebem um perfil curado do casal (sem dados sensíveis como CPF ou telefone) para elaborar propostas de viagem</li>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Padrinhos escolhidos pelo casal</strong> — recebem acesso limitado ao portal com informações da viagem</li>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Fornecedores de tecnologia</strong> — Supabase (banco de dados, hospedado no Brasil), Anthropic (processamento de IA), Vercel (hospedagem)</li>
              </ul>

              <hr/>
              <h2>5. Base legal (LGPD)</h2>
              <p>O tratamento dos seus dados é realizado com base nas seguintes hipóteses previstas na Lei Geral de Proteção de Dados (Lei nº 13.709/2018):</p>
              <ul>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Consentimento</strong> — para coleta de dados de perfil e preferências</li>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Execução de contrato</strong> — para prestação do serviço de intermediação</li>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Legítimo interesse</strong> — para melhoria do serviço e segurança da plataforma</li>
              </ul>

              <hr/>
              <h2>6. Seus direitos</h2>
              <p>Você tem direito a, a qualquer momento:</p>
              <ul>
                <li>Confirmar a existência de tratamento dos seus dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar a exclusão dos seus dados</li>
                <li>Revogar o consentimento dado</li>
                <li>Solicitar portabilidade dos dados</li>
              </ul>
              <p>Para exercer seus direitos, entre em contato: <a href="mailto:privacidade@meldelua.com.br">privacidade@meldelua.com.br</a></p>

              <hr/>
              <h2>7. Segurança dos dados</h2>
              <p>Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados, incluindo criptografia em trânsito (HTTPS), controle de acesso por autenticação, banco de dados hospedado em infraestrutura segura no Brasil e acesso restrito por perfil de usuário.</p>

              <hr/>
              <h2>8. Retenção de dados</h2>
              <p>Mantemos seus dados pelo tempo necessário para a prestação do serviço e cumprimento de obrigações legais. Após o encerramento do serviço, os dados são anonimizados ou excluídos em até 90 dias, salvo obrigação legal de retenção.</p>

              <hr/>
              <h2>9. Alterações nesta política</h2>
              <p>Esta política pode ser atualizada periodicamente. Notificaremos sobre alterações relevantes por e-mail ou aviso na plataforma. O uso continuado do serviço após as alterações implica aceitação da nova versão.</p>
            </div>
          )}

          {/* ——— TERMOS DE USO ——— */}
          {doc === 'termos' && (
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
                <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
                <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Documento legal</span>
              </div>
              <h1 style={{fontSize:'32px',fontWeight:400,margin:'0 0 8px',letterSpacing:'-0.02em'}}>Termos de Uso</h1>
              <p style={{fontSize:'12px',color:'rgba(255,255,255,0.25)',fontFamily:'sans-serif',marginBottom:'32px'}}>Última atualização: {hoje}</p>
              <hr/>

              <h2>1. Aceitação dos termos</h2>
              <p>Ao acessar e utilizar a plataforma Mel de Lua, você concorda com estes Termos de Uso. Se não concordar com qualquer parte, não utilize o serviço.</p>

              <hr/>
              <h2>2. O que é o Mel de Lua</h2>
              <p>O Mel de Lua é uma plataforma de intermediação entre casais de noivos e agências de viagem especializadas em lua de mel. Nosso serviço inclui:</p>
              <ul>
                <li>Coleta de preferências do casal via conversa com inteligência artificial (a Mel)</li>
                <li>Geração de perfil e recomendações de destino personalizadas</li>
                <li>Envio do perfil curado para agências parceiras elaborarem propostas</li>
                <li>Intermediação na escolha da proposta pelo casal</li>
                <li>Experiência de reveal do destino de forma surpresa</li>
              </ul>
              <p>O Mel de Lua <strong style={{color:'rgba(255,255,255,0.8)'}}>não é uma agência de viagens</strong> e não é responsável pela execução das viagens — apenas pela intermediação entre casais e agências.</p>

              <hr/>
              <h2>3. Cadastro e acesso</h2>
              <p>Para utilizar o serviço, o casal deve fornecer informações verdadeiras e completas durante o briefing. O acesso ao painel é realizado por e-mail e senha gerada automaticamente após o briefing.</p>
              <p>Você é responsável por manter a confidencialidade das suas credenciais de acesso. Em caso de uso não autorizado, notifique-nos imediatamente.</p>

              <hr/>
              <h2>4. Gratuidade para casais</h2>
              <p>O uso da plataforma é <strong style={{color:'rgba(255,255,255,0.8)'}}>completamente gratuito para os casais</strong>. O Mel de Lua é remunerado exclusivamente por comissão sobre as viagens efetivamente contratadas, paga pelas agências parceiras.</p>

              <hr/>
              <h2>5. Responsabilidades das agências</h2>
              <p>As agências parceiras são responsáveis por:</p>
              <ul>
                <li>Elaborar propostas precisas e honestas com base no perfil do casal</li>
                <li>Cumprir integralmente a proposta aceita pelo casal</li>
                <li>Fornecer suporte durante toda a experiência de viagem</li>
                <li>Manter sigilo sobre o destino até o momento do reveal</li>
              </ul>

              <hr/>
              <h2>6. O papel dos padrinhos</h2>
              <p>Os padrinhos são pessoas de confiança escolhidas pelo casal para conhecer o destino antes do reveal. Ao aceitar o convite, o padrinho compromete-se a manter o sigilo do destino até que o casal realize o reveal.</p>

              <hr/>
              <h2>7. Recomendações de destino por IA</h2>
              <p>As recomendações de destino são geradas por inteligência artificial com base no perfil do casal. Estas recomendações são sugestões — as propostas finais são elaboradas pelas agências, que podem ou não seguir exatamente os destinos sugeridos.</p>
              <p>O Mel de Lua não garante que o destino final corresponderá exatamente às preferências do casal, pois este depende da proposta elaborada pela agência escolhida.</p>

              <hr/>
              <h2>8. Limitação de responsabilidade</h2>
              <p>O Mel de Lua não se responsabiliza por:</p>
              <ul>
                <li>Problemas na execução da viagem (voos, hospedagem, passeios)</li>
                <li>Divergências entre a proposta aceita e a viagem realizada</li>
                <li>Cancelamentos ou alterações causados por força maior</li>
                <li>Decisões tomadas com base nas recomendações de IA</li>
              </ul>

              <hr/>
              <h2>9. Propriedade intelectual</h2>
              <p>Todo o conteúdo da plataforma — incluindo marca, design, textos e tecnologia — é propriedade do Mel de Lua. É proibida a reprodução ou uso sem autorização expressa.</p>

              <hr/>
              <h2>10. Cancelamento</h2>
              <p>O casal pode solicitar a exclusão do seu cadastro a qualquer momento pelo e-mail <a href="mailto:contato@meldelua.com.br">contato@meldelua.com.br</a>. Após a exclusão, os dados serão tratados conforme nossa Política de Privacidade.</p>

              <hr/>
              <h2>11. Foro e lei aplicável</h2>
              <p>Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de São Paulo/SP para resolução de eventuais conflitos, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
            </div>
          )}

          {/* ——— POLÍTICA DE COOKIES ——— */}
          {doc === 'cookies' && (
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
                <div style={{width:'20px',height:'1px',backgroundColor:'#F0A500'}}/>
                <span style={{fontSize:'10px',letterSpacing:'0.4em',color:'#F0A500',textTransform:'uppercase',fontFamily:'sans-serif'}}>Documento legal</span>
              </div>
              <h1 style={{fontSize:'32px',fontWeight:400,margin:'0 0 8px',letterSpacing:'-0.02em'}}>Política de Cookies</h1>
              <p style={{fontSize:'12px',color:'rgba(255,255,255,0.25)',fontFamily:'sans-serif',marginBottom:'32px'}}>Última atualização: {hoje}</p>
              <hr/>

              <h2>1. O que são cookies</h2>
              <p>Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você acessa um site. Eles permitem que o site reconheça seu dispositivo e lembre informações sobre sua visita.</p>

              <hr/>
              <h2>2. Como usamos cookies</h2>
              <p>O Mel de Lua utiliza cookies para as seguintes finalidades:</p>

              <h3>2.1 Cookies essenciais</h3>
              <p>Necessários para o funcionamento básico da plataforma. Sem eles, o serviço não funciona corretamente.</p>
              <ul>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Autenticação</strong> — mantém a sessão ativa enquanto você navega no painel</li>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Segurança</strong> — protege contra ataques e acessos não autorizados</li>
              </ul>

              <h3>2.2 Cookies de desempenho</h3>
              <p>Coletam informações anônimas sobre como os usuários utilizam o site, ajudando a melhorar a experiência.</p>
              <ul>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Análise de uso</strong> — páginas mais visitadas, tempo de sessão, fluxo de navegação</li>
              </ul>

              <h3>2.3 Cookies de funcionalidade</h3>
              <p>Lembram suas preferências para personalizar a experiência.</p>
              <ul>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Preferências de idioma e região</strong></li>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Estado da conversa com a Mel</strong> — evita recomeçar o briefing por acidente</li>
              </ul>

              <hr/>
              <h2>3. Cookies de terceiros</h2>
              <p>Alguns serviços que utilizamos podem instalar cookies próprios:</p>
              <ul>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Supabase</strong> — autenticação e sessão de usuário</li>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Vercel</strong> — análise de desempenho da hospedagem</li>
              </ul>

              <hr/>
              <h2>4. Como controlar os cookies</h2>
              <p>Você pode controlar e gerenciar cookies de diversas formas:</p>
              <ul>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Configurações do navegador</strong> — a maioria dos navegadores permite bloquear ou excluir cookies nas configurações de privacidade</li>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Modo privado/incógnito</strong> — os cookies não são armazenados após fechar a janela</li>
              </ul>
              <p>Atenção: bloquear cookies essenciais pode impedir o uso correto da plataforma, especialmente o acesso ao painel.</p>

              <hr/>
              <h2>5. Retenção dos cookies</h2>
              <ul>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Cookies de sessão</strong> — expiram ao fechar o navegador</li>
                <li><strong style={{color:'rgba(255,255,255,0.7)'}}>Cookies persistentes</strong> — expiram em até 30 dias ou conforme configuração do serviço</li>
              </ul>

              <hr/>
              <h2>6. Dúvidas</h2>
              <p>Para dúvidas sobre nossa política de cookies: <a href="mailto:privacidade@meldelua.com.br">privacidade@meldelua.com.br</a></p>
            </div>
          )}

        </div>
      </div>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'24px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px',position:'relative',zIndex:10}}>
        <span style={{fontSize:'16px',fontWeight:300,letterSpacing:'0.3em',color:'rgba(255,255,255,0.4)'}}>Mel de Lua</span>
        <div style={{display:'flex',gap:'24px',fontSize:'12px',fontFamily:'sans-serif'}}>
          <button onClick={()=>setDoc('privacidade')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:'12px',fontFamily:'sans-serif'}}>Privacidade</button>
          <button onClick={()=>setDoc('termos')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:'12px',fontFamily:'sans-serif'}}>Termos</button>
          <button onClick={()=>setDoc('cookies')} style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:'12px',fontFamily:'sans-serif'}}>Cookies</button>
        </div>
      </footer>
    </main>
  )
}
