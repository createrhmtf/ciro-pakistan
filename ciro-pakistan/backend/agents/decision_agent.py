import datetime
import uuid
from typing import List, Dict, Any, Tuple
from pydantic import BaseModel
from utils.logger import setup_logger
from models.crisis_model import CrisisReport, AgentTrace, Coordinates
from services.gemini_service import gemini_service
from services.maps_service import maps_service
from services.firebase_service import firebase_service

logger = setup_logger("DecisionAgent")

class CoordinatedResourcePlan(BaseModel):
    crisis_id: str
    allocated_ambulances: int
    allocated_fire_engines: int
    allocated_rescue_boats: int
    assigned_hospital: str
    assigned_rescue_station: str
    dispatch_route_steps: List[Coordinates]
    eta_minutes: float
    action_plan_steps: List[str]

class DecisionResponse(BaseModel):
    plans: List[CoordinatedResourcePlan]

class DecisionAgent:
    def __init__(self):
        self.agent_id = 3
        self.agent_name = "Decision & Resource Agent"

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

    def formulate_response(
        self,
        active_crises: List[CrisisReport]
    ) -> Tuple[List[CoordinatedResourcePlan], List[AgentTrace]]:
        """
        Prioritizes active crises, matches location bounds, finds closest response
        units, and plans dispatch routing coordinates.
        """
        traces = []
        traces.append(self._log_step(
            "Priority Matrix", 
            "IN_PROGRESS", 
            f"Reviewing {len(active_crises)} active situations for asset distribution."
        ))

        # Filter out retracted crises for resource scheduling
        viable_crises = [c for c in active_crises if c.status != "RETRACTED"]
        
        # Sort by severity descending (Priority queuing)
        viable_crises.sort(key=lambda x: x.severity, reverse=True)

        prompt = f"""
        You are the CIRO Decision & Resource Agent. Coordinate response plans for these crises:
        
        Active Crises (Priority Order):
        {json_dump_crises(viable_crises)}

        Determine:
        1. Appropriate ambulance, fire engine, and boat counts based on type and severity.
        2. Steps to resolve the emergency.
        3. Keep in mind resource caps from available stations.
        """

        # Generate rule-based coordinate-route plans as fallbacks
        fallback_plans = []
        for crisis in viable_crises:
            crisis_coords = {"lat": crisis.coordinates.lat, "lng": crisis.coordinates.lng}
            
            # Find closest resources using maps service
            hosp = maps_service.find_nearest_hospital(crisis_coords)
            station = maps_service.find_nearest_rescue_station(crisis_coords)
            
            # Get simulated route coordinates
            route_data = maps_service.get_route(station["coordinates"], crisis_coords)
            route_steps = [Coordinates(lat=s["lat"], lng=s["lng"]) for s in route_data["steps"]]

            # Deduce assets needed
            ambulances = 2
            fire_engines = 0
            boats = 0
            steps = ["Dispatch initial response team.", "Assess surrounding blockages."]

            if crisis.type == "FLOOD":
                boats = 3
                ambulances = 4
                steps = [
                    "Deploy rescue boats to submerged roads.",
                    "Set up temporary evacuation shelters.",
                    "Establish medical triage camps."
                ]
            elif crisis.type == "FIRE":
                fire_engines = 6
                ambulances = 5
                steps = [
                    "Establish fire containment lines.",
                    "Evacuate adjacent factories/homes.",
                    "Set up de-contamination zones."
                ]
            elif crisis.type == "ACCIDENT":
                ambulances = 3
                steps = [
                    "Extract trapped passengers.",
                    "Divert incoming traffic via local alternatives.",
                    "Clear road debris."
                ]

            fallback_plans.append({
                "crisis_id": crisis.id,
                "allocated_ambulances": ambulances,
                "allocated_fire_engines": fire_engines,
                "allocated_rescue_boats": boats,
                "assigned_hospital": hosp["name"],
                "assigned_rescue_station": station["name"],
                "dispatch_route_steps": [s.model_dump() for s in route_steps],
                "eta_minutes": route_data["duration_min"],
                "action_plan_steps": steps
            })

        fallback_output = {"plans": fallback_plans}
        system_instruction = "Compute resource requirements, nearest medical aid, and dispatch route steps. Output valid JSON."

        try:
            gemini_res = gemini_service.generate_structured_output(
                prompt=prompt,
                response_schema=DecisionResponse,
                fallback_data=fallback_output,
                system_instruction=system_instruction
            )
            plans = gemini_res.plans
        except Exception as e:
            logger.error(f"Decision formulation failed: {e}")
            plans = [CoordinatedResourcePlan.model_validate(x) for x in fallback_output["plans"]]

        traces.append(self._log_step(
            "Resource Allocation", 
            "COMPLETED", 
            f"Created deployment plans for {len(plans)} active crisis sites."
        ))

        return plans, traces

def json_dump_crises(crises: List[CrisisReport]) -> str:
    import json
    return json.dumps([c.model_dump() for c in crises], indent=2)

# Singleton Instance
decision_agent = DecisionAgent()
