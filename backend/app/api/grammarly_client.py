import time
import json
import os
import threading
from dataclasses import dataclass, asdict
from typing import Optional
from playwright.sync_api import sync_playwright
from curl_cffi import requests

CACHE_FILE = "grammarly_session.json"

@dataclass
class Session:
    cookies: dict
    csrf: str
    container_id: str
    timestamp: float

def save_session(session: Session):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(asdict(session), f)
    except Exception as e:
        print(f"Error saving session: {e}")

def load_session() -> Optional[Session]:
    if not os.path.exists(CACHE_FILE):
        return None
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return Session(**data)
    except:
        return None

def create_session() -> Session:
    print("DEBUG: Creating new Grammarly session via Playwright...")
    start_time = time.time()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto(
            "https://www.grammarly.com/ai-detector",
            wait_until="networkidle"
        )

        # Wait a small bit more just in case for cookies
        page.wait_for_timeout(1000)
        cookies = {c["name"]: c["value"] for c in context.cookies()}

        csrf = None
        try:
            csrf = page.evaluate("() => window.csrfToken || null")
        except:
            pass

        if not csrf:
            try:
                el = page.query_selector("meta[name='csrf-token']")
                if el:
                    csrf = el.get_attribute("content")
            except:
                pass

        if not csrf:
            csrf = cookies.get("csrf-token")

        container_id = None
        try:
            container_id = page.evaluate("() => window.__APP_CONTAINER_ID || null")
        except:
            pass

        if not container_id:
            container_id = "dmkfap7ijnks0f80"

        browser.close()

        session = Session(
            cookies=cookies,
            csrf=csrf,
            container_id=container_id,
            timestamp=time.time()
        )

        save_session(session)
        print(f"DEBUG: Grammarly session created in {time.time() - start_time:.2f}s")
        return session

class SessionManager:
    def __init__(self, ttl=600):
        self.ttl = ttl
        self.session: Optional[Session] = None
        self._lock = threading.Lock()

    def is_expired(self, session: Optional[Session] = None):
        s = session or self.session
        if not s:
            return True
        return (time.time() - s.timestamp) > self.ttl

    def refresh(self, old_session: Optional[Session] = None):
        with self._lock:
            # If we were given an old session, only refresh if it's still the current one
            if old_session and self.session and self.session != old_session:
                print("DEBUG: Grammarly session already refreshed by another thread.")
                return self.session
            
            print("DEBUG: Refreshing Grammarly session...")
            self.session = create_session()
            return self.session

    def get(self):
        # 1. Fast path: check in-memory session without lock
        if self.session and not self.is_expired(self.session):
            return self.session

        with self._lock:
            # 2. Check in-memory again under lock
            if self.session and not self.is_expired(self.session):
                return self.session

            # 3. Try loading from cache
            cached = load_session()
            if cached and not self.is_expired(cached):
                print("DEBUG: Loaded Grammarly session from cache.")
                self.session = cached
                return self.session

            # 4. If still no valid session, create one
            print("DEBUG: Grammarly session expired or missing. Refreshing...")
            self.session = create_session()
            return self.session

class APIClient:
    def __init__(self, manager: SessionManager):
        self.manager = manager
        self._session = requests.Session()
        self._session_lock = threading.Lock()

    def headers(self, s: Session):
        return {
            "accept": "application/json",
            "content-type": "text/plain",
            "origin": "https://www.grammarly.com",
            "referer": "https://www.grammarly.com/ai-detector",
            "x-client-type": "cms",
            "x-client-version": "1.0.15846",
            "x-container-id": s.container_id,
            "x-csrf-token": s.csrf,
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    def check(self, text: str, retries: int = 3):
        url = "https://capi.grammarly.com/api/check/aidetector"
        last_error = None

        for i in range(retries):
            s = self.manager.get()
            try:
                # Optimized: removed _session_lock to allow concurrent requests
                r = self._session.post(
                    url,
                    headers=self.headers(s),
                    cookies=s.cookies,
                    data=text.encode("utf-8"),
                    impersonate="chrome120",
                    timeout=30
                )

                if r.status_code == 200:
                    return r.json()
                
                print(f"DEBUG: Grammarly API error (Attempt {i+1}): {r.status_code} - {r.text}")
                if r.status_code in [401, 403]:
                    self.manager.refresh(s)
            except Exception as e:
                print(f"DEBUG: Exception during Grammarly check (Attempt {i+1}): {e}")
                last_error = e
                self.manager.refresh(s)

        raise RuntimeError(f"Failed after retries: {last_error}")


# Global instances
grammarly_manager = SessionManager(ttl=600)
grammarly_client = APIClient(grammarly_manager)
