import datetime
import uuid
from typing import List, Dict, Any, Tuple
from pydantic import BaseModel
from utils.logger import setup_logger
from models.crisis_model import CrisisReport, Alert, AgentTrace, ReroutePath
from services.gemini_service import gemini_service
from services.alert_service import alert_service
from services.firebase_service import firebase_service

logger = setup_logger("ExecutionAgent")

class SimulationSummary(BaseModel):
    active_crises: int
    unresponded_alerts: int
    resources_idle: int
    estimated_casualties: int
    response_time_avg_min: float
    coverage_pct: float
    lives_saved: int = 0
    resources_deployed: int = 0

class ExecutionOutput(BaseModel):
    alert_details: List[Dict[str, Any]] # Structured details for alerts to broadcast
    before_state: Dict[str, Any]
    after_state: Dict[str, Any]

class ExecutionAgent:
    def __init__(self):
        self.agent_id = 4
        self.agent_name = "Execution & Simulation Agent"

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

    def execute_plans(
        self,
        crises: List[CrisisReport],
        plans: List[Any]
    ) -> Tuple[List[Alert], Dict[str, Any], List[AgentTrace]]:
        """
        Executes actions, generates tickets, reroutes traffic, broadcasts notifications,
        and computes simulation results.
        """
        traces = []
        traces.append(self._log_step(
            "Action Generation", 
            "IN_PROGRESS", 
            f"Simulating response pipeline execution for {len(crises)} crises."
        ))

        generated_alerts = []

        # Find any retracted crises first and generate retraction alerts
        for c in crises:
            if c.status == "RETRACTED":
                retract_alert = alert_service.create_alert(
                    crisis_id=c.id,
                    alert_type="RETRACTION",
                    title=f"⚠️ ALERT RETRACTED — {c.location} Flood Clear",
                    detail=f"WASA inspection confirmed {c.retracted_reason or 'false alarm'}. Evacuation order canceled.",
                    impact="system",
                    alert_text_en=f"✅ CORRECTION: {c.location} is not flooded. WASA engineers resolved a water main leakage.",
                    alert_text_ur=f"✅ تصحیح: {c.location} میں سیلاب کا خطرہ دور ہو گیا ہے۔ واسا پائپ مرمت مکمل۔"
                )
                generated_alerts.append(Alert.model_validate(retract_alert))

        # Generate action alerts for active dispatches
        plan_dict = {p.crisis_id: p for p in plans}
        for c in crises:
            if c.status == "RETRACTED" or c.id not in plan_dict:
                continue

            plan = plan_dict[c.id]
            
            # 1. Dispatch Alert
            disp = alert_service.create_alert(
                crisis_id=c.id,
                alert_type="DISPATCH",
                title=f"Emergency Units Mobilized to {c.location}",
                detail=f"Dispatched {plan.allocated_ambulances} ambulances and {plan.allocated_fire_engines} fire engines from {plan.assigned_rescue_station}. ETA: {plan.eta_minutes} mins.",
                impact="critical",
                alert_text_en=f"🚀 DISPATCH: Rescue team sent to {c.location}. ETA {plan.eta_minutes} mins.",
                alert_text_ur=f"🚀 ریسکیو روانہ: امدادی ٹیمیں {c.location} کے لیے روانہ ہو چکی ہیں۔"
            )
            generated_alerts.append(Alert.model_validate(disp))

            # 2. Public Evacuation Alert
            text_en = f"⚠️ EMERGENCY: {c.type} active in {c.location}. Avoid area and clear pathways."
            text_ur = f"⚠️ ہنگامی صورتحال: {c.location} میں حادثہ۔ متبادل راستے اختیار کریں۔"
            
            if c.type == "FLOOD":
                text_en = f"🌊 FLOOD ALERT: {c.location}. Evacuate basements. Call 1122."
                text_ur = f"🌊 سیلاب الرٹ: {c.location}۔ تہہ خانوں سے نکلیں۔ 1122 پر کال کریں۔"
            elif c.type == "FIRE":
                text_en = f"🔥 FIRE HAZARD: SITE fire expanding. Evacuate immediately due to smoke."
                text_ur = f"🔥 آگ کا خطرہ: سائٹ ایریا خالی کریں۔ زہریلا دھواں پھیل رہا ہے۔"

            pub = alert_service.create_alert(
                crisis_id=c.id,
                alert_type="ALERT",
                title=f"Public Safety Advisory — {c.location}",
                detail=f"Official safety broadcast to residents within 1km. Instructions: {text_en}",
                impact="high",
                alert_text_en=text_en,
                alert_text_ur=text_ur
            )
            generated_alerts.append(Alert.model_validate(pub))

            # 3. Hospital Notification
            hosp = alert_service.create_alert(
                crisis_id=c.id,
                alert_type="NOTIFY",
                title=f"{plan.assigned_hospital} Emergency Ward Activated",
                detail=f"Reserved trauma beds. Casualty estimates: {c.affected_population // 100} units.",
                impact="high",
                alert_text_en=f"🏥 HOSPITAL WARNED: {plan.assigned_hospital} on high alert.",
                alert_text_ur=f"🏥 ہسپتال الرٹ: {plan.assigned_hospital} ہنگامی وارڈ تیار۔"
            )
            generated_alerts.append(Alert.model_validate(hosp))

            # 4. Traffic Rerouting Alert (if severe)
            if c.type in ["FLOOD", "FIRE", "ACCIDENT"] and c.severity >= 3:
                r_paths = [
                    {
                        "from": f"{c.location} Main Junction",
                        "to": f"{plan.assigned_rescue_station} Diversion Route",
                        "blocked": True
                    }
                ]
                rte = alert_service.create_alert(
                    crisis_id=c.id,
                    alert_type="REROUTE",
                    title=f"Traffic Diversion Activated — {c.location}",
                    detail=f"Traffic rerouted via GT road and local intersections. Clear lanes for ambulances.",
                    impact="medium",
                    alert_text_en="🔄 TRAFFIC DIVERSION: Road blockages active. Use alternate routes.",
                    alert_text_ur="🔄 ٹریفک کا رخ تبدیل: متبادل راستے استعمال کریں۔",
                    reroute_paths=r_paths
                )
                generated_alerts.append(Alert.model_validate(rte))

        # Calculate Before vs After Scenario Math
        before_state = {
            "active_crises": len([x for x in crises if x.status != "RETRACTED"]),
            "unresponded_alerts": len(crises) * 2,
            "resources_idle": 90,
            "estimated_casualties": sum(x.affected_population for x in crises if x.status != "RETRACTED") // 500,
            "response_time_avg_min": 0.0,
            "coverage_pct": 0.0
        }

        total_deployed = len(generated_alerts) * 4
        after_state = {
            "active_crises": before_state["active_crises"],
            "unresponded_alerts": 0,
            "resources_idle": max(90 - total_deployed, 10),
            "estimated_casualties": max(before_state["estimated_casualties"] // 8, 2),
            "response_time_avg_min": round(sum(p.eta_minutes for p in plans) / len(plans), 1) if plans else 5.0,
            "coverage_pct": 95.0,
            "lives_saved": before_state["estimated_casualties"] - max(before_state["estimated_casualties"] // 8, 2),
            "resources_deployed": total_deployed
        }

        traces.append(self._log_step(
            "Simulating Dispatch", 
            "COMPLETED", 
            f"Broadcasting finalized alerts. Simulated: {after_state['lives_saved']} lives saved."
        ))

        simulation_summary = {
            "id": "scenario_a",
            "name": "Live Incident Orchestration",
            "before": before_state,
            "after": after_state,
            "updated_at": datetime.datetime.utcnow().isoformat() + "Z"
        }
        # Save to database state
        firebase_service.save_simulation(simulation_summary)

        return generated_alerts, simulation_summary, traces

# Singleton Instance
execution_agent = ExecutionAgent()
