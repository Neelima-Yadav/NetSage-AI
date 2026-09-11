from typing import Final

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import dashboard_router
from app.routers import diagnose_router
from app.routers import history_router
from app.routers import human_review_router


APP_TITLE: Final = "NetSage AI Cisco Packet Tracer Troubleshooting Assistant API"
APP_VERSION: Final = "1.0.0"

DEVELOPMENT_ORIGINS: Final = (
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
)


def create_app() -> FastAPI:
    """Build and configure the NetSage AI API application."""

    application = FastAPI(
        title=APP_TITLE,
        description=(
            "Backend service for parsing Cisco show command outputs, running deterministic "
            "rule validations, generating diagnostic reports, and managing human review workflows."
        ),
        version=APP_VERSION,
    )

    # Allow the React/Vite frontend to communicate with the FastAPI backend.
    application.add_middleware(
        CORSMiddleware,
        allow_origins=DEVELOPMENT_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API routers
    application.include_router(diagnose_router.router)
    application.include_router(dashboard_router.router)
    application.include_router(history_router.router)
    application.include_router(human_review_router.router)

    @application.get(
        "/",
        tags=["Status"],
        summary="Application root",
    )
    def read_root() -> dict[str, str]:
        return {
            "application": "NetSage AI",
            "version": APP_VERSION,
            "status": "running",
            "message": "Cisco Packet Tracer Troubleshooting Assistant API",
        }

    @application.get(
        "/health",
        tags=["Status"],
        summary="Health check",
    )
    def health_check() -> dict[str, str]:
        return {
            "status": "healthy",
        }

    return application


app = create_app()