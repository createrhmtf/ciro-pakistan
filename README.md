# CIRO Pakistan

A complete crisis intelligence and response system built as a mobile-first web app with a FastAPI backend and multi-agent decision pipeline.

## What this project does

CIRO Pakistan brings together multiple information sources to detect and respond to crises. It uses:

- a React frontend for a responsive command center,
- a FastAPI backend for APIs and agent workflows,
- mock and real data for weather, traffic, and social signals,
- a structured Orchestrator that simulates emergency response actions.

This repository is designed to run locally for demo, testing, and evaluation.

## Project structure

- `ciro-pakistan/` — main app folder
  - `backend/` — Python FastAPI backend, agents, routes, orchestration, and mock data
  - `src/` — React PWA frontend, UI pages, components, and services
  - `public/` — static app manifest and public assets
- `package.json` — frontend dependencies summary
- `ciro-pakistan/package.json` — actual app dependencies and scripts
- `ciro-pakistan/backend/requirements.txt` — Python backend dependencies

## What you need to run it

### Required software

- Node.js and npm
- Python 3.11+ (or compatible Python 3.x)
- Git (optional, but recommended)

### Optional services

- Google APIs if you want live maps or Gemini access
- Firebase credentials for real backend storage

## Backend setup

1. Open a terminal.
2. Navigate to the backend folder:

```powershell
cd "\Project\ciro-pakistan\backend"
```

3. Install dependencies:

```powershell
pip install -r requirements.txt
```

4. Start the API:

```powershell
python main.py
```

5. Visit the API docs in your browser:

```text
http://localhost:8000/docs
```

### Backend dependencies

The backend uses:

- `fastapi` — easy Python API framework
- `uvicorn` — ASGI server
- `websockets` — live event transport
- `google-generativeai` — Gemini/Antigravity integration
- `firebase-admin` — optional Firestore backend
- `pydantic` — data validation
- `python-dotenv` — environment variables
- `requests`, `httpx` — external HTTP calls

### Optional backend settings

If you have Firebase service credentials, set:

```powershell
set GOOGLE_APPLICATION_CREDENTIALS=path\to\service-account.json
```

## Frontend setup

1. Open a new terminal.
2. Navigate to the app folder:

```powershell
cd "f:\Uni Assignment\Project\ciro-pakistan"
```

3. Install frontend packages:

```powershell
npm install
```

4. Start the React app:

```powershell
npm run dev
```

5. Open the app in your browser:

```text
http://localhost:5173
```

### Frontend dependencies

The React app uses:

- `react`, `react-dom` — core UI library
- `react-router-dom` — page navigation
- `axios` — API requests
- `react-leaflet` and `leaflet` — interactive map display
- `firebase` — frontend auth and optional backend integration
- `framer-motion` — animations
- `react-hot-toast` — toast notifications
- `react-icons` — icon library
- `tailwindcss`, `postcss`, `autoprefixer` — styling tools

## How the app works

CIRO Pakistan has two main pieces:

### 1. Backend API and agent workflow

- The backend loads mock signals for weather, traffic, and social media.
- A central orchestration component runs a multi-step agent pipeline.
- The pipeline fuses signals, detects crisis events, chooses response actions, and simulates outcome updates.
- Agent logs are saved and exposed through API routes.

### 2. Frontend command center

- The React app shows a dashboard, map, alerts, and agent logs.
- A user can run the full crisis detection and response workflow from the UI.
- Simulation results and map markers update in real time.

## Main API endpoints

These are the key backend routes to know:

- `POST /api/analyze-crisis` — run the full crisis analysis workflow
- `GET /api/mock-signals` — retrieve demo input signals
- `GET /api/agent-traces` — fetch agent reasoning logs
- `GET /api/simulation` — fetch the latest simulated crisis state
- `GET /api/weather/{city}` — get weather data
- `GET /api/route` — get routing and map path info
- `WS /api/ws` — optional websocket channel for live updates

## Running the project together

1. Start the backend first.
2. Start the frontend next.
3. Open the app UI and choose the dashboard flow.
4. Run the pipeline, then review alerts, map markers, and agent logs.

## Recommended order for first use

1. `cd ciro-pakistan/backend`
2. `pip install -r requirements.txt`
3. `python main.py`
4. `cd ciro-pakistan`
5. `npm install`
6. `npm run dev`
7. Open `http://localhost:5173`

## Notes

- The system works best locally with mock data.
- Live API keys are optional and only needed for full Google API or Firebase integration.
- The app is built to be easy to run and demo.

## Where to look next

- `ciro-pakistan/backend/` — API code, agents, and orchestration logic
- `ciro-pakistan/src/` — React UI, pages, and services
- `ciro-pakistan/backend/requirements.txt` — Python dependencies
- `ciro-pakistan/package.json` — frontend dependencies and scripts
