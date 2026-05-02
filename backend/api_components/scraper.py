from bs4 import BeautifulSoup
import requests
from playwright.sync_api import sync_playwright


class Scraper:

    def __init__(self, website):
        self.website = website

    def _get_static_page(self):
        """Try scraping using requests (fast method)"""
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X)"
            }

            r = requests.get(self.website, headers=headers, timeout=10)
            r.raise_for_status()

            return r.text

        except Exception as e:
            print(f"[ERROR] Static scraping failed: {e}")
            return None

    def _get_dynamic_page(self):
        """Fallback for JavaScript pages"""
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()

                page.goto(self.website, timeout=30000)
                html = page.content()

                browser.close()
                return html

        except Exception as e:
            print(f"[ERROR] Dynamic scraping failed: {e}")
            return None

    def _detect_anomalies(self, soup):
        """Detect scraping anomalies"""
        anomalies = []

        if soup is None:
            anomalies.append("No HTML content")

        text = soup.get_text().lower()

        if "captcha" in text:
            anomalies.append("CAPTCHA detected")

        if "access denied" in text:
            anomalies.append("Blocked by website")

        if len(soup.find_all("li")) == 0:
            anomalies.append("No list items found")

        return anomalies

    def fetch_website_contents(self):

        # Try static scraping first
        html = self._get_static_page()

        if html is None:
            html = self._get_dynamic_page()

        soup = BeautifulSoup(html, "html.parser")

        anomalies = self._detect_anomalies(soup)

        items = soup.find_all("li")
        results = [i.get_text(strip=True) for i in items]

        return {
            "data": results,
            "anomalies": anomalies
        }