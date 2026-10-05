import os
import json
import urllib.request
import urllib.parse
import time

os.makedirs("backend/data/raw", exist_ok=True)

# 1. Fetch live 30-day historical weather from Open-Meteo API
weather_url = (
    "https://api.open-meteo.com/v1/forecast?"
    "latitude=12.9716&longitude=77.5946&past_days=30&"
    "daily=precipitation_sum,temperature_2m_max&timezone=Asia%2FKolkata"
)

req = urllib.request.Request(weather_url, headers={"User-Agent": "CivicFlow/1.0"})
with urllib.request.urlopen(req, timeout=10) as resp:
    raw_weather = json.loads(resp.read().decode("utf-8"))

daily_precip = raw_weather["daily"]["precipitation_sum"]
weather_data = {
    "location": "Bengaluru",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "total_rainfall_30d_mm": round(sum(daily_precip), 1),
    "max_daily_rainfall_mm": round(max(daily_precip), 1),
    "daily_records": raw_weather["daily"]
}

with open("backend/data/raw/weather_bengaluru.json", "w", encoding="utf-8") as f:
    json.dump(weather_data, f, indent=2)

print(f"Weather downloaded: {weather_data['total_rainfall_30d_mm']} mm over last 30 days.")

# 2. Fetch live road coordinates dynamically from OpenStreetMap (Nominatim API)
road_queries = [
    "MG Road", "Outer Ring Road", "Hosur Road", "Old Airport Road",
    "Bannerghatta Road", "Brigade Road", "Sarjapur Road", "Kanakapura Road",
    "Whitefield Main Road", "Residency Road", "Bellary Road", "Koramangala 80 Feet Road"
]

osm_roads = []
for idx, name in enumerate(road_queries, 1):
    query_url = f"https://nominatim.openstreetmap.org/search?street={urllib.parse.quote(name)}&city=Bengaluru&format=json&limit=1"
    req = urllib.request.Request(query_url, headers={"User-Agent": "CivicFlow-Research/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data:
                osm_roads.append({
                    "id": f"OSM-{idx:03d}",
                    "name": name,
                    "latitude": float(data[0]["lat"]),
                    "longitude": float(data[0]["lon"]),
                    "osm_place_id": data[0].get("place_id")
                })
        time.sleep(0.5)  # Respect Nominatim 1 req/sec policy
    except Exception as e:
        print(f"Failed to fetch {name}: {e}")

with open("backend/data/raw/osm_roads.json", "w", encoding="utf-8") as f:
    json.dump(osm_roads, f, indent=2)

print(f"Fetched {len(osm_roads)} real roads from OpenStreetMap.")
