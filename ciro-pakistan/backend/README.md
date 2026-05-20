# CIRO Backend — Crisis Intelligence & Response Orchestrator

Production-grade FastAPI backend system running a multi-agent AI orchestration pipeline (Signal Fusion, Crisis Detection, Decision & Resource Routing, Dispatch Simulation).

---

## Folder Structure

```
backend/
├── agents/
│   ├── signal_agent.py       # Translate Roman Urdu, geo-bound fusion
│   ├── detection_agent.py    # Multi-hazard verification, severity analysis
│   ├── decision_agent.py     # Dispatches rescue assets, nearest hospital lookup
│   └── execution_agent.py    # Broadcaster, before/after simulation
│
├── services/
│   ├── gemini_service.py     # Gemini 1.5 Pro wrapper with Pydantic schemas
│   ├── weather_service.py    # OpenWeather connection + offline JSON fallback
│   ├── maps_service.py       # Google Maps routing polyline + coordinate distance math
│   ├── aqi_service.py        # Environmental air metrics + fallbacks
│   ├── firebase_service.py   # Dual-driver DB (Firestore Admin vs local file database)
│   └── alert_service.py      # Broadcast SMS, notifications & alerts
│
├── routes/
│   └── crisis_routes.py      # Core endpoint handlers
│
├── utils/
│   ├── logger.py             # App logging config
│   ├── helpers.py            # Coordinate distance (Haversine)
│   └── constants.py          # Coordinates of hospitals/rescue centers in Pakistan
│
├── middleware/
│   └── cors.py               # Cross-Origin Resource Sharing configs
│
├── models/
│   └── crisis_model.py       # Pydantic validation models
│
├── data/
│   ├── mock_weather.json     # Offline Pakistani weather bounds
│   ├── mock_traffic.json     # Offline urban congestion metrics
│   └── mock_social_posts.json# Urdu/Roman Urdu testing signals
│
├── main.py                   # FastAPI application initialization
├── requirements.txt          # PIP package requirements
└── .env                      # API secret configurations
```

---

## Getting Started

### 1. Installation
Ensure you have Python 3.10+ installed.

Navigate into the backend folder and install the dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configurations
Configure the keys in your `.env` file:
```env
GEMINI_API_KEY=your-gemini-key
WEATHER_API_KEY=your-openweather-key
GOOGLE_MAPS_API_KEY=your-google-maps-key
FIREBASE_API_KEY=your-firebase-client-key
AQI_API_KEY=your-waqi-or-openaq-key
```

*Note: If no API keys are present, the system runs completely offline using mock JSON databases. It will not crash.*

### 3. Running the Server Locally
Launch the application:
```bash
python main.py
```
The server will boot on `http://localhost:8000`. You can access the interactive API docs at `http://localhost:8000/docs`.

---

## API Documentation

### POST `/api/analyze-crisis`
Ingests raw signals and executes the full AI agent pipeline.

**Example Request:**
```json
{
  "signals": [
    {
      "id": "sig_101",
      "source": "Twitter",
      "content": "SITE area main factory block C main aag lagi hai, log phatay huay hain aur smoke bohot hai!",
      "timestamp": "2026-05-20T11:45:00Z"
    }
  ]
}
```

**Example Response:**
```json
{
  "crises": [
    {
      "id": "crisis_sig_1",
      "type": "FIRE",
      "status": "ACTIVE",
      "priority": 1,
      "title": "Industrial Fire — Karachi, Pakistan",
      "location": "SITE Area, Karachi, Pakistan",
      "coordinates": {"lat": 24.8607, "lng": 67.0011},
      "severity": 5,
      "confidence": 95,
      "affected_population": 25000,
      "area_sqkm": 1.8,
      "signal_ids": ["sig_101"],
      "detected_at": "2026-05-20T11:50:00Z",
      "updated_at": "2026-05-20T11:51:00Z",
      "reasoning": "Corroborated fire hazard at Karachi SITE Block C. High density zone with hazardous smoke...",
      "contradiction_flag": false
    }
  ],
  "alerts": [
    {
      "id": "act_8471",
      "crisis_id": "crisis_sig_1",
      "type": "DISPATCH",
      "title": "5 Fire Brigades Dispatched",
      "detail": "Mobilized fire engines from Civic Centre station. ETA: 8 mins.",
      "timestamp": "2026-05-20T11:52:00Z",
      "status": "COMPLETED",
      "impact": "critical",
      "ticket": "TKT-DISP-2026-8471"
    }
  ],
  "traces": [
    {
      "id": "trace_ab72f",
      "agent_id": 1,
      "agent_name": "Signal Fusion Agent",
      "step": "Signal Fusion",
      "status": "COMPLETED",
      "details": "Parsed Roman Urdu input text and translated: 'Massive fire has broken out in SITE factory Block C...'",
      "timestamp": "2026-05-20T11:49:00Z"
    }
  ]
}
```

---

## Deployment Instructions

### Render (Backend)
1. Link your GitHub repository to Render.
2. Select **Web Service**.
3. Choose Python environment.
4. Set Build Command: `pip install -r requirements.txt`
5. Set Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables inside Render settings.
