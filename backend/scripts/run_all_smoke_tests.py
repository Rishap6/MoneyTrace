"""Master Smoke Test Runner for MoneyTrace AI Financial Crime Intelligence Platform.

Executes end-to-end smoke testing across all 14 system modules:
1. Authentication Gateway (/api/v1/auth)
2. Users, Accounts & Presence Monitoring (/api/v1/users)
3. Executive SOC Dashboard Analytics (/api/v1/dashboard)
4. Transactions & Banking Ledger (/api/v1/transactions)
5. Behavioral Fraud Detection Engine (/api/v1/fraud)
6. Alert Center & Case Triage (/api/v1/alerts)
7. NetworkX Money Flow Graph Analysis (/api/v1/graph)
8. Asset Recovery Intelligence Engine (/api/v1/recovery)
9. AI Forensic Investigator Copilot (/api/v1/assistant)
10. Multi-Format Dossier Exporters (/api/v1/reports)
11. Case Investigation & Evidence Locker (/api/v1/investigation)
12. Watchlist Rules Engine (/api/v1/watchlist)
13. Security Audit Logs (/api/v1/audit-logs)
14. Simulation Control Gateway (/api/v1/simulation)
"""

import asyncio
import io
import sys
import time
from pathlib import Path

# Force UTF-8 output stream to prevent Windows cp1252 print errors
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token
from app.models.user import User
from app.database import async_session
from sqlalchemy import select

RESULTS = []

async def test_endpoint(client: AsyncClient, headers: dict, module: str, method: str, url: str, expected_status: int = 200, json_body: dict = None):
    try:
        if method.upper() == "GET":
            res = await client.get(url, headers=headers)
        elif method.upper() == "POST":
            res = await client.post(url, headers=headers, json=json_body)
        elif method.upper() == "PATCH":
            res = await client.patch(url, headers=headers, json=json_body)
        else:
            res = await client.request(method, url, headers=headers, json=json_body)

        status_code = res.status_code
        pass_cond = (status_code == expected_status)
        status_str = "PASS" if pass_cond else "FAIL"

        details = ""
        if status_code == 200:
            content_type = res.headers.get("content-type", "")
            if "application/json" in content_type:
                body = res.json()
                if isinstance(body, dict):
                    details = f"Keys: {list(body.keys())[:4]}"
                elif isinstance(body, list):
                    details = f"List count: {len(body)}"
            else:
                details = f"Binary/File size: {len(res.content)} bytes ({content_type[:25]})"
        else:
            details = f"Response: {res.text[:80]}"

        RESULTS.append({
            "module": module,
            "endpoint": f"{method.upper()} {url}",
            "status": status_code,
            "result": status_str,
            "details": details
        })
        print(f"[{status_str}] {module:15s} | {method.upper()} {url:50s} -> Status {status_code} ({details})")
        return res
    except Exception as e:
        status_str = "FAIL"
        RESULTS.append({
            "module": module,
            "endpoint": f"{method.upper()} {url}",
            "status": 500,
            "result": status_str,
            "details": f"Exception: {type(e).__name__} - {str(e)[:80]}"
        })
        print(f"[{status_str}] {module:15s} | {method.upper()} {url:50s} -> EXCEPTION: {type(e).__name__}: {e}")
        return None

async def run_master_smoke_tests():
    print("=" * 105)
    print("MONEYTRACE ENTERPRISE SMOKE TEST SUITE - ALL 14 MODULES & ENDPOINTS")
    print("=" * 105)
    start_time = time.time()

    # Get admin user for auth token
    async with async_session() as session:
        res = await session.execute(select(User).where(User.email == "admin@moneytrace.dev"))
        admin_user = res.scalar_one_or_none()
        if not admin_user:
            res = await session.execute(select(User))
            admin_user = res.scalars().first()
        assert admin_user is not None, "No user found in database!"

    token = create_access_token(admin_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver", timeout=30.0) as client:

        # ---------------------------------------------------------
        # MODULE 1: AUTHENTICATION
        # ---------------------------------------------------------
        print("\n--- [Module 1] Authentication Gateway (/api/v1/auth) ---")
        await test_endpoint(client, headers, "Auth", "GET", "/api/v1/auth/me")

        # ---------------------------------------------------------
        # MODULE 2: USERS & ACCOUNTS
        # ---------------------------------------------------------
        print("\n--- [Module 2] Users & Account Presence (/api/v1/users) ---")
        await test_endpoint(client, headers, "Users", "GET", "/api/v1/users/search?q=admin")
        await test_endpoint(client, headers, "Users", "GET", "/api/v1/users/recipients")
        await test_endpoint(client, headers, "Users", "GET", "/api/v1/users/active")

        # ---------------------------------------------------------
        # MODULE 3: EXECUTIVE SOC DASHBOARD
        # ---------------------------------------------------------
        print("\n--- [Module 3] Executive SOC Dashboard (/api/v1/dashboard) ---")
        await test_endpoint(client, headers, "Dashboard", "GET", "/api/v1/dashboard/overview")
        await test_endpoint(client, headers, "Dashboard", "GET", "/api/v1/dashboard/live")
        await test_endpoint(client, headers, "Dashboard", "GET", "/api/v1/dashboard/transactions")
        await test_endpoint(client, headers, "Dashboard", "GET", "/api/v1/dashboard/fraud")
        await test_endpoint(client, headers, "Dashboard", "GET", "/api/v1/dashboard/recovery")
        await test_endpoint(client, headers, "Dashboard", "GET", "/api/v1/dashboard/locations")
        await test_endpoint(client, headers, "Dashboard", "GET", "/api/v1/dashboard/risky-accounts")
        await test_endpoint(client, headers, "Dashboard", "GET", "/api/v1/dashboard/trends")
        await test_endpoint(client, headers, "Dashboard", "GET", "/api/v1/dashboard/investigators")

        # ---------------------------------------------------------
        # MODULE 4: TRANSACTIONS
        # ---------------------------------------------------------
        print("\n--- [Module 4] Transactions Ledger (/api/v1/transactions) ---")
        res_txns = await test_endpoint(client, headers, "Transactions", "GET", "/api/v1/transactions/history")
        await test_endpoint(client, headers, "Transactions", "GET", "/api/v1/transactions/live")
        await test_endpoint(client, headers, "Transactions", "GET", "/api/v1/transactions/accounts/me")

        sample_txn_id = None
        if res_txns and res_txns.status_code == 200:
            txns_list = res_txns.json().get("transactions", [])
            if txns_list:
                sample_txn_id = txns_list[0]["transaction_id"]

        if sample_txn_id:
            await test_endpoint(client, headers, "Transactions", "GET", f"/api/v1/transactions/{sample_txn_id}")

        # ---------------------------------------------------------
        # MODULE 5: FRAUD DETECTION ENGINE
        # ---------------------------------------------------------
        print("\n--- [Module 5] Behavioral Fraud Engine (/api/v1/fraud) ---")
        await test_endpoint(client, headers, "Fraud", "GET", "/api/v1/fraud/stats")
        res_alerts = await test_endpoint(client, headers, "Fraud", "GET", "/api/v1/fraud/alerts")
        await test_endpoint(client, headers, "Fraud", "GET", "/api/v1/fraud/high-risk")

        sample_alert_id = None
        if res_alerts and res_alerts.status_code == 200:
            alerts_list = res_alerts.json().get("alerts", [])
            if alerts_list:
                sample_alert_id = alerts_list[0]["alert_id"]

        if sample_txn_id:
            await test_endpoint(client, headers, "Fraud", "POST", f"/api/v1/fraud/analyze/{sample_txn_id}")

        # ---------------------------------------------------------
        # MODULE 6: ALERT CENTER
        # ---------------------------------------------------------
        print("\n--- [Module 6] Alert Center & Triage (/api/v1/alerts) ---")
        await test_endpoint(client, headers, "Alerts", "GET", "/api/v1/alerts/")

        # ---------------------------------------------------------
        # MODULE 7: NETWORKX MONEY FLOW GRAPH
        # ---------------------------------------------------------
        print("\n--- [Module 7] NetworkX Money Flow Graph (/api/v1/graph) ---")
        await test_endpoint(client, headers, "Graph", "GET", "/api/v1/graph/network")
        await test_endpoint(client, headers, "Graph", "GET", "/api/v1/graph/suspicious")
        await test_endpoint(client, headers, "Graph", "GET", "/api/v1/graph/account/ACC1001")

        if sample_txn_id:
            await test_endpoint(client, headers, "Graph", "GET", f"/api/v1/graph/trace/{sample_txn_id}")

        # ---------------------------------------------------------
        # MODULE 8: ASSET RECOVERY INTELLIGENCE
        # ---------------------------------------------------------
        print("\n--- [Module 8] Asset Recovery Engine (/api/v1/recovery) ---")
        await test_endpoint(client, headers, "Recovery", "GET", "/api/v1/recovery/cases")
        await test_endpoint(client, headers, "Recovery", "GET", "/api/v1/recovery/stats")
        await test_endpoint(client, headers, "Recovery", "GET", "/api/v1/recovery/high-probability")

        if sample_alert_id:
            await test_endpoint(client, headers, "Recovery", "POST", f"/api/v1/recovery/analyze/{sample_alert_id}")

        # ---------------------------------------------------------
        # MODULE 9: AI FORENSIC ASSISTANT (COPILOT PRO)
        # ---------------------------------------------------------
        print("\n--- [Module 9] AI Forensic Assistant (/api/v1/assistant) ---")
        await test_endpoint(client, headers, "AI Assistant", "POST", "/api/v1/assistant/chat", json_body={"message": "Explain mule accounts under RBI guidelines"})
        await test_endpoint(client, headers, "AI Assistant", "GET", "/api/v1/assistant/rag-search?query=mule")
        await test_endpoint(client, headers, "AI Assistant", "GET", "/api/v1/assistant/history")

        # ---------------------------------------------------------
        # MODULE 10: REPORTS & EXPORTERS
        # ---------------------------------------------------------
        print("\n--- [Module 10] Multi-Format Report Exporters (/api/v1/reports) ---")
        await test_endpoint(client, headers, "Reports", "GET", "/api/v1/reports/dashboard/pdf")
        await test_endpoint(client, headers, "Reports", "GET", "/api/v1/reports/dashboard/docx")
        await test_endpoint(client, headers, "Reports", "GET", "/api/v1/reports/export/transactions")
        await test_endpoint(client, headers, "Reports", "GET", "/api/v1/reports/export/alerts")
        await test_endpoint(client, headers, "Reports", "GET", "/api/v1/reports/export/recovery")
        await test_endpoint(client, headers, "Reports", "GET", "/api/v1/reports/export/accounts")
        await test_endpoint(client, headers, "Reports", "GET", "/api/v1/reports/export/dashboard")
        await test_endpoint(client, headers, "Reports", "GET", "/api/v1/reports/history")

        # ---------------------------------------------------------
        # MODULE 11: INVESTIGATION CASES
        # ---------------------------------------------------------
        print("\n--- [Module 11] Case Investigation (/api/v1/investigation) ---")
        await test_endpoint(client, headers, "Investigation", "GET", "/api/v1/investigation/")

        # ---------------------------------------------------------
        # MODULE 12: WATCHLIST
        # ---------------------------------------------------------
        print("\n--- [Module 12] Watchlist Engine (/api/v1/watchlist) ---")
        await test_endpoint(client, headers, "Watchlist", "GET", "/api/v1/watchlist/")

        # ---------------------------------------------------------
        # MODULE 13: AUDIT LOGS
        # ---------------------------------------------------------
        print("\n--- [Module 13] Security Audit Logs (/api/v1/audit-logs) ---")
        await test_endpoint(client, headers, "Audit Logs", "GET", "/api/v1/audit-logs/")

        # ---------------------------------------------------------
        # MODULE 14: SIMULATION CONTROL
        # ---------------------------------------------------------
        print("\n--- [Module 14] Simulation Gateway (/api/v1/simulation) ---")
        await test_endpoint(client, headers, "Simulation", "POST", "/api/v1/simulation/transaction?scenario=normal")

    elapsed = time.time() - start_time
    total_tests = len(RESULTS)
    passed_tests = sum(1 for r in RESULTS if r["result"] == "PASS")
    failed_tests = total_tests - passed_tests

    print("\n" + "=" * 105)
    print("EXECUTIVE SMOKE TEST SCORECARD & SUMMARY")
    print("=" * 105)
    print(f"Total Endpoints Tested     : {total_tests}")
    print(f"Passed                     : {passed_tests} [SUCCESS]")
    print(f"Failed                     : {failed_tests} [FAILED]")
    print(f"Execution Duration         : {elapsed:.2f} seconds")
    print("=" * 105)

    if failed_tests == 0:
        print("🎉 PERFECT SCORE! ALL 14 PLATFORM MODULES & ENDPOINTS PASSED SMOKE TESTS (100% OPERATIONAL)!")
    else:
        print(f"ATTENTION: {failed_tests} ENDPOINTS ENCOUNTERED ISSUES. SEE SCORECARD ABOVE.")

if __name__ == "__main__":
    asyncio.run(run_master_smoke_tests())
