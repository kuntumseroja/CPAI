/**
 * Sample / Dummy findings for demo simulation
 * Covers different scenarios: calibration, training, documentation, temperature, audit
 */

import type { FindingInput } from '../api/client'

export interface SampleFinding {
  id: string
  label: string
  finding: FindingInput
  scenario: string
}

export const SAMPLE_FINDINGS: SampleFinding[] = [
  {
    id: 'calibration',
    label: 'Calibration Overdue',
    scenario: 'Machine / Calibration — triggers recurrence alert',
    finding: {
      finding_text: 'Calibration overdue for equipment in production line A. Last calibration was 8 months ago, exceeding the 6-month schedule per SOP CAL-002. Equipment ID: EQ-PROD-001.',
      department: 'Production',
      product_line: 'Vaccines',
      source: 'Q100+',
    },
  },
  {
    id: 'training',
    label: 'Training Gap',
    scenario: 'Man / Training — personnel competency',
    finding: {
      finding_text: 'Training record not updated for new personnel in aseptic filling area. Three operators have not completed GMP refresher training within the required 12-month period.',
      department: 'Production',
      product_line: 'Injectable',
      source: 'Internal Audit',
    },
  },
  {
    id: 'documentation',
    label: 'Documentation Deviation',
    scenario: 'Method / SOP — batch record gap',
    finding: {
      finding_text: 'Documentation deviation in batch record review. Critical parameter entry was left blank and signed off without verification. Batch #2024-0456.',
      department: 'QA',
      product_line: 'Tablets',
      source: 'Bizzmine',
    },
  },
  {
    id: 'temperature',
    label: 'Temperature Excursion',
    scenario: 'Environment — cold chain',
    finding: {
      finding_text: 'Temperature excursion during cold storage. Warehouse zone 3 recorded 12°C for 4 hours (spec: 2–8°C). Affected product: Vaccine lot VX-2024-089.',
      department: 'Warehouse',
      product_line: 'Vaccines',
      source: 'MES Alert',
    },
  },
  {
    id: 'audit',
    label: 'Audit Finding',
    scenario: 'Audit — process observation',
    finding: {
      finding_text: 'Audit finding: Observation of gowning procedure deviation in cleanroom entry. Operator did not follow full gowning sequence per SOP GMP-012.',
      department: 'Production',
      product_line: 'Sterile',
      source: 'Regulatory Audit',
    },
  },
  {
    id: 'complaint',
    label: 'Customer Complaint',
    scenario: 'Complaint — quality concern',
    finding: {
      finding_text: 'Customer complaint received regarding visible particle in vial. Lot number provided. Requires investigation and root cause analysis per complaint handling SOP.',
      department: 'QA',
      product_line: 'Injectable',
      source: 'Bizzmine Complaint',
    },
  },
]
