import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getDomainOverview, getTopKeywords } from '@/lib/dataforseo'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function cleanDomain(raw: string) {
  return raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase().trim()
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const target = cleanDomain(body.target ?? '')
  const competitors: string[] = (body.competitors ?? []).map(cleanDomain).filter(Boolean)

  if (!target) {
    return NextResponse.json({ error: 'Target domain is required' }, { status: 400 })
  }

  const allDomains = [target, ...competitors]

  // Fetch domain overviews and target keywords in parallel
  const [overviews, targetKeywords] = await Promise.all([
    Promise.all(allDomains.map((d) => getDomainOverview(d))),
    getTopKeywords(target, 10),
  ])

  const targetData = overviews[0]
  const competitorData = overviews.slice(1)

  // Build Claude prompt
  const competitorSection =
    competitorData.length > 0
      ? competitorData
          .map(
            (c) =>
              `${c.domain}: ${c.organicKeywords.toLocaleString()} keywords, ` +
              `~${c.organicTraffic.toLocaleString()} monthly visits, ` +
              `$${c.trafficCost.toLocaleString()} traffic value`
          )
          .join('\n')
      : 'No competitors provided for comparison.'

  const keywordSection =
    targetKeywords.length > 0
      ? targetKeywords
          .slice(0, 8)
          .map((k, i) => `${i + 1}. "${k.keyword}" — pos ${k.position}, ${k.searchVolume.toLocaleString()}/mo`)
          .join('\n')
      : 'No keyword data available.'

  const prompt = `You are a senior competitive intelligence analyst. Analyze this SEO data and deliver a sharp, specific briefing.

TARGET DOMAIN: ${target}
- Organic keywords ranking: ${targetData.organicKeywords.toLocaleString()}
- Estimated monthly organic visits: ${targetData.organicTraffic.toLocaleString()}
- Estimated traffic value: $${targetData.trafficCost.toLocaleString()}/month

COMPETITORS:
${competitorSection}

TOP KEYWORDS FOR ${target}:
${keywordSection}

Write a 3-paragraph competitive intelligence briefing:
**Paragraph 1 - Market Position**: Where does ${target} stand? Is it ahead, behind, or on par? Use the actual numbers.
**Paragraph 2 - Key Insight**: What does this data reveal about the competitive landscape? Look for patterns, weaknesses, or opportunities a smart marketer would notice.
**Paragraph 3 - Top 3 Actions**: Give 3 concrete, specific actions ${target} should take in the next 30 days to gain ground. Be specific, not generic.

Be direct. Use the actual numbers. No filler phrases.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 700,
    messages: [{ role: 'user', content: prompt }],
  })

  const narrative = message.content[0].type === 'text' ? message.content[0].text : ''

  return NextResponse.json({
    target: { ...targetData, topKeywords: targetKeywords },
    competitors: competitorData.map((c) => ({ ...c, topKeywords: [] })),
    narrative,
  })
}
