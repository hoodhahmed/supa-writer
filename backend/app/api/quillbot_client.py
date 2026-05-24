import time
import json
import os
import threading
from dataclasses import dataclass, asdict
from typing import Optional, List
from playwright.sync_api import sync_playwright
from curl_cffi import requests

CACHE_FILE = "quillbot_session.json"

@dataclass
class Session:
    cookies: dict
    headers: dict
    timestamp: float

def save_session(session: Session):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(asdict(session), f)
    except Exception as e:
        print(f"Error saving QuillBot session: {e}")

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
    print("DEBUG: Creating new QuillBot session via Playwright...")
    start_time = time.time()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        )
        page = context.new_page()

        page.goto(
            "https://quillbot.com/ai-content-detector",
            wait_until="networkidle"
        )

        # Optimize: slightly reduced timeout
        page.wait_for_timeout(3000)

        cookies = {c["name"]: c["value"] for c in context.cookies()}

        headers = {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "origin": "https://quillbot.com",
            "referer": "https://quillbot.com/ai-content-detector",
            "platform-type": "webapp",
            "user-agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        }

        browser.close()

        session = Session(
            cookies=cookies,
            headers=headers,
            timestamp=time.time()
        )

        save_session(session)
        print(f"DEBUG: QuillBot session created in {time.time() - start_time:.2f}s")
        return session

class SessionManager:
    def __init__(self, ttl=1800):
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
            if old_session and self.session and self.session != old_session:
                print("DEBUG: QuillBot session already refreshed by another thread.")
                return self.session
            
            print("DEBUG: Refreshing QuillBot session...")
            self.session = create_session()
            return self.session

    def get(self):
        # 1. Fast path
        if self.session and not self.is_expired(self.session):
            return self.session

        with self._lock:
            # 2. Double check
            if self.session and not self.is_expired(self.session):
                return self.session

            # 3. Cache
            cached = load_session()
            if cached and not self.is_expired(cached):
                print("DEBUG: Loaded QuillBot session from cache.")
                self.session = cached
                return self.session

            # 4. Refresh
            print("DEBUG: QuillBot session expired or missing. Refreshing...")
            self.session = create_session()
            return self.session

class QuillBotClient:
    def __init__(self, manager: SessionManager):
        self.manager = manager
        self._session = requests.Session()
        self._session_lock = threading.Lock()

    def check(self, text: str, explain: bool = True, retries: int = 5):
        url = "https://quillbot.com/api/ai-detector/score"
        payload = {
            "text": text,
            "language": "en",
            "explain": explain
        }
        last_error = None

        for i in range(retries):
            s = self.manager.get()
            try:
                # Optimized: removed _session_lock to allow concurrent requests
                response = self._session.post(
                    url,
                    headers=s.headers,
                    cookies=s.cookies,
                    json=payload,
                    impersonate="chrome120",
                    timeout=30
                )

                if response.status_code == 200:
                    return response.json()

                print(f"DEBUG: QuillBot API error (Attempt {i+1}): {response.status_code} - {response.text}")
                if response.status_code in [401, 403, 429]:
                    self.manager.refresh(s)
                    continue
                
                self.manager.refresh(s)
            except Exception as e:
                print(f"DEBUG: Exception during QuillBot check (Attempt {i+1}): {e}")
                last_error = e
                self.manager.refresh(s)

    def detect_tone(self, texts: List[str], retries: int = 3):
        url = "https://quillbot.com/api/utils/tone-detection"
        payload = {"text": texts}
        last_error = None

        for i in range(retries):
            s = self.manager.get()
            try:
                # Optimized: removed _session_lock
                response = self._session.post(
                    url,
                    headers=s.headers,
                    cookies=s.cookies,
                    json=payload,
                    impersonate="chrome120",
                    timeout=30
                )

                if response.status_code == 200:
                    return response.json()

                if response.status_code in [401, 403, 429]:
                    self.manager.refresh(s)
                    continue
                
                self.manager.refresh(s)
            except Exception as e:
                print(f"DEBUG: Exception during QuillBot tone check (Attempt {i+1}): {e}")
                last_error = e
                self.manager.refresh(s)

        raise RuntimeError(f"Failed after {retries} retries. Last error: {last_error}")


quillbot_manager = SessionManager(ttl=1800)
quillbot_client = QuillBotClient(quillbot_manager)
