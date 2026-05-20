# Coordinates of Major Cities in Pakistan
CITY_COORDINATES = {
    "islamabad": {"lat": 33.6844, "lng": 73.0479},
    "karachi": {"lat": 24.8607, "lng": 67.0011},
    "lahore": {"lat": 31.5204, "lng": 74.3587},
    "peshawar": {"lat": 34.0151, "lng": 71.5249},
    "quetta": {"lat": 30.1798, "lng": 66.9750}
}

# Coordinated Hospitals & Trauma Centers
HOSPITALS = [
    {
        "name": "PIMS Hospital, Islamabad",
        "city": "islamabad",
        "coordinates": {"lat": 33.7126, "lng": 73.0560},
        "beds_available": 45,
        "burn_unit": True
    },
    {
        "name": "Shifa International Hospital, Islamabad",
        "city": "islamabad",
        "coordinates": {"lat": 33.6811, "lng": 73.0906},
        "beds_available": 20,
        "burn_unit": False
    },
    {
        "name": "Aga Khan University Hospital, Karachi",
        "city": "karachi",
        "coordinates": {"lat": 24.8922, "lng": 67.0747},
        "beds_available": 110,
        "burn_unit": True
    },
    {
        "name": "Jinnah Postgraduate Medical Centre, Karachi",
        "city": "karachi",
        "coordinates": {"lat": 24.8519, "lng": 67.0422},
        "beds_available": 75,
        "burn_unit": True
    },
    {
        "name": "Mayo Hospital, Lahore",
        "city": "lahore",
        "coordinates": {"lat": 31.5775, "lng": 74.3125},
        "beds_available": 90,
        "burn_unit": True
    },
    {
        "name": "Jinnah Hospital, Lahore",
        "city": "lahore",
        "coordinates": {"lat": 31.4828, "lng": 74.3021},
        "beds_available": 55,
        "burn_unit": False
    }
]

# Rescue 1122 and NDMA Dispatch Stations
RESCUE_STATIONS = [
    {
        "name": "Rescue 1122 HQ, Islamabad",
        "city": "islamabad",
        "coordinates": {"lat": 33.6934, "lng": 73.0645},
        "ambulances": 15,
        "fire_engines": 10,
        "rescue_boats": 5
    },
    {
        "name": "Rescue 1122 Civic Centre Station, Karachi",
        "city": "karachi",
        "coordinates": {"lat": 24.8948, "lng": 67.0694},
        "ambulances": 25,
        "fire_engines": 18,
        "rescue_boats": 0
    },
    {
        "name": "Rescue 1122 Ferozepur Rd Station, Lahore",
        "city": "lahore",
        "coordinates": {"lat": 31.4965, "lng": 74.3291},
        "ambulances": 20,
        "fire_engines": 15,
        "rescue_boats": 8
    }
]

# Crisis severity labels and descriptions
SEVERITY_LEVELS = {
    1: "MINIMAL",
    2: "LOW",
    3: "MODERATE",
    4: "HIGH",
    5: "CRITICAL"
}
