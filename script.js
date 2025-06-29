// DOM References
const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const countdown = document.getElementById("countdown");
const frameMsg = document.getElementById("frame-msg");
const download = document.getElementById("download");
const retake = document.getElementById("retake");
const stripBtn = document.getElementById("strip");
const context = canvas.getContext("2d");
let streamHandle = null;

const cameraSection = document.getElementById("camera-section");
const outputSection = document.getElementById("output-section");

const prompts = [
  "Let's create a memorable picture together.",
  "Capturing 2nd picture...",
  "This is the last take — can’t wait to show you the magic!"
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function flash() {
  document.body.style.backgroundColor = "white";
  setTimeout(() => {
    document.body.style.backgroundColor = "#f4f4f4";
  }, 100);
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    streamHandle = stream;
    await video.play();
  } catch (err) {
    console.error("Camera error:", err);
  }
}

function resetUI() {
  stripBtn.style.display = "inline-block";
  download.style.display = "none";
  retake.style.display = "none";
  canvas.style.display = "none";
  video.style.display = "block";
  countdown.textContent = "";
  frameMsg.textContent = "";
  cameraSection.style.display = "block";
  outputSection.style.display = "none";
}

stripBtn.onclick = async () => {
  resetUI();
  stripBtn.style.display = "none";
  const frames = [];

  for (let i = 0; i < 3; i++) {
    countdown.textContent = "3";
    frameMsg.textContent = prompts[i];
    await delay(1000);
    countdown.textContent = "2";
    await delay(1000);
    countdown.textContent = "1";
    await delay(1000);
    countdown.textContent = "";
    frameMsg.textContent = "";
    flash();

    const snap = document.createElement("canvas");
    snap.width = video.videoWidth;
    snap.height = video.videoHeight;
    const ctx = snap.getContext("2d");
    ctx.drawImage(video, 0, 0, snap.width, snap.height);
    frames.push(snap);
    await delay(800);
  }

  if (streamHandle) {
    streamHandle.getTracks().forEach(track => track.stop());
  }

  video.style.display = "none";
  cameraSection.style.display = "none";
  outputSection.style.display = "block";

  const strip = buildStrip(frames);
  canvas.width = 1080;
  canvas.height = 1920;
  context.drawImage(strip, 0, 0, canvas.width, canvas.height);
  canvas.style.display = "block";

  canvas.scrollIntoView({ behavior: "smooth", block: "start" });
  download.href = canvas.toDataURL("image/png");
  download.download = `photostrip-${Date.now()}.png`;
  download.style.display = "inline-block";
  retake.style.display = "inline-block";
};

retake.onclick = async () => {
  await startCamera();
  resetUI();
};

function buildStrip(frames) {
  const w = 1080, h = 1920;
  const strip = document.createElement("canvas");
  strip.width = w;
  strip.height = h;
  const ctx = strip.getContext("2d");

  ctx.fillStyle = "#f9f2e7";
  ctx.fillRect(0, 0, w, h);

  const frameW = 600;
  const frameH = Math.floor(frameW * (frames[0].height / frames[0].width));
  const spacing = 40;
  const totalPhotoH = frameH * 3 + spacing * 2;
  const startY = Math.floor((h - totalPhotoH - 140) / 2);

  ctx.filter = "sepia(0.6) contrast(1.05) brightness(0.95)";
  frames.forEach((f, i) => {
    const y = startY + i * (frameH + spacing);
    ctx.drawImage(f, (w - frameW) / 2, y, frameW, frameH);
  });

  ctx.filter = "none
