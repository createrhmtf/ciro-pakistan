import datetime
import uuid
import json
from typing import List, Dict, Any, Tuple
from pydantic import BaseModel
from utils.logger import setup_logger
from utils.helpers import extract_city_from_text
from models.crisis_model import NormalizedSignal, CrisisReport, AgentTrace
from services.gemini_service import gemini_service
from services.maps_service import maps_service
from services.firebase_service import firebase_service

logger = setup_logger("DetectionAgent")

class CrisisDetectionOutput(BaseModel):
    crises: List[CrisisReport]

class DetectionAgent:
    def __init__(self):
        self.agent_id = 2
        self.agent_name = "Crisis Detection Agent"

    def _log_step(self, step: str, status: str, details: str) -> AgentTrace:
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

    def analyze_signals(
        self,
        normalized_signals: List[NormalizedSignal],
        existing_crises: List[CrisisReport],
        contradictions_found: bool
    ) -> Tuple[List[CrisisReport], List[AgentTrace]]:
        """
        Groups signals, evaluates environmental hazards, detects crisis thresholds,
        and manages retractions and reclassifications.
        """
        traces = []
        traces.append(self._log_step(
            "Crisis Clustering", 
            "IN_PROGRESS", 
            f"Reviewing {len(normalized_signals)} signals against {len(existing_crises)} existing crises."
        ))

        # Fetch live environmental context for prompt and heuristic checks
        env_context = {}
        from services.weather_service import weather_service
        from services.aqi_service import aqi_service

        for s in normalized_signals:
            city = extract_city_from_text(s.content)
            if city not in env_context:
                try:
                    w = weather_service.get_weather(city)
                    a = aqi_service.get_aqi(city)
                    env_context[city] = {
                        "temperature": w.get("temp", 25.0),
                        "precipitation_mm": w.get("precipitation_mm", 0.0),
                        "humidity": w.get("humidity", 70),
                        "aqi": a.get("aqi", 75),
                        "pm25": a.get("pm25", 22.5)
                    }
                except Exception as e:
                    logger.error(f"Error fetching env context: {e}")

        # Build prompt listing signals and current state
        prompt = f"""
        You are the CIRO Crisis Detection Agent. Analyze the signals and current state to determine active crises.
        
        Normalized Signals:
        {json_dump_normalized(normalized_signals)}
        
        Existing Active Crises in System:
        {json_dump_crises(existing_crises)}
        
        Environmental Weather and AQI Context:
        {json.dumps(env_context, indent=2)}
        
        Contradictions Detected: {contradictions_found}

        Guidelines:
        1. Group signals by location and hazard type.
        2. Assign severity (1 to 5) and confidence (0 to 100).
        3. Set status: 'ACTIVE', 'MONITORING', or 'RETRACTED'.
        4. If a contradiction indicates an active crisis was a false alarm, change the old crisis status to 'RETRACTED' and add a reclassification report with the correct type.
        5. For each crisis, generate a detailed `reasoning` paragraph explaining the factors.
        """

        # Pre-calculated fallback data matching CrisisDetectionOutput
        # Maps coordinates and generates realistic severity scores based on rules
        fallback_crises = []
        processed_sig_ids = set()

        for s in normalized_signals:
            if s.id in processed_sig_ids:
                continue

            city = extract_city_from_text(s.content)
            coords = maps_service.geocode_address(city)
            city_env = env_context.get(city, {"temperature": 25.0, "precipitation_mm": 0.0, "humidity": 70, "aqi": 75, "pm25": 22.5})
            
            # Heuristic flood & fire risk calculation rules
            precip = city_env.get("precipitation_mm", 0.0)
            temp = city_env.get("temperature", 25.0)
            aqi_val = city_env.get("aqi", 75)
            humidity = city_env.get("humidity", 70)

            is_flood_risk = precip > 20.0 or (precip > 10.0 and humidity > 90)
            is_fire_risk = temp > 38.0 or (temp > 35.0 and aqi_val > 150)
            
            severity = 3
            pop = 5000
            area = 1.0
            title = f"Emergency Alert — {city.title()}"
            status = "ACTIVE"
            contradiction_flag = False
            retracted = False
            retracted_reason = None
            reclassified_as = None
            is_reclassification = False
            reclassified_from = None

            if s.type == "FLOOD" or is_flood_risk:
                severity = 4
                pop = 12000
                area = 3.2
                title = f"Urban Flash Flood — {city.title()}"
                
                # Check for adaptive F-7 reclassification mock scenario
                if "f-7" in s.content.lower() or "wasa" in s.content.lower():
                    status = "RETRACTED"
                    retracted = True
                    retracted_reason = "Conflicting field report confirms burst water main"
                    contradiction_flag = True
                    new_id = f"crisis_{uuid.uuid4().hex[:6]}"
                    reclassified_as = new_id

                    # Add the reclassified infrastructure crisis
                    fallback_crises.append({
                        "id": new_id,
                        "type": "INFRASTRUCTURE",
                        "status": "ACTIVE",
                        "priority": 3,
                        "title": f"Burst Water Main — F-7, {city.title()}",
                        "location": f"F-7, {city.title()}",
                        "coordinates": {"lat": 33.7215, "lng": 73.0565},
                        "severity": 2,
                        "confidence": 98.0,
                        "affected_population": 500,
                        "area_sqkm": 0.3,
                        "signal_ids": [s.id],
                        "detected_at": datetime.datetime.utcnow().isoformat() + "Z",
                        "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
                        "reasoning": f"WASA engineer confirms 24-inch pipe rupture. No flood active. Water flow redirected. Weather: {temp}°C, rain {precip}mm/hr.",
                        "contradiction_flag": False,
                        "is_reclassification": True,
                        "reclassified_from": f"crisis_{s.id[:5]}"
                    })

            elif s.type == "FIRE" or is_fire_risk:
                severity = 5
                pop = 25000
                area = 1.8
                title = f"Industrial Fire — {city.title()}"
            elif s.type == "HEATWAVE":
                severity = 4
                pop = 1200000
                area = 1772.0
                title = f"Severe Heatwave — {city.title()}"
            elif s.type == "ACCIDENT":
                severity = 3
                pop = 3000
                area = 0.5
                title = f"Multi-Vehicle Pileup — {city.title()}"

            reasoning = f"Detected {s.type} hazard in {city} with confidence {s.confidence}%. Triggered by report: '{s.content}'."
            if is_flood_risk or s.type == "FLOOD":
                reasoning += f" [Risk Index: Flood High (Precipitation: {precip}mm/hr, Humidity: {humidity}%)]"
            if is_fire_risk:
                reasoning += f" [Risk Index: Fire Elevated (Temp: {temp}°C, AQI: {aqi_val})]"

            fallback_crises.append({
                "id": f"crisis_{s.id[:5]}" if not retracted else f"crisis_{s.id[:5]}_retracted",
                "type": s.type,
                "status": status,
                "priority": 1 if severity >= 4 else 2,
                "title": title,
                "location": f"{city.title()}, Pakistan",
                "coordinates": coords,
                "severity": severity,
                "confidence": s.confidence,
                "affected_population": pop,
                "area_sqkm": area,
                "signal_ids": [s.id],
                "detected_at": datetime.datetime.utcnow().isoformat() + "Z",
                "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
                "reasoning": reasoning,
                "contradiction_flag": contradiction_flag,
                "retracted": retracted,
                "retracted_reason": retracted_reason,
                "reclassified_as": reclassified_as,
                "is_reclassification": is_reclassification,
                "reclassified_from": reclassified_from
            })
            processed_sig_ids.add(s.id)

        fallback_output = {"crises": fallback_crises}
        system_instruction = "Verify and cluster signals into structured crisis reports. Output valid JSON."

        try:
            gemini_res = gemini_service.generate_structured_output(
                prompt=prompt,
                response_schema=CrisisDetectionOutput,
                fallback_data=fallback_output,
                system_instruction=system_instruction
            )
            detected = gemini_res.crises
        except Exception as e:
            logger.error(f"Detection Agent failed to generate output: {e}")
            detected = [CrisisReport.model_validate(x) for x in fallback_output["crises"]]

        # Commit detected crises to database
        for crisis in detected:
            firebase_service.save_crisis(crisis.model_dump())

        traces.append(self._log_step(
            "Crisis Verification", 
            "COMPLETED", 
            f"Successfully classified {len(detected)} situations."
        ))

        return detected, traces

def json_dump_normalized(signals: List[NormalizedSignal]) -> str:
    return json.dumps([s.model_dump() for s in signals], indent=2)

def json_dump_crises(crises: List[CrisisReport]) -> str:
    return json.dumps([c.model_dump() for c in crises], indent=2)

# Singleton Instance
detection_agent = DetectionAgent()
