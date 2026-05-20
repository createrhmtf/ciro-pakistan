import math
import re
from typing import Dict, Any, Optional

def haversine_distance(coord1: Dict[str, float], coord2: Dict[str, float]) -> float:
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees) in kilometers.
    """
    lat1, lon1 = coord1["lat"], coord1["lng"]
    lat2, lon2 = coord2["lat"], coord2["lng"]

    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r

def extract_city_from_text(text: str) -> Optional[str]:
    """
    Attempts to extract the Pakistani city name from the given text
    using simple dictionary matching.
    """
    text_lower = text.lower()
    cities = ["islamabad", "karachi", "lahore", "peshawar", "quetta", "rawalpindi", "multan", "faisalabad"]
    for city in cities:
        if city in text_lower:
            return city
    # Common location key associations
    if "site" in text_lower or "clifton" in text_lower or "nursery" in text_lower:
        return "karachi"
    if "g-10" in text_lower or "f-7" in text_lower or "g-9" in text_lower or "wasa" in text_lower:
        return "islamabad"
    if "ferozepur" in text_lower or "kalma" in text_lower or "gulberg" in text_lower:
        return "lahore"
    
    return "islamabad" # Default fallback
