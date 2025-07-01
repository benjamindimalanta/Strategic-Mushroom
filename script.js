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
  const outerPadding = 20;
  const canvasBorder = 2;

  canvas.width = frameW + outerPadding * 2;
  canvas.height = frameH * 3 + spacing * 2 + footerHeight + outerPadding * 2;
  context.clearRect(0, 0, canvas.width, canvas.height);

  frames.forEach((frame, i) => {
    const x = outerPadding;
    const y = outerPadding + i * (frameH + spacing);
    const radius = 20;

    context.save();
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + frameW - radius, y);
    context.quadraticCurveTo(x + frameW, y, x + frameW, y + radius);
    context.lineTo(x + frameW, y + frameH - radius);
    context.quadraticCurveTo(x + frameW, y + frameH, x + frameW - radius, y + frameH);
    context.lineTo(x + radius, y + frameH);
    context.quadraticCurveTo(x, y + frameH, x, y + frameH - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.clip();

    context.drawImage(frame, x, y, frameW, frameH);
    context.restore();
  });

  // Draw footer background
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const now = new Date().toLocaleDateString();
  const location = "Dubai, U.A.E";

  const footerY = canvas.height - footerHeight - outerPadding;
  context.fillStyle = "#ffffff";
  context.fillRect(outerPadding, footerY, canvas.width - outerPadding * 2, footerHeight);

  // Draw footer text lines
  context.fillStyle = "#333";
  context.font = "20px 'Cedarville Cursive', cursive";
  context.textAlign = "center";
  context.textBaseline = "middle";

  const lineHeight = 24; // ⬅️ bump this up from 20 or 22 to give breathing room
  context.fillText(quote, canvas.width / 2, footerY + lineHeight);
  context.fillText(now, canvas.width / 2, footerY + lineHeight * 2);
  context.fillText(location, canvas.width / 2, footerY + lineHeight * 3);


  // Draw outer border
  context.strokeStyle = "#999";
  context.lineWidth = canvasBorder;
  context.strokeRect(0, 0, canvas.width, canvas.height);

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
