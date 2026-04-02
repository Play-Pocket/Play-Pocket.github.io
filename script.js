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

function detectOS() {
  const ua = navigator.userAgent;

  if (/android/i.test(ua)) return "Android";
  if (/windows/i.test(ua)) return "Windows";
  return "Other";
}

function setupDownloadButton() {
  const os = detectOS();

  const winBtn = document.getElementById("winBtn");
  const androidBtn = document.getElementById("androidBtn");

  if (os === "Windows") {
    winBtn.style.display = "inline-block";
  } else if (os === "Android") {
    androidBtn.style.display = "inline-block";
  } else {
    winBtn.style.display = "inline-block";
    androidBtn.style.display = "inline-block";
  }
}

function downloadWindows() {
  window.location.href = "https://github.com/Play-Pocket/PlayPocket/releases/download/v1.0.1/Play-Pocket-Setup-1.0.1.exe";
}

function downloadAndroid() {
  window.location.href = "https://github.com/Play-Pocket/PlayPocket/releases/download/v1.0.1/PlayPocket-Setup-1.0.1.apk";
}

fetchDownloads();
window.onload = setupDownloadButton;
