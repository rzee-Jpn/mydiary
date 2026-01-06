import requests, json, os, re, time
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# ======================================================
# KONFIGURASI
# ======================================================

BASE = "https://www.gutenberg.org"
BOOKSHELF = "https://www.gutenberg.org/ebooks/bookshelf/696"
LIMIT_PER_RUN = 3

DATA_DIR = "data/books/gutenberg"
LIBRARY_JSON = "data/library.json"
STATE_FILE = "crawler/state.json"

HEADERS = {
    "User-Agent": "MyDiary-Gutenberg-Crawler/FINAL"
}

REQUEST_TIMEOUT = 20
MIN_CHAPTERS = 3
SLEEP_BETWEEN_BOOKS = 2

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs("crawler", exist_ok=True)
os.makedirs("data", exist_ok=True)

# ======================================================
# UTIL
# ======================================================

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def load_state():
    if not os.path.exists(STATE_FILE):
        return {
            "page": BOOKSHELF,
            "index": 0,
            "done": False
        }
    with open(STATE_FILE, encoding="utf-8") as f:
        return json.load(f)

def save_state(state):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

# ======================================================
# SCRAPER
# ======================================================

def safe_get(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        if r.status_code != 200:
            return None
        return r
    except requests.RequestException:
        return None

def get_books(page):
    r = safe_get(page)
    if not r:
        return [], None

    soup = BeautifulSoup(r.text, "lxml")

    books = [
        urljoin(BASE, a["href"])
        for a in soup.select("li.booklink a.link")
        if a.get("href")
    ]

    next_page = None
    for a in soup.select("a"):
        if a.text.strip().lower() == "next":
            next_page = urljoin(BASE, a.get("href"))
            break

    return books, next_page

def get_html_url(book_url):
    book_id = book_url.rstrip("/").split("/")[-1]
    return f"{BASE}/ebooks/{book_id}.html.images"

def parse_html_book(html_url):
    r = safe_get(html_url)
    if not r:
        return None, None, []

    soup = BeautifulSoup(r.text, "lxml")

    # ===== Title =====
    title_tag = soup.find("h1")
    title = title_tag.get_text(strip=True) if title_tag else "Unknown"

    # ===== Author =====
    author = "Unknown"
    for meta in soup.select("meta"):
        if meta.get("name", "").lower() == "author":
            author = meta.get("content", "Unknown")

    body = soup.find("body")
    if not body:
        return title, author, []

    chapters = []
    current = None

    for el in body.children:
        if not getattr(el, "name", None):
            continue

        if el.name in ("h2", "h3"):
            if current and current["html"].strip():
                chapters.append(current)

            current = {
                "title": el.get_text(strip=True),
                "html": ""
            }

        elif current and el.name == "p":
            current["html"] += f"<p>{el.decode_contents()}</p>\n"

    if current and current["html"].strip():
        chapters.append(current)

    if len(chapters) < MIN_CHAPTERS:
        return title, author, []

    return title, author, chapters

# ======================================================
# LIBRARY
# ======================================================

def update_library(entry):
    data = []
    if os.path.exists(LIBRARY_JSON):
        with open(LIBRARY_JSON, encoding="utf-8") as f:
            data = json.load(f)

    if not any(b["id"] == entry["id"] for b in data):
        data.append(entry)

    with open(LIBRARY_JSON, "w", encoding="utf-8") as f:
        json.dump(
            sorted(data, key=lambda x: x["title"]),
            f,
            indent=2,
            ensure_ascii=False
        )

# ======================================================
# MAIN
# ======================================================

def main():
    state = load_state()
    if state.get("done"):
        return

    books, next_page = get_books(state["page"])
    count = 0

    for url in books[state["index"]:]:
        state["index"] += 1

        html_url = get_html_url(url)
        title, author, chapters = parse_html_book(html_url)

        if not chapters:
            continue

        slug = slugify(title)
        book_dir = f"{DATA_DIR}/{slug}"
        chapters_dir = f"{book_dir}/chapters"

        if os.path.exists(book_dir):
            continue

        os.makedirs(chapters_dir, exist_ok=True)

        chapter_meta = []

        for i, ch in enumerate(chapters, 1):
            if "contents" in ch["title"].lower():
                continue

            fname = f"ch{i:02d}.html"
            file_path = f"{chapters_dir}/{fname}"

            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f"<h2>{ch['title']}</h2>\n")
                f.write(ch["html"])

            chapter_meta.append({
                "id": f"ch{i:02d}",
                "title": ch["title"],
                "file": f"chapters/{fname}"
            })

        with open(f"{book_dir}/book.json", "w", encoding="utf-8") as f:
            json.dump(
                {
                    "id": slug,
                    "title": title,
                    "author": author,
                    "chapters": chapter_meta
                },
                f,
                indent=2,
                ensure_ascii=False
            )

        update_library({
            "id": slug,
            "title": title,
            "author": author,
            "source": "Project Gutenberg",
            "path": f"data/books/gutenberg/{slug}"
        })

        count += 1
        time.sleep(SLEEP_BETWEEN_BOOKS)

        if count >= LIMIT_PER_RUN:
            break

    if state["index"] >= len(books):
        if next_page:
            state["page"] = next_page
            state["index"] = 0
        else:
            state["done"] = True

    save_state(state)

# ======================================================
# ENTRY
# ======================================================

if __name__ == "__main__":
    main()