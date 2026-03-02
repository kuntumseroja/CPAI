/**
 * CAPA AI Demo Simulator
 * Standalone simulation - no backend required.
 * Uses scenario-specific presets for realistic Bio Farma pharma outputs.
 */

import type {
  AnalysisResult,
  RCAResult,
  SimilarityResult,
  CAPARecommendation,
  AgentStep,
} from '../api/client'
import { SCENARIO_PRESETS, detectScenarioId } from './simulatorPresets'

// Simulate processing delay
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Add slight variance to scores for realism (deterministic from text)
function addVariance(value: number, seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i) | 0
  const r = Math.abs(h % 100) / 100
  return Math.min(1, Math.max(0.1, value + (r - 0.5) * 0.06))
}

export async function simulateAnalysis(finding: {
  finding_text: string
  department?: string
  product_line?: string
  source?: string
}): Promise<AnalysisResult> {
  await delay(800 + Math.random() * 700) // 0.8–1.5s simulated processing

  const scenarioId = detectScenarioId(finding.finding_text)
  const preset = SCENARIO_PRESETS[scenarioId]
  const seed = finding.finding_text.slice(0, 50)

  const confidenceScore = addVariance(preset.rootCauseHypothesis.confidence, seed)
  const dept = finding.department || 'QA'

  const rca: RCAResult = {
    finding_type: scenarioId === 'audit' ? 'audit' : scenarioId === 'complaint' ? 'complaint' : scenarioId === 'temperature' ? 'deviation' : 'deviation',
    classification_confidence: addVariance(0.9, seed),
    root_cause_hypotheses: [{
      ...preset.rootCauseHypothesis,
      confidence: confidenceScore,
    }],
    contributing_factors: preset.rootCauseHypothesis.contributing_factors,
    ishikawa_categories: preset.ishikawaCategories,
    five_why_chain: preset.fiveWhyChain,
    confidence_score: confidenceScore,
    requires_human_review: scenarioId === 'complaint' || scenarioId === 'temperature' || (scenarioId === 'calibration' && preset.similarCases.some(c => c.is_potential_recurrence)),
    shap_values: preset.shapKeywords,
  }

  const similarCases = preset.similarCases.map((c) => ({
    ...c,
    similarity_score: addVariance(c.similarity_score, c.case_id + seed),
  })).sort((a, b) => b.similarity_score - a.similarity_score).slice(0, 5)

  const potentialRecurrences = similarCases.filter((c) => c.is_potential_recurrence)

  const similarity: SimilarityResult = {
    query_finding: finding.finding_text,
    similar_cases: similarCases,
    potential_recurrences: potentialRecurrences,
    search_latency_ms: 120 + Math.random() * 80,
  }

  const correctiveActions = preset.correctiveActions.map((a) => ({
    ...a,
    responsible_department: a.responsible_department === 'QA' && dept ? dept : a.responsible_department,
  }))
  const preventiveActions = preset.preventiveActions.map((a) => ({
    ...a,
    responsible_department: a.responsible_department === 'QA' && dept ? dept : a.responsible_department,
  }))

  const capa_recommendation: CAPARecommendation = {
    corrective_actions: correctiveActions,
    preventive_actions: preventiveActions,
    effectiveness_metrics: ['Recurrence rate', 'Compliance score', 'Training completion'],
    implementation_timeline_days: Math.max(...correctiveActions.map((a) => a.timeline_days), ...preventiveActions.map((a) => a.timeline_days)),
    effectiveness_score: addVariance(0.88, seed),
    regulatory_alignment: true,
    human_review_required: rca.requires_human_review,
  }

  const agent_steps: AgentStep[] = [
    { step: 'classify', label: 'NLP Classification', status: 'completed', output: `Type: ${rca.finding_type} (${(rca.classification_confidence * 100).toFixed(0)}% confidence)`, duration_ms: 95 + Math.floor(Math.random() * 50) },
    { step: 'retrieve', label: 'RAG Retrieval', status: 'completed', output: `Retrieved ${preset.ragDocuments.length} documents, ${similarCases.length} similar cases`, duration_ms: 150 + Math.floor(Math.random() * 80) },
    { step: 'analyze', label: 'Causal Inference (RCA)', status: 'completed', output: 'Ishikawa + 5-Why analysis complete', duration_ms: 380 + Math.floor(Math.random() * 120) },
    { step: 'generate', label: 'CAPA Generation', status: 'completed', output: `${correctiveActions.length} corrective + ${preventiveActions.length} preventive actions`, duration_ms: 320 + Math.floor(Math.random() * 100) },
    { step: 'validate', label: 'XAI Validation', status: 'completed', output: `Confidence: ${(confidenceScore * 100).toFixed(0)}%, SHAP features extracted`, duration_ms: 75 + Math.floor(Math.random() * 40) },
  ]

  return {
    finding_id: `demo-${Date.now()}`,
    rca,
    similarity,
    capa_recommendation,
    agent_steps,
    rag_context: preset.ragDocuments,
    created_at: new Date().toISOString(),
  }
}

export function simulateHealthCheck(): Promise<{ status: string }> {
  return Promise.resolve({ status: 'healthy' })
}

/** Pre-generated sample analysis for instant demo view */
export async function getSampleAnalysis(): Promise<AnalysisResult> {
  const sampleFinding = {
    finding_text: 'Calibration overdue for equipment in production line A. Last calibration was 8 months ago, exceeding the 6-month schedule per SOP CAL-002. Equipment ID: EQ-PROD-001.',
    department: 'Production',
    product_line: 'Vaccines',
    source: 'Q100+',
  }
  return simulateAnalysis(sampleFinding)
}
