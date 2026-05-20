import os
import requests
from typing import Dict, Any, List
from utils.logger import setup_logger
from utils.helpers import haversine_distance
from utils.constants import HOSPITALS, RESCUE_STATIONS, CITY_COORDINATES

logger = setup_logger("MapsService")

class MapsService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    def geocode_address(self, address: str) -> Dict[str, float]:
        """
        Geocodes a street address/location to coordinates.
        Falls back to Pakistani city bounds if API fails or is missing.
        """
        if self.api_key and "AIzaSy" in self.api_key:
            try:
                url = "https://maps.googleapis.com/maps/api/geocode/json"
                params = {"address": f"{address}, Pakistan", "key": self.api_key}
                response = requests.get(url, params=params, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "OK":
                        location = data["results"][0]["geometry"]["location"]
                        coords = {"lat": location["lat"], "lng": location["lng"]}
                        logger.info(f"Geocoded '{address}' successfully via API: {coords}")
                        return coords
            except Exception as e:
                logger.error(f"Geocoding API error: {e}. Falling back to coordinate dictionary.")

        # Heuristic search fallback
        address_lower = address.lower()
        for city, coords in CITY_COORDINATES.items():
            if city in address_lower:
                logger.info(f"Geocoding fallback match: city '{city}' for address '{address}'")
                return coords
                
        # Default Islamabad center
        logger.info(f"Geocoding fallback default: Islamabad coordinates.")
        return CITY_COORDINATES["islamabad"]

    def get_route(self, origin: Dict[str, float], destination: Dict[str, float]) -> Dict[str, Any]:
        """
        Returns routing data (polyline coordinate path, distance, duration).
        Generates simulated intermediate paths if API is offline.
        """
        if self.api_key and "AIzaSy" in self.api_key:
            try:
                url = "https://maps.googleapis.com/maps/api/directions/json"
                params = {
                    "origin": f"{origin['lat']},{origin['lng']}",
                    "destination": f"{destination['lat']},{destination['lng']}",
                    "key": self.api_key
                }
                response = requests.get(url, params=params, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "OK":
                        route = data["routes"][0]
                        leg = route["legs"][0]
                        logger.info("Fetched Google Directions successfully.")
                        return {
                            "distance_km": leg["distance"]["value"] / 1000.0,
                            "duration_min": leg["duration"]["value"] / 60.0,
                            "overview_polyline": route["overview_polyline"]["points"],
                            "steps": [{"lat": step["end_location"]["lat"], "lng": step["end_location"]["lng"]} for step in leg["steps"]]
                        }
            except Exception as e:
                logger.error(f"Google Directions API failure: {e}. Simulating route.")

        # Coordinate-interpolation fallback route
        distance = haversine_distance(origin, destination)
        # Average speed 40 km/h in traffic
        duration = (distance / 40.0) * 60.0

        # Generate a simulated polyline steps array (line interpolation)
        steps = []
        steps_count = 5
        for i in range(steps_count + 1):
            fraction = i / steps_count
            lat = origin["lat"] + (destination["lat"] - origin["lat"]) * fraction
            lng = origin["lng"] + (destination["lng"] - origin["lng"]) * fraction
            steps.append({"lat": lat, "lng": lng})

        logger.info(f"Simulated route of {distance:.2f}km completed in {duration:.1f} minutes.")
        return {
            "distance_km": round(distance, 2),
            "duration_min": round(duration, 1),
            "overview_polyline": "", # Optional overview polyline
            "steps": steps
        }

    def find_nearest_hospital(self, location: Dict[str, float]) -> Dict[str, Any]:
        """
        Finds the closest hospital from constants.py based on distance math.
        """
        closest_hosp = None
        min_dist = float("inf")

        for hosp in HOSPITALS:
            dist = haversine_distance(location, hosp["coordinates"])
            if dist < min_dist:
                min_dist = dist
                closest_hosp = hosp.copy()

        closest_hosp["distance_km"] = round(min_dist, 2)
        return closest_hosp

    def find_nearest_rescue_station(self, location: Dict[str, float]) -> Dict[str, Any]:
        """
        Finds the closest Rescue station from constants.py based on distance math.
        """
        closest_station = None
        min_dist = float("inf")

        for station in RESCUE_STATIONS:
            dist = haversine_distance(location, station["coordinates"])
            if dist < min_dist:
                min_dist = dist
                closest_station = station.copy()

        closest_station["distance_km"] = round(min_dist, 2)
        return closest_station

# Singleton instance
maps_service = MapsService()
