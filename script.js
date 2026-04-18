const repo = "Play-Pocket/PlayPocket";
const releaseTag = "v1.1.0";
const releaseBaseUrl = `https://github.com/Play-Pocket/PlayPocket/releases/download/${releaseTag}`;
const releaseUrl = `https://api.github.com/repos/${repo}/releases/latest`;

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

async function fetchDownloads() {
  const el = document.getElementById("count");
  if (!el) return;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(releaseUrl, {
      headers: {
        Accept: "application/vnd.github+json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    const assets = Array.isArray(data.assets) ? data.assets : [];

    const total = assets.reduce((sum, asset) => {
      const n = Number(asset?.download_count);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);

    el.textContent = String(total);
  } catch (err) {
    console.error(err);
    el.textContent = "取得失敗";
  }
}

function detectOS() {
  const ua = (navigator.userAgent || "").toLowerCase();

  if (ua.includes("android")) return "Android";
  if (ua.includes("windows")) return "Windows";
  return "Other";
}

function setupDownloadButtons() {
  const os = detectOS();
  const winBtn = document.getElementById("winBtn");
  const androidBtn = document.getElementById("androidBtn");
  const osText = document.getElementById("osText");

  if (!winBtn || !androidBtn) return;

  winBtn.style.display = "none";
  androidBtn.style.display = "none";

  if (os === "Windows") {
    winBtn.style.display = "inline-flex";
    setText("osText", "あなたのOS: Windows");
  } else if (os === "Android") {
    androidBtn.style.display = "inline-flex";
    setText("osText", "あなたのOS: Android");
  } else {
    winBtn.style.display = "inline-flex";
    androidBtn.style.display = "inline-flex";
    setText("osText", "OSを判別できませんでした（すべて表示）");
  }

  if (osText) osText.hidden = false;
}

function downloadWindows() {
  window.location.href = `${releaseBaseUrl}/PlayPocket-Setup-1.1.0-Windows.exe`;
}

function downloadAndroid() {
  window.location.href = `${releaseBaseUrl}/PlayPocket-Setup-1.1.0-Android.apk`;
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("show"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  fetchDownloads();
  setupDownloadButtons();
  setupReveal();
});
