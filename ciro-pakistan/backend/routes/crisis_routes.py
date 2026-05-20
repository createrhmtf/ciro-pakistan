import json
import os
from fastapi import APIRouter, HTTPException, WebSocket
from typing import List, Dict, Any
from models.crisis_model import (
    AnalysisRequest,
    AnalysisResponse,
    CrisisReport,
    Alert,
    AgentTrace,
    SignalInput,
)
from services.firebase_service import firebase_service
from services.weather_service import weather_service
from services.aqi_service import aqi_service
from services.maps_service import maps_service
from services.gemini_service import gemini_service
from orchestration.antigravity_orchestrator import antigravity_orchestrator
from utils.logger import setup_logger

logger = setup_logger("CrisisRoutes")
router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def _load_demo_signals() -> List[Dict[str, Any]]:
    """Challenge demo: G-10 / George Town urban flooding multi-source bundle."""
    return [
        {
            "id": "demo_social_1",
            "source": "twitter",
            "content": "Flash flood happening at George Town for past 30 mins",
            "timestamp": "2026-05-20T12:00:00Z",
            "location_hint": "George Town, Karachi",
        },
        {
            "id": "demo_social_2",
            "source": "twitter",
            "content": "G-10 mein pani bhar gaya hai, gaariyan phans gayi hain",
            "timestamp": "2026-05-20T12:01:00Z",
            "location_hint": "G-10, Islamabad",
        },
        {
            "id": "demo_weather_1",
            "source": "weather_api",
            "content": "PMD Alert: Heavy rainfall 85mm/hr in Islamabad G-sector. Flash flood risk EXTREME.",
            "timestamp": "2026-05-20T11:58:00Z",
            "location_hint": "Islamabad",
        },
        {
            "id": "demo_traffic_1",
            "source": "traffic_api",
            "content": "G-10 Main Boulevard — severe congestion. Speed 4km/h (normal 60km/h). Vehicles stranded.",
            "timestamp": "2026-05-20T11:59:00Z",
            "location_hint": "G-10 Boulevard, Islamabad",
        },
    ]


@router.get("/health")
async def health():
    fb = firebase_service.get_status()
    return {
        "status": "healthy",
        "service": "CIRO Pakistan API",
        "orchestrator": "google-antigravity",
        "integrations": {
            "firestore": fb,
            "gemini": {"live": gemini_service.initialized},
            "maps": {"live": bool(maps_service.api_key)},
            "weather": {"live": bool(weather_service.api_key)},
        },
    }


@router.get("/mock-signals")
async def get_mock_signals():
    """Returns demo multi-source signals for the challenge scenario."""
    return {"signals": _load_demo_signals()}


@router.get("/simulation")
async def get_simulation():
    """Returns latest before/after simulation state."""
    try:
        latest = firebase_service.get_latest_simulation()
        if latest:
            return latest
    except Exception:
        pass
    return {
        "id": "scenario_a",
        "name": "Awaiting orchestration run",
        "before": {"active_crises": 0, "unresponded_alerts": 0, "coverage_pct": 0},
        "after": {"active_crises": 0, "unresponded_alerts": 0, "coverage_pct": 0},
    }


@router.post("/analyze-crisis", response_model=AnalysisResponse)
async def analyze_crisis(request: AnalysisRequest):
    """
    Google Antigravity–orchestrated multi-agent pipeline:
    PLAN → TOOLS → Signal Fusion → Detection → Decision → Execution → Simulation
    """
    try:
        raw_signals = request.signals
        if not raw_signals:
            raise HTTPException(status_code=400, detail="No emergency signals provided.")

        logger.info("Starting Google Antigravity orchestration...")
        return antigravity_orchestrator.run_pipeline(raw_signals)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to orchestrate analyze-crisis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal agent error: {str(e)}")


@router.post("/ingest-signal")
async def ingest_signal(signal: SignalInput):
    """Accept a single live signal (text complaint, post, or API feed row)."""
    firebase_service.save_signal(signal.model_dump())
    return {
        "accepted": True,
        "signal": signal.model_dump(),
        "message": "Signal queued. Run /api/analyze-crisis to execute the Antigravity pipeline.",
    }


@router.get("/signals", response_model=List[SignalInput])
async def get_signals():
    try:
        return [SignalInput.model_validate(s) for s in firebase_service.get_signals()]
    except Exception as e:
        logger.error(f"Failed to load signals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/crisis-history", response_model=List[CrisisReport])
async def get_crisis_history():
    try:
        db_crises = firebase_service.get_crises()
        return [CrisisReport.model_validate(c) for c in db_crises]
    except Exception as e:
        logger.error(f"Failed to load history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alerts", response_model=List[Alert])
async def get_all_alerts():
    try:
        db_alerts = firebase_service.get_alerts()
        seen_ids = set()
        unique_alerts = []
        for a in db_alerts:
            if a["id"] not in seen_ids:
                unique_alerts.append(Alert.model_validate(a))
                seen_ids.add(a["id"])
        return unique_alerts
    except Exception as e:
        logger.error(f"Failed to load alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/agent-traces", response_model=List[AgentTrace])
async def get_agent_traces():
    try:
        db_traces = firebase_service.get_traces()
        return [AgentTrace.model_validate(t) for t in db_traces]
    except Exception as e:
        logger.error(f"Failed to load traces: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/weather/{city}")
async def get_city_weather(city: str):
    return weather_service.get_weather(city)


@router.get("/environment/{city}")
async def get_city_environment(city: str):
    return aqi_service.get_aqi(city)


@router.get("/route")
async def get_route(
    origin_lat: float = None,
    origin_lng: float = None,
    dest_lat: float = None,
    dest_lng: float = None,
    origin_address: str = None,
    dest_address: str = None,
):
    try:
        if origin_address:
            origin = maps_service.geocode_address(origin_address)
        elif origin_lat is not None and origin_lng is not None:
            origin = {"lat": origin_lat, "lng": origin_lng}
        else:
            raise HTTPException(status_code=400, detail="Origin coordinates or address required.")

        if dest_address:
            destination = maps_service.geocode_address(dest_address)
        elif dest_lat is not None and dest_lng is not None:
            destination = {"lat": dest_lat, "lng": dest_lng}
        else:
            raise HTTPException(status_code=400, detail="Destination coordinates or address required.")

        return maps_service.get_route(origin, destination)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to calculate route: {e}")
        raise HTTPException(status_code=500, detail=str(e))
