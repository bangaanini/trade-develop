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

def test_admin_stats():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/stats", timeout=30)
    assert r.status_code == 200, f"admin stats returned {r.status_code}"

def test_admin_users_list():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/users", timeout=30)
    assert r.status_code == 200, f"admin users returned {r.status_code}"

def test_admin_deposits_list():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/deposits", timeout=30)
    assert r.status_code == 200, f"admin deposits returned {r.status_code}"

def test_admin_withdraws_list():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/withdraws", timeout=30)
    assert r.status_code in [200, 404], f"admin withdraws returned {r.status_code}"

def test_admin_settings():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/settings", timeout=30)
    assert r.status_code == 200, f"admin settings returned {r.status_code}"

def test_admin_trades():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/trades", timeout=30)
    assert r.status_code == 200, f"admin trades returned {r.status_code}"

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

def test_admin_logs():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/logs", timeout=30)
    assert r.status_code in [200, 404], f"admin logs returned {r.status_code}"

def test_admin_kyc_list():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/kyc", timeout=30)
    assert r.status_code == 200, f"admin kyc returned {r.status_code}"

def test_admin_tickets_list():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/tickets", timeout=30)
    assert r.status_code == 200, f"admin tickets returned {r.status_code}"

def test_admin_deposit_methods():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/deposit-methods", timeout=30)
    assert r.status_code == 200, f"admin deposit methods returned {r.status_code}"

def test_admin_option_settings():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/option/settings", timeout=30)
    assert r.status_code == 200, f"admin option settings returned {r.status_code}"

def test_admin_chat_sessions():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/chat/sessions", timeout=30)
    assert r.status_code == 200, f"admin chat sessions returned {r.status_code}"

def test_admin_database_tables():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/database/tables", timeout=30)
    assert r.status_code == 200, f"admin database tables returned {r.status_code}"

def test_non_admin_cannot_access():
    r = requests.get(f"{TARGET_URL}/api/admin/stats", timeout=30)
    assert r.status_code in [401, 403], f"unauthenticated admin access should fail, got {r.status_code}"
