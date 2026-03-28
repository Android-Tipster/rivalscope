'use client'

import { useState, useRef } from 'react'

interface KeywordItem {
  keyword: string
  position: number
  searchVolume: number
  etv: number
}

interface DomainMetrics {
  domain: string
  organicKeywords: number
  organicTraffic: number
  trafficCost: number
  topKeywords?: KeywordItem[]
  error?: string
}

interface AnalysisResult {
  target: DomainMetrics
  competitors: DomainMetrics[]
  narrative: string
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K'
  return '$' + n.toString()
}

function Bar({ value, max, color = '#10b981' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 2
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 4, transition: 'width 0.8s ease' }} />
    </div>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

function Results({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const allDomains = [result.target, ...result.competitors]
  const maxKeywords = Math.max(...allDomains.map((d) => d.organicKeywords))
  const maxTraffic = Math.max(...allDomains.map((d) => d.organicTraffic))

  const paragraphs = result.narrative.split('\n').filter((p) => p.trim().length > 0)

  return (
    <div className="fade-up" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Competitive Analysis Report</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {result.target.domain}
            {result.competitors.length > 0 && ` vs ${result.competitors.map((c) => c.domain).join(', ')}`}
          </p>
        </div>
        <button
          onClick={onReset}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            borderRadius: 8,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          New Analysis
        </button>
      </div>

      {/* Summary metrics for target domain */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <MetricCard label="Organic Keywords" value={fmt(result.target.organicKeywords)} sub="Total pages ranking on Google" />
        <MetricCard label="Monthly Visits" value={fmt(result.target.organicTraffic)} sub="Estimated organic traffic" />
        <MetricCard label="Traffic Value" value={fmtMoney(result.target.trafficCost)} sub="Equivalent paid traffic cost" />
      </div>

      {/* Traffic comparison */}
      {allDomains.length > 1 && (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Domain Comparison
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr 1fr', gap: '0 16px', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingBottom: 8 }}>Domain</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingBottom: 8 }}>Keywords</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingBottom: 8 }}>Monthly Traffic</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingBottom: 8 }}>Traffic Value</div>

            {allDomains.map((d, i) => {
              const isTarget = i === 0
              const accent = isTarget ? '#10b981' : '#6366f1'
              return (
                <>
                  <div key={`name-${d.domain}`} style={{ padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: accent,
                        background: isTarget ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                        borderRadius: 4,
                        padding: '2px 8px',
                      }}
                    >
                      {isTarget ? 'YOU' : 'COMP'}
                    </span>
                    <p style={{ fontSize: 13, marginTop: 4, color: 'var(--text)' }}>{d.domain}</p>
                  </div>
                  <div key={`kw-${d.domain}`} style={{ padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{fmt(d.organicKeywords)}</p>
                    <Bar value={d.organicKeywords} max={maxKeywords} color={accent} />
                  </div>
                  <div key={`tr-${d.domain}`} style={{ padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{fmt(d.organicTraffic)}</p>
                    <Bar value={d.organicTraffic} max={maxTraffic} color={accent} />
                  </div>
                  <div key={`tc-${d.domain}`} style={{ padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 16, fontWeight: 700 }}>{fmtMoney(d.trafficCost)}</p>
                  </div>
                </>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Keywords */}
      {result.target.topKeywords && result.target.topKeywords.length > 0 && (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Top Keywords — {result.target.domain}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ paddingBottom: 12, fontWeight: 500 }}>#</th>
                <th style={{ paddingBottom: 12, fontWeight: 500 }}>Keyword</th>
                <th style={{ paddingBottom: 12, fontWeight: 500, textAlign: 'right' }}>Position</th>
                <th style={{ paddingBottom: 12, fontWeight: 500, textAlign: 'right' }}>Search Volume</th>
                <th style={{ paddingBottom: 12, fontWeight: 500, textAlign: 'right' }}>Traffic Share</th>
              </tr>
            </thead>
            <tbody>
              {result.target.topKeywords.slice(0, 8).map((kw, i) => (
                <tr key={kw.keyword} style={{ borderTop: '1px solid var(--border)', fontSize: 13 }}>
                  <td style={{ padding: '10px 0', color: 'var(--text-muted)', width: 32 }}>{i + 1}</td>
                  <td style={{ padding: '10px 0', fontWeight: 500 }}>{kw.keyword}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right' }}>
                    <span
                      style={{
                        background: kw.position <= 3 ? 'rgba(16,185,129,0.15)' : kw.position <= 10 ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.05)',
                        color: kw.position <= 3 ? '#10b981' : kw.position <= 10 ? '#eab308' : 'var(--text-muted)',
                        borderRadius: 4,
                        padding: '2px 8px',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      #{kw.position}
                    </span>
                  </td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: 'var(--text-muted)' }}>{fmt(kw.searchVolume)}/mo</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>{fmt(kw.etv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Narrative */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(99,102,241,0.05) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 12,
          padding: 28,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 24, height: 24, background: 'var(--green-dim)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            🧠
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>AI Strategic Briefing</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 1.7, color: '#d1d5db' }}>
              {p.replace(/^\*\*[^*]+\*\*\s*/, '')}
            </p>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Want the full deep-dive?</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Export this report as a PDF with keyword gap analysis and backlink data.
          </p>
        </div>
        <a
          href="mailto:rinascita.hub@gmail.com?subject=RivalScope Full Report&body=Domain analyzed: "
          style={{
            background: '#10b981',
            color: '#000',
            fontWeight: 700,
            borderRadius: 8,
            padding: '12px 24px',
            fontSize: 14,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Request Full Report $19
        </a>
      </div>
    </div>
  )
}

export default function Home() {
  const [target, setTarget] = useState('')
  const [c1, setC1] = useState('')
  const [c2, setC2] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  async function analyze() {
    if (!target.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: target.trim(),
          competitors: [c1, c2].filter(Boolean),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Analysis failed')
      }
      const data: AnalysisResult = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') analyze()
  }

  if (result) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <nav
          style={{
            borderBottom: '1px solid var(--border)',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ width: 28, height: 28, background: '#10b981', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#000' }}>R</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>RivalScope</span>
        </nav>
        <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
          <Results result={result} onReset={() => setResult(null)} />
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#10b981', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#000' }}>R</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>RivalScope</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px' }}>
          Powered by DataForSEO + Claude AI
        </span>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ maxWidth: 580, width: '100%', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 12,
              color: '#10b981',
              marginBottom: 32,
            }}
          >
            <span className="pulse-dot" style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
            Live data from 100M+ ranked keywords
          </div>

          <h1
            style={{
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 20,
              background: 'linear-gradient(180deg, #f0f4f8 0%, #6b7280 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            Know Your Competitors.
            <br />
            Own Your Market.
          </h1>

          <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 48 }}>
            Enter any domain to get an instant AI-powered competitive intelligence report. Keyword gaps, traffic comparison, and strategic actions in under 30 seconds.
          </p>

          {/* Form */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 28,
              textAlign: 'left',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Your Domain
              </label>
              <input
                type="text"
                placeholder="yoursite.com"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                onKeyDown={handleKey}
                autoFocus
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  color: 'var(--text)',
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#10b981')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Competitor 1', val: c1, set: setC1, ph: 'competitor1.com' },
                { label: 'Competitor 2', val: c2, set: setC2, ph: 'competitor2.com' },
              ].map(({ label, val, set, ph }) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {label} <span style={{ color: '#374151', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={ph}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    onKeyDown={handleKey}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '12px 16px',
                      color: 'var(--text)',
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={analyze}
              disabled={loading || !target.trim()}
              style={{
                width: '100%',
                background: loading || !target.trim() ? '#1f2937' : '#10b981',
                color: loading || !target.trim() ? '#4b5563' : '#000',
                fontWeight: 700,
                fontSize: 15,
                borderRadius: 8,
                padding: '14px',
                border: 'none',
                cursor: loading || !target.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31" strokeDashoffset="10" />
                  </svg>
                  Analyzing — pulling live data...
                </>
              ) : (
                'Analyze Now →'
              )}
            </button>

            {error && (
              <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 12 }}>{error}</p>
            )}
          </div>

          {/* Feature badges */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            {['Live SEO data', 'Claude AI analysis', 'No signup required', 'Results in ~20s'].map((f) => (
              <span
                key={f}
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: '5px 14px',
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
