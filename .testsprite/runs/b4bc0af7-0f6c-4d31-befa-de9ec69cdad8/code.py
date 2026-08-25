# Auto-injected credentials — redacted for security; set TESTSPRITE_AUTH_CREDENTIAL to run this locally
__AUTH_CREDENTIAL__ = __import__("os").environ.get("TESTSPRITE_AUTH_CREDENTIAL", "")
__AUTH_TYPE__ = "public"
__EXTRA_HEADERS__ = {}
__AUTH_HEADERS__ = {}
import requests
import os
_T = os.environ.get("TARGET_URL") or os.environ.get("TESTSPRITE_TARGET_URL") or os.environ.get("BASE_URL") or "https://demo.tradefreedoms.com"
TARGET_URL = _T.rstrip("/")
import uuid

EMAIL = "bangaan2509@gmail.com"
PASSWORD = "password"

def _login():
    s = requests.Session()
    r = s.post(f"{TARGET_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"login failed {r.status_code} {r.text[:300]}"
    return s

def test_transfer_balances_exposed():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/transfer", timeout=30)
    assert r.status_code == 200, r.text[:300]
    bal = r.json()["balances"]
    for key in ("funding", "trading", "futures", "stocks", "mining"):
        assert key in bal, f"missing wallet balance {key} in {bal}"

def test_transfer_funding_to_trading_and_back():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/transfer", timeout=30).json()["balances"]
    amt = 1500
    t = s.post(f"{TARGET_URL}/api/transfer", json={"direction": "funding-to-trading", "amount": amt}, timeout=30)
    assert t.status_code == 200, f"transfer failed {t.status_code} {t.text[:300]}"
    r2 = s.get(f"{TARGET_URL}/api/transfer", timeout=30).json()["balances"]
    assert float(r2["trading"]) >= float(r["trading"]) + amt - 0.01, f"trading balance did not increase {r} {r2}"
    assert float(r2["funding"]) <= float(r["funding"]) - amt + 0.01, f"funding balance did not decrease {r} {r2}"
    # move it back to keep the account tidy
    t2 = s.post(f"{TARGET_URL}/api/transfer", json={"direction": "trading-to-funding", "amount": amt}, timeout=30)
    assert t2.status_code == 200, f"reverse transfer failed {t2.status_code} {t2.text[:300]}"

def test_transfer_validation():
    s = _login()
    r = s.post(f"{TARGET_URL}/api/transfer", json={"direction": "invalid-direction", "amount": 100}, timeout=30)
    assert r.status_code == 400, f"invalid direction expected 400, got {r.status_code} {r.text[:200]}"
    r = s.post(f"{TARGET_URL}/api/transfer", json={"direction": "funding-to-trading", "amount": 999999999}, timeout=30)
    assert r.status_code == 400, f"insufficient transfer expected 400, got {r.status_code} {r.text[:200]}"

test_transfer_balances_exposed()
test_transfer_validation()
test_transfer_funding_to_trading_and_back()