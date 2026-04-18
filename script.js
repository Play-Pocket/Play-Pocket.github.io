const repo = "Play-Pocket/PlayPocket";
const releaseUrl = `https://api.github.com/repos/${repo}/releases/latest`;

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

async function fetchDownloads() {
  const el = document.getElementById("count");

  try {
    const res = await fetch(releaseUrl, {
      headers: {
        "Accept": "application/vnd.github+json"
      }
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    const assets = Array.isArray(data.assets) ? data.assets : [];

    const total = assets.reduce((sum, a) => {
      const n = Number(a?.download_count);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);

    if (el) el.textContent = String(total);
  } catch (err) {
    if (el) el.textContent = "取得失敗";
    console.error(err);
  }
}

function detectOS() {
  const ua = navigator.userAgent || "";

  if (/android/i.test(ua)) return "Android";
  if (/windows/i.test(ua)) return "Windows";
  return "Other";
}

function setupDownloadButton() {
  const os = detectOS();
  const winBtn = document.getElementById("winBtn");
  const androidBtn = document.getElementById("androidBtn");

  if (!winBtn || !androidBtn) return;

  winBtn.style.display = "none";
  androidBtn.style.display = "none";

  if (os === "Windows") {
    winBtn.style.display = "inline-flex";
  } else if (os === "Android") {
    androidBtn.style.display = "inline-flex";
  } else {
    winBtn.style.display = "inline-flex";
    androidBtn.style.display = "inline-flex";
  }
}

function downloadWindows() {
  window.location.href = "https://github.com/Play-Pocket/PlayPocket/releases/download/v1.1.0/PlayPocket-Setup-1.1.0-Windows.exe";
}

function downloadAndroid() {
  window.location.href = "https://github.com/Play-Pocket/PlayPocket/releases/download/v1.1.0/PlayPocket-Setup-1.1.0-Android.apk";
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach(el => el.classList.add("show"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  items.forEach(el => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  fetchDownloads();
  setupDownloadButton();
  setupReveal();
});
