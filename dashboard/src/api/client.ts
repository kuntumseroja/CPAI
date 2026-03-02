const API_BASE = '/v1';

export interface FindingInput {
  finding_text: string;
  source?: string;
  department?: string;
  product_line?: string;
}

export interface AnalysisRequest {
  finding: FindingInput;
  include_similarity?: boolean;
  include_capa_recommendation?: boolean;
}

export interface AgentStep {
  step: string;
  label: string;
  status: 'completed';
  output?: string;
  duration_ms: number;
}

export interface RAGDocument {
  id: string;
  source: string;
  content: string;
  relevance: number;
  doc_type: 'sop' | 'historical_capa' | 'regulation';
}

export interface AnalysisResult {
  finding_id?: string;
  rca?: RCAResult;
  similarity?: SimilarityResult;
  capa_recommendation?: CAPARecommendation;
  agent_steps?: AgentStep[];
  rag_context?: RAGDocument[];
  created_at?: string;
}

export interface RCAResult {
  finding_type: string;
  classification_confidence: number;
  root_cause_hypotheses: RootCauseHypothesis[];
  contributing_factors: ContributingFactor[];
  ishikawa_categories?: Record<string, string[]>;
  five_why_chain?: string[];
  confidence_score: number;
  requires_human_review: boolean;
  shap_values?: Record<string, number>;
}

export interface RootCauseHypothesis {
  hypothesis: string;
  confidence: number;
  supporting_evidence: string[];
  contributing_factors: ContributingFactor[];
}

export interface ContributingFactor {
  factor: string;
  category: string;
  relevance_score: number;
}

export interface CorrectiveAction {
  action: string;
  responsible_department: string;
  timeline_days: number;
  effectiveness_metrics: string[];
}

export interface PreventiveAction {
  action: string;
  responsible_department: string;
  timeline_days: number;
  systemic_improvement: string;
}

export interface CAPARecommendation {
  corrective_actions: CorrectiveAction[];
  preventive_actions: PreventiveAction[];
  effectiveness_metrics: string[];
  implementation_timeline_days: number;
  effectiveness_score: number;
  regulatory_alignment: boolean;
  human_review_required: boolean;
}

export interface SimilarCase {
  case_id: string;
  similarity_score: number;
  finding_text: string;
  resolution_summary?: string;
  is_potential_recurrence: boolean;
}

export interface SimilarityResult {
  query_finding: string;
  similar_cases: SimilarCase[];
  potential_recurrences: SimilarCase[];
  search_latency_ms: number;
}

async function realSubmitFinding(request: AnalysisRequest): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/findings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function realSubmitFeedback(
  analysisId: string,
  approved: boolean,
  feedbackNotes?: string
): Promise<{ feedback_id: string }> {
  const params = new URLSearchParams({ analysis_id: analysisId, approved: String(approved) });
  if (feedbackNotes) params.set('feedback_notes', feedbackNotes);
  const res = await fetch(`${API_BASE}/feedback?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function realHealthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function submitFinding(
  request: AnalysisRequest,
  useDemo: boolean
): Promise<AnalysisResult> {
  if (useDemo) {
    const { simulateAnalysis } = await import('../demo/simulator');
    return simulateAnalysis(request.finding);
  }
  return realSubmitFinding(request);
}

export async function submitFeedback(
  analysisId: string,
  approved: boolean,
  feedbackNotes?: string,
  useDemo?: boolean
): Promise<{ feedback_id: string }> {
  if (useDemo) {
    return Promise.resolve({
      feedback_id: `demo-fb-${Date.now()}`,
    });
  }
  return realSubmitFeedback(analysisId, approved, feedbackNotes);
}

export const STORAGE_KEY = 'capa_last_analysis';

export async function healthCheck(useDemo?: boolean): Promise<{ status: string }> {
  if (useDemo) {
    const { simulateHealthCheck } = await import('../demo/simulator');
    return simulateHealthCheck();
  }
  return realHealthCheck();
}
