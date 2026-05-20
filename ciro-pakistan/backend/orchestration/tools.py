"""
CIRO tool adapters invoked by the Google Antigravity orchestrator.
Maps, weather, traffic, and search are simulated or backed by live APIs with offline fallbacks.
"""
import json
import os
from typing import Any, Dict, List

from services.weather_service import weather_service
from services.maps_service import maps_service
from utils.helpers import extract_city_from_text
from utils.logger import setup_logger

logger = setup_logger("OrchestrationTools")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def _load_json(filename: str) -> Any:
    path = os.path.join(DATA_DIR, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.warning(f"Could not load {filename}: {e}")
        return []


def tool_weather(city: str = "Islamabad") -> Dict[str, Any]:
    """OpenWeather (or mock) for a Pakistani city."""
    return weather_service.get_weather(city)


def tool_traffic(area: str = "G-10") -> Dict[str, Any]:
    """Simulated traffic intelligence feed."""
    records = _load_json("mock_traffic.json")
    for row in records:
        road = row.get("road_name", row.get("area", ""))
        if area.lower() in road.lower():
            speed = row.get("avg_speed_kph", row.get("avg_speed_kmh", 10))
            return {
                **row,
                "area": road,
                "congestion_index": max(0.0, 1.0 - (speed / 60.0)),
                "avg_speed_kmh": speed,
                "normal_speed_kmh": 60,
            }
    if records:
        row = records[0]
        speed = row.get("avg_speed_kph", 10)
        return {
            **row,
            "area": row.get("road_name", "Unknown"),
            "congestion_index": max(0.0, 1.0 - (speed / 60.0)),
            "avg_speed_kmh": speed,
            "normal_speed_kmh": 60,
        }
    return {
        "area": area,
        "congestion_index": 0.92,
        "avg_speed_kmh": 4,
        "normal_speed_kmh": 60,
        "status": "SEVERE_CONGESTION",
    }


def tool_social_search(query: str) -> List[Dict[str, Any]]:
    """Simulated social/search ingest — matches informal Urdu/Roman Urdu posts."""
    posts = _load_json("mock_social_posts.json")
    q = query.lower()
    if not q:
        return posts[:5]
    return [p for p in posts if q in p.get("text", "").lower()][:8] or posts[:3]


def tool_maps_route(origin: Dict[str, float], destination: Dict[str, float]) -> Dict[str, Any]:
    """Google Directions or polyline fallback."""
    return maps_service.get_route(origin, destination)


def gather_context_from_signals(signals: List[Any]) -> Dict[str, Any]:
    """Build orchestrator context from ingested multi-source signals."""
    cities = set()
    areas = set()
    for sig in signals:
        content = getattr(sig, "content", None) or getattr(sig, "raw", "") or ""
        cities.add(extract_city_from_text(content))
        loc = getattr(sig, "location", None)
        if loc and getattr(loc, "name", None):
            areas.add(loc.name)
        hint = getattr(sig, "location_hint", None)
        if hint:
            areas.add(hint)

    primary_city = "Islamabad" if "Islamabad" in cities else (next(iter(cities)) if cities else "Islamabad")
    primary_area = next((a for a in areas if "G-10" in a or "George" in a), next(iter(areas), "G-10, Islamabad"))

    return {
        "weather": tool_weather(primary_city),
        "traffic": tool_traffic(primary_area.split(",")[0].strip()),
        "social_hits": tool_social_search("flood pani G-10 George Town"),
        "maps_available": bool(os.getenv("GOOGLE_MAPS_API_KEY")),
    }
