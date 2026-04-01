let count = localStorage.getItem("downloads") || 0;
document.getElementById("count").textContent = count;

function downloadApp() {
  count++;
  localStorage.setItem("downloads", count);
  document.getElementById("count").textContent = count;
  window.location.href = "https://github.com/Play-Pocket/PlayPocket/releases/latest";
}
