/**
 * AI Processing Overlay - "Wow" experience
 * Shows agent steps executing in real-time with streaming effect
 */

const AGENT_STEPS = [
  { id: 'classify', label: 'NLP Classification', sub: 'Categorizing finding type...' },
  { id: 'retrieve', label: 'RAG Retrieval', sub: 'Searching SOPs & similar cases...' },
  { id: 'analyze', label: 'Causal Inference', sub: 'Running Ishikawa & 5-Why...' },
  { id: 'generate', label: 'CAPA Generation', sub: 'Generating actions...' },
  { id: 'validate', label: 'XAI Validation', sub: 'Extracting SHAP features...' },
]

interface ProcessingOverlayProps {
  visible: boolean
  currentStep?: number
}

export default function ProcessingOverlay({ visible, currentStep = 0 }: ProcessingOverlayProps) {
  if (!visible) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} />
      <div style={styles.content}>
        <div style={styles.brainIcon}>
          <span style={styles.brainEmoji}>🧠</span>
          <div style={styles.pulse} />
        </div>
        <h3 style={styles.title}>AI Analysis in Progress</h3>
        <p style={styles.subtitle}>LangGraph agent pipeline • RAG retrieval • ML inference</p>
        <div style={styles.steps}>
          {AGENT_STEPS.map((s, i) => (
            <div
              key={s.id}
              style={{
                ...styles.step,
                ...(i < currentStep ? styles.stepDone : {}),
                ...(i === currentStep ? styles.stepActive : {}),
              }}
            >
              <span style={styles.stepIcon}>
                {i < currentStep ? '✓' : i === currentStep ? '⋯' : '○'}
              </span>
              <div>
                <strong>{s.label}</strong>
                {i === currentStep && <span style={styles.stepSub}>{s.sub}</span>}
              </div>
            </div>
          ))}
        </div>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${((currentStep + 0.5) / AGENT_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(15, 20, 25, 0.95)',
    backdropFilter: 'blur(8px)',
  },
  content: {
    position: 'relative',
    maxWidth: '420px',
    width: '100%',
    padding: '2rem',
    background: 'linear-gradient(145deg, #1a2332 0%, #0f1419 100%)',
    borderRadius: '16px',
    border: '1px solid rgba(0, 200, 150, 0.3)',
    boxShadow: '0 0 60px rgba(0, 200, 150, 0.15)',
  },
  brainIcon: {
    position: 'relative',
    width: '64px',
    height: '64px',
    margin: '0 auto 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brainEmoji: { fontSize: '2.5rem', zIndex: 1 },
  pulse: {
    position: 'absolute',
    inset: '-8px',
    borderRadius: '50%',
    border: '2px solid rgba(0, 200, 150, 0.5)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  title: {
    fontSize: '1.25rem',
    textAlign: 'center',
    marginBottom: '0.25rem',
    background: 'linear-gradient(135deg, #00c896, #00a67d)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  steps: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    borderRadius: '8px',
    opacity: 0.6,
  },
  stepDone: { opacity: 1, color: 'var(--success)' },
  stepActive: {
    opacity: 1,
    background: 'rgba(0, 200, 150, 0.1)',
    border: '1px solid rgba(0, 200, 150, 0.3)',
  },
  stepIcon: {
    width: '24px',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  stepSub: {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '0.15rem',
  },
  progressBar: {
    marginTop: '1.5rem',
    height: '4px',
    background: 'var(--bg-secondary)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent), var(--accent-dim))',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
  },
}
