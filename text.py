import time
import json
import os
from dataclasses import dataclass, asdict
from typing import Optional

from playwright.sync_api import sync_playwright
from curl_cffi import requests


CACHE_FILE = "quillbot_session.json"


# --------------------------------
# SESSION STRUCTURE
# --------------------------------
@dataclass
class Session:
    cookies: dict
    headers: dict
    timestamp: float


# --------------------------------
# SAVE / LOAD SESSION
# --------------------------------
def save_session(session: Session):
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(asdict(session), f)


def load_session() -> Optional[Session]:
    if not os.path.exists(CACHE_FILE):
        return None

    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        return Session(**data)

    except:
        return None


# --------------------------------
# CREATE SESSION VIA PLAYWRIGHT
# --------------------------------
def create_session() -> Session:
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
            wait_until="domcontentloaded"
        )

        page.wait_for_timeout(5000)

        cookies = {
            c["name"]: c["value"]
            for c in context.cookies()
        }

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

        return session


# --------------------------------
# SESSION MANAGER
# --------------------------------
class SessionManager:
    def __init__(self, ttl=1800):
        self.ttl = ttl
        self.session: Optional[Session] = None

    def expired(self):
        return (
            not self.session
            or (time.time() - self.session.timestamp) > self.ttl
        )

    def refresh(self):
        print("[+] Refreshing session...")
        self.session = create_session()
        print("[+] New session created")

    def get(self):
        # memory
        if not self.expired():
            return self.session

        # disk
        cached = load_session()

        if cached:
            age = time.time() - cached.timestamp

            if age <= self.ttl:
                self.session = cached
                print("[+] Loaded cached session")
                return self.session

        # rebuild
        self.refresh()
        return self.session


# --------------------------------
# QUILLBOT CLIENT
# --------------------------------
class QuillBotClient:
    def __init__(self, manager: SessionManager):
        self.manager = manager
        self.http = requests.Session()

    def check(
        self,
        text: str,
        explain: bool = True,
        retries: int = 5
    ):
        url = "https://quillbot.com/api/ai-detector/score"

        payload = {
            "text": text,
            "language": "en",
            "explain": explain
        }

        last_error = None

        for attempt in range(retries):
            session = self.manager.get()

            try:
                response = self.http.post(
                    url,
                    headers=session.headers,
                    cookies=session.cookies,
                    json=payload,
                    impersonate="chrome120",
                    timeout=30
                )

                print(
                    f"[Attempt {attempt + 1}] "
                    f"Status: {response.status_code}"
                )

                # success
                if response.status_code == 200:
                    return response

                # blocked / invalid
                if response.status_code in [401, 403, 429]:
                    print("[!] Session invalid. Refreshing...")
                    self.manager.refresh()
                    continue

                # other bad response
                self.manager.refresh()

            except Exception as e:
                last_error = e
                print("[!] Error:", e)

                self.manager.refresh()

        raise RuntimeError(
            f"Failed after {retries} retries. "
            f"Last error: {last_error}"
        )


# --------------------------------
# USAGE
# --------------------------------
if __name__ == "__main__":
    manager = SessionManager(ttl=1800)

    client = QuillBotClient(manager)

    text = """
    One of the persistent criticisms of Islamic finance in developing
    markets is that the product range is narrow.
    """

    response = client.check(text)

    print("\nSTATUS:", response.status_code)
    print("\nRESPONSE:")
    print(response.text)