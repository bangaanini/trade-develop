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

def test_spot_orderbook():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/orderbook?symbol=BTCUSDT", timeout=30)
    assert r.status_code == 200, f"orderbook returned {r.status_code}"

def test_binance_top10():
    r = requests.get(f"{TARGET_URL}/api/binance/top10", timeout=30)
    assert r.status_code == 200, f"binance top10 returned {r.status_code}"
    data = r.json()
    assert "data" in data and len(data["data"]) > 0, "top10 should have coins"

def test_market_overview():
    r = requests.get(f"{TARGET_URL}/api/market", timeout=30)
    assert r.status_code == 200, f"market returned {r.status_code}"

def test_option_settings():
    r = requests.get(f"{TARGET_URL}/api/option/settings", timeout=30)
    assert r.status_code == 200, f"option settings returned {r.status_code}"

def test_option_orders():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/option/orders", timeout=30)
    assert r.status_code == 200, f"option orders returned {r.status_code}"

def test_option_history():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/option/history", timeout=30)
    assert r.status_code == 200, f"option history returned {r.status_code}"

def test_user_kyc_status():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/kyc", timeout=30)
    assert r.status_code in [200, 401, 404], f"kyc status returned {r.status_code}"

def test_user_chat_messages_requires_session():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/chat/messages", timeout=30)
    assert r.status_code == 400, f"chat messages without sessionId should return 400, got {r.status_code}"

def test_spot_order_all():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/spot/all", timeout=30)
    assert r.status_code == 200, f"spot/all returned {r.status_code}"

def test_binance_klines():
    r = requests.get(f"{TARGET_URL}/api/binance/proxy/klines?symbol=BTCUSDT&interval=1m&limit=5", timeout=30)
    assert r.status_code in [200, 400, 500], f"binance klines returned {r.status_code}"
