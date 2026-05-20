import os
import requests
import json
from typing import Dict, Any
from utils.logger import setup_logger

logger = setup_logger("WeatherService")

# Mock file location
MOCK_WEATHER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "mock_weather.json")

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("WEATHER_API_KEY")
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"

    def get_weather(self, city: str) -> Dict[str, Any]:
        """
        Fetches current weather for a specific city.
        If OpenWeather fails, returns data from mock_weather.json.
        """
        city_cleaned = city.strip().lower()

        if self.api_key and "api.openweathermap" not in self.api_key: # check for placeholder strings
            try:
                params = {
                    "q": f"{city_cleaned},PK",
                    "appid": self.api_key,
                    "units": "metric"
                }
                logger.info(f"Fetching weather for {city_cleaned} from OpenWeather...")
                response = requests.get(self.base_url, params=params, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    result = {
                        "temp": data["main"]["temp"],
                        "humidity": data["main"]["humidity"],
                        "wind_speed": data["wind"]["speed"],
                        "precipitation_1h": data.get("rain", {}).get("1h", 0.0),
                        "description": data["weather"][0]["description"],
                        "aqi": 50, # Default moderate AQI placeholder if AQI is separate
                        "pm25": 12.0
                    }
                    logger.info(f"OpenWeather fetched successfully for {city_cleaned}.")
                    return result
                else:
                    logger.warning(f"OpenWeather returned status {response.status_code}. Using mock fallback.")
            except Exception as e:
                logger.error(f"OpenWeather query failed: {e}. Using mock fallback.")

        # Fallback implementation
        return self._get_mock_weather(city_cleaned)

    def _get_mock_weather(self, city: str) -> Dict[str, Any]:
        """Reads mock weather profile from file."""
        try:
            with open(MOCK_WEATHER_PATH, "r") as f:
                mocks = json.load(f)
            if city in mocks:
                logger.info(f"Loaded mock weather profile for {city}.")
                return mocks[city]
        except Exception as e:
            logger.error(f"Failed to read mock weather file: {e}")

        # Default fallback
        logger.warning(f"No mock profile for {city}. Returning standard safe weather.")
        return {
            "temp": 25.0,
            "humidity": 60,
            "wind_speed": 5.0,
            "precipitation_1h": 0.0,
            "description": "clear skies (fallback)",
            "aqi": 40,
            "pm25": 10.0
        }

# Singleton instances
weather_service = WeatherService()
