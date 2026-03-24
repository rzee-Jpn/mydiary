import requests, json, os, re, time
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime, UTC

# ======================================================
# CONFIG
# ======================================================

BASE = "https://www.gutenberg.org"
BOOKSHELF = "https://www.gutenberg.org/ebooks/bookshelf/696"

DATA_DIR = "data/books/gutenberg"
LIBRARY_JSON = "data/library.json"
STATE_FILE = "crawler/state.json"

LIMIT_PER_RUN = 3
MIN_CHAPTERS = 3

REQUEST_TIMEOUT = 20
RETRY = 3
SLEEP_BETWEEN_BOOKS = 2

HEADERS = {"User-Agent": "Pustaka-LibraryEngine/4.0"}

TODAY = datetime.now(UTC).strftime("%Y-%m-%d")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs("crawler", exist_ok=True)

# ======================================================
# BASIC UTIL
# ======================================================

def log(*x):
    print("[ENGINE]", *x)

def load_json(path, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except:
        return default

def save_json_atomic(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)

# ======================================================
# NETWORK
# ======================================================

def safe_get(url):
    for _ in range(RETRY):
        try:
            r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            if r.status_code == 200:
                return r
        except:
            pass
        time.sleep(2)
    log("FAILED", url)
    return None

# ======================================================
# STATE (ANTI DUPLICATE CORE)
# ======================================================

def load_state():
    return load_json(STATE_FILE, {
        "seen_ids": []
    })

def save_state(s):
    save_json_atomic(STATE_FILE, s)

# ======================================================
# BOOK LIST
# ======================================================

def get_books(page):
    r = safe_get(page)
    if not r:
        return [], None

    soup = BeautifulSoup(r.text, "html.parser")

    books = [
        urljoin(BASE, a["href"])
        for a in soup.select("li.booklink a.link")
    ]

    next_page = None
    for a in soup.select("a"):
        if a.text.strip().lower() == "next":
            next_page = urljoin(BASE, a["href"])

    return books, next_page

def get_book_id(url):
    return url.rstrip("/").split("/")[-1]

def get_html_url(book_id):
    return f"{BASE}/ebooks/{book_id}.html.images"

# ======================================================
# PARSER
# ======================================================

def parse_html_book(html_url):
    r = safe_get(html_url)
    if not r:
        return None, None, []

    soup = BeautifulSoup(r.text, "html.parser")

    title = soup.find("h1")
    title = title.get_text(strip=True) if title else "Unknown"

    author = "Unknown"
    meta = soup.find("meta", attrs={"name":"author"})
    if meta:
        author = meta.get("content","Unknown")

    body = soup.find("body")
    if not body:
        return title, author, []

    chapters = []
    current = None

    for el in body.find_all(["h2","h3","p"]):
        if el.name in ("h2","h3"):
            if current and current["html"]:
                chapters.append(current)
            current = {"title": el.get_text(strip=True), "html": ""}
        elif current:
            current["html"] += f"<p>{el.decode_contents()}</p>\n"

    if current and current["html"]:
        chapters.append(current)

    if len(chapters) < MIN_CHAPTERS:
        return title, author, []

    return title, author, chapters

# ======================================================
# WORD COUNT
# ======================================================

def count_words(chapters):
    total = 0
    for ch in chapters:
        txt = BeautifulSoup(ch["html"], "html.parser").get_text(" ")
        total += len(txt.split())
    return total

# ======================================================
# LIBRARY
# ======================================================

def update_library(entry):
    data = load_json(LIBRARY_JSON, [])

    for i,b in enumerate(data):
        if b["id"] == entry["id"]:
            data[i].update(entry)
            save_json_atomic(LIBRARY_JSON, data)
            return

    data.append(entry)
    data.sort(key=lambda x:x.get("created","1970"), reverse=True)
    save_json_atomic(LIBRARY_JSON, data)

# ======================================================
# ENGINE
# ======================================================

def process_book(book_id):

    title, author, chapters = parse_html_book(
        get_html_url(book_id)
    )

    if not chapters:
        log("SKIP (bad html)", book_id)
        return False

    # ✅ ID FIX (STABLE)
    engine_id = book_id

    book_dir = f"{DATA_DIR}/{engine_id}"
    chap_dir = f"{book_dir}/chapters"
    os.makedirs(chap_dir, exist_ok=True)

    chapter_meta = []

    for i, ch in enumerate(chapters, 1):
        fname = f"ch{i:02d}.html"
        path = f"{chap_dir}/{fname}"

        if not os.path.exists(path):
            with open(path, "w", encoding="utf-8") as f:
                f.write(f"<h2>{ch['title']}</h2>\n{ch['html']}")

        chapter_meta.append({
            "id": f"ch{i:02d}",
            "title": ch["title"],
            "file": f"chapters/{fname}"
        })

    word_count = count_words(chapters)

    save_json_atomic(f"{book_dir}/book.json", {
        "id": engine_id,
        "title": title,
        "author": author,
        "word_count": word_count,
        "chapters": chapter_meta,
        "updated": TODAY
    })

    update_library({
        "id": engine_id,
        "title": title,
        "author": author,
        "path": book_dir,
        "chapter_count": len(chapters),
        "updated": TODAY,
        "source": "Project Gutenberg"
    })

    log("DONE", engine_id)
    return True

# ======================================================
# MAIN (ANTI DUPLICATE LOGIC)
# ======================================================

def main():
    state = load_state()
    seen = set(state["seen_ids"])

    page = BOOKSHELF
    processed = 0

    while page and processed < LIMIT_PER_RUN:
        books, next_page = get_books(page)

        for url in books:
            book_id = get_book_id(url)

            # ✅ SKIP kalau sudah pernah
            if book_id in seen:
                continue

            try:
                ok = process_book(book_id)
                seen.add(book_id)

                if ok:
                    processed += 1
                    time.sleep(SLEEP_BETWEEN_BOOKS)

            except Exception as e:
                log("ERROR", e)

            if processed >= LIMIT_PER_RUN:
                break

        page = next_page

    # simpan state
    state["seen_ids"] = list(seen)
    save_state(state)

# ======================================================

if __name__ == "__main__":
    main()