import { bands } from "./data/index.js";

const bandList = document.querySelector("#band-list ul");
const title = document.querySelector("#content-title");
const body = document.querySelector("#content-body");

// render daftar band
bands.forEach(band => {
  const li = document.createElement("li");
  li.textContent = band.name;
  li.onclick = () => loadBand(band);
  bandList.appendChild(li);
});

async function loadBand(band) {
  title.textContent = band.name;
  body.innerHTML = "Loading lagu...";

  const module = await import(`./data/${band.file}`);
  const songs = module.songs;

  body.innerHTML = "";
  songs.forEach(song => {
    const div = document.createElement("div");
    div.className = "song";
    div.textContent = "🎵 " + song.title;
    div.onclick = () => showSong(song);
    body.appendChild(div);
  });
}

function showSong(song) {
  title.textContent = song.title;
  body.innerHTML = `<pre>${song.body}</pre>`;
}