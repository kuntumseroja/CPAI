#!/usr/bin/env python3
"""
Run CAPA AI server from project root.
Usage: python run.py
"""
import sys
from pathlib import Path

# Add src to path for development (when package not installed)
sys.path.insert(0, str(Path(__file__).parent / "src"))

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "capa_ai.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
