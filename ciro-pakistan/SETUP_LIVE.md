# CIRO Pakistan — Live Integration Guide (Step by Step)

Your UI was showing **mock/static data** because three things were not connected:

1. **Backend API** was not running (frontend shows `START BACKEND` / `CONN. ERROR`)
2. **Firestore** had no **service account** on the server → data saved only to `local_db.json`, not your Firebase Console
3. **Frontend Firebase** env vars were incomplete → app ran in **mock mode**

Follow every step below in order.

---

## Architecture (how live mode works)

```
[React PWA]  ──HTTP──►  [FastAPI Backend :8000]
     │                        │
     │ onSnapshot             │ firebase-admin SDK
     ▼                        ▼
[Firestore]  ◄────────────────┘
  collections: crises, alerts, traces

[Gemini API]  ← agents (Signal, Detection, Decision, Execution)
[Google Maps] ← geocode + directions
[OpenWeather] ← live weather
```

When you click **Run Full Agent Pipeline**:

1. Frontend sends signals to `POST /api/analyze-crisis`
2. **Antigravity orchestrator** calls tools + 4 Gemini agents
3. Results are **written to Firestore** (visible in Firebase Console)
4. Frontend **updates in real time** via Firestore `onSnapshot` listeners

---

## STEP 1 — Firebase Console (Firestore + Web app)

Project: [ciro-pakistan-e2084](https://console.firebase.google.com/project/ciro-pakistan-e2084)

### 1.1 Enable Firestore

1. Open **Build → Firestore Database**
2. If empty, click **Create database**
3. Mode: **Start in test mode** (for university demo) or production with rules below
4. Region: choose closest (e.g. `asia-south1`)

### 1.2 Firestore security rules (demo)

In **Firestore → Rules**, paste (dev only — open read/write):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Click **Publish**.

### 1.3 Register Web app (frontend)

1. **Project settings** (gear) → **General**
2. Scroll to **Your apps** → **Add app** → **Web** `</>`
3. App nickname: `CIRO Web`
4. Copy the `firebaseConfig` object values into `ciro-pakistan/.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=ciro-pakistan-e2084.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ciro-pakistan-e2084
VITE_FIREBASE_STORAGE_BUCKET=ciro-pakistan-e2084.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...   # from config
VITE_FIREBASE_APP_ID=...               # from config — REQUIRED
```

### 1.4 Service account (backend — **this makes Firestore fill with data**)

1. **Project settings → Service accounts**
2. Click **Generate new private key** → download JSON
3. Save the downloaded JSON anywhere inside:

```
ciro-pakistan/backend/secrets/
```

The backend auto-detects Firebase service-account JSON files in that folder. You can also rename it to
`firebase-service-account.json` if you prefer.

4. Confirm `backend/.env` contains:

```env
FIREBASE_PROJECT_ID=ciro-pakistan-e2084
GOOGLE_APPLICATION_CREDENTIALS=secrets/firebase-service-account.json
```

**Never commit this JSON to GitHub.**

---

## STEP 2 — Google Cloud Console (Maps)

Project: [ciro-pakistan-e2084 Maps credentials](https://console.cloud.google.com/google/maps-apis/credentials?project=ciro-pakistan-e2084)

### 2.1 Enable APIs

**APIs & Services → Library** → enable:

- Maps JavaScript API
- Geocoding API
- Directions API
- Places API (optional, for Crisis Map search)

### 2.2 API key restrictions

1. Open your API key
2. **Application restrictions**: HTTP referrers for web:
   - `http://localhost:5173/*`
   - `http://127.0.0.1:5173/*`
3. **API restrictions**: restrict to Maps/Geocoding/Directions APIs

Keys are already in `.env` files as `GOOGLE_MAPS_API_KEY` / `VITE_GOOGLE_MAPS_API_KEY`.

---

## STEP 3 — Gemini API (real AI agents)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create API key for project `ciro-pakistan-e2084` (or same Google account)
3. Set in `backend/.env`:

```env
GEMINI_API_KEY=your-key-here
```

Without this key, agents use **rule-based fallback** (UI works but not “real AI”).

---

## STEP 4 — OpenWeather (live weather)

1. [openweathermap.org/api](https://openweathermap.org/api) → API key
2. Already in `backend/.env` as `WEATHER_API_KEY`

---

## STEP 5 — Install & verify

### Terminal 1 — Backend

```powershell
cd "F:\Uni Assignment\Project\ciro-pakistan\backend"
pip install -r requirements.txt
python scripts/verify_live_setup.py
```

Expected output:

```
[Firestore] mode=firestore connected=True
[Gemini] initialized=True
[Maps] api_key_set=True
[Weather] api_key_set=True
✓ Ready for LIVE agent pipeline
```

If Firestore shows `local_json`, run `python scripts/verify_live_setup.py` from `backend/` and confirm the
JSON is inside `backend/secrets/`.

Create/seed Firestore collections from the local demo data:

```powershell
python scripts/seed_firestore.py
```

Start API:

```powershell
python main.py
```

Open http://localhost:8000/docs — test `GET /api/health` — should show `"connected": true` under firestore.

### Terminal 2 — Frontend

```powershell
cd "F:\Uni Assignment\Project\ciro-pakistan"
npm install
npm run dev
```

Open http://localhost:5173

Top bar should show **LIVE DB·AI·Maps** (not `START BACKEND`).

---

## STEP 6 — Run live agent pipeline

1. **Dashboard** → **Run Full Agent Pipeline**
2. Watch **Agent Logs** — traces appear in real time
3. Open [Firestore data](https://console.firebase.google.com/project/ciro-pakistan-e2084/firestore/databases/-default-/data) — you should see:
   - `crises`
   - `alerts`
   - `traces`
4. **Alerts** / **Simulation** / **Map** update from live data

---

## STEP 7 — Confirm each integration

| Feature | How to verify |
|---------|----------------|
| **Firestore** | New documents in Console after pipeline run |
| **Gemini AI** | Agent log reasoning is detailed (not generic fallback text) |
| **Maps** | Crisis Map routes; backend log says "Fetched Google Directions" |
| **Weather** | Dashboard city selector shows real °C from OpenWeather |
| **Real-time UI** | Change data in Firestore → UI updates without refresh |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `START BACKEND` in header | Run `python main.py` in `backend/` |
| Firestore empty | Add `firebase-service-account.json` in `backend/secrets/` |
| `Firebase mock mode` banner | Fill `VITE_FIREBASE_APP_ID` and `MESSAGING_SENDER_ID` in `.env`, restart `npm run dev` |
| Maps show straight lines only | Enable Directions + Geocoding APIs; check API key billing |
| Gemini generic responses | Set `GEMINI_API_KEY`; restart backend |
| CORS error | Frontend must be `localhost:5173`; backend CORS already allows it |
| Permission denied Firestore | Publish test rules (Step 1.2) |

---

## Optional: Google Antigravity SDK

```powershell
pip install google-antigravity
```

In `backend/.env`:

```env
ANTIGRAVITY_AGENT=1
```

Orchestrator will prefer Antigravity runtime when installed.

---

## Production deployment notes

- Replace open Firestore rules with auth-based rules
- Deploy backend (Render/Railway) and set `VITE_API_URL` to production URL
- Restrict Maps API key to your production domain
- Store secrets in environment variables, not committed `.env` files
