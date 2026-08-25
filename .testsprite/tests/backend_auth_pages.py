__AUTH_CREDENTIAL__ = __import__("os").environ.get("TESTSPRITE_AUTH_CREDENTIAL", "")
__AUTH_TYPE__ = "public"
__EXTRA_HEADERS__ = {}
__AUTH_HEADERS__ = {}
import requests
import os
_T = os.environ.get("TARGET_URL") or os.environ.get("TESTSPRITE_TARGET_URL") or os.environ.get("BASE_URL") or "https://demo2.tradefreedoms.com"
TARGET_URL = _T.rstrip("/")

def test_homepage_loads():
    r = requests.get(f"{TARGET_URL}", timeout=30)
    assert r.status_code == 200, f"homepage returned {r.status_code}"
    assert "Trade Freedom" in r.text or "trade" in r.text.lower(), "homepage missing brand name"

def test_login_page_loads():
    r = requests.get(f"{TARGET_URL}/login", timeout=30)
    assert r.status_code == 200, f"login page returned {r.status_code}"

def test_register_page_loads():
    r = requests.get(f"{TARGET_URL}/register", timeout=30)
    assert r.status_code == 200, f"register page returned {r.status_code}"

def test_terms_page_loads():
    r = requests.get(f"{TARGET_URL}/terms", timeout=30)
    assert r.status_code == 200, f"terms page returned {r.status_code}"

def test_privacy_page_loads():
    r = requests.get(f"{TARGET_URL}/privacy", timeout=30)
    assert r.status_code == 200, f"privacy page returned {r.status_code}"

def test_forgot_password_page_loads():
    r = requests.get(f"{TARGET_URL}/forgot-password", timeout=30)
    assert r.status_code == 200, f"forgot-password page returned {r.status_code}"

def test_download_page_loads():
    r = requests.get(f"{TARGET_URL}/download", timeout=30)
    assert r.status_code == 200, f"download page returned {r.status_code}"

def test_support_page_loads():
    r = requests.get(f"{TARGET_URL}/support", timeout=30)
    assert r.status_code == 200, f"support page returned {r.status_code}"

def test_api_session_unauthenticated():
    r = requests.get(f"{TARGET_URL}/api/auth/session", timeout=30)
    assert r.status_code == 200, f"session returned {r.status_code}"
    data = r.json()
    assert data.get("user") is None, "unauthenticated session should return user=null"

def test_api_login_missing_fields():
    r = requests.post(f"{TARGET_URL}/api/auth/login", json={}, timeout=30)
    assert r.status_code == 400, f"expected 400, got {r.status_code}"

def test_api_login_wrong_password():
    r = requests.post(f"{TARGET_URL}/api/auth/login", json={"email": "nonexistent@test.com", "password": "wrongpass"}, timeout=30)
    assert r.status_code == 401, f"expected 401, got {r.status_code}"

def test_api_forgot_password():
    r = requests.post(f"{TARGET_URL}/api/auth/forgot-password", json={"email": "test@test.com"}, timeout=30)
    assert r.status_code in [200, 400, 404], f"forgot-password returned {r.status_code}"

def test_api_market_endpoint():
    r = requests.get(f"{TARGET_URL}/api/market", timeout=30)
    assert r.status_code == 200, f"market endpoint returned {r.status_code}"

def test_binance_top10():
    r = requests.get(f"{TARGET_URL}/api/binance/top10", timeout=30)
    assert r.status_code == 200, f"binance top10 returned {r.status_code}"
    data = r.json()
    assert "data" in data, f"top10 missing data: {list(data.keys())}"
    assert len(data["data"]) > 0, "top10 should have coins"
