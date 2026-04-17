from fastapi import APIRouter
from app.schemas.common import HealthResponse
from app.api.endpoints import auth, products

api_router = APIRouter()

# ── Health check ──────────────────────────────────────────────────────────────
@api_router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health() -> HealthResponse:
    return HealthResponse()

# ── Public routes ─────────────────────────────────────────────────────────────
api_router.include_router(auth.router)
api_router.include_router(products.router)
