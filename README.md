# CAPA AI Management System

AI-Powered Corrective and Preventive Action Management for **PT Bio Farma (Persero)** — Quality Assurance Teams.

## Overview

Transform reactive, manual CAPA processes into proactive, AI-driven quality management with:
- **60%** cycle time reduction
- **95%+** AI accuracy target
- **100%** XAI coverage for GxP compliance

## Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **LLM Engine** | vLLM + LiteLLM Proxy | Llama 3.1 (local), Claude Sonnet 4 & GPT-4o (API) |
| **Agent Framework** | LangGraph | Multi-agent RCA, CAPA recommendation, similarity |
| **Embeddings** | SiEBERT (Domain-Adapted) | Pharmaceutical quality semantic understanding |
| **RAG Pipeline** | LlamaIndex + Hybrid Retrieval | Grounded in SOPs, historical CAPAs, regulations |
| **XAI Module** | SHAP + Attention | Explainable predictions for GxP compliance |
| **ML Platform** | MLflow + XGBoost | Model lifecycle, impact scoring, drift detection |

## Features

- **AI-Powered Root Cause Analysis (RCA)** — Ishikawa/5-Why with confidence scoring
- **Similarity Analysis Engine** — Duplicate/recurring detection (>0.85 = recurrence alert)
- **CAPA Recommendation Agent** — Corrective & preventive actions with effectiveness prediction
- **Topic Clustering & Trend Detection** — BERTopic for systemic quality insights
- **Explainable AI (XAI)** — SHAP values, citation tracing, attention visualization

**Demo guide:** See [DEMO_GUIDE.md](DEMO_GUIDE.md) for a step-by-step walkthrough of all capabilities.

## Quick Start

### 1. Start Supporting Services (Podman)

```bash
# PostgreSQL + Qdrant
podman compose up -d postgres qdrant

# With vLLM (requires NVIDIA GPU)
podman compose --profile vllm up -d
```

Or use the script:
```bash
./scripts/start-services.sh           # PostgreSQL + Qdrant
./scripts/start-services.sh --with-vllm   # + vLLM (GPU)
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the API

From project root with virtual environment:

```bash
# Activate venv and set path
source .venv/bin/activate  # or: .venv\Scripts\activate on Windows
export PYTHONPATH=src

# Run server
uvicorn capa_ai.main:app --reload --host 0.0.0.0 --port 8000
```

Or use the run script:

```bash
python run.py
```

### 4. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/findings` | POST | Submit finding for AI analysis |
| `/v1/similarity` | POST | Similarity search for recurrences |
| `/v1/analysis/{id}` | GET | Retrieve analysis result |
| `/v1/feedback` | POST | Human feedback for retraining |
| `/v1/health` | GET | Health check |
| `/v1/trends/cluster` | POST | FR-TREND-01: Topic clustering |
| `/v1/impact-score` | POST | Impact scoring (XGBoost) |
| `/v1/drift-detection` | POST | Model drift detection |
| `/v1/audit-log` | POST | GxP: ALCOA+ audit trail |
| `/v1/xai/feature-importance` | GET | XAI: SHAP feature importance |
| `/webhooks/q100` | POST | Q100+ finding webhook |
| `/webhooks/bizzmine` | POST | Bizzmine deviation/complaint webhook |

### 5. React Dashboard

**Option A – Served by FastAPI (recommended):**
```bash
cd dashboard
npm install
npm run build
# Restart the API server - dashboard at http://localhost:8000
```

**Option B – Dev mode (hot reload):**
```bash
cd dashboard
npm install
npm run dev
# Dashboard at http://localhost:3000 (proxies API to :8000)
```

### 6. Example Request

```bash
curl -X POST http://localhost:8000/v1/findings \
  -H "Content-Type: application/json" \
  -d '{
    "finding": {
      "finding_text": "Calibration overdue for equipment in production line A",
      "department": "Production",
      "product_line": "Vaccines"
    },
    "include_similarity": true,
    "include_capa_recommendation": true
  }'
```

## Project Structure

```
CAPA AI/
├── config/
│   └── config.yaml          # Application configuration
├── src/
│   └── capa_ai/
│       ├── agents/          # LangGraph agent (RCA, CAPA)
│       ├── api/             # FastAPI routes
│       ├── feedback/        # HITL feedback store
│       ├── integrations/    # Q100+, Bizzmine webhooks
│       ├── llm/             # LLM client (vLLM/OpenAI/Claude)
│       ├── rag/             # LlamaIndex RAG pipeline
│       ├── similarity/      # Similarity engine
│       ├── trends/          # BERTopic clustering
│       ├── vector_store/    # Qdrant/pgvector
│       ├── xai/             # Explainable AI
│       ├── config.py
│       ├── models.py
│       └── main.py
├── requirements.txt
├── pyproject.toml
└── README.md
```

## Development Phases

- **Phase 1 (Weeks 1-4):** vLLM setup, SiEBERT fine-tuning, LangGraph skeleton, Kong API
- **Phase 2 (Weeks 5-8):** RAG hybrid retrieval, RCA agent, similarity, XAI
- **Phase 3 (Weeks 9-12):** Q100+ & Bizzmine connectors, HITL UI, MLflow, CSV
- **Phase 4 (Weeks 13-16):** BERTopic trends, impact scoring, optimization, security

## Configuration

Copy `config/config.yaml` and adjust for your environment. Key settings:
- `llm.vllm.base_url` — vLLM server URL
- `vector_store.pgvector` — PostgreSQL connection
- `vector_store.qdrant` — Qdrant vector DB
- `similarity.threshold_recurrence` — Recurrence alert threshold (default: 0.85)

## Compliance

- **ALCOA+** — Immutable audit trail
- **21 CFR Part 11** — Electronic signatures
- **GAMP 5** — Category 5 software lifecycle
- **EU AI Act** — High-risk AI registration

## License

Proprietary — PT Bio Farma (Persero)
