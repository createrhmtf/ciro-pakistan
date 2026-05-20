import datetime
import random
from typing import Dict, Any, List, Optional
from utils.logger import setup_logger
from services.firebase_service import firebase_service

logger = setup_logger("AlertService")

class AlertService:
    def create_alert(
        self,
        crisis_id: str,
        alert_type: str,
        title: str,
        detail: str,
        impact: str,
        alert_text_en: str,
        alert_text_ur: str,
        reroute_paths: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Creates, logs and returns a formatted Alert entity.
        Automatically handles unique ticket numbers.
        """
        ticket_prefix = {
            "DISPATCH": "DISP",
            "ALERT": "ALRT",
            "REROUTE": "RTE",
            "NOTIFY": "HOSP",
            "RETRACTION": "RETR"
        }.get(alert_type, "GEN")
        
        random_id = random.randint(1000, 9999)
        ticket_number = f"TKT-{ticket_prefix}-{datetime.datetime.now().year}-{random_id}"

        alert_payload = {
            "id": f"act_{random_id}",
            "crisis_id": crisis_id,
            "type": alert_type,
            "title": title,
            "detail": detail,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "status": "COMPLETED",
            "impact": impact,
            "ticket": ticket_number,
            "languages": ["English", "Urdu"],
            "alert_text_en": alert_text_en,
            "alert_text_ur": alert_text_ur,
            "reroute_paths": reroute_paths or []
        }

        # Save to database
        firebase_service.save_alert(alert_payload)
        logger.info(f"Broadcasted alert {alert_payload['id']} with ticket {ticket_number}")
        
        return alert_payload

# Singleton instance
alert_service = AlertService()
