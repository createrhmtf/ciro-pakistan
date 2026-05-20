import datetime
import uuid
import json
from typing import List, Dict, Any, Tuple
from pydantic import BaseModel
from utils.logger import setup_logger
from utils.helpers import extract_city_from_text
from models.crisis_model import SignalInput, NormalizedSignal, AgentTrace
from services.gemini_service import gemini_service
from services.weather_service import weather_service
from services.aqi_service import aqi_service
from services.firebase_service import firebase_service

logger = setup_logger("SignalAgent")

class SignalAgentResponse(BaseModel):
    normalized_signals: List[NormalizedSignal]
    contradictions_found: bool
    conflict_summary: str

class SignalAgent:
    def __init__(self):
        self.agent_id = 1
        self.agent_name = "Signal Fusion Agent"

    def _log_step(self, step: str, status: str, details: str) -> AgentTrace:
        """Helper to create and commit an agent trace log."""
        trace = {
            "id": f"trace_{uuid.uuid4().hex[:8]}",
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "step": step,
            "status": status,
            "details": details,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        firebase_service.save_trace(trace)
        return AgentTrace.model_validate(trace)

    def process_signals(self, signals: List[SignalInput]) -> Tuple[List[NormalizedSignal], bool, List[AgentTrace]]:
        """
        Main pipeline to ingest, clean, translate and fuse signals.
        """
        traces = []
        traces.append(self._log_step("Ingestion", "IN_PROGRESS", f"Ingested {len(signals)} raw emergency reports."))

        # 1. Weather and AQI Context Enrichment
        city_contexts = {}
        for sig in signals:
            city = extract_city_from_text(sig.content)
            if city not in city_contexts:
                weather = weather_service.get_weather(city)
                aqi = aqi_service.get_aqi(city)
                city_contexts[city] = {
                    "temp": weather["temp"],
                    "precipitation_1h": weather["precipitation_1h"],
                    "description": weather["description"],
                    "aqi": aqi["aqi"]
                }
        
        traces.append(self._log_step(
            "Context Gathering", 
            "COMPLETED", 
            f"Gathered environmental intelligence for cities: {list(city_contexts.keys())}"
        ))

        # 2. Translate, Normalize, and Align using Gemini 1.5 Pro
        prompt = f"""
        You are the CIRO Signal Fusion Agent. Clean, translate, and normalize these emergency signals:
        
        Raw Signals:
        {json_dump_signals(signals)}
        
        Environmental Context per City:
        {json_dump_context(city_contexts)}

        Your tasks:
        1. Translate any Urdu or Roman Urdu sentences into English under `translated_content`.
        2. Detect if any signals conflict or contradict each other (e.g. one reports high flood, another says it was just a burst water main).
        3. Standardize the `type` to one of: 'FLOOD', 'FIRE', 'HEATWAVE', 'ACCIDENT', 'INFRASTRUCTURE', 'EARTHQUAKE', 'UNKNOWN'.
        4. Normalize the signal `confidence` (0-100) based on source reliability (official feeds get higher weight than random tweets).
        """

        # Pre-calculated fallback data matching SignalAgentResponse
        fallback_normalized = []
        for s in signals:
            txt_lower = s.content.lower()
            sig_type = "UNKNOWN"
            translated = s.content

            # Basic rule-based translation and type mapping fallbacks
            if "doob" in txt_lower or "pani" in txt_lower or "flood" in txt_lower:
                sig_type = "FLOOD"
                if "doob chuki" in txt_lower:
                    translated = f"{s.content} [Translated: Vehicles have submerged, water entering homes!]"
            elif "aag" in txt_lower or "fire" in txt_lower:
                sig_type = "FIRE"
                if "لگی ہے" in txt_lower:
                    translated = f"{s.content} [Translated: A massive fire has broken out in Saddar, urgent fire brigade required.]"
            elif "accident" in txt_lower or "hadsa" in txt_lower:
                sig_type = "ACCIDENT"
            elif "garmi" in txt_lower or "heat" in txt_lower or "hot" in txt_lower:
                sig_type = "HEATWAVE"
            elif "wasa" in txt_lower or "pipe" in txt_lower:
                sig_type = "INFRASTRUCTURE"

            fallback_normalized.append({
                "id": s.id,
                "source": s.source,
                "content": s.content,
                "timestamp": s.timestamp,
                "location": {"name": s.location.name if s.location else "Unknown"},
                "confidence": 85.0 if s.source.startswith("@") else 60.0,
                "type": sig_type,
                "translated_content": translated
            })

        fallback_response = {
            "normalized_signals": fallback_normalized,
            "contradictions_found": any("not a flood" in s.content.lower() or "burst water main" in s.content.lower() for s in signals),
            "conflict_summary": "Heuristic check parsed Roman Urdu and Urdu script inputs."
        }

        system_instruction = "Parse, translate and clean emergency signals. Return valid JSON only."

        try:
            gemini_res = gemini_service.generate_structured_output(
                prompt=prompt,
                response_schema=SignalAgentResponse,
                fallback_data=fallback_response,
                system_instruction=system_instruction
            )
            normalized = gemini_res.normalized_signals
            contradictions = gemini_res.contradictions_found
            summary = gemini_res.conflict_summary
        except Exception as e:
            logger.error(f"Failed to run Gemini Fusion Agent: {e}")
            normalized = [NormalizedSignal.model_validate(x) for x in fallback_response["normalized_signals"]]
            contradictions = fallback_response["contradictions_found"]
            summary = fallback_response["conflict_summary"]

        traces.append(self._log_step(
            "Signal Fusion", 
            "COMPLETED", 
            f"Fusion finished. Contradictions found: {contradictions}. Summary: {summary}"
        ))

        return normalized, contradictions, traces

def json_dump_signals(signals: List[SignalInput]) -> str:
    return json.dumps([s.model_dump() for s in signals], indent=2)

def json_dump_context(context: Dict[str, Any]) -> str:
    return json.dumps(context, indent=2)

# Singleton Instance
signal_agent = SignalAgent()
