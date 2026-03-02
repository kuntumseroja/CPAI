import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { healthCheck } from '../api/client'
import { useDemoMode } from '../demo/DemoContext'
import { getSampleAnalysis } from '../demo/simulator'
import { STORAGE_KEY } from '../api/client'

export default function Home() {
  const navigate = useNavigate()
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking')
  const [loadingSample, setLoadingSample] = useState(false)
  const { isDemoMode } = useDemoMode()

  const handleViewSample = async () => {
    setLoadingSample(true)
    try {
      const result = await getSampleAnalysis()
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result))
      navigate('/analysis')
    } finally {
      setLoadingSample(false)
    }
  }

  useEffect(() => {
    healthCheck(isDemoMode)
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('error'))
  }, [isDemoMode])

  return (
    <div style={styles.container}>
      {isDemoMode && (
        <div style={styles.demoBanner}>
          Demo Mode — Simulated AI responses, no backend required. Toggle off to use real API.
          <span style={styles.demoHint}>See DEMO_GUIDE.md in project root for full demo walkthrough.</span>
        </div>
      )}
      <section style={styles.hero}>
        <h1 style={styles.title}>CAPA AI Management System</h1>
        <p style={styles.subtitle}>
          AI-powered Root Cause Analysis and Corrective/Preventive Action recommendations for PT Bio Farma Quality Assurance
        </p>
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>API Status:</span>
          <span
            style={{
              ...styles.statusBadge,
              ...(apiStatus === 'ok'
                ? styles.statusOk
                : apiStatus === 'error'
                ? styles.statusError
                : styles.statusChecking),
            }}
          >
            {apiStatus === 'checking' && 'Checking...'}
            {apiStatus === 'ok' && (isDemoMode ? 'Demo Mode' : 'Connected')}
            {apiStatus === 'error' && 'Disconnected'}
          </span>
        </div>
      </section>

      <section style={styles.cards}>
        <Link to="/submit" style={styles.card}>
          <span style={styles.cardIcon}>+</span>
          <h3 style={styles.cardTitle}>Submit Finding</h3>
          <p style={styles.cardDesc}>
            Submit a quality finding for AI-powered RCA, similarity analysis, and CAPA recommendations
          </p>
        </Link>
        <div style={styles.card}>
          <span style={styles.cardIcon}>◈</span>
          <h3 style={styles.cardTitle}>View Analysis</h3>
          <p style={styles.cardDesc}>
            Review root cause analysis, similar cases, and corrective/preventive actions
          </p>
          {isDemoMode && (
            <button onClick={handleViewSample} disabled={loadingSample} style={styles.sampleBtn}>
              {loadingSample ? 'Loading...' : 'View sample analysis'}
            </button>
          )}
          {!isDemoMode && <Link to="/analysis" style={styles.cardLink}>Go to Analysis</Link>}
        </div>
      </section>

      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Features</h2>
        <ul style={styles.featureList}>
          {[
            'AI-powered Root Cause Analysis (Ishikawa / 5-Why)',
            'Similarity search for duplicate & recurring detection',
            'CAPA recommendations with effectiveness scoring',
            'Explainable AI (SHAP) for GxP compliance',
            'Human-in-the-loop feedback for model improvement',
          ].map((f) => (
            <li key={f} style={styles.featureItem}><span style={styles.check}>✓</span> {f}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },
  demoBanner: {
    padding: '0.75rem 1rem',
    background: 'rgba(0, 200, 150, 0.15)',
    border: '1px solid var(--accent)',
    borderRadius: '8px',
    color: 'var(--accent)',
    fontSize: '0.9rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  demoHint: {
    fontSize: '0.85rem',
    opacity: 0.9,
  },
  hero: {
    textAlign: 'center',
    padding: '2rem 0',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '0.75rem',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
    maxWidth: '600px',
    margin: '0 auto 1.5rem',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  statusLabel: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  statusOk: { background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' },
  statusError: { background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)' },
  statusChecking: { background: 'var(--bg-card)', color: 'var(--text-secondary)' },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    padding: '1.5rem',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.2s',
  },
  cardIcon: {
    display: 'block',
    fontSize: '2rem',
    color: 'var(--accent)',
    marginBottom: '0.75rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginBottom: '0.5rem',
  },
  sampleBtn: {
    marginTop: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'var(--accent)',
    color: 'var(--bg-primary)',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  cardLink: {
    marginTop: '0.5rem',
    color: 'var(--accent)',
    fontSize: '0.9rem',
    textDecoration: 'none',
  },
  features: {},
  sectionTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    color: 'var(--text-secondary)',
  },
  featureList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  featureItem: {
    padding: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  check: { color: 'var(--accent)', fontWeight: 700 },
}
