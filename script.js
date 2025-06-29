const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const countdown = document.getElementById("countdown");
const frameMsg = document.getElementById("frame-msg");
const download = document.getElementById("download");
const retake = document.getElementById("retake");
const stripBtn = document.getElementById("strip");
const cameraSection = document.getElementById("camera-section");
const outputSection = document.getElementById("output-section");
const loader = document.getElementById("loader");
const context = canvas.getContext("2d");

let streamHandle = null;

const prompts = [
  "Smile! Let's start 📸",
  "Second snap coming...",
  "Last one — say cheese!"
];

const quotes = [
  "Collect moments, not things.",
  "Life is made of small moments like this.",
  "You’ll never regret capturing a smile.",
  "Photos are the return ticket to a moment otherwise gone.",
  "This moment will never happen again. Cherish it."
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function flash() {
  document.body.style.backgroundColor = "#fff";
  setTimeout(() => document.body.style.backgroundColor = "#f4f4f4", 100);
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    streamHandle = stream;
    await video.play();
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      await new Promise(res => video.onloadedmetadata = res);
    }
    loader.style.display = "none";
  } catch (err) {
    alert("Camera access failed: " + err.message);
  }
}

function resetUI() {
  stripBtn.style.display = "inline-block";
  download.style.display = "none";
  retake.style.display = "none";
  canvas.classList.remove("show");
  canvas.style.display = "none";
  video.style.display = "block";
  countdown.textContent = "";
  frameMsg.textContent = "";
  cameraSection.style.display = "flex";
  outputSection.style.display = "none";
}

stripBtn.onclick = async () => {
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    alert("Camera not ready yet. Please wait a moment and try again.");
    return;
  }

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

  if (streamHandle) streamHandle.getTracks().forEach(track => track.stop());

  video.style.display = "none";
  cameraSection.style.display = "none";
  outputSection.style.display = "block";

  const frameW = frames[0].width;
  const frameH = frames[0].height;
  const spacing = 20;
  const footerHeight = 100;

  canvas.width = frameW;
  canvas.height = frameH * 3 + spacing * 2 + footerHeight;
  context.clearRect(0, 0, canvas.width, canvas.height);

  frames.forEach((frame, i) => {
    const y = i * (frameH + spacing);
    context.drawImage(frame, 0, y, frameW, frameH);
  });

  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const now = new Date().toLocaleDateString();
  const footerText = `${quote} — ${now}, Dubai, U.A.E`;

  context.fillStyle = "#ffffff";
  context.fillRect(0, canvas.height - footerHeight, canvas.width, footerHeight);

  context.fillStyle = "#333";
  context.font = "18px sans-serif";
  context.textAlign = "center";
  context.fillText(footerText, canvas.width / 2, canvas.height - footerHeight / 2 + 6);

  canvas.classList.add("show");
  canvas.style.display = "block";

  download.href = canvas.toDataURL("image/png");
  download.download = `photostrip-${Date.now()}.png`;
  download.style.display = "inline-block";
  retake.style.display = "inline-block";
};

retake.onclick = async () => {
  await startCamera();
  resetUI();
};

startCamera();
