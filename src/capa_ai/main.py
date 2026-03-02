"""
CAPA AI Management System - Main Entry Point
PT Bio Farma - AI-Powered Quality Assurance
"""

from pathlib import Path

from dotenv import load_dotenv

# Load .env from project root
load_dotenv(Path(__file__).parent.parent.parent / ".env")

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from capa_ai import __version__
from capa_ai.api.routes import router
from capa_ai.integrations.webhooks import router as webhooks_router

# Path to dashboard build (relative to project root)
PROJECT_ROOT = Path(__file__).parent.parent.parent
DASHBOARD_DIST = PROJECT_ROOT / "dashboard" / "dist"


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="CAPA AI Management System",
        description="AI-Powered Corrective and Preventive Action Management for PT Bio Farma",
        version=__version__,
        docs_url="/docs",
        redoc_url="/redoc",
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(router)
    app.include_router(webhooks_router)
    
    # Serve React dashboard (SPA) - same origin as API, no CORS needed
    if DASHBOARD_DIST.exists():
        assets_dir = DASHBOARD_DIST / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
        
        def _serve_dashboard():
            return FileResponse(DASHBOARD_DIST / "index.html")
        
        @app.get("/")
        async def serve_root():
            return _serve_dashboard()
        
        @app.get("/submit")
        @app.get("/analysis")
        async def serve_spa_routes():
            return _serve_dashboard()
        
        @app.get("/{path:path}")
        async def serve_spa_catchall(path: str):
            # Don't serve dashboard for API/docs paths
            if path.startswith(("v1/", "webhooks/", "assets/")) or path in ("docs", "redoc", "openapi.json"):
                from fastapi import HTTPException
                raise HTTPException(404)
            return _serve_dashboard()
    else:
        @app.get("/")
        async def root():
            return {
                "service": "CAPA AI Management System",
                "version": __version__,
                "docs": "/docs",
                "health": "/v1/health",
                "dashboard": "Run 'cd dashboard && npm run build' to enable dashboard",
            }
    
    return app


app = create_app()


def run():
    """Run the application."""
    uvicorn.run(
        "capa_ai.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )


if __name__ == "__main__":
    run()
