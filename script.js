const repo = "Play-Pocket/PlayPocket";

async function fetchDownloads() {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
    const data = await res.json();

    let total = 0;
    data.assets.forEach(asset => {
      total += asset.download_count;
    });

    document.getElementById("count").textContent = total;
  } catch (e) {
    document.getElementById("count").textContent = "取得失敗";
  }
}

fetchDownloads();
