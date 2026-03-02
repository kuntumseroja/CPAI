/**
 * Scenario-specific presets for Bio Farma pharma simulation
 * Each finding type has unique RCA, RAG, similar cases, CAPA
 */

import type { RAGDocument, SimilarCase, CorrectiveAction, PreventiveAction, RootCauseHypothesis } from '../api/client'

export type ScenarioId = 'calibration' | 'training' | 'documentation' | 'temperature' | 'audit' | 'complaint' | 'default'

export interface ScenarioPreset {
  scenarioId: ScenarioId
  fiveWhyChain: string[]
  rootCauseHypothesis: Omit<RootCauseHypothesis, 'confidence'> & { confidence: number }
  ragDocuments: RAGDocument[]
  similarCases: SimilarCase[]
  correctiveActions: CorrectiveAction[]
  preventiveActions: PreventiveAction[]
  ishikawaCategories: Record<string, string[]>
  shapKeywords: Record<string, number>
}

export const SCENARIO_PRESETS: Record<ScenarioId, ScenarioPreset> = {
  calibration: {
    scenarioId: 'calibration',
    fiveWhyChain: [
      'Why was calibration overdue for equipment EQ-PROD-001?',
      'Because the CMMS reminder was not triggered or was ignored.',
      'Why was the reminder not effective?',
      'Because the calibration schedule was not synced with CMMS after SOP CAL-002 revision.',
      'Why was the sync not performed?',
      'Because the handover from Engineering to Production did not include calibration schedule verification.',
      'Root cause: Process gap in CMMS–SOP alignment and accountability for maintenance tracking.',
    ],
    rootCauseHypothesis: {
      hypothesis: 'Root cause: Calibration schedule non-compliance due to CMMS configuration gap. Contributing factors: Machine (Calibration), Method (SOP tracking).',
      confidence: 0.91,
      supporting_evidence: ['Equipment ID EQ-PROD-001', '8 months since last calibration (SOP: 6 months)', 'SOP CAL-002 applicable'],
      contributing_factors: [
        { factor: 'CMMS schedule not updated', category: 'Machine', relevance_score: 0.92 },
        { factor: 'SOP CAL-002 compliance gap', category: 'Method', relevance_score: 0.88 },
        { factor: 'Accountability for maintenance', category: 'Man', relevance_score: 0.75 },
      ],
    },
    ragDocuments: [
      { id: 'SOP-CAL-002', source: 'SOP CAL-002', content: 'Equipment calibration schedule: every 6 months for production equipment. CMMS must be configured with automated reminders. Production and Engineering jointly accountable.', relevance: 0.95, doc_type: 'sop' },
      { id: 'SOP-GMP-012', source: 'SOP GMP-012', content: 'Preventive maintenance and calibration tracking. Department head accountable for compliance. Deviations require CAPA.', relevance: 0.92, doc_type: 'sop' },
      { id: 'CAPA-2024-001', source: 'CAPA-2024-001', content: 'Similar: Calibration overdue EQ-PROD-003. Resolution: Updated CMMS, implemented bi-weekly schedule review.', relevance: 0.89, doc_type: 'historical_capa' },
      { id: 'WHO-TRS-1025', source: 'WHO TRS 1025', content: 'GMP for vaccine production: Equipment must be calibrated within defined intervals. Deviations must be documented and investigated.', relevance: 0.85, doc_type: 'regulation' },
      { id: 'SOP-QA-001', source: 'SOP QA-001', content: 'Deviation handling: Immediate containment, root cause analysis within 7 days. 5-Why mandatory for equipment-related deviations.', relevance: 0.82, doc_type: 'sop' },
    ],
    similarCases: [
      { case_id: 'CAPA-2024-001', finding_text: 'Calibration overdue for equipment in production line A. Last calibration 8 months ago.', similarity_score: 0.94, resolution_summary: 'CMMS updated, automated reminders implemented.', is_potential_recurrence: true },
      { case_id: 'CAPA-2023-078', finding_text: 'Calibration overdue for filling machine EQ-FILL-002.', similarity_score: 0.87, resolution_summary: 'Schedule revised, Engineering–Production handover improved.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-003', finding_text: 'Training record not updated for calibration technician.', similarity_score: 0.68, resolution_summary: 'Training completed, competency matrix updated.', is_potential_recurrence: false },
      { case_id: 'CAPA-2023-045', finding_text: 'Temperature excursion during cold storage.', similarity_score: 0.52, resolution_summary: 'Cold chain SOP updated, monitoring enhanced.', is_potential_recurrence: false },
      { case_id: 'CAPA-2023-089', finding_text: 'SOP deviation in aseptic filling process.', similarity_score: 0.48, resolution_summary: 'Gowning SOP re-training, observation checklist added.', is_potential_recurrence: false },
    ],
    correctiveActions: [
      { action: 'Immediate quarantine of production equipment EQ-PROD-001 until calibration completed.', responsible_department: 'Production', timeline_days: 1, effectiveness_metrics: ['Equipment status', 'Batch impact'] },
      { action: 'Verify CMMS calibration schedule for all production equipment; align with SOP CAL-002.', responsible_department: 'Engineering', timeline_days: 3, effectiveness_metrics: ['CMMS accuracy', 'Schedule compliance'] },
      { action: 'Root cause verification and CAPA plan approval', responsible_department: 'QA', timeline_days: 7, effectiveness_metrics: ['CAPA approval', 'Implementation start'] },
    ],
    preventiveActions: [
      { action: 'Implement automated CMMS reminders for calibration; integrate with Engineering–Production handover checklist.', responsible_department: 'Engineering', timeline_days: 30, systemic_improvement: 'Prevent recurrence through automated tracking and clear accountability.' },
    ],
    ishikawaCategories: { Man: ['Training', 'Accountability'], Machine: ['Calibration', 'Maintenance'], Method: ['SOP', 'CMMS tracking'] },
    shapKeywords: { calibration: 0.95, overdue: 0.92, equipment: 0.88, schedule: 0.85, sop: 0.82 },
  },

  training: {
    scenarioId: 'training',
    fiveWhyChain: [
      'Why were training records not updated for 3 operators?',
      'Because the training coordinator did not track refresher due dates.',
      'Why was tracking insufficient?',
      'Because the competency matrix was not linked to the training calendar.',
      'Why was the link not established?',
      'Because the HR system transition did not include training module integration.',
      'Root cause: Process gap in training–competency tracking and system integration.',
    ],
    rootCauseHypothesis: {
      hypothesis: 'Root cause: Training record gap due to competency tracking system failure. Contributing factors: Man (Training), Method (Process control).',
      confidence: 0.88,
      supporting_evidence: ['3 operators in aseptic filling', 'GMP refresher required within 12 months', 'Internal audit finding'],
      contributing_factors: [
        { factor: 'Competency matrix not updated', category: 'Man', relevance_score: 0.90 },
        { factor: 'Training calendar not linked',
          category: 'Method',
          relevance_score: 0.85 },
        { factor: 'HR system integration gap', category: 'Method', relevance_score: 0.78 },
      ],
    },
    ragDocuments: [
      { id: 'SOP-HR-015', source: 'SOP HR-015', content: 'GMP training: Refresher required every 12 months. Competency matrix must be updated within 5 days of training completion.', relevance: 0.92, doc_type: 'sop' },
      { id: 'SOP-GMP-008', source: 'SOP GMP-008', content: 'Aseptic area personnel: Mandatory GMP refresher before entry. Training record must be current.', relevance: 0.90, doc_type: 'sop' },
      { id: 'CAPA-2024-003', source: 'CAPA-2024-003', content: 'Similar: Training gap for 2 operators. Resolution: Competency matrix automated, training module added to HR.', relevance: 0.86, doc_type: 'historical_capa' },
      { id: 'WHO-TRS-1025', source: 'WHO TRS 1025', content: 'Personnel training: All personnel must be trained and qualified. Records must be maintained and auditable.', relevance: 0.84, doc_type: 'regulation' },
      { id: 'PIC-S-PE-009', source: 'PIC/S PE 009', content: 'Personnel training and qualification. Deviations from training require documented justification.', relevance: 0.80, doc_type: 'regulation' },
    ],
    similarCases: [
      { case_id: 'CAPA-2024-003', finding_text: 'Training record not updated for new personnel in aseptic filling area.', similarity_score: 0.96, resolution_summary: 'Competency matrix automated, HR training module integrated.', is_potential_recurrence: false },
      { case_id: 'CAPA-2023-091', finding_text: 'GMP refresher overdue for 2 operators in production.', similarity_score: 0.89, resolution_summary: 'Training completed, tracking system improved.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-003', finding_text: 'Calibration overdue for equipment in production line A.', similarity_score: 0.55, resolution_summary: 'CMMS updated, automated reminders implemented.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-002', finding_text: 'Documentation deviation in batch record review.', similarity_score: 0.52, resolution_summary: 'Dual verification SOP implemented.', is_potential_recurrence: false },
      { case_id: 'CAPA-2023-045', finding_text: 'Temperature excursion during cold storage.', similarity_score: 0.45, resolution_summary: 'Cold chain SOP updated.', is_potential_recurrence: false },
    ],
    correctiveActions: [
      { action: 'Immediate removal of 3 operators from aseptic area until GMP refresher completed.', responsible_department: 'Production', timeline_days: 1, effectiveness_metrics: ['Personnel status', 'Area compliance'] },
      { action: 'Schedule and complete GMP refresher training within 5 days.', responsible_department: 'HR', timeline_days: 5, effectiveness_metrics: ['Training completion', 'Competency matrix'] },
      { action: 'Verify competency matrix for all aseptic area personnel.', responsible_department: 'QA', timeline_days: 7, effectiveness_metrics: ['Matrix accuracy', 'Compliance'] },
    ],
    preventiveActions: [
      { action: 'Integrate training calendar with competency matrix; implement automated alerts for refresher due dates.', responsible_department: 'HR', timeline_days: 45, systemic_improvement: 'Prevent recurrence through automated training tracking.' },
    ],
    ishikawaCategories: { Man: ['Training', 'Competency'], Method: ['Process control', 'HR system'] },
    shapKeywords: { training: 0.94, personnel: 0.90, aseptic: 0.87, gmp: 0.85, refresher: 0.88 },
  },

  documentation: {
    scenarioId: 'documentation',
    fiveWhyChain: [
      'Why was the critical parameter entry left blank and signed off?',
      'Because the reviewer did not verify the entry before signing.',
      'Why was verification skipped?',
      'Because the dual-verification step was not enforced in the batch record.',
      'Why was it not enforced?',
      'Because the SOP revision removed the dual-signature requirement for this parameter.',
      'Root cause: SOP revision introduced gap in batch record verification; process control failure.',
    ],
    rootCauseHypothesis: {
      hypothesis: 'Root cause: Documentation deviation due to SOP revision gap and verification bypass. Contributing factors: Method (Documentation), Man (Verification).',
      confidence: 0.89,
      supporting_evidence: ['Batch #2024-0456', 'Critical parameter blank', 'Bizzmine source'],
      contributing_factors: [
        { factor: 'Dual verification not performed', category: 'Method', relevance_score: 0.91 },
        { factor: 'SOP revision gap', category: 'Method', relevance_score: 0.88 },
        { factor: 'Reviewer competency', category: 'Man', relevance_score: 0.75 },
      ],
    },
    ragDocuments: [
      { id: 'SOP-BR-004', source: 'SOP BR-004', content: 'Batch record review: Critical parameters require dual verification. Blank entries must be justified and documented.', relevance: 0.94, doc_type: 'sop' },
      { id: '21CFR-211', source: '21 CFR Part 211', content: 'Batch production records: Complete and accurate. Any deviation must be documented and investigated.', relevance: 0.91, doc_type: 'regulation' },
      { id: 'CAPA-2024-002', source: 'CAPA-2024-002', content: 'Similar: Batch record blank entry. Resolution: Dual verification SOP implemented, training completed.', relevance: 0.88, doc_type: 'historical_capa' },
      { id: 'SOP-QA-001', source: 'SOP QA-001', content: 'Deviation handling: Immediate containment, root cause analysis within 7 days.', relevance: 0.85, doc_type: 'sop' },
      { id: 'WHO-TRS-1025', source: 'WHO TRS 1025', content: 'Documentation: Records must be complete, accurate, and traceable. GMP compliance.', relevance: 0.82, doc_type: 'regulation' },
    ],
    similarCases: [
      { case_id: 'CAPA-2024-002', finding_text: 'Documentation deviation in batch record review. Critical parameter entry was left blank.', similarity_score: 0.95, resolution_summary: 'Dual verification SOP implemented, training completed.', is_potential_recurrence: true },
      { case_id: 'CAPA-2023-102', finding_text: 'Batch record incomplete for Pentabio lot. Missing signature on release.', similarity_score: 0.82, resolution_summary: 'Electronic batch record validation enhanced.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-003', finding_text: 'Training record not updated for new personnel.', similarity_score: 0.55, resolution_summary: 'Competency matrix automated.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-001', finding_text: 'Calibration overdue for equipment in production line A.', similarity_score: 0.50, resolution_summary: 'CMMS updated.', is_potential_recurrence: false },
      { case_id: 'CAPA-2023-045', finding_text: 'Temperature excursion during cold storage.', similarity_score: 0.45, resolution_summary: 'Cold chain SOP updated.', is_potential_recurrence: false },
    ],
    correctiveActions: [
      { action: 'Immediate batch #2024-0456 impact assessment; quarantine if required.', responsible_department: 'QA', timeline_days: 1, effectiveness_metrics: ['Batch status', 'Impact scope'] },
      { action: 'Verify all batch records for similar deviations; retrospective review.', responsible_department: 'QA', timeline_days: 5, effectiveness_metrics: ['Review completion', 'Deviation count'] },
      { action: 'Root cause verification and CAPA plan approval', responsible_department: 'QA', timeline_days: 7, effectiveness_metrics: ['CAPA approval', 'Implementation start'] },
    ],
    preventiveActions: [
      { action: 'Reinstate dual verification for critical parameters in SOP BR-004; implement electronic batch record validation.', responsible_department: 'QA', timeline_days: 30, systemic_improvement: 'Prevent recurrence through enforced verification and system controls.' },
    ],
    ishikawaCategories: { Man: ['Verification', 'Competency'], Method: ['Documentation', 'SOP'] },
    shapKeywords: { documentation: 0.93, batch: 0.90, record: 0.88, parameter: 0.86, deviation: 0.84 },
  },

  temperature: {
    scenarioId: 'temperature',
    fiveWhyChain: [
      'Why did temperature excursion occur in warehouse zone 3?',
      'Because the cold room temperature exceeded 8°C for 4 hours.',
      'Why did the temperature rise?',
      'Because the refrigeration unit failed or the door was left open.',
      'Why was the failure not detected earlier?',
      'Because the alarm system did not trigger or was not monitored.',
      'Root cause: Cold chain monitoring failure; alarm response and/or equipment maintenance gap.',
    ],
    rootCauseHypothesis: {
      hypothesis: 'Root cause: Cold chain breach due to refrigeration/alarm failure. Contributing factors: Environment (Storage), Machine (Monitoring).',
      confidence: 0.92,
      supporting_evidence: ['Zone 3: 12°C for 4h (spec 2–8°C)', 'Vaccine lot VX-2024-089', 'MES alert'],
      contributing_factors: [
        { factor: 'Refrigeration unit failure or door left open', category: 'Environment', relevance_score: 0.93 },
        { factor: 'Alarm monitoring gap', category: 'Machine', relevance_score: 0.89 },
        { factor: 'Cold chain SOP compliance', category: 'Method', relevance_score: 0.82 },
      ],
    },
    ragDocuments: [
      { id: 'SOP-WH-003', source: 'SOP WH-003', content: 'Cold chain storage: 2–8°C for vaccines. Continuous monitoring required. Alarm response within 15 minutes.', relevance: 0.96, doc_type: 'sop' },
      { id: 'WHO-TRS-1025', source: 'WHO TRS 1025', content: 'Vaccine storage: Cold chain must be maintained. Temperature excursions require investigation and impact assessment.', relevance: 0.93, doc_type: 'regulation' },
      { id: 'CAPA-2023-045', source: 'CAPA-2023-045', content: 'Similar: Temperature excursion zone 2. Resolution: Backup refrigeration, alarm escalation improved.', relevance: 0.90, doc_type: 'historical_capa' },
      { id: 'SOP-QA-001', source: 'SOP QA-001', content: 'Deviation handling: Immediate containment. Temperature excursion requires batch impact assessment.', relevance: 0.88, doc_type: 'sop' },
      { id: 'BPOM-GMP', source: 'BPOM GMP', content: 'Cold chain storage for vaccines. Deviations must be documented and reported per regulatory requirements.', relevance: 0.85, doc_type: 'regulation' },
    ],
    similarCases: [
      { case_id: 'CAPA-2023-045', finding_text: 'Temperature excursion during cold storage. Warehouse zone 2 recorded 10°C for 2 hours.', similarity_score: 0.93, resolution_summary: 'Backup refrigeration, alarm escalation improved.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-004', finding_text: 'Temperature excursion during transport. Vaccine shipment exceeded 8°C for 1 hour.', similarity_score: 0.85, resolution_summary: 'Transport validation revised, cold chain monitoring enhanced.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-001', finding_text: 'Calibration overdue for equipment in production line A.', similarity_score: 0.50, resolution_summary: 'CMMS updated.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-003', finding_text: 'Training record not updated for new personnel.', similarity_score: 0.55, resolution_summary: 'Competency matrix automated.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-002', finding_text: 'Documentation deviation in batch record review.', similarity_score: 0.48, resolution_summary: 'Dual verification SOP implemented.', is_potential_recurrence: false },
    ],
    correctiveActions: [
      { action: 'Immediate quarantine of vaccine lot VX-2024-089; impact assessment per cold chain SOP.', responsible_department: 'Warehouse', timeline_days: 1, effectiveness_metrics: ['Lot status', 'Impact assessment'] },
      { action: 'Verify refrigeration unit and alarm system; repair or replace as needed.', responsible_department: 'Engineering', timeline_days: 3, effectiveness_metrics: ['Equipment status', 'Alarm verification'] },
      { action: 'Root cause verification and CAPA plan approval', responsible_department: 'QA', timeline_days: 7, effectiveness_metrics: ['CAPA approval', 'Implementation start'] },
    ],
    preventiveActions: [
      { action: 'Implement backup refrigeration and alarm escalation; cold chain monitoring 24/7.', responsible_department: 'Warehouse', timeline_days: 30, systemic_improvement: 'Prevent recurrence through redundant cold chain controls.' },
    ],
    ishikawaCategories: { Environment: ['Storage', 'Monitoring'], Machine: ['Refrigeration', 'Alarm'] },
    shapKeywords: { temperature: 0.95, excursion: 0.93, cold: 0.90, storage: 0.88, vaccine: 0.86 },
  },

  audit: {
    scenarioId: 'audit',
    fiveWhyChain: [
      'Why did the operator deviate from the gowning sequence?',
      'Because the operator did not follow the full sequence per SOP GMP-012.',
      'Why was the sequence not followed?',
      'Because the operator was not aware of the updated procedure or took a shortcut.',
      'Why was awareness lacking?',
      'Because the gowning SOP was revised but re-training was not completed for all personnel.',
      'Root cause: Training gap and/or SOP communication failure for cleanroom entry procedure.',
    ],
    rootCauseHypothesis: {
      hypothesis: 'Root cause: Gowning procedure deviation due to training/communication gap. Contributing factors: Man (Training), Method (SOP).',
      confidence: 0.87,
      supporting_evidence: ['Regulatory audit observation', 'SOP GMP-012', 'Cleanroom entry'],
      contributing_factors: [
        { factor: 'SOP awareness gap', category: 'Man', relevance_score: 0.89 },
        { factor: 'Gowning training incomplete', category: 'Man', relevance_score: 0.86 },
        { factor: 'SOP communication', category: 'Method', relevance_score: 0.88 },
      ],
    },
    ragDocuments: [
      { id: 'SOP-GMP-012', source: 'SOP GMP-012', content: 'Cleanroom gowning: Full sequence mandatory. Operators must complete gowning training before entry. Observation checklist at entry.', relevance: 0.94, doc_type: 'sop' },
      { id: 'PIC-S-PE-009', source: 'PIC/S PE 009', content: 'Aseptic processing: Gowning must follow validated procedure. Deviations are observations requiring corrective action.', relevance: 0.91, doc_type: 'regulation' },
      { id: 'CAPA-2023-089', source: 'CAPA-2023-089', content: 'Similar: Gowning deviation. Resolution: Re-training, observation checklist at entry.', relevance: 0.88, doc_type: 'historical_capa' },
      { id: 'WHO-TRS-1025', source: 'WHO TRS 1025', content: 'Personnel: Gowning and aseptic technique must be documented and trained.', relevance: 0.85, doc_type: 'regulation' },
      { id: 'SOP-QA-001', source: 'SOP QA-001', content: 'Audit observation handling: Document, investigate, corrective action within 30 days.', relevance: 0.82, doc_type: 'sop' },
    ],
    similarCases: [
      { case_id: 'CAPA-2023-089', finding_text: 'SOP deviation in aseptic filling process. Gowning procedure not followed.', similarity_score: 0.91, resolution_summary: 'Re-training, observation checklist at entry.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-005', finding_text: 'Regulatory audit: Hand hygiene not performed per SOP before entry.', similarity_score: 0.84, resolution_summary: 'Hand hygiene training, visual reminders at entry.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-003', finding_text: 'Training record not updated for new personnel.', similarity_score: 0.72, resolution_summary: 'Competency matrix automated.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-001', finding_text: 'Calibration overdue for equipment in production line A.', similarity_score: 0.48, resolution_summary: 'CMMS updated.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-002', finding_text: 'Documentation deviation in batch record review.', similarity_score: 0.50, resolution_summary: 'Dual verification SOP implemented.', is_potential_recurrence: false },
    ],
    correctiveActions: [
      { action: 'Immediate re-training of operator on gowning procedure per SOP GMP-012.', responsible_department: 'Production', timeline_days: 1, effectiveness_metrics: ['Training completion', 'Competency'] },
      { action: 'Verify all cleanroom personnel have completed gowning training; competency check.', responsible_department: 'Production', timeline_days: 5, effectiveness_metrics: ['Training status', 'Compliance'] },
      { action: 'Root cause verification and CAPA plan approval', responsible_department: 'QA', timeline_days: 7, effectiveness_metrics: ['CAPA approval', 'Implementation start'] },
    ],
    preventiveActions: [
      { action: 'Implement observation checklist at cleanroom entry; mandatory sign-off before entry.', responsible_department: 'Production', timeline_days: 21, systemic_improvement: 'Prevent recurrence through enforced verification at point of use.' },
    ],
    ishikawaCategories: { Man: ['Training', 'Awareness'], Method: ['SOP', 'Communication'] },
    shapKeywords: { gowning: 0.92, procedure: 0.89, deviation: 0.87, cleanroom: 0.85, sop: 0.84 },
  },

  complaint: {
    scenarioId: 'complaint',
    fiveWhyChain: [
      'Why was a visible particle found in the vial?',
      'Because the particle was introduced during filling, packaging, or was present in the material.',
      'Why could it have been introduced during filling?',
      'Because the aseptic filtration or filling process was not within specification.',
      'Why was the process out of specification?',
      'Because equipment, environment, or material controls failed.',
      'Root cause: Requires investigation—equipment, environment, material, or process control failure.',
    ],
    rootCauseHypothesis: {
      hypothesis: 'Root cause: Visible particle—likely introduced during filling or from material. Contributing factors: Machine (Filling), Material, Environment.',
      confidence: 0.84,
      supporting_evidence: ['Customer complaint', 'Lot number provided', 'Complaint handling SOP'],
      contributing_factors: [
        { factor: 'Filling process control', category: 'Machine', relevance_score: 0.88 },
        { factor: 'Material quality', category: 'Material', relevance_score: 0.85 },
        { factor: 'Environment control', category: 'Environment', relevance_score: 0.80 },
      ],
    },
    ragDocuments: [
      { id: 'SOP-CMP-001', source: 'SOP CMP-001', content: 'Complaint handling: Investigation within 24h. Root cause analysis required. Lot impact assessment mandatory.', relevance: 0.95, doc_type: 'sop' },
      { id: 'SOP-QA-001', source: 'SOP QA-001', content: 'Deviation handling: Immediate containment, root cause analysis within 7 days. 5-Why mandatory.', relevance: 0.92, doc_type: 'sop' },
      { id: 'CAPA-2023-112', source: 'CAPA-2023-112', content: 'Similar: Visible particle complaint. Resolution: Filtration validation enhanced, material inspection improved.', relevance: 0.90, doc_type: 'historical_capa' },
      { id: '21CFR-211', source: '21 CFR Part 211', content: 'Complaint handling: Written procedures. Investigation and documentation required.', relevance: 0.88, doc_type: 'regulation' },
      { id: 'WHO-TRS-1025', source: 'WHO TRS 1025', content: 'Quality complaints: Investigation, root cause, corrective action. Report to regulatory if required.', relevance: 0.85, doc_type: 'regulation' },
    ],
    similarCases: [
      { case_id: 'CAPA-2023-112', finding_text: 'Customer complaint: Visible particle in vial. Lot number provided.', similarity_score: 0.94, resolution_summary: 'Filtration validation enhanced, material inspection improved.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-006', finding_text: 'Complaint: Discoloration in Pentabio vial. Lot identified.', similarity_score: 0.78, resolution_summary: 'Stability investigation, material review.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-002', finding_text: 'Documentation deviation in batch record review.', similarity_score: 0.55, resolution_summary: 'Dual verification SOP implemented.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-001', finding_text: 'Calibration overdue for equipment in production line A.', similarity_score: 0.50, resolution_summary: 'CMMS updated.', is_potential_recurrence: false },
      { case_id: 'CAPA-2023-045', finding_text: 'Temperature excursion during cold storage.', similarity_score: 0.48, resolution_summary: 'Cold chain SOP updated.', is_potential_recurrence: false },
    ],
    correctiveActions: [
      { action: 'Immediate lot investigation: retrieve batch records, samples, retention.', responsible_department: 'QA', timeline_days: 1, effectiveness_metrics: ['Investigation start', 'Lot retrieval'] },
      { action: 'Root cause verification: filling, material, environment. 5-Why and CAPA plan.', responsible_department: 'QA', timeline_days: 7, effectiveness_metrics: ['RCA completion', 'CAPA plan'] },
      { action: 'Regulatory reporting if required per complaint handling SOP.', responsible_department: 'QA', timeline_days: 14, effectiveness_metrics: ['Reporting status', 'Regulatory response'] },
    ],
    preventiveActions: [
      { action: 'Enhance filtration validation and material inspection; implement additional inline controls.', responsible_department: 'Production', timeline_days: 60, systemic_improvement: 'Prevent recurrence through process and material controls.' },
    ],
    ishikawaCategories: { Machine: ['Filling', 'Filtration'], Material: ['Quality', 'Inspection'], Environment: ['Cleanroom'] },
    shapKeywords: { complaint: 0.92, particle: 0.90, vial: 0.88, investigation: 0.85, lot: 0.83 },
  },

  default: {
    scenarioId: 'default',
    fiveWhyChain: [
      'Why did the process deviation occur?',
      'Because process parameter or control was not maintained within specification.',
      'Why was it out of specification?',
      'Because preventive controls or monitoring were insufficient.',
      'Why were controls insufficient?',
      'Because process design or accountability gap.',
      'Root cause: Systemic process control gap requiring CAPA.',
    ],
    rootCauseHypothesis: {
      hypothesis: 'Root cause: Process deviation with potential systemic cause. Further investigation recommended.',
      confidence: 0.82,
      supporting_evidence: ['Finding details available'],
      contributing_factors: [
        { factor: 'Process control gap', category: 'Method', relevance_score: 0.80 },
        { factor: 'Documentation gap', category: 'Method', relevance_score: 0.75 },
      ],
    },
    ragDocuments: [
      { id: 'SOP-QA-001', source: 'SOP QA-001', content: 'Deviation handling requires immediate containment and root cause analysis within 7 days. 5-Why analysis mandatory.', relevance: 0.92, doc_type: 'sop' },
      { id: 'SOP-GMP-012', source: 'SOP GMP-012', content: 'Preventive maintenance and calibration tracking. Department head accountable for compliance.', relevance: 0.82, doc_type: 'sop' },
      { id: 'WHO-TRS-1025', source: 'WHO TRS 1025', content: 'GMP for vaccine production. Deviations must be documented and investigated.', relevance: 0.85, doc_type: 'regulation' },
      { id: '21CFR-211', source: '21 CFR Part 211', content: 'Batch production records. Deviations must be documented.', relevance: 0.80, doc_type: 'regulation' },
    ],
    similarCases: [
      { case_id: 'CAPA-2024-001', finding_text: 'Calibration overdue for equipment in production line.', similarity_score: 0.72, resolution_summary: 'CMMS updated.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-002', finding_text: 'Documentation deviation in batch record review.', similarity_score: 0.68, resolution_summary: 'Dual verification SOP implemented.', is_potential_recurrence: false },
      { case_id: 'CAPA-2024-003', finding_text: 'Training record not updated for new personnel.', similarity_score: 0.65, resolution_summary: 'Competency matrix automated.', is_potential_recurrence: false },
      { case_id: 'CAPA-2023-045', finding_text: 'Temperature excursion during cold storage.', similarity_score: 0.60, resolution_summary: 'Cold chain SOP updated.', is_potential_recurrence: false },
    ],
    correctiveActions: [
      { action: 'Immediate containment and impact assessment', responsible_department: 'QA', timeline_days: 1, effectiveness_metrics: ['Containment completion', 'Batch status'] },
      { action: 'Root cause verification and CAPA plan approval', responsible_department: 'QA', timeline_days: 7, effectiveness_metrics: ['CAPA approval', 'Implementation start'] },
    ],
    preventiveActions: [
      { action: 'Update SOP and implement preventive controls', responsible_department: 'QA', timeline_days: 30, systemic_improvement: 'Prevent recurrence through process control and monitoring.' },
    ],
    ishikawaCategories: { Method: ['Process control', 'Documentation'] },
    shapKeywords: { deviation: 0.85, process: 0.82, sop: 0.80 },
  },
}

export function detectScenarioId(text: string): ScenarioId {
  const t = text.toLowerCase()
  if (t.includes('calibration') || t.includes('kalibrasi') || t.includes('overdue') && t.includes('equipment')) return 'calibration'
  if (t.includes('training') || t.includes('pelatihan') || t.includes('personnel') || t.includes('gmp refresher')) return 'training'
  if (t.includes('documentation') || t.includes('dokumentasi') || t.includes('batch record') || t.includes('blank entry')) return 'documentation'
  if (t.includes('temperature') || t.includes('suhu') || t.includes('cold storage') || t.includes('excursion')) return 'temperature'
  if (t.includes('audit') || t.includes('temuan') || t.includes('gowning') || t.includes('cleanroom')) return 'audit'
  if (t.includes('complaint') || t.includes('keluhan') || t.includes('particle') || t.includes('vial')) return 'complaint'
  return 'default'
}
