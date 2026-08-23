"""Test script for GeoIP resolution and /api/v1/transactions/ip-map endpoint."""

import asyncio
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.services.geoip import GeoIPService
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token
from app.models.user import User
from app.database import async_session
from sqlalchemy import select

async def test_geoip():
    print("--- 1. Testing GeoIP Resolution ---")
    test_ips = ["103.21.244.2", "49.37.12.94", "106.51.72.10", "127.0.0.1"]
    for ip in test_ips:
        res = GeoIPService.resolve_ip(ip)
        print(f"IP: {ip:15s} -> City: {res['city']:12s} ({res['lat']}, {res['lng']}) | ISP: {res['isp']}")
        assert res["lat"] != 0 and res["lng"] != 0

    print("\n--- 2. Testing GET /api/v1/transactions/ip-map ---")
    async with async_session() as session:
        res = await session.execute(select(User).where(User.email == "admin@moneytrace.dev"))
        admin_user = res.scalar_one_or_none()
        if not admin_user:
            res = await session.execute(select(User))
            admin_user = res.scalars().first()

    token = create_access_token(admin_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        res_map = await client.get("/api/v1/transactions/ip-map?limit=10", headers=headers)
        print(f"Status Code: {res_map.status_code}")
        data = res_map.json()
        print(f"Total nodes returned: {data.get('total')}")
        if data.get("transactions"):
            first = data["transactions"][0]
            print(f"First Node: TXN {first['transaction_id']} | IP: {first['ip_address']} | City: {first['city']} ({first['lat']}, {first['lng']})")
        assert res_map.status_code == 200
        assert data.get("total", 0) > 0

    print("\n[OK] GEOIP & TRANSACTION IP MAP TEST PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_geoip())
