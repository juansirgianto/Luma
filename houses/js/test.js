const svg = document.getElementById("map-svg");
const width = window.innerWidth;
const height = window.innerHeight;

// Sesuaikan viewBox agar koordinat SVG = koordinat piksel
svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

const container = document.getElementById("tracking-area");
const cursorInfo = document.getElementById("cursorInfo");
const xLine = document.getElementById("xLine");
const yLine = document.getElementById("yLine");

let lastCopied = ""; // untuk mencegah copy terus-terusan

container.addEventListener("mousemove", (e) => {
  const rect = container.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);

  const coordText = `X: ${x}, Y: ${y}`;
  cursorInfo.innerText = coordText;
  cursorInfo.style.left = `${e.clientX + 15}px`;
  cursorInfo.style.top = `${e.clientY + 15}px`;

  xLine.style.top = `${e.clientY}px`;
  yLine.style.left = `${e.clientX}px`;

  const copyText = `${x},${y}`;
  if (copyText !== lastCopied) {
    navigator.clipboard.writeText(copyText).catch((err) => {
      console.error("Copy failed: ", err);
    });
    lastCopied = copyText;
  }
});
