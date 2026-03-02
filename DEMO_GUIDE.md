# CAPA AI — Demo Guide

How to demonstrate all capabilities of the CAPA AI Management System.

---

## Quick Start

```bash
cd dashboard
npm install
npm run dev
```

Open **http://localhost:3000** — Demo Mode is on by default. No backend required.

---

## Demo Flow (5–10 minutes)

### 1. Home Dashboard

**What to show:** Overview, status, navigation

- **Demo Mode banner** — Explains simulated AI, no backend needed
- **API Status** — Shows "Demo Mode" (green) when simulation is active
- **Cards** — Submit Finding, View Analysis

**Action:** Click **View sample analysis** for an instant full analysis.

---

### 2. Agent Pipeline (LangGraph)

**What to show:** Multi-agent orchestration

After loading any analysis, scroll to **Agent Pipeline (LangGraph)**:

| Step | What it demonstrates |
|------|----------------------|
| 1. NLP Classification | Finding type (deviation/audit/complaint) + confidence |
| 2. RAG Retrieval | Hybrid search: SOPs + historical CAPAs + similar cases |
| 3. Causal Inference (RCA) | Ishikawa + 5-Why analysis |
| 4. CAPA Generation | Corrective + preventive actions |
| 5. XAI Validation | SHAP features, confidence scoring |

**Talking point:** "The system uses a LangGraph state machine: classify → retrieve → analyze → generate → validate."

---

### 3. RAG Retrieval (LlamaIndex)

**What to show:** Grounded AI with retrieved context

In **RAG Retrieval (LlamaIndex)**:

- **SOPs** — QA-001, CAL-002, GMP-012
- **Historical CAPA** — Similar past cases
- **Regulations** — 21 CFR Part 11

**Talking point:** "AI outputs are grounded in SOPs and regulations. Each recommendation can be traced to source documents."

---

### 4. Root Cause Analysis (RCA)

**What to show:** Ishikawa, 5-Why, XAI

- **Finding type** — deviation, audit, complaint
- **Root cause hypotheses** — With confidence scores
- **5-Why chain** — Step-by-step causal reasoning
- **Key Factors (XAI)** — SHAP-style feature importance

**Talking point:** "Explainable AI for GxP: every output has traceable reasoning."

---

### 5. Similar Cases (Recurrence Detection)

**What to show:** Duplicate and recurrence detection

- **Similar cases** — Historical findings with similarity scores
- **Potential recurrence alert** — When similarity > 85%

**Talking point:** "Hybrid retrieval (SiEBERT + BM25) flags potential recurrences to prevent repeat issues."

---

### 6. CAPA Recommendations

**What to show:** Corrective and preventive actions

- **Corrective actions** — Immediate containment, timelines
- **Preventive actions** — Systemic improvements
- **Effectiveness score** — Predicted impact
- **Regulatory alignment** — GxP compliance

**Talking point:** "Actions are generated with departments, timelines, and effectiveness metrics."

---

### 7. One-Click Sample Findings

**What to show:** Different scenarios

Go to **Submit Finding** and use the **Try example findings** section:

| Example | Scenario | What it demonstrates |
|---------|----------|----------------------|
| **Calibration Overdue** | Machine/Calibration | Recurrence alert, calibration SOPs |
| **Training Gap** | Man/Training | Personnel competency, training factors |
| **Documentation Deviation** | Method/SOP | Batch record, documentation controls |
| **Temperature Excursion** | Environment | Cold chain, storage monitoring |
| **Audit Finding** | Audit | Process observation, gowning |
| **Customer Complaint** | Complaint | Quality investigation flow |

**Action:** Click each example to see how the analysis changes by scenario.

---

### 8. Feedback (Human-in-the-Loop)

**What to show:** HITL for model improvement

- **Approve** / **Reject** — Captures human feedback
- **Message** — "Feedback recorded for model improvement"

**Talking point:** "Feedback is used for retraining and continuous improvement."

---

### 9. Custom Finding (Optional)

**What to show:** Contextual simulation

1. Go to **Submit Finding**
2. Enter a finding, e.g.:
   - "Calibration overdue for equipment in production line A"
   - "Training record not updated for new personnel"
   - "Documentation gap in batch record"
3. Add Department, Product Line, Source
4. Click **Submit for Analysis**

**Talking point:** "The simulator uses keyword detection to tailor RCA, RAG context, and CAPA to the input."

---

### 10. Full Stack Mode (Optional)

**What to show:** Real API integration

1. Start the FastAPI backend:
   ```bash
   cd "/path/to/CAPA AI"
   PYTHONPATH=src .venv/bin/uvicorn capa_ai.main:app --host 0.0.0.0 --port 8000
   ```
2. In the dashboard, turn **Demo Mode** off (header checkbox)
3. Submit a finding — it will call the real API

**Talking point:** "Same UI works with the full backend: LangGraph agent, RAG, vLLM/Claude/GPT-4o."

---

## Demo Script (Summary)

1. **Intro** (1 min) — "CAPA AI: AI-driven quality management for PT Bio Farma."
2. **View sample** (1 min) — Click "View sample analysis" on Home.
3. **Agent + RAG** (2 min) — Walk through Agent Pipeline and RAG Retrieval.
4. **RCA + Similarity** (2 min) — Show RCA, 5-Why, similar cases, recurrence alert.
5. **CAPA** (1 min) — Show corrective/preventive actions and effectiveness.
6. **Samples** (2 min) — Click 2–3 example findings (e.g. Calibration, Training).
7. **Feedback** (1 min) — Approve/Reject and explain HITL.
8. **Q&A** — Optional: custom finding or full-stack mode.

---

## Key Messages

| Capability | Message |
|------------|---------|
| **Agentic** | LangGraph multi-agent workflow: classify → retrieve → analyze → generate → validate |
| **RAG** | LlamaIndex hybrid retrieval grounds outputs in SOPs, CAPAs, regulations |
| **RCA** | Ishikawa, 5-Why, SHAP for explainable root cause analysis |
| **Similarity** | SiEBERT + BM25 for recurrence detection (>85% = alert) |
| **CAPA** | Corrective and preventive actions with effectiveness scoring |
| **XAI** | SHAP, citations, attention for GxP compliance |
| **HITL** | Feedback loop for model improvement |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page | Hard refresh (Cmd+Shift+R). Ensure Demo Mode is on. |
| "Disconnected" | Demo Mode off but backend not running. Turn Demo Mode on or start backend. |
| No agent/RAG sections | Use a sample or submit a finding; these come from the simulator. |
