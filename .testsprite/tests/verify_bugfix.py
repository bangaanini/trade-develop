__AUTH_CREDENTIAL__ = __import__("os").environ.get("TESTSPRITE_AUTH_CREDENTIAL", "")
__AUTH_TYPE__ = "public"
__EXTRA_HEADERS__ = {}
__AUTH_HEADERS__ = {}
import requests, os
TARGET_URL = (os.environ.get("TARGET_URL") or os.environ.get("TESTSPRITE_TARGET_URL") or "https://demo2.tradefreedoms.com").rstrip("/")
EMAIL = "superadmin@local.com"
PASSWORD = "password"

def _login():
    s = requests.Session()
    r = s.post(f"{TARGET_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, f"login failed {r.status_code}"
    return s

def test_spot_transactions_no_longer_500():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/admin/transactions?type=spot", timeout=30)
    assert r.status_code == 200, f"spot transactions returned {r.status_code}: {r.text[:200]}"

def test_chat_invalid_uuid_returns_400():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/chat/messages?sessionId=invalid-id", timeout=30)
    assert r.status_code == 400, f"invalid UUID should return 400, got {r.status_code}"

def test_chat_valid_uuid_nonexistent_returns_404():
    s = _login()
    r = s.get(f"{TARGET_URL}/api/chat/messages?sessionId=00000000-0000-0000-0000-000000000000", timeout=30)
    assert r.status_code in [404, 403], f"valid UUID nonexistent session should return 404/403, got {r.status_code}"
