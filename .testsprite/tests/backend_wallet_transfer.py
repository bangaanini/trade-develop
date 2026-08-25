__AUTH_CREDENTIAL__ = __import__("os").environ.get("TESTSPRITE_AUTH_CREDENTIAL", "")
__AUTH_TYPE__ = "public"
__EXTRA_HEADERS__ = {}
__AUTH_HEADERS__ = {}
import requests
import os
_T = os.environ.get("TARGET_URL") or os.environ.get("TESTSPRITE_TARGET_URL") or os.environ.get("BASE_URL") or "https://demo2.tradefreedoms.com"
TARGET_URL = _T.rstrip("/")

EMAIL = "superadmin@local.com"
PASSWORD = "password"

def _login():
    s = requests.Session()
    r = s.post(f"{TARGET_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"login failed {r.status_code} {r.text[:300]}"
    return s

def _get_user_id(s):
    r = s.get(f"{TARGET_URL}/api/auth/me", timeout=30)
    assert r.status_code == 200, f"me endpoint failed {r.status_code}"
    return r.json()["user"]["id"]

def test_session_authenticated():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/auth/session", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert data.get("user") is not None, "authenticated session should return user"
    assert data["user"]["email"] == EMAIL

def test_me_endpoint():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/auth/me", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert data["user"]["email"] == EMAIL
    assert "id" in data["user"]
    assert "role" in data["user"]

def test_wallet_balances():
    s = _login()
    uid = _get_user_id(s)
    r = s.get(f"{TARGET_URL}/api/wallets?userId={uid}", timeout=30)
    assert r.status_code == 200, f"wallets returned {r.status_code}: {r.text[:300]}"
    data = r.json()
    assert "data" in data, f"wallets response missing 'data' key: {list(data.keys())}"

def test_transfer_balances_exposed():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/transfer", timeout=30)
    assert r.status_code == 200, f"transfer GET returned {r.status_code}: {r.text[:300]}"
    bal = r.json().get("balances", {})
    for key in ("funding", "trading"):
        assert key in bal, f"missing wallet balance {key} in {bal}"

def test_transfer_funding_to_trading():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/transfer", timeout=30).json()["balances"]
    amt = 10
    t = s.post(f"{TARGET_URL}/api/transfer", json={"direction": "funding-to-trading", "amount": amt}, timeout=30)
    assert t.status_code == 200, f"transfer failed {t.status_code} {t.text[:300]}"
    r2 = s.get(f"{TARGET_URL}/api/transfer", timeout=30).json()["balances"]
    assert float(r2["trading"]) >= float(r["trading"]) + amt - 0.01, f"trading balance did not increase {r} {r2}"
    assert float(r2["funding"]) <= float(r["funding"]) - amt + 0.01, f"funding balance did not decrease {r} {r2}"
    s.post(f"{TARGET_URL}/api/transfer", json={"direction": "trading-to-funding", "amount": amt}, timeout=30)

def test_transfer_trading_to_funding():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/transfer", timeout=30).json()["balances"]
    amt = 10
    t = s.post(f"{TARGET_URL}/api/transfer", json={"direction": "trading-to-funding", "amount": amt}, timeout=30)
    assert t.status_code == 200, f"transfer failed {t.status_code} {t.text[:300]}"
    r2 = s.get(f"{TARGET_URL}/api/transfer", timeout=30).json()["balances"]
    assert float(r2["funding"]) >= float(r["funding"]) + amt - 0.01, f"funding balance did not increase"
    assert float(r2["trading"]) <= float(r["trading"]) - amt + 0.01, f"trading balance did not decrease"
    s.post(f"{TARGET_URL}/api/transfer", json={"direction": "funding-to-trading", "amount": amt}, timeout=30)

def test_transfer_invalid_direction():
    s = _login()
    r = s.post(f"{TARGET_URL}/api/transfer", json={"direction": "invalid", "amount": 10}, timeout=30)
    assert r.status_code in [400, 401], f"expected 400 for invalid direction, got {r.status_code}"

def test_transfer_missing_fields():
    s = _login()
    r = s.post(f"{TARGET_URL}/api/transfer", json={}, timeout=30)
    assert r.status_code in [400, 401], f"expected 400 for missing fields, got {r.status_code}"

def test_deposit_methods():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/deposit/methods", timeout=30)
    assert r.status_code == 200, f"deposit methods returned {r.status_code}: {r.text[:200]}"

def test_wallets_with_user_id():
    s = _login()
    uid = _get_user_id(s)
    r = s.get(f"{TARGET_URL}/api/wallets?userId={uid}", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert "data" in data
    assert len(data["data"]) > 0, "user should have at least one wallet"

def test_logout_and_relogin():
    s = _login()
    r = s.post(f"{TARGET_URL}/api/auth/logout", timeout=30)
    assert r.status_code == 200, f"logout returned {r.status_code}"
    r2 = s.get(f"{TARGET_URL}/api/auth/session", timeout=30)
    assert r2.json().get("user") is None, "session should be null after logout"
    r3 = s.post(f"{TARGET_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=30)
    assert r3.status_code == 200, "re-login failed"
