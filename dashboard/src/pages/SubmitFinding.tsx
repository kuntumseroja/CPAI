import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitFinding, STORAGE_KEY } from '../api/client'
import { useDemoMode } from '../demo/DemoContext'
import { SAMPLE_FINDINGS } from '../demo/sampleData'
import ProcessingOverlay from '../components/ProcessingOverlay'
import type { FindingInput, AnalysisResult } from '../api/client'

export default function SubmitFinding() {
  const navigate = useNavigate()
  const { isDemoMode } = useDemoMode()
  const [loading, setLoading] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)

  useEffect(() => {
    if (!loading) {
      setProcessingStep(0)
      return
    }
    const steps = 5
    const interval = 350
    let i = 0
    const id = setInterval(() => {
      i++
      setProcessingStep(Math.min(i, steps - 1))
      if (i >= steps) clearInterval(id)
    }, interval)
    return () => clearInterval(id)
  }, [loading])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FindingInput>({
    finding_text: '',
    department: '',
    product_line: '',
    source: '',
  })

  const runAnalysis = async (finding: FindingInput) => {
    setError(null)
    setLoading(true)
    try {
      const result: AnalysisResult = await submitFinding({
        finding,
        include_similarity: true,
        include_capa_recommendation: true,
      }, isDemoMode)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result))
      navigate('/analysis')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.finding_text.length < 10) {
      setError('Finding description must be at least 10 characters')
      return
    }
    const finding: FindingInput = {
      ...form,
      finding_text: form.finding_text.trim(),
      department: form.department || undefined,
      product_line: form.product_line || undefined,
      source: form.source || undefined,
    }
    await runAnalysis(finding)
  }

  const handleSampleClick = (sample: typeof SAMPLE_FINDINGS[0]) => {
    setForm({
      finding_text: sample.finding.finding_text,
      department: sample.finding.department || '',
      product_line: sample.finding.product_line || '',
      source: sample.finding.source || '',
    })
    runAnalysis(sample.finding)
  }

  return (
    <div style={styles.container}>
      <ProcessingOverlay visible={loading} currentStep={processingStep} />
      <h1 style={styles.title}>Submit Finding for Analysis</h1>
      <p style={styles.subtitle}>
        Enter the quality finding details. AI will perform RCA, similarity search, and generate CAPA recommendations.
      </p>

      {isDemoMode && (
        <section style={styles.samples}>
          <h3 style={styles.samplesTitle}>Try example findings (one-click simulation)</h3>
          <div style={styles.sampleGrid}>
            {SAMPLE_FINDINGS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSampleClick(s)}
                disabled={loading}
                style={styles.sampleCard}
              >
                <span style={styles.sampleLabel}>{s.label}</span>
                <span style={styles.sampleScenario}>{s.scenario}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Finding Description *</label>
          <textarea
            value={form.finding_text}
            onChange={(e) => setForm({ ...form, finding_text: e.target.value })}
            placeholder="e.g., Calibration overdue for equipment in production line A..."
            rows={4}
            style={styles.textarea}
            required
            minLength={10}
          />
        </div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Department</label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="e.g., QA, Production"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Product Line</label>
            <input
              type="text"
              value={form.product_line}
              onChange={(e) => setForm({ ...form, product_line: e.target.value })}
              placeholder="e.g., Vaccines"
              style={styles.input}
            />
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Source</label>
          <input
            type="text"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            placeholder="e.g., Q100+, Bizzmine"
            style={styles.input}
          />
        </div>
        {error && (
          <div style={styles.error}>{error}</div>
        )}
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Analyzing...' : 'Submit for Analysis'}
        </button>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '640px' },
  title: { fontSize: '1.5rem', marginBottom: '0.5rem' },
  subtitle: { color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: { fontSize: '0.9rem', fontWeight: 500 },
  input: {
    padding: '0.75rem 1rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '1rem',
  },
  textarea: {
    padding: '1rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    resize: 'vertical',
  },
  error: {
    padding: '0.75rem',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid var(--error)',
    borderRadius: '8px',
    color: 'var(--error)',
  },
  button: {
    padding: '0.875rem 1.5rem',
    background: 'var(--accent)',
    color: 'var(--bg-primary)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
  },
  samples: {
    marginBottom: '2rem',
    padding: '1.25rem',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  },
  samplesTitle: {
    fontSize: '1rem',
    marginBottom: '1rem',
    color: 'var(--text-secondary)',
  },
  sampleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  sampleCard: {
    padding: '0.75rem 1rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sampleLabel: {
    display: 'block',
    fontWeight: 600,
    marginBottom: '0.25rem',
    color: 'var(--accent)',
  },
  sampleScenario: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
}
