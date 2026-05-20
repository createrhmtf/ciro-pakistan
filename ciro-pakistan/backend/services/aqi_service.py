import os
import requests
from typing import Dict, Any
from utils.logger import setup_logger
from services.weather_service import weather_service

logger = setup_logger("AQIService")

class AQIService:
    def __init__(self):
        self.api_key = os.getenv("AQI_API_KEY")
        # Standard Waqi URL (World Air Quality Index) as example
        self.base_url = "https://api.waqi.info/feed"

    def get_aqi(self, city: str) -> Dict[str, Any]:
        """
        Fetches current AQI parameters for a city.
        Falls back to local weather/AQI database profiles.
        """
        city_cleaned = city.strip().lower()

        if self.api_key and len(self.api_key) > 5:
            try:
                # Waqi API example
                url = f"{self.base_url}/{city_cleaned}/"
                logger.info(f"Fetching AQI for {city_cleaned} from Waqi...")
                response = requests.get(url, params={"token": self.api_key}, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "ok":
                        aqi_val = data["data"]["aqi"]
                        pm25_val = data["data"].get("iaqi", {}).get("pm25", {}).get("v", 12.0)
                        logger.info(f"AQI successfully fetched for {city_cleaned}: {aqi_val}")
                        return {
                            "aqi": aqi_val,
                            "pm25": pm25_val,
                            "source": "Waqi API"
                        }
            except Exception as e:
                logger.error(f"AQI query failed: {e}. Falling back to mock weather profile.")

        # Fallback to weather service mock profile
        weather = weather_service.get_weather(city_cleaned)
        return {
            "aqi": weather.get("aqi", 75),
            "pm25": weather.get("pm25", 22.5),
            "source": "Local Mock DB"
        }

# Singleton instances
aqi_service = AQIService()
