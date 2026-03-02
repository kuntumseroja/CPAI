import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { submitFeedback, STORAGE_KEY } from '../api/client'
import { useDemoMode } from '../demo/DemoContext'
import type { AnalysisResult, RCAResult, CAPARecommendation, SimilarityResult, AgentStep, RAGDocument } from '../api/client'

export default function AnalysisResultPage() {
  const { isDemoMode } = useDemoMode()
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [feedbackSent, setFeedbackSent] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) setAnalysis(JSON.parse(stored))
  }, [])

  const handleFeedback = async (approved: boolean) => {
    const id = analysis?.finding_id ?? `analysis-${Date.now()}`
    try {
      await submitFeedback(id, approved, undefined, isDemoMode)
      setFeedbackSent(true)
    } catch (err) {
      console.error(err)
    }
  }

  if (!analysis) {
    return (
      <div style={styles.empty}>
        <p>No analysis data. Submit a finding first.</p>
        <Link to="/submit" style={styles.link}>Submit Finding</Link>
      </div>
    )
  }

  const { rca, similarity, capa_recommendation, agent_steps, rag_context } = analysis

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Analysis Result</h1>

      {agent_steps && agent_steps.length > 0 && (
        <AgentPipelineCard steps={agent_steps} />
      )}
      {rag_context && rag_context.length > 0 && (
        <RAGContextCard documents={rag_context} />
      )}
      {rca && <RCACard rca={rca} />}
      {similarity && <SimilarityCard similarity={similarity} />}
      {capa_recommendation && <CAPACard capa={capa_recommendation} />}

      <section style={styles.feedback}>
        <h3 style={styles.sectionTitle}>Feedback</h3>
        <p style={styles.feedbackDesc}>Was this analysis helpful?</p>
        <div style={styles.feedbackButtons}>
          <button
            onClick={() => handleFeedback(true)}
            disabled={feedbackSent}
            style={{ ...styles.fbButton, ...styles.fbApprove }}
          >
            Approve
          </button>
          <button
            onClick={() => handleFeedback(false)}
            disabled={feedbackSent}
            style={{ ...styles.fbButton, ...styles.fbReject }}
          >
            Reject
          </button>
        </div>
        {feedbackSent && <p style={styles.feedbackSent}>Thank you for your feedback.</p>}
      </section>

      <Link to="/submit" style={styles.newAnalysis}>Submit New Finding</Link>
    </div>
  )
}

function AgentPipelineCard({ steps }: { steps: AgentStep[] }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>Agent Pipeline (LangGraph)</h2>
      <p style={styles.pipelineDesc}>Multi-agent workflow: classify → retrieve → analyze → generate → validate</p>
      <div style={styles.pipeline}>
        {steps.map((s, i) => (
          <div key={s.step} style={styles.pipelineStep}>
            <span style={styles.stepNum}>{i + 1}</span>
            <div style={styles.stepContent}>
              <strong>{s.label}</strong>
              {s.output && <span style={styles.stepOutput}>{s.output}</span>}
              <span style={styles.stepDuration}>{s.duration_ms}ms</span>
            </div>
            <span style={styles.stepStatus}>✓</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function RAGContextCard({ documents }: { documents: RAGDocument[] }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>RAG Retrieval (LlamaIndex)</h2>
      <p style={styles.ragDesc}>Retrieved context grounding AI outputs — SOPs, historical CAPAs, regulations</p>
      <div style={styles.ragList}>
        {documents.map((d) => (
          <div key={d.id} style={styles.ragDoc}>
            <div style={styles.ragHeader}>
              <span style={styles.ragSource}>{d.source}</span>
              <span style={styles.ragType}>{d.doc_type}</span>
              <span style={styles.ragRel}>{(d.relevance * 100).toFixed(0)}%</span>
            </div>
            <p style={styles.ragContent}>{d.content}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function RCACard({ rca }: { rca: RCAResult }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>Root Cause Analysis</h2>
      <div style={styles.meta}>
        <span>Type: {rca.finding_type}</span>
        <span>Confidence: {(rca.confidence_score * 100).toFixed(0)}%</span>
        {rca.requires_human_review && (
          <span style={styles.reviewBadge}>Human review required</span>
        )}
      </div>
      {rca.root_cause_hypotheses?.map((h, i) => (
        <div key={i} style={styles.hypothesis}>
          <strong>{h.hypothesis}</strong>
          <span style={styles.confidence}>{(h.confidence * 100).toFixed(0)}%</span>
        </div>
      ))}
      {rca.five_why_chain && rca.five_why_chain.length > 0 && (
        <div style={styles.fiveWhy}>
          <h4>5-Why Chain</h4>
          <ol style={styles.fiveWhyOl}>
            {rca.five_why_chain.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}
      {rca.shap_values && Object.keys(rca.shap_values).length > 0 && (
        <div style={styles.shap}>
          <h4>Key Factors (XAI)</h4>
          <div style={styles.shapList}>
            {Object.entries(rca.shap_values).map(([k, v]) => (
              <span key={k} style={styles.shapItem}>{k}: {(v * 100).toFixed(0)}%</span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function SimilarityCard({ similarity }: { similarity: SimilarityResult }) {
  const hasRecurrence = similarity.potential_recurrences?.length > 0
  return (
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>Similar Cases</h2>
      {hasRecurrence && (
        <div style={styles.recurrenceAlert}>
          ⚠ Potential recurrence detected ({similarity.potential_recurrences?.length} cases)
        </div>
      )}
      <div style={styles.similarList}>
        {similarity.similar_cases?.slice(0, 5).map((c) => (
          <div key={c.case_id} style={styles.similarItem}>
            <div style={styles.similarHeader}>
              <span>{c.case_id}</span>
              <span style={c.is_potential_recurrence ? styles.recurBadge : styles.score}>
                {(c.similarity_score * 100).toFixed(0)}%
              </span>
            </div>
            <p style={styles.similarText}>{c.finding_text}</p>
          </div>
        ))}
      </div>
      <p style={styles.latency}>Search: {similarity.search_latency_ms?.toFixed(0)}ms</p>
    </section>
  )
}

function CAPACard({ capa }: { capa: CAPARecommendation }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>CAPA Recommendations</h2>
      <div style={styles.meta}>
        <span>Effectiveness: {(capa.effectiveness_score * 100).toFixed(0)}%</span>
        <span>Timeline: {capa.implementation_timeline_days} days</span>
      </div>
      <div style={styles.actions}>
        <h4>Corrective Actions</h4>
        {capa.corrective_actions?.map((a, i) => (
          <div key={i} style={styles.actionItem}>
            <p style={styles.actionItemP}>{a.action}</p>
            <span style={styles.actionItemSpan}>{a.responsible_department} • {a.timeline_days}d</span>
          </div>
        ))}
      </div>
      <div style={styles.actions}>
        <h4>Preventive Actions</h4>
        {capa.preventive_actions?.map((a, i) => (
          <div key={i} style={styles.actionItem}>
            <p style={styles.actionItemP}>{a.action}</p>
            <span style={styles.actionItemSpan}>{a.responsible_department} • {a.timeline_days}d</span>
          </div>
        ))}
      </div>
    </section>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  title: { fontSize: '1.5rem', marginBottom: '0.5rem' },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-secondary)',
  },
  link: {
    display: 'inline-block',
    marginTop: '1rem',
    color: 'var(--accent)',
    textDecoration: 'none',
  },
  card: {
    padding: '1.5rem',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  },
  pipelineDesc: { fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' },
  pipeline: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  pipelineStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    background: 'var(--bg-secondary)',
    borderRadius: '8px',
  },
  stepNum: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  stepContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  stepOutput: { fontSize: '0.85rem', color: 'var(--text-secondary)' },
  stepDuration: { fontSize: '0.8rem', color: 'var(--accent)' },
  stepStatus: { color: 'var(--success)', fontSize: '1.2rem' },
  ragDesc: { fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' },
  ragList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  ragDoc: {
    padding: '0.75rem',
    background: 'var(--bg-secondary)',
    borderRadius: '8px',
    borderLeft: '3px solid var(--accent)',
  },
  ragHeader: { display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' },
  ragSource: { fontWeight: 600, color: 'var(--accent)' },
  ragType: { fontSize: '0.75rem', padding: '0.1rem 0.4rem', background: 'var(--bg-card)', borderRadius: '4px', color: 'var(--text-secondary)' },
  ragRel: { fontSize: '0.85rem', color: 'var(--success)', marginLeft: 'auto' },
  ragContent: { fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 },
  cardTitle: { fontSize: '1.1rem', marginBottom: '1rem' },
  meta: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  reviewBadge: { color: 'var(--warning)' },
  hypothesis: {
    marginBottom: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  confidence: { color: 'var(--accent)', fontSize: '0.9rem' },
  fiveWhy: { marginTop: '1rem' },
  fiveWhyOl: { marginLeft: '1.25rem', marginTop: '0.5rem' },
  shap: { marginTop: '1rem' },
  shapList: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' },
  shapItem: {
    padding: '0.25rem 0.5rem',
    background: 'var(--bg-secondary)',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  recurrenceAlert: {
    padding: '0.75rem',
    background: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid var(--warning)',
    borderRadius: '8px',
    marginBottom: '1rem',
    color: 'var(--warning)',
  },
  similarList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  similarItem: {
    padding: '0.75rem',
    background: 'var(--bg-secondary)',
    borderRadius: '8px',
  },
  similarHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' },
  score: { color: 'var(--text-secondary)' },
  recurBadge: { color: 'var(--warning)' },
  similarText: { fontSize: '0.9rem', color: 'var(--text-secondary)' },
  latency: { fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' },
  actions: { marginTop: '1rem' },
  actionItem: {
    padding: '0.75rem',
    background: 'var(--bg-secondary)',
    borderRadius: '8px',
    marginTop: '0.5rem',
  },
  actionItemP: { marginBottom: '0.25rem' },
  actionItemSpan: { fontSize: '0.85rem', color: 'var(--text-secondary)' },
  feedback: {
    padding: '1.5rem',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  },
  sectionTitle: { marginBottom: '0.5rem' },
  feedbackDesc: { color: 'var(--text-secondary)', marginBottom: '0.75rem' },
  feedbackButtons: { display: 'flex', gap: '0.5rem' },
  fbButton: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  fbApprove: { background: 'var(--success)', color: 'white' },
  fbReject: { background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)' },
  feedbackSent: { marginTop: '0.5rem', color: 'var(--success)' },
  newAnalysis: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    background: 'var(--accent)',
    color: 'var(--bg-primary)',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    alignSelf: 'flex-start',
  },
}
