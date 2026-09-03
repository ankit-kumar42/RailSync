from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.priority import router as priority_router
from app.api.compatibility import router as compatibility_router
from app.api.risk import router as risk_router
from app.api.scheduler import router as scheduler_router
from app.api.confirmation import router as confirmation_router


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="SIH Infrastructure Optimization API"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,

    # Frontend origins allowed to access this backend
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    # Allow cookies/auth headers if required later
    allow_credentials=True,

    # Allow GET, POST, PUT, PATCH, DELETE, OPTIONS, etc.
    allow_methods=["*"],

    # Allow Content-Type, Authorization, etc.
    allow_headers=["*"],
)


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(priority_router)
app.include_router(compatibility_router)
app.include_router(risk_router)
app.include_router(scheduler_router)
app.include_router(confirmation_router)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "status": "running",
        "service": "SIH Backend",
    }