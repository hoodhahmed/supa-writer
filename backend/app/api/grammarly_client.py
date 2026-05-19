import time
import json
import os
from dataclasses import dataclass, asdict
from typing import Optional
from playwright.sync_api import sync_playwright
from curl_cffi import requests

CACHE_FILE = "session.json"

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
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto(
            "https://www.grammarly.com/ai-detector",
            wait_until="domcontentloaded"
        )

        page.wait_for_timeout(2000)
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
        return session

class SessionManager:
    def __init__(self, ttl=600):
        self.ttl = ttl
        self.session: Optional[Session] = None

    def expired(self):
        return (
            not self.session
            or (time.time() - self.session.timestamp) > self.ttl
        )

    def refresh(self):
        self.session = create_session()

    def get(self):
        if not self.expired():
            return self.session

        cached = load_session()
        if cached and (time.time() - cached.timestamp) <= self.ttl:
            self.session = cached
            return self.session

        self.refresh()
        return self.session

class APIClient:
    def __init__(self, manager: SessionManager):
        self.manager = manager
        # We'll create a new session for each request or reuse if possible
        # but curl_cffi sessions might need to be handled carefully in async environments
        # though this script is sync.

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

        for _ in range(retries):
            s = self.manager.get()
            try:
                # Use a fresh request session each time to avoid cookie pollution if any
                with requests.Session() as session:
                    r = session.post(
                        url,
                        headers=self.headers(s),
                        cookies=s.cookies,
                        data=text.encode("utf-8"),
                        impersonate="chrome120",
                        timeout=30
                    )

                    if r.status_code == 200:
                        return r.json()
                    
                    print(f"Grammarly API error: {r.status_code} - {r.text}")
                    self.manager.refresh()
            except Exception as e:
                print(f"Exception during Grammarly check: {e}")
                last_error = e
                self.manager.refresh()

        raise RuntimeError(f"Failed after retries: {last_error}")

# Global instances
grammarly_manager = SessionManager(ttl=600)
grammarly_client = APIClient(grammarly_manager)
