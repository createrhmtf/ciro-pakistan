"""
Verify CIRO live integrations: Firestore, Gemini, Maps, Weather.
Run from backend folder: python scripts/verify_live_setup.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()


def main():
    print("=" * 60)
    print("CIRO LIVE SETUP VERIFICATION")
    print("=" * 60)

    from services.firebase_service import firebase_service
    from services.gemini_service import gemini_service
    from services.maps_service import maps_service
    from services.weather_service import weather_service

    fb = firebase_service.get_status()
    print(f"\n[Firestore] mode={fb['mode']} connected={fb['connected']}")
    if fb["error"]:
        print(f"  ERROR: {fb['error']}")
    else:
        print(f"  project={fb['project_id']}")
        print(f"  collections={', '.join(fb.get('collections', []))}")

    print(f"\n[Gemini] initialized={gemini_service.initialized}")
    if not gemini_service.initialized:
        print("  Set GEMINI_API_KEY in backend/.env")

    print(f"\n[Maps] api_key_set={bool(maps_service.api_key)}")
    if maps_service.api_key:
        coords = maps_service.geocode_address("G-10 Islamabad")
        print(f"  geocode G-10: {coords}")

    print(f"\n[Weather] api_key_set={bool(weather_service.api_key)}")
    if weather_service.api_key:
        w = weather_service.get_weather("Islamabad")
        print(f"  Islamabad temp: {w.get('temp')} C - {w.get('description')}")

    if fb["connected"] and gemini_service.initialized:
        print("\nOK: Ready for LIVE agent pipeline. Start backend: python main.py")
    elif fb["connected"]:
        print("\nWARN: Firestore OK but Gemini missing - agents use rule-based fallback.")
    else:
        print("\nERROR: Firestore NOT connected - data stays in local_db.json only.")
        print("  Fix: place service account JSON inside backend/secrets/")

    print("=" * 60)


if __name__ == "__main__":
    main()
