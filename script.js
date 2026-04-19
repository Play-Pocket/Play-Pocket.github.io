const repo = "Play-Pocket/PlayPocket";
const releaseApiUrl = `https://api.github.com/repos/${repo}/releases/latest`;

const CACHE_KEY = "playpocket_release_cache_v1";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1時間
const COUNT_CACHE_KEY = "playpocket_download_count_cache_v1";
const COUNT_TTL_MS = 60 * 60 * 1000; // 1時間

let releaseData = null;

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function getCachedJson(key, ttlMs) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!Number.isFinite(parsed.time) || Date.now() - parsed.time > ttlMs) return null;

    return parsed.value ?? null;
  } catch {
    return null;
  }
}

function setCachedJson(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        time: Date.now(),
        value,
      })
    );
  } catch {
    // 保存失敗時は無視
  }
}

function detectOS() {
  const ua = (navigator.userAgent || "").toLowerCase();

  if (ua.includes("android")) return "Android";
  if (ua.includes("windows")) return "Windows";
  return "Other";
}

function normalizeReleaseData(data) {
  const assets = Array.isArray(data?.assets) ? data.assets : [];
  const tagName = typeof data?.tag_name === "string" && data.tag_name.trim()
    ? data.tag_name.trim()
    : "v1.1.0";

  const windowsAsset =
    assets.find((a) => /windows|setup.*exe|\.exe$/i.test(String(a?.name || ""))) || null;

  const androidAsset =
    assets.find((a) => /android|\.apk$/i.test(String(a?.name || ""))) || null;

  const downloadCount = assets.reduce((sum, asset) => {
    const n = Number(asset?.download_count);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return {
    tagName,
    htmlUrl: typeof data?.html_url === "string" ? data.html_url : `https://github.com/${repo}/releases/latest`,
    windowsUrl: typeof windowsAsset?.browser_download_url === "string" ? windowsAsset.browser_download_url : null,
    androidUrl: typeof androidAsset?.browser_download_url === "string" ? androidAsset.browser_download_url : null,
    downloadCount,
    releaseName: typeof data?.name === "string" && data.name.trim() ? data.name.trim() : tagName,
    body: typeof data?.body === "string" ? data.body : "",
  };
}

async function fetchLatestRelease() {
  const cached = getCachedJson(CACHE_KEY, CACHE_TTL_MS);
  if (cached) {
    releaseData = cached;
    return cached;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(releaseApiUrl, {
      headers: {
        Accept: "application/vnd.github+json",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = normalizeReleaseData(await res.json());
    setCachedJson(CACHE_KEY, data);
    releaseData = data;
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchDownloads() {
  const countEl = document.getElementById("count");
  if (!countEl) return;

  const cachedCount = getCachedJson(COUNT_CACHE_KEY, COUNT_TTL_MS);
  if (Number.isFinite(cachedCount)) {
    countEl.textContent = String(cachedCount);
    return;
  }

  try {
    const release = releaseData || await fetchLatestRelease();
    const total = Number.isFinite(release?.downloadCount) ? release.downloadCount : 0;

    countEl.textContent = String(total);
    setCachedJson(COUNT_CACHE_KEY, total);
  } catch (err) {
    console.error(err);
    countEl.textContent = "取得失敗";
  }
}

function setupDownloadButtons() {
  const os = detectOS();
  const winBtn = document.getElementById("winBtn");
  const androidBtn = document.getElementById("androidBtn");
  const osText = document.getElementById("osText");

  if (!winBtn || !androidBtn) return;

  winBtn.style.display = "none";
  androidBtn.style.display = "none";

  const recommended =
    os === "Windows" ? "Windows版がおすすめです"
    : os === "Android" ? "Android版がおすすめです"
    : "お使いの環境に合わせて選べます";

  if (os === "Windows") {
    winBtn.style.display = "inline-flex";
    androidBtn.style.display = "inline-flex";
    setText("osText", `あなたのOS: Windows / ${recommended}`);
  } else if (os === "Android") {
    androidBtn.style.display = "inline-flex";
    winBtn.style.display = "inline-flex";
    setText("osText", `あなたのOS: Android / ${recommended}`);
  } else {
    winBtn.style.display = "inline-flex";
    androidBtn.style.display = "inline-flex";
    setText("osText", "OSを判別できませんでした（両方表示）");
  }

  if (osText) osText.hidden = false;
}

async function downloadWindows() {
  try {
    const release = releaseData || await fetchLatestRelease();
    const url = release?.windowsUrl;

    if (url) {
      window.location.href = url;
      return;
    }

    window.location.href = `https://github.com/${repo}/releases/latest`;
  } catch {
    window.location.href = `https://github.com/${repo}/releases/latest`;
  }
}

async function downloadAndroid() {
  try {
    const release = releaseData || await fetchLatestRelease();
    const url = release?.androidUrl;

    if (url) {
      window.location.href = url;
      return;
    }

    window.location.href = `https://github.com/${repo}/releases/latest`;
  } catch {
    window.location.href = `https://github.com/${repo}/releases/latest`;
  }
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

document.addEventListener("DOMContentLoaded", async () => {
  setupDownloadButtons();
  setupReveal();
  await fetchLatestRelease();
  await fetchDownloads();
});
