import requests, json, os, re, time
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE = "https://www.gutenberg.org"
BOOKSHELF = "https://www.gutenberg.org/ebooks/bookshelf/696"
LIMIT_PER_RUN = 3

DATA_DIR = "data/books/gutenberg"
LIBRARY_JSON = "data/library.json"
STATE_FILE = "crawler/state.json"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs("crawler", exist_ok=True)
os.makedirs("data", exist_ok=True)

HEADERS = {"User-Agent": "MyDiary-Gutenberg-Crawler/1.0"}

CHAPTER_RE = re.compile(r'^(BOOK|PART|CHAPTER)\s+([IVXLCDM]+|\d+).*', re.I)

# ------------------------

def slugify(t):
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')

def load_state():
    if not os.path.exists(STATE_FILE):
        return {"page": BOOKSHELF, "index": 0, "done": False}
    return json.load(open(STATE_FILE))

def save_state(s):
    json.dump(s, open(STATE_FILE, "w"), indent=2)

def get_books(page):
    soup = BeautifulSoup(requests.get(page, headers=HEADERS).text, "lxml")
    books = [urljoin(BASE, a["href"]) for a in soup.select("li.booklink a.link")]
    next_page = next((urljoin(BASE, a["href"]) for a in soup.select("a") if a.text.strip().lower()=="next"), None)
    return books, next_page

def get_txt(book_url):
    soup = BeautifulSoup(requests.get(book_url, headers=HEADERS).text, "lxml")
    for a in soup.select("a"):
        if a.get("href","").endswith(".txt.utf-8"):
            return urljoin(BASE, a["href"])
    return None

def clean(text):
    s = text.find("*** START OF THIS PROJECT GUTENBERG EBOOK")
    e = text.find("*** END OF THIS PROJECT GUTENBERG EBOOK")
    return text[s:e] if s!=-1 and e!=-1 else text

def extract_meta(text):
    title, author, year = "Unknown", "Unknown", ""
    for l in text.splitlines()[:200]:
        if l.lower().startswith("title:"):
            title = l.split(":",1)[1].strip()
        if l.lower().startswith("author:"):
            author = l.split(":",1)[1].strip()
        if l.lower().startswith("release date:"):
            year = re.findall(r'\d{4}', l)
            year = year[0] if year else ""
    return title, author, year

def split_chapters(text):
    lines = text.splitlines()
    chapters, current = [], None

    for line in lines:
        if CHAPTER_RE.match(line.strip()):
            if current:
                chapters.append(current)
            current = {"title": line.strip(), "content": []}
        elif current:
            if line.strip():
                current["content"].append(line.strip())

    if current:
        chapters.append(current)
    return chapters

# ------------------------

def update_library(entry):
    data = []
    if os.path.exists(LIBRARY_JSON):
        data = json.load(open(LIBRARY_JSON))

    if not any(b["id"] == entry["id"] for b in data):
        data.append(entry)

    json.dump(sorted(data, key=lambda x: x["title"]), open(LIBRARY_JSON,"w"), indent=2)

# ------------------------

def main():
    state = load_state()
    if state["done"]:
        return

    books, next_page = get_books(state["page"])
    count = 0

    for url in books[state["index"]:]:
        state["index"] += 1
        txt_url = get_txt(url)
        if not txt_url:
            continue

        raw = requests.get(txt_url, headers=HEADERS).text
        text = clean(raw)
        title, author, year = extract_meta(text)
        slug = slugify(title)

        book_dir = f"{DATA_DIR}/{slug}"
        if os.path.exists(book_dir):
            continue

        os.makedirs(book_dir, exist_ok=True)

        chapters = split_chapters(text)
        chapter_meta = []

        for i, ch in enumerate(chapters, 1):
            fname = f"chapter-{i:02d}.json"
            json.dump(
                {"title": ch["title"], "content": ch["content"]},
                open(f"{book_dir}/{fname}", "w", encoding="utf-8"),
                ensure_ascii=False,
                indent=2
            )
            chapter_meta.append({"id": fname[:-5], "title": ch["title"], "file": fname})

        json.dump(
            {"id": slug, "title": title, "author": author, "chapters": chapter_meta},
            open(f"{book_dir}/book.json", "w", encoding="utf-8"),
            ensure_ascii=False,
            indent=2
        )

        update_library({
            "id": slug,
            "title": title,
            "author": author,
            "year": year,
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