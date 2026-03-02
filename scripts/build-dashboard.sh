#!/bin/bash
# Build React dashboard for production
# Dashboard is then served by FastAPI at http://localhost:8000
set -e
cd "$(dirname "$0")/../dashboard"
npm run build
echo "Dashboard built. Restart the API server to serve it at http://localhost:8000"
