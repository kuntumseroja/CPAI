/**
 * CAPA AI Demo Simulator
 * Standalone simulation - no backend required.
 * Generates contextual mock responses based on finding input.
 */

import type {
  AnalysisResult,
  RCAResult,
  SimilarityResult,
  SimilarCase,
  CAPARecommendation,
  CorrectiveAction,
  PreventiveAction,
  RootCauseHypothesis,
  AgentStep,
  RAGDocument,
} from '../api/client'

// Simulate processing delay
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Keyword-based "intelligent" detection
function detectContext(text: string): {
  type: string
  categories: string[]
  factors: string[]
  severity: string
} {
  const t = text.toLowerCase()
  let type = 'deviation'
  if (t.includes('audit') || t.includes('temuan') || t.includes('finding')) type = 'audit'
  else if (t.includes('complaint') || t.includes('keluhan')) type = 'complaint'
  else if (t.includes('observation') || t.includes('observasi')) type = 'observation'

  const categories: string[] = []
  if (t.includes('calibration') || t.includes('kalibrasi')) categories.push('Machine', 'Calibration')
  if (t.includes('training') || t.includes('pelatihan') || t.includes('personnel')) categories.push('Man', 'Training')
  if (t.includes('sop') || t.includes('procedure') || t.includes('prosedur')) categories.push('Method', 'SOP')
  if (t.includes('documentation') || t.includes('dokumentasi') || t.includes('record')) categories.push('Method', 'Documentation')
  if (t.includes('temperature') || t.includes('suhu') || t.includes('storage')) categories.push('Environment', 'Cold chain')
  if (t.includes('material') || t.includes('bahan') || t.includes('raw')) categories.push('Material')
  if (categories.length === 0) categories.push('Method', 'Process control')

  const factors: string[] = []
  if (t.includes('overdue') || t.includes('terlambat')) factors.push('Schedule non-compliance')
  if (t.includes('gap') || t.includes('missing')) factors.push('Process gap')
  if (t.includes('drift') || t.includes('deviasi')) factors.push('Parameter drift')
  if (factors.length === 0) factors.push('Process deviation', 'Documentation gap')

  let severity = 'medium'
  if (t.includes('critical') || t.includes('batch') || t.includes('quarantine')) severity = 'high'
  if (t.includes('minor') || t.includes('observation')) severity = 'low'

  return { type, categories, factors, severity }
}

// Generate contextual 5-Why chain
function generateFiveWhy(_text: string, factors: string[]): string[] {
  const base = factors[0] || 'Process deviation'
  return [
    `Why did the ${base.toLowerCase()} occur?`,
    `Because process parameter or control was not maintained within specification.`,
    `Why was it out of specification?`,
    `Because preventive maintenance or calibration schedule was not followed.`,
    `Why was the schedule not followed?`,
    `Because tracking system or accountability was insufficient.`,
    `Root cause: Systemic process control gap requiring CAPA.`,
  ]
}

// Generate hypothesis from context
function generateHypothesis(text: string, ctx: ReturnType<typeof detectContext>): RootCauseHypothesis {
  const hypothesis = ctx.factors.length > 0
    ? `Root cause identified: ${ctx.factors[0]}. Contributing factors include ${ctx.categories.slice(0, 2).join(' and ')}.`
    : 'Process deviation with potential systemic cause. Further investigation recommended.'
  return {
    hypothesis,
    confidence: 0.85 + Math.random() * 0.1,
    supporting_evidence: [text.slice(0, 100) + '...'],
    contributing_factors: ctx.categories.slice(0, 3).map((c, i) => ({
      factor: ctx.factors[i] || c,
      category: c,
      relevance_score: 0.7 + Math.random() * 0.2,
    })),
  }
}

// SHAP-style feature importance from text
function getSimulatedShap(text: string): Record<string, number> {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
  const scores: Record<string, number> = {}
  const keywords = ['calibration', 'deviation', 'overdue', 'training', 'documentation', 'batch', 'temperature', 'sop']
  words.forEach((w, i) => {
    const base = keywords.includes(w) ? 0.9 : 0.5 - i * 0.02
    scores[w] = Math.round(Math.max(0.2, base) * 100) / 100
  })
  return Object.fromEntries(
    Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  )
}

// Simulated similar cases
function getSimilarCases(text: string, _ctx: ReturnType<typeof detectContext>): SimilarCase[] {
  const templates = [
    { id: 'CAPA-2024-001', text: 'Calibration overdue for equipment in production line', score: 0.88, recur: true },
    { id: 'CAPA-2024-002', text: 'Documentation gap in batch record review', score: 0.72, recur: false },
    { id: 'CAPA-2023-045', text: 'Temperature excursion during cold storage', score: 0.65, recur: false },
    { id: 'CAPA-2024-003', text: 'Training record not updated for new personnel', score: 0.78, recur: false },
    { id: 'CAPA-2023-089', text: 'SOP deviation in aseptic filling process', score: 0.71, recur: false },
  ]
  const hasCalib = text.toLowerCase().includes('calibration')
  const cases = templates.map((t) => ({
    case_id: t.id,
    similarity_score: hasCalib && t.text.includes('Calibration') ? t.score : t.score * 0.95,
    finding_text: t.text,
    resolution_summary: 'CAPA implemented, recurrence monitoring in place.',
    is_potential_recurrence: t.recur && (hasCalib || Math.random() > 0.5),
  }))
  return cases.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, 5)
}

// Generate CAPA actions from context
function generateCAPA(ctx: ReturnType<typeof detectContext>, department: string): CAPARecommendation {
  const dept = department || 'QA'
  const corrective: CorrectiveAction[] = [
    { action: 'Immediate containment and impact assessment', responsible_department: dept, timeline_days: 1, effectiveness_metrics: ['Containment completion', 'Batch status'] },
    { action: 'Root cause verification and CAPA plan approval', responsible_department: dept, timeline_days: 7, effectiveness_metrics: ['CAPA approval', 'Implementation start'] },
  ]
  const preventive: PreventiveAction[] = [
    {
      action: ctx.categories.includes('Calibration') ? 'Update calibration schedule and implement automated reminders' : 'Update SOP and implement preventive controls',
      responsible_department: dept,
      timeline_days: 30,
      systemic_improvement: 'Prevent recurrence through process control and monitoring.',
    },
  ]
  return {
    corrective_actions: corrective,
    preventive_actions: preventive,
    effectiveness_metrics: ['Recurrence rate', 'Compliance score', 'Training completion'],
    implementation_timeline_days: 30,
    effectiveness_score: 0.85 + Math.random() * 0.1,
    regulatory_alignment: true,
    human_review_required: ctx.severity === 'high',
  }
}

export async function simulateAnalysis(finding: {
  finding_text: string
  department?: string
  product_line?: string
  source?: string
}): Promise<AnalysisResult> {
  await delay(800 + Math.random() * 700) // 0.8–1.5s simulated processing

  const ctx = detectContext(finding.finding_text)
  const hypothesis = generateHypothesis(finding.finding_text, ctx)
  const similarCases = getSimilarCases(finding.finding_text, ctx)
  const potentialRecurrences = similarCases.filter((c) => c.is_potential_recurrence)

  const rca: RCAResult = {
    finding_type: ctx.type,
    classification_confidence: 0.88 + Math.random() * 0.08,
    root_cause_hypotheses: [hypothesis],
    contributing_factors: hypothesis.contributing_factors,
    ishikawa_categories: Object.fromEntries(
      [
        ['Man', ctx.categories.includes('Man') ? ['Training', 'Competency'] : ['Training']],
        ['Method', ctx.categories.includes('Method') ? ['SOP', 'Documentation'] : ['Process']],
        ['Machine', ctx.categories.includes('Machine') ? ['Calibration', 'Maintenance'] : ['Equipment']],
        ['Material', ctx.categories.includes('Material') ? ['Specification', 'Handling'] : []],
        ['Environment', ctx.categories.includes('Environment') ? ['Storage', 'Monitoring'] : []],
      ].filter(([, v]) => v.length > 0)
    ),
    five_why_chain: generateFiveWhy(finding.finding_text, ctx.factors),
    confidence_score: 0.85 + Math.random() * 0.1,
    requires_human_review: ctx.severity === 'high' || potentialRecurrences.length > 0,
    shap_values: getSimulatedShap(finding.finding_text),
  }

  const similarity: SimilarityResult = {
    query_finding: finding.finding_text,
    similar_cases: similarCases,
    potential_recurrences: potentialRecurrences,
    search_latency_ms: 120 + Math.random() * 80,
  }

  const capa_recommendation = generateCAPA(ctx, finding.department || '')

  // Simulated Agent pipeline (LangGraph)
  const agent_steps: AgentStep[] = [
    { step: 'classify', label: 'NLP Classification', status: 'completed', output: `Type: ${ctx.type} (${(0.9 * 100).toFixed(0)}% confidence)`, duration_ms: 120 },
    { step: 'retrieve', label: 'RAG Retrieval', status: 'completed', output: `Retrieved ${5} documents, ${similarCases.length} similar cases`, duration_ms: 180 },
    { step: 'analyze', label: 'Causal Inference (RCA)', status: 'completed', output: 'Ishikawa + 5-Why analysis complete', duration_ms: 450 },
    { step: 'generate', label: 'CAPA Generation', status: 'completed', output: `${capa_recommendation.corrective_actions.length} corrective + ${capa_recommendation.preventive_actions.length} preventive actions`, duration_ms: 380 },
    { step: 'validate', label: 'XAI Validation', status: 'completed', output: `Confidence: ${(rca.confidence_score * 100).toFixed(0)}%, SHAP features extracted`, duration_ms: 90 },
  ]

  // Simulated RAG context (LlamaIndex hybrid retrieval)
  const rag_context: RAGDocument[] = [
    { id: 'SOP-QA-001', source: 'SOP QA-001', content: 'Deviation handling requires immediate containment and root cause analysis within 7 days. 5-Why analysis mandatory.', relevance: 0.92, doc_type: 'sop' },
    { id: 'SOP-CAL-002', source: 'SOP CAL-002', content: 'Equipment calibration schedule: every 6 months. Automated reminders must be configured in CMMS.', relevance: 0.88, doc_type: 'sop' },
    { id: 'CAPA-2024-001', source: 'Historical CAPA', content: 'Similar case: Calibration overdue for equipment. Resolution: Updated schedule, implemented CMMS alerts.', relevance: 0.85, doc_type: 'historical_capa' },
    { id: 'GMP-21CFR', source: '21 CFR Part 11', content: 'Electronic records and signatures. Audit trail required for all quality decisions.', relevance: 0.78, doc_type: 'regulation' },
    { id: 'SOP-GMP-012', source: 'SOP GMP-012', content: 'Preventive maintenance and calibration tracking. Department head accountable for compliance.', relevance: 0.82, doc_type: 'sop' },
  ]

  return {
    finding_id: `demo-${Date.now()}`,
    rca,
    similarity,
    capa_recommendation,
    agent_steps,
    rag_context,
    created_at: new Date().toISOString(),
  }
}

export function simulateHealthCheck(): Promise<{ status: string }> {
  return Promise.resolve({ status: 'healthy' })
}

/** Pre-generated sample analysis for instant demo view */
export async function getSampleAnalysis(): Promise<AnalysisResult> {
  const sampleFinding = {
    finding_text: 'Calibration overdue for equipment in production line A. Last calibration was 8 months ago.',
    department: 'Production',
    product_line: 'Vaccines',
    source: 'Q100+',
  }
  return simulateAnalysis(sampleFinding)
}
