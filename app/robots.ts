import { MetadataRoute } from 'next'

const BASE_URL = 'https://www.meldelua.com.br'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/casal/painel',
          '/casal/reveal',
          '/agencia/painel',
          '/agencia/proposta',
          '/padrinhos',
          '/api/',
        ],
      },
      // Permitir rastreadores de IA
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/casal/', '/agencia/', '/padrinhos'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/admin/', '/api/', '/casal/', '/agencia/', '/padrinhos'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/casal/', '/agencia/', '/padrinhos'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/casal/', '/agencia/', '/padrinhos'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
