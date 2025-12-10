# server/routers/support_routes.py
from typing import List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel
import math

router = APIRouter(
    prefix="/api",  # -> /api/support-locations
    tags=["support"],
)

MAX_RADIUS_KM = 30.0

class SupportLocation(BaseModel):
    id: int
    name: str
    address: str
    phone: Optional[str] = None
    website: Optional[str] = None
    distanceKm: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    city: Optional[str] = None  # internal helper for city search


# ===== STATIC SAMPLE CLINICS BY CITY (SEED DATA) =====
# Each city has at least one "clinic" so the UI always shows something
# when the user searches by that city name (case-insensitive / partial).
LOCATIONS: List[SupportLocation] = [
    # ---------- HAIFA REGION ----------
    SupportLocation(
        id=1,
        name="Haifa Mental Health Center",
        address="Haifa, Israel",
        phone="+972-4-0000000",
        website=None,
        lat=32.8,
        lng=35.0,
        city="haifa",
    ),
    SupportLocation(
        id=2,
        name="Carmel Psychology Clinic",
        address="Haifa, Israel",
        phone="+972-4-0001111",
        website=None,
        lat=32.79,
        lng=35.01,
        city="haifa",
    ),
    SupportLocation(
        id=3,
        name="Tirat Carmel Mental Health Service",
        address="Tirat Carmel, Israel",
        phone="+972-4-0002222",
        website=None,
        lat=32.76,
        lng=34.97,
        city="tirat carmel",
    ),
    SupportLocation(
        id=4,
        name="Krayot Counseling Center",
        address="Kiryat Bialik / Kiryat Motzkin, Israel",
        phone="+972-4-0003333",
        website=None,
        lat=32.83,
        lng=35.09,
        city="krayot",
    ),

    # ---------- TEL AVIV METRO ----------
    SupportLocation(
        id=10,
        name="Tel Aviv Mental Health Center",
        address="Tel Aviv, Israel",
        phone="+972-3-0000000",
        website=None,
        lat=32.0853,
        lng=34.7818,
        city="tel aviv",
    ),
    SupportLocation(
        id=11,
        name="Tel Aviv City Psychology Clinic",
        address="Tel Aviv, Israel",
        phone="+972-3-0001111",
        website=None,
        lat=32.08,
        lng=34.78,
        city="tel aviv",
    ),
    SupportLocation(
        id=12,
        name="Ramat Gan Counseling Center",
        address="Ramat Gan, Israel",
        phone="+972-3-0002222",
        website=None,
        lat=32.08,
        lng=34.82,
        city="ramat gan",
    ),
    SupportLocation(
        id=13,
        name="Bnei Brak Family Therapy Clinic",
        address="Bnei Brak, Israel",
        phone="+972-3-0003333",
        website=None,
        lat=32.08,
        lng=34.83,
        city="bnei brak",
    ),
    SupportLocation(
        id=14,
        name="Holon Mental Health Service",
        address="Holon, Israel",
        phone="+972-3-0004444",
        website=None,
        lat=32.01,
        lng=34.77,
        city="holon",
    ),
    SupportLocation(
        id=15,
        name="Bat Yam Psychology Clinic",
        address="Bat Yam, Israel",
        phone="+972-3-0005555",
        website=None,
        lat=32.02,
        lng=34.75,
        city="bat yam",
    ),
    SupportLocation(
        id=16,
        name="Herzliya Counseling & Support",
        address="Herzliya, Israel",
        phone="+972-9-0000000",
        website=None,
        lat=32.16,
        lng=34.84,
        city="herzliya",
    ),
    SupportLocation(
        id=17,
        name="Netanya Psychological Services",
        address="Netanya, Israel",
        phone="+972-9-0001111",
        website=None,
        lat=32.32,
        lng=34.86,
        city="netanya",
    ),

    # ---------- CENTRAL DISTRICT ----------
    SupportLocation(
        id=20,
        name="Rishon LeZion Mental Health Clinic",
        address="Rishon LeZion, Israel",
        phone="+972-3-0006666",
        website=None,
        lat=31.97,
        lng=34.79,
        city="rishon lezion",
    ),
    SupportLocation(
        id=21,
        name="Petah Tikva Counseling Center",
        address="Petah Tikva, Israel",
        phone="+972-3-0007777",
        website=None,
        lat=32.09,
        lng=34.88,
        city="petah tikva",
    ),
    SupportLocation(
        id=22,
        name="Kfar Saba Mental Health Service",
        address="Kfar Saba, Israel",
        phone="+972-9-0002222",
        website=None,
        lat=32.18,
        lng=34.91,
        city="kfar saba",
    ),
    SupportLocation(
        id=23,
        name="Ra'anana Psychology Clinic",
        address="Ra'anana, Israel",
        phone="+972-9-0003333",
        website=None,
        lat=32.19,
        lng=34.87,
        city="raanana",
    ),
    SupportLocation(
        id=24,
        name="Rehovot Counseling Center",
        address="Rehovot, Israel",
        phone="+972-8-0000000",
        website=None,
        lat=31.89,
        lng=34.81,
        city="rehovot",
    ),
    SupportLocation(
        id=25,
        name="Lod Family Therapy Clinic",
        address="Lod, Israel",
        phone="+972-8-0001111",
        website=None,
        lat=31.95,
        lng=34.89,
        city="lod",
    ),
    SupportLocation(
        id=26,
        name="Ramla Psychological Services",
        address="Ramla, Israel",
        phone="+972-8-0002222",
        website=None,
        lat=31.93,
        lng=34.86,
        city="ramla",
    ),
    SupportLocation(
        id=27,
        name="Modiin-Maccabim-Reut Counseling Center",
        address="Modiin-Maccabim-Reut, Israel",
        phone="+972-8-0003333",
        website=None,
        lat=31.90,
        lng=35.01,
        city="modiin",
    ),

    # ---------- JERUSALEM AREA ----------
    SupportLocation(
        id=30,
        name="Jerusalem Psychological Services",
        address="Jerusalem, Israel",
        phone="+972-2-0000000",
        website=None,
        lat=31.7683,
        lng=35.2137,
        city="jerusalem",
    ),
    SupportLocation(
        id=31,
        name="Jerusalem Youth Counseling Clinic",
        address="Jerusalem, Israel",
        phone="+972-2-0001111",
        website=None,
        lat=31.77,
        lng=35.22,
        city="jerusalem",
    ),
    SupportLocation(
        id=32,
        name="Ma'ale Adumim Mental Health Service",
        address="Ma'ale Adumim, Israel",
        phone="+972-2-0002222",
        website=None,
        lat=31.78,
        lng=35.30,
        city="maale adumim",
    ),

    # ---------- SOUTH (NEGEV) ----------
    SupportLocation(
        id=40,
        name="Be'er Sheva Mental Health Center",
        address="Be'er Sheva, Israel",
        phone="+972-8-0000000",
        website=None,
        lat=31.252,
        lng=34.791,
        city="beer sheva",
    ),
    SupportLocation(
        id=41,
        name="Negev Counseling Clinic",
        address="Be'er Sheva, Israel",
        phone="+972-8-0001111",
        website=None,
        lat=31.25,
        lng=34.79,
        city="beer sheva",
    ),
    SupportLocation(
        id=42,
        name="Ashdod Psychological Services",
        address="Ashdod, Israel",
        phone="+972-8-0002222",
        website=None,
        lat=31.80,
        lng=34.65,
        city="ashdod",
    ),
    SupportLocation(
        id=43,
        name="Ashkelon Counseling Center",
        address="Ashkelon, Israel",
        phone="+972-8-0003333",
        website=None,
        lat=31.67,
        lng=34.57,
        city="ashkelon",
    ),
    SupportLocation(
        id=44,
        name="Eilat Mental Health Clinic",
        address="Eilat, Israel",
        phone="+972-8-0004444",
        website=None,
        lat=29.558,
        lng=34.95,
        city="eilat",
    ),

    # ---------- NORTH (GALILEE) ----------
    SupportLocation(
        id=50,
        name="Nazareth Mental Health Service",
        address="Nazareth, Israel",
        phone="+972-4-0000000",
        website=None,
        lat=32.704,
        lng=35.303,
        city="nazareth",
    ),
    SupportLocation(
        id=51,
        name="Nazareth Family Counseling Center",
        address="Nazareth, Israel",
        phone="+972-4-0001111",
        website=None,
        lat=32.705,
        lng=35.30,
        city="nazareth",
    ),
    SupportLocation(
        id=52,
        name="Tiberias Psychological Clinic",
        address="Tiberias, Israel",
        phone="+972-4-0002222",
        website=None,
        lat=32.79,
        lng=35.53,
        city="tiberias",
    ),
    SupportLocation(
        id=53,
        name="Safed Mental Health Service",
        address="Safed, Israel",
        phone="+972-4-0003333",
        website=None,
        lat=32.97,
        lng=35.50,
        city="safed",
    ),
    SupportLocation(
        id=54,
        name="Acre Counseling Center",
        address="Acre, Israel",
        phone="+972-4-0004444",
        website=None,
        lat=32.93,
        lng=35.08,
        city="acre",
    ),
]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Rough distance in km between two lat/lng points."""
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@router.get("/support-locations", response_model=List[SupportLocation])
async def get_support_locations(
    city: Optional[str] = Query(
        None, description="City name, e.g. 'Haifa'. Optional if lat/lng given."
    ),
    lat: Optional[float] = Query(
        None, description="Latitude for current-location search."
    ),
    lng: Optional[float] = Query(
        None, description="Longitude for current-location search."
    ),
):
    # ---- 1. search by city name ----
    if city:
        c = city.strip().lower()
        results = [
            loc
            for loc in LOCATIONS
            if loc.city and c in loc.city.lower()
        ]
        return results

    # ---- 2. search near current location ----
    if lat is not None and lng is not None:
        scored: List[SupportLocation] = []

        for loc in LOCATIONS:
            if loc.lat is None or loc.lng is None:
                continue

            d = haversine_km(lat, lng, loc.lat, loc.lng)

            # ⬅️ skip anything farther than 20 km
            if d > MAX_RADIUS_KM:
                continue

            updated = loc.copy()
            updated.distanceKm = round(d, 1)
            scored.append(updated)

        scored.sort(key=lambda x: x.distanceKm or 0.0)
        return scored  # may be [] if nothing within 20 km

    # ---- 3. no params ----
    return []
