import json
import os
from typing import Any, Dict, List, Optional

from utils.logger import setup_logger

logger = setup_logger("FirebaseService")

BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
LOCAL_DB_PATH = os.path.join(BACKEND_DIR, "data", "local_db.json")
SECRETS_DIR = os.path.join(BACKEND_DIR, "secrets")
DEFAULT_SERVICE_ACCOUNT_PATH = os.path.join(SECRETS_DIR, "firebase-service-account.json")

DOMAIN_COLLECTIONS = ("crises", "alerts", "traces", "simulations", "signals")
SCHEMA_DOC_ID = "_schema"


class FirebaseService:
    def __init__(self):
        self.db = None
        self.use_local = True
        self.project_id = os.getenv("FIREBASE_PROJECT_ID", "ciro-pakistan-e2084")
        self.init_error: Optional[str] = None
        self._init_firestore()

    def _credential_candidates(self, explicit: Optional[str]) -> List[str]:
        if not explicit:
            return []

        candidates = [explicit]
        if not os.path.isabs(explicit):
            candidates.extend([
                os.path.join(os.getcwd(), explicit),
                os.path.join(BACKEND_DIR, explicit),
            ])

        seen = set()
        resolved = []
        for path in candidates:
            normalized = os.path.abspath(path)
            if normalized not in seen:
                seen.add(normalized)
                resolved.append(normalized)
        return resolved

    def _discover_service_account(self) -> Optional[str]:
        if not os.path.isdir(SECRETS_DIR):
            return None

        matching_project = []
        other_service_accounts = []
        for name in os.listdir(SECRETS_DIR):
            if not name.lower().endswith(".json"):
                continue

            path = os.path.join(SECRETS_DIR, name)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception as e:
                logger.warning(f"Skipping invalid Firebase credential file {name}: {e}")
                continue

            if data.get("type") != "service_account":
                continue
            if data.get("project_id") == self.project_id:
                matching_project.append(path)
            else:
                other_service_accounts.append(path)

        selected_pool = matching_project or other_service_accounts
        if not selected_pool:
            return None

        selected_pool.sort(key=lambda p: os.path.getmtime(p), reverse=True)
        return selected_pool[0]

    def _resolve_credentials_path(self) -> Optional[str]:
        explicit = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        for candidate in self._credential_candidates(explicit):
            if os.path.isfile(candidate):
                return candidate

        if os.path.isfile(DEFAULT_SERVICE_ACCOUNT_PATH):
            return DEFAULT_SERVICE_ACCOUNT_PATH

        return self._discover_service_account()

    def _init_firestore(self):
        cred_path = self._resolve_credentials_path()
        if not cred_path:
            self.init_error = (
                "Missing Firebase service account. Download JSON from Firebase Console > "
                "Project Settings > Service accounts > Generate new private key, then save as "
                f"{DEFAULT_SERVICE_ACCOUNT_PATH}, or place the downloaded JSON in {SECRETS_DIR}."
            )
            logger.warning(self.init_error)
            self._init_local_db()
            return

        try:
            import firebase_admin
            from firebase_admin import credentials, firestore

            if not firebase_admin._apps:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {"projectId": self.project_id})
                logger.info(f"Firebase Admin initialized with service account: {cred_path}")

            self.db = firestore.client()
            self.use_local = False
            self.init_error = None
            logger.info(f"Firestore LIVE - project: {self.project_id}")
        except Exception as e:
            self.db = None
            self.use_local = True
            self.init_error = str(e)
            logger.error(f"Firestore init failed: {e}")
            self._init_local_db()

    def get_status(self) -> Dict[str, Any]:
        connected = not self.use_local and self.db is not None
        return {
            "mode": "firestore" if connected else "local_json",
            "project_id": self.project_id,
            "connected": connected,
            "error": self.init_error,
            "local_path": LOCAL_DB_PATH if self.use_local else None,
            "collections": list(DOMAIN_COLLECTIONS),
        }

    def _empty_local_db(self) -> Dict[str, Any]:
        return {name: [] for name in DOMAIN_COLLECTIONS}

    def _init_local_db(self):
        os.makedirs(os.path.dirname(LOCAL_DB_PATH), exist_ok=True)
        if not os.path.exists(LOCAL_DB_PATH):
            self._write_local_db(self._empty_local_db())
            return

        data = self._read_local_db()
        changed = False
        for name in DOMAIN_COLLECTIONS:
            if name not in data:
                data[name] = []
                changed = True
        if changed:
            self._write_local_db(data)

    def _read_local_db(self) -> Dict[str, Any]:
        try:
            with open(LOCAL_DB_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, dict):
                return data
        except Exception as e:
            logger.error(f"Failed to read local DB: {e}")
        return self._empty_local_db()

    def _write_local_db(self, data: Dict[str, Any]):
        with open(LOCAL_DB_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def _is_domain_doc(self, doc_id: str, data: Dict[str, Any]) -> bool:
        return not doc_id.startswith("_") and not data.get("_system")

    def _stream_collection(self, collection: str) -> List[Dict[str, Any]]:
        docs = []
        for doc in self.db.collection(collection).stream():
            data = doc.to_dict() or {}
            if self._is_domain_doc(doc.id, data):
                data.setdefault("id", doc.id)
                docs.append(data)
        return docs

    def ensure_collections(self) -> Dict[str, bool]:
        if self.use_local or not self.db:
            self._init_local_db()
            return {name: True for name in DOMAIN_COLLECTIONS}

        created = {}
        for name in DOMAIN_COLLECTIONS:
            self.db.collection(name).document(SCHEMA_DOC_ID).set(
                {
                    "_system": True,
                    "collection": name,
                    "project_id": self.project_id,
                    "description": f"CIRO Pakistan {name} collection",
                },
                merge=True,
            )
            created[name] = True
        return created

    def seed_from_local_db(self, overwrite: bool = True) -> Dict[str, int]:
        local_data = self._read_local_db()
        counts = {name: 0 for name in DOMAIN_COLLECTIONS}

        if self.use_local or not self.db:
            self._init_local_db()
            return counts

        self.ensure_collections()
        for name in DOMAIN_COLLECTIONS:
            items = local_data.get(name, [])
            if not isinstance(items, list):
                continue

            for index, item in enumerate(items):
                if not isinstance(item, dict):
                    continue
                doc_id = str(item.get("id") or f"seed_{index + 1}")
                doc_ref = self.db.collection(name).document(doc_id)
                if not overwrite and doc_ref.get().exists:
                    continue
                doc_ref.set(item, merge=True)
                counts[name] += 1
        return counts

    def save_crisis(self, crisis: Dict[str, Any]):
        if not self.use_local and self.db:
            try:
                self.db.collection("crises").document(crisis["id"]).set(crisis)
                logger.info(f"Crisis {crisis['id']} saved to Firestore")
                return
            except Exception as e:
                logger.error(f"Firestore save crisis failed: {e}")
        self._save_local("crises", crisis)

    def get_crises(self) -> List[Dict[str, Any]]:
        if not self.use_local and self.db:
            try:
                return self._stream_collection("crises")
            except Exception as e:
                logger.error(f"Firestore get crises failed: {e}")
        return self._read_local_db().get("crises", [])

    def save_alert(self, alert: Dict[str, Any]):
        if not self.use_local and self.db:
            try:
                self.db.collection("alerts").document(alert["id"]).set(alert)
                logger.info(f"Alert {alert['id']} saved to Firestore")
                return
            except Exception as e:
                logger.error(f"Firestore save alert failed: {e}")
        self._save_local("alerts", alert)

    def get_alerts(self) -> List[Dict[str, Any]]:
        if not self.use_local and self.db:
            try:
                alerts = self._stream_collection("alerts")
                alerts.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
                return alerts
            except Exception as e:
                logger.error(f"Firestore get alerts failed: {e}")
        alerts = self._read_local_db().get("alerts", [])
        alerts.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return alerts

    def save_trace(self, trace: Dict[str, Any]):
        if not self.use_local and self.db:
            try:
                self.db.collection("traces").document(trace["id"]).set(trace)
                return
            except Exception as e:
                logger.error(f"Firestore save trace failed: {e}")
        self._save_local("traces", trace)

    def get_traces(self) -> List[Dict[str, Any]]:
        if not self.use_local and self.db:
            try:
                traces = self._stream_collection("traces")
                traces.sort(key=lambda x: x.get("timestamp", ""))
                return traces
            except Exception as e:
                logger.error(f"Firestore get traces failed: {e}")
        traces = self._read_local_db().get("traces", [])
        traces.sort(key=lambda x: x.get("timestamp", ""))
        return traces

    def save_simulation(self, simulation: Dict[str, Any]):
        if not self.use_local and self.db:
            try:
                self.db.collection("simulations").document(simulation["id"]).set(simulation)
                return
            except Exception as e:
                logger.error(f"Firestore save simulation failed: {e}")
        self._save_local("simulations", simulation)

    def get_simulations(self) -> List[Dict[str, Any]]:
        if not self.use_local and self.db:
            try:
                return self._stream_collection("simulations")
            except Exception as e:
                logger.error(f"Firestore get simulations failed: {e}")
        return self._read_local_db().get("simulations", [])

    def get_latest_simulation(self) -> Optional[Dict[str, Any]]:
        simulations = self.get_simulations()
        if not simulations:
            return None
        simulations.sort(key=lambda x: x.get("updated_at") or x.get("timestamp") or x.get("id", ""))
        return simulations[-1]

    def save_signal(self, signal: Dict[str, Any]):
        if not self.use_local and self.db:
            try:
                self.db.collection("signals").document(signal["id"]).set(signal)
                return
            except Exception as e:
                logger.error(f"Firestore save signal failed: {e}")
        self._save_local("signals", signal)

    def get_signals(self) -> List[Dict[str, Any]]:
        if not self.use_local and self.db:
            try:
                signals = self._stream_collection("signals")
                signals.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
                return signals
            except Exception as e:
                logger.error(f"Firestore get signals failed: {e}")
        signals = self._read_local_db().get("signals", [])
        signals.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return signals

    def _save_local(self, collection: str, item: Dict[str, Any]):
        db_data = self._read_local_db()
        items = db_data.setdefault(collection, [])
        idx = next((i for i, x in enumerate(items) if x.get("id") == item.get("id")), -1)
        if idx != -1:
            items[idx] = item
        else:
            items.append(item)
        self._write_local_db(db_data)


firebase_service = FirebaseService()
