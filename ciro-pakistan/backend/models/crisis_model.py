from pydantic import BaseModel, Field, model_validator
from typing import List, Dict, Any, Optional

class Coordinates(BaseModel):
    lat: float
    lng: float

class SignalLocation(BaseModel):
    name: str

class SignalInput(BaseModel):
    id: str
    source: str
    content: Optional[str] = None
    raw: Optional[str] = None
    timestamp: str
    location: Optional[SignalLocation] = None
    location_hint: Optional[str] = None
    confidence: Optional[float] = 100.0
    type: Optional[str] = None
    live: Optional[bool] = False
    filtered: Optional[bool] = False

    @model_validator(mode='before')
    @classmethod
    def map_frontend_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'raw' in data and not data.get('content'):
                data['content'] = data['raw']
            if 'location_hint' in data and not data.get('location'):
                data['location'] = {'name': data['location_hint']}
        return data

class NormalizedSignal(BaseModel):
    id: str
    source: str
    content: str
    timestamp: str
    location: Optional[SignalLocation] = None
    confidence: float
    type: str
    translated_content: Optional[str] = None

class CrisisReport(BaseModel):
    id: str
    type: str
    status: str
    priority: int
    title: str
    location: str
    coordinates: Coordinates
    severity: int
    confidence: float
    affected_population: int
    area_sqkm: float
    signal_ids: List[str]
    detected_at: str
    updated_at: str
    reasoning: str
    contradiction_flag: bool = False
    retracted: Optional[bool] = False
    retracted_reason: Optional[str] = None
    reclassified_as: Optional[str] = None
    is_reclassification: Optional[bool] = False
    reclassified_from: Optional[str] = None

class ReroutePath(BaseModel):
    from_loc: str = Field(alias="from")
    to_loc: str = Field(alias="to")
    blocked: bool

    class Config:
        populate_by_name = True

class Alert(BaseModel):
    id: str
    crisis_id: str
    type: str
    title: str
    detail: str
    timestamp: str
    status: str
    impact: str
    ticket: Optional[str] = None
    languages: Optional[List[str]] = None
    alert_text_en: Optional[str] = None
    alert_text_ur: Optional[str] = None
    reroute_paths: Optional[List[ReroutePath]] = None
    is_retraction: Optional[bool] = False

class AgentTrace(BaseModel):
    id: str
    agent_id: int
    agent_name: str
    step: str
    status: str
    details: str
    timestamp: str

class SimulationOutcome(BaseModel):
    id: str
    name: str
    before: Dict[str, Any]
    after: Dict[str, Any]

class OrchestratorMeta(BaseModel):
    engine: str = "antigravity-gemini-orchestrator"
    plan_summary: str = ""
    tools_used: List[str] = []
    antigravity_sdk_active: bool = False
    detected_situation: Optional[str] = None
    confidence: Optional[float] = None
    impact_summary: Optional[str] = None

class AnalysisRequest(BaseModel):
    signals: List[SignalInput]

class AnalysisResponse(BaseModel):
    crises: List[CrisisReport]
    alerts: List[Alert]
    traces: List[AgentTrace]
    simulation: Optional[SimulationOutcome] = None
    orchestrator: Optional[OrchestratorMeta] = None
