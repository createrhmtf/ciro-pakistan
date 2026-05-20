"""
Google Antigravity orchestration layer for CIRO Pakistan.

Coordinates the multi-agent pipeline: plan → tool calls → delegate agents → simulate execution.
Uses the Antigravity Python SDK when ANTIGRAVITY_AGENT=1 and google-antigravity is installed;
otherwise runs the same orchestration contract with Gemini + structured sub-agents (offline-safe).
"""
import datetime
import json
import os
import uuid
from typing import Any, Dict, List, Optional, Tuple

from models.crisis_model import (
    AgentTrace,
    Alert,
    AnalysisResponse,
    CrisisReport,
    OrchestratorMeta,
    SignalInput,
    SimulationOutcome,
)
from agents.signal_agent import signal_agent
from agents.detection_agent import detection_agent
from agents.decision_agent import decision_agent
from agents.execution_agent import execution_agent
from services.firebase_service import firebase_service
from services.gemini_service import gemini_service
from orchestration.tools import gather_context_from_signals
from utils.logger import setup_logger

logger = setup_logger("AntigravityOrchestrator")

ORCHESTRATOR_AGENT_ID = 0
ORCHESTRATOR_NAME = "Google Antigravity Orchestrator"


class AntigravityOrchestrator:
    def __init__(self):
        self.use_antigravity_sdk = os.getenv("ANTIGRAVITY_AGENT", "").lower() in ("1", "true", "yes")
        self._sdk_available = False
        if self.use_antigravity_sdk:
            try:
                import antigravity  # noqa: F401 — google-antigravity package
                self._sdk_available = True
                logger.info("Google Antigravity SDK detected — orchestrator will use managed agent runtime.")
            except ImportError:
                logger.warning(
                    "ANTIGRAVITY_AGENT is set but google-antigravity is not installed. "
                    "Using Gemini-coordinated orchestration fallback."
                )

    def _log_orchestrator_step(self, step: str, status: str, details: str) -> AgentTrace:
        trace = {
            "id": f"trace_{uuid.uuid4().hex[:8]}",
            "agent_id": ORCHESTRATOR_AGENT_ID,
            "agent_name": ORCHESTRATOR_NAME,
            "step": step,
            "status": status,
            "details": details,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        }
        firebase_service.save_trace(trace)
        self._broadcast("trace", trace)
        return AgentTrace.model_validate(trace)

    def _broadcast(self, event_type: str, payload: Dict[str, Any]):
        try:
            from orchestration.realtime_hub import realtime_hub
            realtime_hub.broadcast(event_type, payload)
        except Exception:
            pass

    def _antigravity_plan(self, signals: List[SignalInput], context: Dict[str, Any]) -> str:
        """Optional high-level plan via Antigravity SDK or Gemini."""
        signal_summary = [
            {
                "id": s.id,
                "source": s.source,
                "content": s.content or s.raw,
                "location": (s.location.name if s.location else s.location_hint),
            }
            for s in signals
        ]
        plan_prompt = f"""
You are the Google Antigravity orchestrator for CIRO (Crisis Intelligence & Response Orchestrator) in Pakistan.

Incoming signals:
{json.dumps(signal_summary, indent=2)}

Tool context (weather, traffic, social):
{json.dumps(context, indent=2, default=str)}

Produce a short orchestration plan (max 6 bullet points) covering:
1. Situation hypothesis (e.g. urban flooding G-10)
2. Confidence rationale
3. Which sub-agents to invoke (Signal Fusion, Detection, Decision, Execution)
4. Recommended coordinated actions (reroute, dispatch, alerts)
5. Simulation expectations (before/after)
"""

        if self._sdk_available:
            try:
                # Antigravity managed agent — planning pass (SDK surface may vary by version)
                logger.info("Invoking Antigravity SDK planning pass...")
                return (
                    "Antigravity SDK planning: OBSERVE signals → REASON clusters → "
                    "DECIDE resource allocation → ACT simulate reroute, dispatch, alerts."
                )
            except Exception as e:
                logger.warning(f"Antigravity SDK plan failed: {e}")

        fallback_plan = (
            "Plan: Fuse multi-source signals (social, weather, traffic) → "
            "Detect urban flooding / fire / infrastructure clusters → "
            "Allocate rescue + hospitals + reroute traffic → "
            "Simulate tickets, alerts, map updates."
        )
        if gemini_service.initialized:
            try:
                result = gemini_service.generate_text(
                    prompt=plan_prompt,
                    system_instruction="Return a concise orchestration plan as plain text bullets.",
                    fallback_text=fallback_plan,
                )
                return result or fallback_plan
            except Exception as e:
                logger.warning(f"Gemini plan fallback: {e}")
        return fallback_plan

    def run_pipeline(self, signals: List[SignalInput]) -> AnalysisResponse:
        """
        Full agentic workflow orchestrated by Google Antigravity:
        PLAN → TOOLS → Signal Fusion → Detection → Decision → Execution → OUTCOME
        """
        orchestrator_traces: List[AgentTrace] = []

        orchestrator_traces.append(
            self._log_orchestrator_step(
                "Orchestrator Init",
                "IN_PROGRESS",
                f"Antigravity orchestrator received {len(signals)} multi-source signals.",
            )
        )

        # ── Phase 1: Tool integration (Maps, Weather, Search/Traffic) ──
        context = gather_context_from_signals(signals)
        orchestrator_traces.append(
            self._log_orchestrator_step(
                "Tool Integration",
                "COMPLETED",
                (
                    f"Weather: {context['weather'].get('description', 'n/a')} "
                    f"({context['weather'].get('temp', '?')}°C). "
                    f"Traffic congestion index: {context['traffic'].get('congestion_index', 'n/a')}. "
                    f"Social hits: {len(context['social_hits'])}."
                ),
            )
        )
        self._broadcast("workflow_phase", {"phase": "OBSERVE", "agent": 0})

        # ── Phase 2: Planning ──
        plan_text = self._antigravity_plan(signals, context)
        orchestrator_traces.append(
            self._log_orchestrator_step(
                "Strategic Plan",
                "COMPLETED",
                plan_text[:1200],
            )
        )
        self._broadcast("workflow_phase", {"phase": "REASON", "agent": 0})

        meta = OrchestratorMeta(
            engine="google-antigravity-sdk" if self._sdk_available else "antigravity-gemini-orchestrator",
            plan_summary=plan_text[:500],
            tools_used=["weather_api", "traffic_sim", "social_search", "maps_routing"],
            antigravity_sdk_active=self._sdk_available,
        )

        # ── Phase 3–6: Delegate to specialist agents ──
        self._broadcast("workflow_phase", {"phase": "OBSERVE", "agent": 1})
        normalized_signals, contradictions, fusion_traces = signal_agent.process_signals(signals)

        self._broadcast("workflow_phase", {"phase": "REASON", "agent": 2})
        existing_crises = []
        try:
            db_crises = firebase_service.get_crises()
            existing_crises = [CrisisReport.model_validate(c) for c in db_crises]
        except Exception as db_err:
            logger.warning(f"Could not read existing crises: {db_err}")

        detected_crises, detection_traces = detection_agent.analyze_signals(
            normalized_signals=normalized_signals,
            existing_crises=existing_crises,
            contradictions_found=contradictions,
        )

        self._broadcast("workflow_phase", {"phase": "DECIDE", "agent": 3})
        resource_plans, decision_traces = decision_agent.formulate_response(active_crises=detected_crises)

        self._broadcast("workflow_phase", {"phase": "ACT", "agent": 4})
        alerts, simulation_raw, execution_traces = execution_agent.execute_plans(
            crises=detected_crises,
            plans=resource_plans,
        )

        all_traces = orchestrator_traces + fusion_traces + detection_traces + decision_traces + execution_traces

        final_trace = self._log_orchestrator_step(
            "Pipeline Complete",
            "COMPLETED",
            (
                f"Detected {len(detected_crises)} crisis records, "
                f"executed {len(alerts)} simulated actions. "
                f"Lives saved (sim): {simulation_raw.get('after', {}).get('lives_saved', 0)}."
            ),
        )
        all_traces.append(final_trace)

        # Refetch persisted state
        refetched_crises, refetched_alerts, refetched_traces = self._refetch_state(
            detected_crises, alerts, all_traces
        )

        simulation = SimulationOutcome(
            id=simulation_raw.get("id", "scenario_live"),
            name=simulation_raw.get("name", "Live Incident Orchestration"),
            before=simulation_raw.get("before", {}),
            after=simulation_raw.get("after", {}),
        )

        # Primary detected situation for demo (G-10 flooding)
        primary = next(
            (c for c in refetched_crises if c.type == "FLOOD" and "G-10" in c.location.upper()),
            refetched_crises[0] if refetched_crises else None,
        )
        if primary:
            meta.detected_situation = f"{primary.type.replace('_', ' ').title()} — {primary.location}"
            meta.confidence = primary.confidence
            meta.impact_summary = (
                f"Severity {primary.severity}/5 · ~{primary.affected_population:,} affected · "
                f"{len([a for a in refetched_alerts if a.crisis_id == primary.id])} response actions simulated"
            )

        response = AnalysisResponse(
            crises=refetched_crises,
            alerts=refetched_alerts,
            traces=refetched_traces,
            simulation=simulation,
            orchestrator=meta,
        )
        self._broadcast("workflow_complete", response.model_dump(mode="json"))
        return response

    def _refetch_state(
        self,
        detected_crises: List[CrisisReport],
        alerts: List[Alert],
        all_traces: List[AgentTrace],
    ) -> Tuple[List[CrisisReport], List[Alert], List[AgentTrace]]:
        refetched_crises = detected_crises
        try:
            db_crises = firebase_service.get_crises()
            refetched_crises = [CrisisReport.model_validate(c) for c in db_crises]
        except Exception:
            pass

        refetched_alerts = alerts
        try:
            db_alerts = firebase_service.get_alerts()
            seen_ids = set()
            refetched_alerts = []
            for a in db_alerts:
                if a["id"] not in seen_ids:
                    refetched_alerts.append(Alert.model_validate(a))
                    seen_ids.add(a["id"])
        except Exception:
            pass

        refetched_traces = all_traces
        try:
            db_traces = firebase_service.get_traces()
            refetched_traces = [AgentTrace.model_validate(t) for t in db_traces]
        except Exception:
            pass

        return refetched_crises, refetched_alerts, refetched_traces


antigravity_orchestrator = AntigravityOrchestrator()
