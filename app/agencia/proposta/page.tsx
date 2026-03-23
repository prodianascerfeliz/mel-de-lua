'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type ItemChecklist = { id: string; presente: boolean; observacao: string }
type Analise = { itens: ItemChecklist[]; aprovado: boolean; resumo: string }

function FormularioProposta() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const briefingId = searchParams.get('briefing')
  const fileRef = useRef<HTMLInputElement>(null)

  const [agenciaId, setAgenciaId] = useState<string | null>(null)
  const [agenciaNome, setAgenciaNome] = useState('')
  const [resumoCasal, setResumoCasal] = useState('')
  const [recIA, setRecIA] = useState<{recomendacao_1?: {destino:string;pais:string;titulo:string;justificativa:string;melhor_epoca:string;perfil_viagem:string;nivel_exclusividade:string}, recomendacao_2?: {destino:string;pais:string;titulo:string;justificativa:string;melhor_epoca:string;perfil_viagem:string;nivel_exclusividade:string}} | null>(null)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [analise, setAnalise] = useState<Analise | null>(null)
  const [erroUpload, setErroUpload] = useState('')
  const [destino, setDestino] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [mensagemCasal, setMensagemCasal] = useState('')
  const [aceitouPolitica, setAceitouPolitica] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { verificarSessao() }, [])

  const verificarSessao = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agencia/login'); return }
    setAgenciaId(user.id)
    const { data: ag } = await supabase.from('agencias').select('nome_fantasia').eq('email', user.email).single()
    if (ag) setAgenciaNome(ag.nome_fantasia)
    if (briefingId) {
      const { data: b } = await supabase.from('briefings').select('resumo_ia, respostas').eq('id', briefingId).single()
      if (b) {
        try { if (b.resumo_ia) { const rec = JSON.parse(b.resumo_ia); if (rec.resumo_casal) setResumoCasal(rec.resumo_casal) } } catch {}
        if (b.respostas) setRespostas(b.respostas as Record<string, string>)
      }
    }
  }

  const handleArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setErroUpload('Apenas arquivos PDF são aceitos.'); return }
    if (file.size > 10 * 1024 * 1024) { setErroUpload('Máximo 10MB.'); return }
    setArquivo(file); setErroUpload(''); setAnalise(null)
    setAnalisando(true)
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = () => res((r.result as string).split(',')[1])
        r.onerror = () => rej(new Error('Erro'))
        r.readAsDataURL(file)
      })
      const response = await fetch('/api/analisar-proposta', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64 }),
      })
      const data = await response.json()
      if (data.resultado) setAnalise(data.resultado)
      else setErroUpload('Erro ao analisar PDF.')
    } catch { setErroUpload('Erro ao processar arquivo.') }
    setAnalisando(false)
  }

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!arquivo) { setErro('Faça o upload do PDF.'); return }
    if (!aceitouPolitica) { setErro('Aceite a política de comissionamento.'); return }
    if (!destino || !valorTotal) { setErro('Preencha destino e valor total.'); return }
    setEnviando(true); setErro('')
    try {
      const nomeArquivo = `${briefingId}_${agenciaId}_${Date.now()}.pdf`
      const { error: uploadError } = await supabase.storage.from('propostas').upload(nomeArquivo, arquivo, { contentType: 'application/pdf' })
      if (uploadError) throw new Error('Erro no upload')
      const { data: urlData } = supabase.storage.from('propostas').getPublicUrl(nomeArquivo)
      const { error: dbError } = await supabase.from('propostas').insert({
        briefing_id: briefingId, agencia_id: agenciaId, destino,
        valor_total: parseFloat(valorTotal.replace(/[^\d,]/g, '').replace(',', '.')),
        duracao_dias: parseInt(respostas.duracao_dias) || 0,
        tipo_experiencia: [],
        roteiro_completo: { pdf_url: urlData.publicUrl, analise_ia: analise, politica_aceita: true, data_aceite: new Date().toISOString() },
        checklist_mala: {}, teaser_ia: mensagemCasal, status: 'aguardando_casal',
      })
      if (dbError) throw new Error('Erro ao salvar')
      setEnviado(true)
    } catch (err) { setErro(err instanceof Error ? err.message : 'Erro ao enviar.') }
    setEnviando(false)
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '14px', fontFamily: 'sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '7px' }

  if (enviado) return (
    <main style={{ backgroundColor: '#060d1a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>✈️</div>
        <h2 style={{ fontSize: '28px', fontWeight: 400, color: '#FFFFFF', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Proposta enviada!</h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', lineHeight: 1.8, marginBottom: '32px' }}>O PDF foi enviado com sucesso. O casal receberá a proposta em breve.</p>
        <a href="/agencia/painel" style={{ backgroundColor: '#2E86C1', color: '#FFFFFF', padding: '14px 40px', fontSize: '12px', letterSpacing: '0.18em', textDecoration: 'none', textTransform: 'uppercase', fontFamily: 'sans-serif', display: 'inline-block' }}>Voltar ao painel</a>
      </div>
    </main>
  )

  return (
    <main style={{ backgroundColor: '#060d1a', minHeight: '100vh', fontFamily: "'Georgia', serif" }}>
      <style>{`
        input:focus,textarea:focus{outline:none;border-color:rgba(46,134,193,0.5)!important;}
        .upload-area:hover{border-color:rgba(46,134,193,0.5)!important;background-color:rgba(46,134,193,0.04)!important;}
        .submit-btn:hover:not(:disabled){background-color:#1a6fa8!important;}
        @media(max-width:768px){.grid-2{grid-template-columns:1fr!important;}.content{padding:28px 16px!important;}}
      `}</style>

      <header style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', backgroundColor: 'rgba(6,13,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ textDecoration: 'none' }}><div style={{ fontSize: '18px', fontWeight: 300, letterSpacing: '0.35em', color: '#FFFFFF' }}>Mel de Lua</div></a>
        <a href="/agencia/painel" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', textDecoration: 'none', letterSpacing: '0.1em' }}>← Voltar ao painel</a>
      </header>

      <div className="content" style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '20px', height: '1px', backgroundColor: '#F0A500' }} />
            <span style={{ fontSize: '10px', letterSpacing: '0.4em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>Nova proposta</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#FFFFFF', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Enviar proposta para o casal</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', margin: 0, lineHeight: 1.7 }}>
            Faça o upload do orçamento em PDF. Nossa IA verifica se todos os itens obrigatórios estão presentes antes do envio.
          </p>
        </div>

        {/* Perfil do casal */}
        {resumoCasal && (
          <div style={{ backgroundColor: 'rgba(46,134,193,0.08)', border: '1px solid rgba(46,134,193,0.2)', padding: '18px 20px', marginBottom: '14px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#2E86C1', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px' }}>Perfil do casal</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', fontFamily: 'sans-serif', lineHeight: 1.85, margin: 0, fontStyle: 'italic' }}>"{resumoCasal}"</p>
          </div>
        )}

        {/* Dados do casal */}
        {Object.keys(respostas).length > 0 && (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: '18px 20px', marginBottom: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '12px' }}>Dados para o orçamento</p>
            {/* Solicitação de cotação técnica */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {/* Linha 1: Datas */}
              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: 'Data de ida', valor: respostas.data_viagem || respostas.data_casamento || null },
                  { label: 'Data de volta', valor: (() => { try { const raw = respostas.data_viagem || respostas.data_casamento; if (!raw) return null; const partes = raw.split('/'); const d = partes.length === 3 ? new Date(parseInt(partes[2]), parseInt(partes[1])-1, parseInt(partes[0])) : new Date(raw); if (isNaN(d.getTime())) return `${respostas.duracao_dias || 10} dias após a ida`; d.setDate(d.getDate() + (parseInt(respostas.duracao_dias) || 10)); return d.toLocaleDateString('pt-BR') } catch { return respostas.duracao_dias ? `${respostas.duracao_dias} dias após a ida` : null } })() },
                ].map((item, i) => item.valor && (
                  <div key={item.label} style={{ padding: '12px 14px', borderRight: i === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '3px' }}>{item.label}</div>
                    <div style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'sans-serif', fontWeight: 400 }}>{item.valor}</div>
                  </div>
                ))}
              </div>
              {/* Linha 2: Duração e orçamento */}
              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: 'Duração', valor: respostas.duracao_dias ? `${respostas.duracao_dias} noites` : null },
                  { label: 'Orçamento total disponível', valor: respostas.orcamento },
                ].map((item, i) => item.valor && (
                  <div key={item.label} style={{ padding: '12px 14px', borderRight: i === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '3px' }}>{item.label}</div>
                    <div style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'sans-serif', fontWeight: 400 }}>{item.valor}</div>
                  </div>
                ))}
              </div>
              {/* Linha 3: Origem e destinos sugeridos */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '3px' }}>Origem</div>
                <div style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'sans-serif' }}>GRU — São Paulo / Guarulhos</div>
              </div>
              {recIA && (recIA.recomendacao_1 || recIA.recomendacao_2) && (
                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px' }}>Destinos sugeridos para cotar</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[recIA.recomendacao_1, recIA.recomendacao_2].filter(Boolean).map((dest, i) => dest && (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <span style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'sans-serif' }}>Destino {i+1}: <strong>{dest.destino}, {dest.pais}</strong></span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif', marginLeft: '10px' }}>Melhor época: {dest.melhor_epoca}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'rgba(240,165,0,0.8)', fontFamily: 'sans-serif', backgroundColor: 'rgba(240,165,0,0.08)', padding: '2px 10px' }}>{dest.perfil_viagem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Destinos sugeridos */}
              {recIA && (recIA.recomendacao_1 || recIA.recomendacao_2) && (
                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '10px' }}>Destinos para cotar</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {([recIA.recomendacao_1, recIA.recomendacao_2] as Array<{destino:string;pais:string;titulo:string;melhor_epoca:string;perfil_viagem:string;nivel_exclusividade:string} | undefined>).filter(Boolean).map((dest, i) => dest && (
                      <div key={i} style={{ backgroundColor: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.15)', padding: '10px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'sans-serif', fontWeight: 400 }}>
                            <strong style={{ color: '#F0A500' }}>Destino {i+1}:</strong> {dest.destino}, {dest.pais}
                          </span>
                          <span style={{ fontSize: '11px', color: 'rgba(240,165,0,0.7)', fontFamily: 'sans-serif', backgroundColor: 'rgba(240,165,0,0.08)', padding: '2px 8px' }}>{dest.perfil_viagem}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif' }}>🗓 Melhor época: {dest.melhor_epoca}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif' }}>⭐ {dest.nivel_exclusividade}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* O que incluir no orçamento */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px' }}>Incluir no orçamento</div>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {[
                    { item: 'Passagens aéreas (ida e volta)', sim: true },
                    { item: 'Hospedagem', sim: true },
                    { item: 'Translados', sim: true },
                    { item: 'Seguro viagem', sim: true },
                    { item: 'Pensão alimentar', sim: false },
                    { item: 'Passeios opcionais', sim: false },
                  ].map(({ item, sim }) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: sim ? '#3DD68C' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{sim ? '✓' : '—'}</span>
                      <span style={{ fontSize: '12px', color: sim ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Restrições alimentares */}
              {respostas.restricao_alimentar && (
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,107,107,0.7)', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '3px' }}>⚠️ Restrições alimentares</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontFamily: 'sans-serif' }}>{respostas.restricao_alimentar}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Checklist obrigatório */}
        <div style={{ backgroundColor: 'rgba(240,165,0,0.04)', border: '1px solid rgba(240,165,0,0.15)', padding: '18px 20px', marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '12px' }}>O PDF deve conter obrigatoriamente</p>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {['Destino e datas de ida/volta', 'Valor discriminado (aéreo, hotel, passeios)', 'Inclusões e exclusões', 'Condições de cancelamento', 'Validade do orçamento', 'CNPJ e responsável da agência', 'Informação sobre seguro viagem', 'Visto e documentos necessários'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#F0A500', fontSize: '11px', flexShrink: 0, marginTop: '2px' }}>→</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleEnviar} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Upload */}
          <div>
            <label style={labelStyle}>Upload da proposta em PDF *</label>
            <div className="upload-area" onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${arquivo ? 'rgba(46,134,193,0.5)' : 'rgba(255,255,255,0.15)'}`, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: arquivo ? 'rgba(46,134,193,0.04)' : 'transparent' }}>
              <input ref={fileRef} type="file" accept=".pdf" onChange={handleArquivo} style={{ display: 'none' }} />
              {!arquivo ? (
                <>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', margin: '0 0 4px' }}>Clique para selecionar o PDF</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontFamily: 'sans-serif', margin: 0 }}>Máximo 10MB · Somente PDF</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
                  <p style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'sans-serif', margin: '0 0 4px' }}>{arquivo.name}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif', margin: 0 }}>
                    {(arquivo.size / 1024 / 1024).toFixed(2)}MB · <span style={{ color: '#2E86C1' }}>Trocar arquivo</span>
                  </p>
                </>
              )}
            </div>
            {erroUpload && <p style={{ fontSize: '12px', color: '#ff8080', fontFamily: 'sans-serif', marginTop: '6px' }}>{erroUpload}</p>}
          </div>

          {/* Análise IA */}
          {analisando && (
            <div style={{ backgroundColor: 'rgba(46,134,193,0.08)', border: '1px solid rgba(46,134,193,0.2)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontFamily: 'sans-serif', margin: 0 }}>Analisando o PDF... verificando todos os itens obrigatórios.</p>
            </div>
          )}

          {analise && !analisando && (
            <div style={{ border: `1px solid ${analise.aprovado ? 'rgba(61,214,140,0.3)' : 'rgba(255,107,107,0.3)'}`, backgroundColor: analise.aprovado ? 'rgba(61,214,140,0.05)' : 'rgba(255,107,107,0.05)', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '20px' }}>{analise.aprovado ? '✅' : '⚠️'}</span>
                <div>
                  <p style={{ fontSize: '13px', color: analise.aprovado ? '#3DD68C' : '#ff8080', fontFamily: 'sans-serif', margin: '0 0 2px', fontWeight: 400 }}>
                    {analise.aprovado ? 'PDF aprovado — todos os itens encontrados' : 'Atenção — itens obrigatórios ausentes'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', margin: 0 }}>{analise.resumo}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {analise.itens.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '14px', flexShrink: 0, color: item.presente ? '#3DD68C' : '#ff8080' }}>{item.presente ? '✓' : '✗'}</span>
                    <div>
                      <span style={{ fontSize: '13px', color: item.presente ? 'rgba(255,255,255,0.7)' : '#ff8080', fontFamily: 'sans-serif' }}>{item.id.replace(/_/g, ' ')}</span>
                      {!item.presente && item.observacao && <p style={{ fontSize: '12px', color: 'rgba(255,107,107,0.7)', fontFamily: 'sans-serif', margin: '2px 0 0', lineHeight: 1.5 }}>{item.observacao}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {!analise.aprovado && (
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ marginTop: '14px', padding: '8px 18px', backgroundColor: 'transparent', border: '1px solid rgba(255,107,107,0.4)', color: '#ff8080', fontSize: '11px', letterSpacing: '0.15em', fontFamily: 'sans-serif', cursor: 'pointer', textTransform: 'uppercase' }}>
                  Fazer novo upload
                </button>
              )}
            </div>
          )}

          {/* Destino e valor */}
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Destino *</label>
              <input type="text" value={destino} onChange={e => setDestino(e.target.value)} required placeholder="Ex: Socotra, Iêmen" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Valor total (R$) *</label>
              <input type="text" value={valorTotal} onChange={e => setValorTotal(e.target.value)} required placeholder="Ex: 48.500" style={inputStyle} />
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <label style={labelStyle}>Mensagem especial para o casal</label>
            <textarea value={mensagemCasal} onChange={e => setMensagemCasal(e.target.value)} rows={3}
              placeholder="Uma mensagem pessoal sobre por que essa proposta foi criada especialmente para eles — sem revelar o destino!"
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
          </div>

          {/* Política de comissionamento */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#F0A500', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '14px' }}>Política de comissionamento</p>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '16px', marginBottom: '14px', maxHeight: '180px', overflowY: 'auto' }}>
              {[
                { titulo: '1. Comissionamento por resultado', texto: 'O Mel de Lua é remunerado exclusivamente sobre viagens efetivamente contratadas e pagas pelo casal. Não há cobrança de mensalidade, taxa de cadastro ou custo por lead.' },
                { titulo: '2. Percentual', texto: 'O percentual de comissionamento é definido no contrato de credenciamento assinado entre a agência e o Mel de Lua, e será comunicado durante o processo de aprovação da agência.' },
                { titulo: '3. Prazo de pagamento', texto: 'A comissão deverá ser paga ao Mel de Lua em até 30 dias após a confirmação do pagamento integral pelo casal à agência.' },
                { titulo: '4. Veracidade', texto: `${agenciaNome || 'A agência'} declara que o orçamento enviado é verdadeiro, preciso e exequível, e que tem capacidade de entregar a viagem nos termos descritos.` },
              ].map(item => (
                <p key={item.titulo} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', lineHeight: 1.85, margin: '0 0 10px' }}>
                  <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{item.titulo}:</strong> {item.texto}
                </p>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', marginBottom: '14px' }}>
              Leia nossa <a href="/legal" target="_blank" style={{ color: 'rgba(46,134,193,0.7)', textDecoration: 'none' }}>Política completa</a> antes de prosseguir.
            </p>
            <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input type="checkbox" checked={aceitouPolitica} onChange={e => setAceitouPolitica(e.target.checked)}
                style={{ marginTop: '2px', flexShrink: 0, accentColor: '#2E86C1', width: '16px', height: '16px' }} />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontFamily: 'sans-serif', lineHeight: 1.7 }}>
                Li e concordo com a política de comissionamento do Mel de Lua e declaro que o orçamento enviado é verdadeiro e exequível.
              </span>
            </label>
          </div>

          {erro && <div style={{ padding: '12px 16px', backgroundColor: 'rgba(220,60,60,0.15)', border: '1px solid rgba(220,60,60,0.3)', fontSize: '13px', color: '#ff8080', fontFamily: 'sans-serif' }}>{erro}</div>}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button type="submit" disabled={enviando || !arquivo || !aceitouPolitica} className="submit-btn"
              style={{ backgroundColor: '#2E86C1', color: '#FFFFFF', padding: '15px 48px', fontSize: '12px', letterSpacing: '0.2em', border: 'none', textTransform: 'uppercase', fontFamily: 'sans-serif', cursor: enviando || !arquivo || !aceitouPolitica ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', opacity: enviando || !arquivo || !aceitouPolitica ? 0.5 : 1 }}>
              {enviando ? 'Enviando...' : '✈️ Enviar proposta'}
            </button>
            <a href="/agencia/painel" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', textDecoration: 'none' }}>Cancelar</a>
          </div>
        </form>
      </div>
    </main>
  )
}

export default function PropostaPage() {
  return (
    <Suspense fallback={<div style={{ backgroundColor: '#060d1a', minHeight: '100vh' }} />}>
      <FormularioProposta />
    </Suspense>
  )
}
