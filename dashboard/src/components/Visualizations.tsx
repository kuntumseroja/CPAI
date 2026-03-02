/**
 * AI/ML Visualizations - Confidence rings, SHAP bars, similarity charts
 */

export function ConfidenceRing({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(value * 100)
  const r = 36
  const circ = 2 * Math.PI * r
  const stroke = (1 - value) * circ
  return (
    <div style={vizStyles.ringWrap}>
      <svg width={90} height={90} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={45} cy={45} r={r} fill="none" stroke="var(--bg-secondary)" strokeWidth={8} />
        <circle
          cx={45}
          cy={45}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={stroke}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-dim)" />
          </linearGradient>
        </defs>
      </svg>
      <div style={vizStyles.ringLabel}>
        <span style={vizStyles.ringValue}>{pct}%</span>
        {label && <span style={vizStyles.ringText}>{label}</span>}
      </div>
    </div>
  )
}

export function SHAPBarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const max = Math.max(...entries.map(([, v]) => v), 0.01)
  return (
    <div style={vizStyles.barChart}>
      {entries.map(([k, v]) => (
        <div key={k} style={vizStyles.barRow}>
          <span style={vizStyles.barLabel}>{k}</span>
          <div style={vizStyles.barTrack}>
            <div
              style={{
                ...vizStyles.barFill,
                width: `${(v / max) * 100}%`,
              }}
            />
          </div>
          <span style={vizStyles.barVal}>{(v * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  )
}

export function SimilarityBars({ cases }: { cases: { case_id: string; similarity_score: number }[] }) {
  return (
    <div style={vizStyles.simBars}>
      {cases.slice(0, 5).map((c) => (
        <div key={c.case_id} style={vizStyles.simRow}>
          <span style={vizStyles.simId}>{c.case_id}</span>
          <div style={vizStyles.simTrack}>
            <div
              style={{
                ...vizStyles.simFill,
                width: `${c.similarity_score * 100}%`,
                background: c.similarity_score >= 0.85
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  : 'linear-gradient(90deg, var(--accent), var(--accent-dim))',
              }}
            />
          </div>
          <span style={vizStyles.simVal}>{(c.similarity_score * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  )
}

export function RelevanceBars({ docs }: { docs: { source: string; relevance: number }[] }) {
  return (
    <div style={{ ...vizStyles.relBars, marginBottom: '1rem' }}>
      {docs.map((d) => (
        <div key={d.source} style={vizStyles.relRow}>
          <span style={vizStyles.relSource}>{d.source}</span>
          <div style={vizStyles.relTrack}>
            <div
              style={{
                ...vizStyles.relFill,
                width: `${d.relevance * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const vizStyles: Record<string, React.CSSProperties> = {
  ringWrap: { position: 'relative', display: 'inline-flex' },
  ringLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: { fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' },
  ringText: { fontSize: '0.7rem', color: 'var(--text-secondary)' },
  barChart: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  barRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  barLabel: { width: '100px', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis' },
  barTrack: { flex: 1, height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' },
  barFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent), var(--accent-dim))',
    borderRadius: '4px',
    transition: 'width 0.6s ease',
  },
  barVal: { width: '36px', fontSize: '0.8rem', color: 'var(--text-secondary)' },
  simBars: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  simRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  simId: { width: '110px', fontSize: '0.8rem' },
  simTrack: { flex: 1, height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' },
  simFill: { height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' },
  simVal: { width: '32px', fontSize: '0.75rem' },
  relBars: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  relRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  relSource: { width: '120px', fontSize: '0.8rem', fontWeight: 500 },
  relTrack: { flex: 1, height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' },
  relFill: {
    height: '100%',
    background: 'var(--accent)',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
}
