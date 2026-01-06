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

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs("crawler", exist_ok=True)
os.makedirs("data", exist_ok=True)

# ======================================================
# UTIL
# ======================================================

def slugify(t):
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')

def load_state():
    if not os.path.exists(STATE_FILE):
        return {"page": BOOKSHELF, "index": 0, "done": False}
    return json.load(open(STATE_FILE, encoding="utf-8"))

def save_state(s):
    json.dump(s, open(STATE_FILE, "w", encoding="utf-8"), indent=2)

# ======================================================
# SCRAPER
# ======================================================

def get_books(page):
    soup = BeautifulSoup(requests.get(page, headers=HEADERS).text, "lxml")
    books = [urljoin(BASE, a["href"]) for a in soup.select("li.booklink a.link")]
    next_page = next(
        (urljoin(BASE, a["href"]) for a in soup.select("a")
         if a.text.strip().lower() == "next"),
        None
    )
    return books, next_page

def get_html_url(book_url):
    book_id = book_url.rstrip("/").split("/")[-1]
    return f"https://www.gutenberg.org/ebooks/{book_id}.html.images"

def parse_html_book(html_url):
    r = requests.get(html_url, headers=HEADERS)
    if r.status_code != 200:
        return None, None, []

    soup = BeautifulSoup(r.text, "lxml")

    title_tag = soup.find("h1")
    title = title_tag.get_text(strip=True) if title_tag else "Unknown"

    author = "Unknown"
    for meta in soup.select("meta"):
        if meta.get("name", "").lower() == "author":
            author = meta.get("content", "Unknown")

    body = soup.find("body")
    chapters = []
    current = None

    for el in body.children:
        if not getattr(el, "name", None):
            continue

        if el.name in ["h2", "h3"]:
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

    return title, author, chapters

# ======================================================
# LIBRARY
# ======================================================

def update_library(entry):
    data = []
    if os.path.exists(LIBRARY_JSON):
        data = json.load(open(LIBRARY_JSON, encoding="utf-8"))

    if not any(b["id"] == entry["id"] for b in data):
        data.append(entry)

    json.dump(
        sorted(data, key=lambda x: x["title"]),
        open(LIBRARY_JSON, "w", encoding="utf-8"),
        indent=2,
        ensure_ascii=False
    )

# ======================================================
# MAIN
# ======================================================

def main():
    state = load_state()
    if state["done"]:
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
            # skip TOC
            if "contents" in ch["title"].lower():
                continue

            fname = f"ch{i:02d}.html"

            with open(f"{chapters_dir}/{fname}", "w", encoding="utf-8") as f:
                f.write(f"<h2>{ch['title']}</h2>\n")
                f.write(ch["html"])

            chapter_meta.append({
                "id": f"ch{i:02d}",
                "title": ch["title"],
                "file": f"chapters/{fname}"
            })

        json.dump(
            {
                "id": slug,
                "title": title,
                "author": author,
                "chapters": chapter_meta
            },
            open(f"{book_dir}/book.json", "w", encoding="utf-8"),
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
        time.sleep(2)
        if count >= LIMIT_PER_RUN:
            break

    if state["index"] >= len(books):
        if next_page:
            state["page"] = next_page
            state["index"] = 0
        else:
            state["done"] = True

    save_state(state)

if __name__ == "__main__":
    main()