# CAPA AI Dashboard — Demo Mode

**Full demo guide:** See [DEMO_GUIDE.md](../DEMO_GUIDE.md) in the project root.

## Standalone Demo (No Backend)

The dashboard runs in **Demo Mode** by default. No FastAPI backend or containers are required.

### Run Demo

```bash
cd dashboard
npm install
npm run dev
```

Open **http://localhost:3000** — the dashboard works immediately.

### What Demo Mode Does

- **Simulated AI** — Contextual responses based on your input (keywords: calibration, deviation, training, documentation, etc.)
- **No API calls** — All data is generated locally
- **Full flow** — Submit finding → RCA → Similarity → CAPA recommendations → Feedback

### Intelligent Simulation

The simulator detects keywords and generates contextual output:

| Input Keywords | Simulated Response |
|----------------|-------------------|
| calibration, overdue | Machine/Calibration category, recurrence alert |
| training, personnel | Man/Training factors |
| documentation, SOP | Method/Documentation, 5-Why chain |
| temperature, storage | Environment, cold chain |

### Toggle to Real API

Use the **Demo Mode** checkbox in the header to switch to the live FastAPI backend (requires backend running on port 8000).
