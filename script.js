const repo = "Play-Pocket/PlayPocket";

async function fetchDownloads() {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
    const data = await res.json();

    let total = 0;
    data.assets.forEach(a => total += a.download_count);

    const el = document.getElementById("count");
    if (el) el.textContent = total;
  } catch {
    const el = document.getElementById("count");
    if (el) el.textContent = "取得失敗";
  }
}

function downloadApp() {
  window.location.href = "https://github.com/Play-Pocket/PlayPocket/releases/latest";
}

fetchDownloads();
