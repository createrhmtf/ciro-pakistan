"""
Create CIRO Firestore collections and optionally seed them from data/local_db.json.

Run from backend folder:
    python scripts/seed_firestore.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()


def main():
    from services.firebase_service import DOMAIN_COLLECTIONS, firebase_service

    status = firebase_service.get_status()
    print("=" * 60)
    print("CIRO FIRESTORE SEED")
    print("=" * 60)
    print(f"mode={status['mode']} connected={status['connected']} project={status['project_id']}")

    if not status["connected"]:
        print(f"error={status['error']}")
        print("Firestore is not connected. Collections were not created.")
        return 1

    firebase_service.ensure_collections()
    counts = firebase_service.seed_from_local_db(overwrite=True)

    print("collections:")
    for name in DOMAIN_COLLECTIONS:
        print(f"  {name}: ensured, seeded {counts.get(name, 0)} docs")
    print("done")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
