import requests, json, os, re, time
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime

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
    "User-Agent": "Pustaka-Gutenberg-Crawler/1.0"
}

REQUEST_TIMEOUT = 20
MIN_CHAPTERS = 3
SLEEP_BETWEEN_BOOKS = 2

TODAY_ISO = datetime.utcnow().strftime("%Y-%m-%d")
IS_CI = os.getenv("GITHUB_ACTIONS") == "true"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs("crawler", exist_ok=True)
os.makedirs("data", exist_ok=True)

# ======================================================
# UTIL
# ======================================================

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def load_state():
    if IS_CI:
        return {"page": BOOKSHELF, "index": 0, "done": False}
    if not os.path.exists(STATE_FILE):
        return {"page": BOOKSHELF, "index": 0, "done": False}
    with open(STATE_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_state(state):
    if IS_CI:
        return
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def normalize_categories(subjects, bookshelves):
    cats = set()
    for s in subjects + bookshelves:
        s = s.lower()
        if "philosophy" in s:
            cats.add("Philosophy")
        elif "history" in s:
            cats.add("History")
        elif "poetry" in s:
            cats.add("Poetry")
        elif "romance" in s:
            cats.add("Romance")
        elif "fiction" in s or "novel" in s:
            cats.add("Classic")
        elif "science" in s:
            cats.add("Science")
        else:
            cats.add("General")
    return sorted(cats)


def normalize_tags(subjects, bookshelves):
    tags = set()
    for s in subjects + bookshelves:
        s = s.lower()
        if "philosophy" in s:
            tags.add("philosophy")
        if "politic" in s:
            tags.add("politics")
        if "econom" in s:
            tags.add("economics")
        if "history" in s:
            tags.add("history")
        if "religion" in s or "theology" in s:
            tags.add("religion")
        if "poetry" in s:
            tags.add("poetry")
        if "fiction" in s or "novel" in s:
            tags.add("fiction")
        if "science" in s:
            tags.add("science")
        if "education" in s:
            tags.add("education")
    return sorted(tags)


def infer_reading_level(word_count):
    if word_count < 15000:
        return "light"
    elif word_count < 50000:
        return "medium"
    return "heavy"


def infer_length(word_count):
    if word_count < 20000:
        return "short"
    elif word_count < 80000:
        return "medium"
    return "long"


def infer_audience(categories, reading_level):
    if reading_level == "heavy":
        return ["academic"]
    if "Philosophy" in categories or "Science" in categories:
        return ["academic", "general"]
    return ["general"]


def count_words(chapters):
    text = ""
    for ch in chapters:
        text += BeautifulSoup(ch["html"], "lxml").get_text(" ")
    return len(text.split())

# ======================================================
# REQUEST
# ======================================================

def safe_get(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        if r.status_code != 200:
            return None
        return r
    except requests.RequestException:
        return None

# ======================================================
# BOOK LIST
# ======================================================

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


def get_book_id(book_url):
    return book_url.rstrip("/").split("/")[-1]


def get_html_url(book_id):
    return f"{BASE}/ebooks/{book_id}.html.images"

# ======================================================
# METADATA
# ======================================================

def get_metadata(book_url):
    r = safe_get(book_url)
    if not r:
        return [], [], None

    soup = BeautifulSoup(r.text, "lxml")
    subjects, bookshelves, release_date = [], [], None

    for tr in soup.select("table.bibrec tr"):
        th, td = tr.find("th"), tr.find("td")
        if not th or not td:
            continue

        label = th.get_text(strip=True).lower()
        value = td.get_text(" ", strip=True)

        if label == "subject":
            subjects.append(value)
        elif label == "bookshelf":
            bookshelves.append(value)
        elif label == "release date":
            try:
                release_date = datetime.strptime(value, "%B %d, %Y").strftime("%Y-%m-%d")
            except:
                release_date = None

    return subjects, bookshelves, release_date

# ======================================================
# HTML PARSER
# ======================================================

def parse_html_book(html_url):
    r = safe_get(html_url)
    if not r:
        return None, None, []

    soup = BeautifulSoup(r.text, "lxml")
    title = soup.find("h1").get_text(strip=True) if soup.find("h1") else "Unknown"

    author = "Unknown"
    for meta in soup.select("meta"):
        if meta.get("name", "").lower() == "author":
            author = meta.get("content", "Unknown")

    body = soup.find("body")
    if not body:
        return title, author, []

    chapters, current = [], None

    for el in body.children:
        if not getattr(el, "name", None):
            continue

        if el.name in ("h2", "h3"):
            if current and current["html"].strip():
                chapters.append(current)
            current = {"title": el.get_text(strip=True), "html": ""}
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

    data = sorted(data, key=lambda x: x.get("created", "1970-01-01"), reverse=True)

    with open(LIBRARY_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ======================================================
# MAIN
# ======================================================

def main():
    state = load_state()
    books, next_page = get_books(state["page"])
    count = 0

    for url in books[state["index"]:]:
        state["index"] += 1

        book_id = get_book_id(url)
        subjects, bookshelves, release_date = get_metadata(url)
        title, author, chapters = parse_html_book(get_html_url(book_id))

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
            fname = f"ch{i:02d}.html"
            with open(f"{chapters_dir}/{fname}", "w", encoding="utf-8") as f:
                f.write(f"<h2>{ch['title']}</h2>\n{ch['html']}")
            chapter_meta.append({
                "id": f"ch{i:02d}",
                "title": ch["title"],
                "file": f"chapters/{fname}"
            })

        categories = normalize_categories(subjects, bookshelves)
        tags = normalize_tags(subjects, bookshelves)
        word_count = count_words(chapters)

        reading_level = infer_reading_level(word_count)
        length = infer_length(word_count)
        audience = infer_audience(categories, reading_level)

        with open(f"{book_dir}/book.json", "w", encoding="utf-8") as f:
            json.dump({
                "id": slug,
                "title": title,
                "author": author,
                "categories": categories,
                "tags": tags,
                "reading_level": reading_level,
                "length": length,
                "audience": audience,
                "release_date": release_date,
                "chapters": chapter_meta,
                "word_count": word_count
            }, f, indent=2, ensure_ascii=False)

        update_library({
            "id": slug,
            "title": title,
            "author": author,
            "path": f"data/books/gutenberg/{slug}",
            "created": release_date or TODAY_ISO,
            "updated": TODAY_ISO,
            "categories": categories,
            "tags": tags,
            "reading_level": reading_level,
            "length": length,
            "audience": audience,
            "language": "en",
            "views": 0,
            "word_count": word_count,
            "chapter_count": len(chapters),
            "source": "Project Gutenberg",
            "license": "Public Domain"
        })

        count += 1
        time.sleep(SLEEP_BETWEEN_BOOKS)
        if count >= LIMIT_PER_RUN:
            break

    if not IS_CI:
        if state["index"] >= len(books):
            if next_page:
                state["page"], state["index"] = next_page, 0
            else:
                state["done"] = True
        save_state(state)

# ======================================================
# ENTRY
# ======================================================

if __name__ == "__main__":
    main()