/**
 * AUTO GENERATE LIBRARY.JSON
 * Folder = sumber data
 * Cocok untuk GitHub Pages (tanpa backend)
 */

const fs = require("fs");
const path = require("path");

const BOOKS_DIR = path.join(__dirname, "data/books");
const OUTPUT_FILE = path.join(__dirname, "data/library.json");

const library = [];

if (!fs.existsSync(BOOKS_DIR)) {
  console.error("❌ Folder data/books tidak ditemukan");
  process.exit(1);
}

const folders = fs.readdirSync(BOOKS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory());

folders.forEach(folder => {
  const id = folder.name;
  const bookPath = path.join(BOOKS_DIR, id, "book.json");

  if (!fs.existsSync(bookPath)) {
    console.warn(`⚠️  book.json tidak ditemukan: ${id}`);
    return;
  }

  try {
    const book = JSON.parse(fs.readFileSync(bookPath, "utf8"));

    library.push({
      id,
      title: book.title || id,
      author: book.author || "",
      year: book.year || "",
      cover: book.cover || "cover.jpg",
      language: book.language || "",
      tags: book.tags || []
    });

  } catch (err) {
    console.error(`❌ Error parsing book.json: ${id}`, err.message);
  }
});

/**
 * Sort otomatis A–Z (judul)
 */
library.sort((a, b) => a.title.localeCompare(b.title));

/**
 * Tulis output
 */
fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(library, null, 2),
  "utf8"
);

console.log(`✅ library.json dibuat (${library.length} buku)`);