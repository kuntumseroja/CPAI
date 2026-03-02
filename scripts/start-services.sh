#!/bin/bash
# Start PostgreSQL, Qdrant, and optionally vLLM for CAPA AI
# Uses Podman (podman compose or podman-compose)

set -e
cd "$(dirname "$0")/.."

# Detect podman compose command
if command -v podman &> /dev/null; then
  if podman compose version 2>/dev/null; then
    COMPOSE="podman compose"
  elif command -v podman-compose &> /dev/null; then
    COMPOSE="podman-compose"
  else
    echo "Error: podman compose not found. Install with: pip install podman-compose"
    exit 1
  fi
else
  echo "Error: Podman not found. Please install Podman."
  exit 1
fi

echo "Starting CAPA AI supporting services (Podman)..."
echo ""

# Load .env for POSTGRES_* vars
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Start PostgreSQL and Qdrant
echo "Starting PostgreSQL and Qdrant..."
$COMPOSE up -d postgres qdrant

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
for i in $(seq 1 30); do
  if $COMPOSE exec -T postgres pg_isready -U "${POSTGRES_USER:-capa}" -d "${POSTGRES_DB:-capa_ai}" 2>/dev/null; then
    echo "PostgreSQL is ready at localhost:5432"
    break
  fi
  sleep 1
  if [ $i -eq 30 ]; then
    echo "PostgreSQL failed to start"
    exit 1
  fi
done

# Wait for Qdrant
echo "Waiting for Qdrant..."
for i in $(seq 1 30); do
  if curl -s http://localhost:6333/ > /dev/null 2>&1; then
    echo "Qdrant is ready at http://localhost:6333"
    break
  fi
  sleep 1
  if [ $i -eq 30 ]; then
    echo "Qdrant failed to start"
    exit 1
  fi
done

# Optional: vLLM (requires GPU)
if [ "$1" = "--with-vllm" ]; then
  echo "Starting vLLM (requires NVIDIA GPU)..."
  $COMPOSE --profile vllm up -d vllm
  echo "vLLM will be at http://localhost:8001 when ready"
  echo "Set VLLM_BASE_URL=http://localhost:8001/v1 in .env"
fi

echo ""
echo "Done. Start the app with: python run.py"
echo ""
echo "PostgreSQL: localhost:5432 (user: ${POSTGRES_USER:-capa}, db: ${POSTGRES_DB:-capa_ai})"
echo "Qdrant:     http://localhost:6333"
