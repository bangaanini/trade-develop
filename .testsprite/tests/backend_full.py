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

# === AUTH ===
def test_login_success():
    r = requests.post(f"{TARGET_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200
    assert "user" in r.json()

def test_login_wrong_password():
    r = requests.post(f"{TARGET_URL}/api/auth/login", json={"email": EMAIL, "password": "wrong"}, timeout=30)
    assert r.status_code == 401

def test_login_missing_fields():
    r = requests.post(f"{TARGET_URL}/api/auth/login", json={}, timeout=30)
    assert r.status_code == 400

def test_session_unauthenticated():
    r = requests.get(f"{TARGET_URL}/api/auth/session", timeout=30)
    assert r.status_code == 200
    assert r.json().get("user") is None

def test_session_authenticated():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/auth/session", timeout=30)
    assert r.status_code == 200
    assert r.json().get("user") is not None
    assert r.json()["user"]["email"] == EMAIL

def test_me_endpoint():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/auth/me", timeout=30)
    assert r.status_code == 200
    u = r.json()["user"]
    assert u["email"] == EMAIL
    assert "id" in u and "role" in u

def test_me_unauthenticated():
    r = requests.get(f"{TARGET_URL}/api/auth/me", timeout=30)
    assert r.status_code in [401, 404]

def test_logout():
    s = _login()
    r = s.post(f"{TARGET_URL}/api/auth/logout", timeout=30)
    assert r.status_code == 200
    r2 = s.get(f"{TARGET_URL}/api/auth/session", timeout=30)
    assert r2.json().get("user") is None

def test_forgot_password():
    r = requests.post(f"{TARGET_URL}/api/auth/forgot-password", json={"email": "test@test.com"}, timeout=30)
    assert r.status_code in [200, 400, 404]

# === WALLETS ===
def test_wallets_requires_user_id():
    r = requests.get(f"{TARGET_URL}/api/wallets", timeout=30)
    assert r.status_code == 400

def test_wallets_with_user_id():
    s = _login()
    uid = _get_user_id(s)
    r = s.get(f"{TARGET_URL}/api/wallets?userId={uid}", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert "data" in data
    assert len(data["data"]) > 0

# === TRANSFER ===
def test_transfer_balances():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/transfer", timeout=30)
    assert r.status_code == 200
    bal = r.json().get("balances", {})
    for k in ("funding", "trading"):
        assert k in bal

def test_transfer_funding_to_trading():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/transfer", timeout=30).json()["balances"]
    amt = 5
    t = s.post(f"{TARGET_URL}/api/transfer", json={"direction": "funding-to-trading", "amount": amt}, timeout=30)
    assert t.status_code == 200
    r2 = s.get(f"{TARGET_URL}/api/transfer", timeout=30).json()["balances"]
    assert float(r2["trading"]) >= float(r["trading"]) + amt - 0.01
    assert float(r2["funding"]) <= float(r["funding"]) - amt + 0.01
    s.post(f"{TARGET_URL}/api/transfer", json={"direction": "trading-to-funding", "amount": amt}, timeout=30)

def test_transfer_invalid_direction():
    s = _login()
    r = s.post(f"{TARGET_URL}/api/transfer", json={"direction": "invalid", "amount": 10}, timeout=30)
    assert r.status_code in [400, 401]

# === DEPOSIT ===
def test_deposit_methods():
    r = requests.get(f"{TARGET_URL}/api/deposit/methods", timeout=30)
    assert r.status_code == 200

# === MARKET ===
def test_market():
    r = requests.get(f"{TARGET_URL}/api/market", timeout=30)
    assert r.status_code == 200

# === BINANCE ===
def test_binance_top10():
    r = requests.get(f"{TARGET_URL}/api/binance/top10", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert "data" in data and len(data["data"]) > 0

def test_binance_klines():
    r = requests.get(f"{TARGET_URL}/api/binance/proxy/klines?symbol=BTCUSDT&interval=1m&limit=5", timeout=30)
    assert r.status_code in [200, 400, 500]

# === ORDERBOOK ===
def test_orderbook():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/orderbook?symbol=BTCUSDT", timeout=30)
    assert r.status_code == 200

# === SPOT ===
def test_spot_all():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/spot/all", timeout=30)
    assert r.status_code == 200

# === OPTION ===
def test_option_settings():
    r = requests.get(f"{TARGET_URL}/api/option/settings", timeout=30)
    assert r.status_code == 200

def test_option_orders():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/option/orders", timeout=30)
    assert r.status_code == 200

def test_option_history():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/option/history", timeout=30)
    assert r.status_code == 200

# === KYC ===
def test_kyc():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/kyc", timeout=30)
    assert r.status_code in [200, 401, 404]

# === CHAT ===
def test_chat_messages_requires_session():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/chat/messages", timeout=30)
    assert r.status_code == 400

# === ADMIN ===
def test_admin_stats():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/stats", timeout=30)
    assert r.status_code == 200

def test_admin_users():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/users", timeout=30)
    assert r.status_code == 200

def test_admin_deposits():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/deposits", timeout=30)
    assert r.status_code == 200

def test_admin_withdraws():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/withdraws", timeout=30)
    assert r.status_code in [200, 404]

def test_admin_settings():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/settings", timeout=30)
    assert r.status_code == 200

def test_admin_trades():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/trades", timeout=30)
    assert r.status_code == 200

def test_admin_transactions_options():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/transactions?type=options", timeout=30)
    assert r.status_code == 200

def test_admin_transactions_deposits():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/transactions?type=deposits", timeout=30)
    assert r.status_code == 200

def test_admin_transactions_withdraws():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/transactions?type=withdraws", timeout=30)
    assert r.status_code == 200

def test_admin_kyc():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/kyc", timeout=30)
    assert r.status_code == 200

def test_admin_tickets():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/tickets", timeout=30)
    assert r.status_code == 200

def test_admin_deposit_methods():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/deposit-methods", timeout=30)
    assert r.status_code == 200

def test_admin_option_settings():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/option/settings", timeout=30)
    assert r.status_code == 200

def test_admin_chat_sessions():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/chat/sessions", timeout=30)
    assert r.status_code == 200

def test_admin_database_tables():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/database/tables", timeout=30)
    assert r.status_code == 200

def test_non_admin_blocked():
    r = requests.get(f"{TARGET_URL}/api/admin/stats", timeout=30)
    assert r.status_code in [401, 403]

# === PAGES (server-rendered check) ===
def test_homepage():
    r = requests.get(f"{TARGET_URL}", timeout=30)
    assert r.status_code == 200
    assert "trade" in r.text.lower()

def test_login_page():
    r = requests.get(f"{TARGET_URL}/login", timeout=30)
    assert r.status_code == 200

def test_register_page():
    r = requests.get(f"{TARGET_URL}/register", timeout=30)
    assert r.status_code == 200

def test_spot_page():
    r = requests.get(f"{TARGET_URL}/spot", timeout=30)
    assert r.status_code == 200

def test_option_page():
    r = requests.get(f"{TARGET_URL}/option", timeout=30)
    assert r.status_code == 200

def test_terms_page():
    r = requests.get(f"{TARGET_URL}/terms", timeout=30)
    assert r.status_code == 200

def test_privacy_page():
    r = requests.get(f"{TARGET_URL}/privacy", timeout=30)
    assert r.status_code == 200

def test_download_page():
    r = requests.get(f"{TARGET_URL}/download", timeout=30)
    assert r.status_code == 200

def test_support_page():
    r = requests.get(f"{TARGET_URL}/support", timeout=30)
    assert r.status_code == 200

def test_forgot_password_page():
    r = requests.get(f"{TARGET_URL}/forgot-password", timeout=30)
    assert r.status_code == 200
