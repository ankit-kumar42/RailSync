from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.api.tasks import router as tasks_router
from app.api.schedule import router as schedule_router
from app.api.maintenance import router as maintenance_router
from app.db.models import (
    MaintenanceTask,
    ScheduledMaintenance,
    UnscheduledMaintenance,
)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="Railway Maintenance Backend",
    description=(
        "Main backend for railway maintenance "
        "management and AI-powered scheduling."
    ),
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(tasks_router)
app.include_router(schedule_router)
app.include_router(maintenance_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "success": True,
        "message": "Railway Maintenance Backend is running.",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "success": True,
        "status": "healthy",
    }