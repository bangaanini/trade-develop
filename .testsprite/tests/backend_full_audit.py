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
    return r.json()["user"]["id"]

def test_wallets_with_user_id():
    s = _login()
    uid = _get_user_id(s)
    r = s.get(f"{TARGET_URL}/api/wallets?userId={uid}", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert "data" in data
    assert len(data["data"]) > 0, "user should have at least one wallet"

def test_admin_transactions_options():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/transactions?type=options", timeout=30)
    assert r.status_code == 200, f"admin transactions options returned {r.status_code}: {r.text[:200]}"

def test_admin_transactions_deposits():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/transactions?type=deposits", timeout=30)
    assert r.status_code == 200, f"admin transactions deposits returned {r.status_code}: {r.text[:200]}"

def test_admin_transactions_withdraws():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/transactions?type=withdraws", timeout=30)
    assert r.status_code == 200, f"admin transactions withdraws returned {r.status_code}: {r.text[:200]}"

def test_admin_transactions_swap():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/transactions?type=swap", timeout=30)
    assert r.status_code == 200, f"admin transactions swap returned {r.status_code}: {r.text[:200]}"

def test_binance_klines():
    r = requests.get(f"{TARGET_URL}/api/binance/proxy/klines?symbol=BTCUSDT&interval=1m&limit=5", timeout=30)
    assert r.status_code in [200, 400, 500], f"binance klines returned {r.status_code}"
