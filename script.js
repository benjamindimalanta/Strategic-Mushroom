import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCANQvUbZ0xMIyZi3l9RCeuS2pGVEcODDk",
  authDomain: "strategic-mushroom.firebaseapp.com",
  projectId: "strategic-mushroom",
  storageBucket: "strategic-mushroom.appspot.com",
  messagingSenderId: "850022773330",
  appId: "1:850022773330:web:5b6490518c0496b82e258b"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// --- DOM Elements ---
const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const countdown = document.getElementById("countdown");
const frameMsg = document.getElementById("frame-msg");
const download = document.getElementById("download");
const retake = document.getElementById("retake");
const stripBtn = document.getElementById("strip");

let streamHandle = null;

const prompts = [
  "Let's create a memorable picture together.",
  "Capturing 2nd picture.",
  "This is the last take—can't wait to show you the magic."
];

// --- Utility Functions ---
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function flash() {
  document.body.style.backgroundColor = "white";
  setTimeout(() => {
    document.body.style.backgroundColor = "#f4f4f4";
  }, 100);
}

// --- Core Logic ---
function startCamera() {
  return navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    streamHandle = stream;
    video.srcObject = stream;
    video.style.display = "block";
  });
}

function resetUI() {
  stripBtn.style.display = "inline-block";
  download.style.display = "none";
  retake.style.display = "none";
  canvas.style.display = "none";
  video.style.display = "block";
  countdown.textContent = "";
  frameMsg.textContent = "";
}

startCamera().then(resetUI);

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
    snap.getContext("2d").drawImage(video, 0, 0);
    frames.push(snap);

    await delay(800);
  }

  if (streamHandle) {
    streamHandle.getTracks().forEach(track => track.stop());
  }
  video.style.display = "none";

  const strip = buildStrip(frames);
  canvas.width = 1080;
  canvas.height = 1920;
  canvas.getContext("2d").drawImage(strip, 0, 0, 1080, 1920);
  canvas.style.display = "block";

  download.href = canvas.toDataURL("image/png");
  download.style.display = "inline-block";
  retake.style.display = "inline-block";

  await uploadToFirebase(canvas, `strips/strip-${Date.now()}.png`);
};

retake.onclick = async () => {
  await startCamera();
  resetUI();
};

function buildStrip(frames) {
  const w = 1080;
  const h = 1920;
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

  ctx.filter = "none";
  ctx.fillStyle = "#222";
  ctx.textAlign = "center";
  ctx.font = "28px 'Cedarville Cursive', 'Courier New', cursive";

  const quotes = [
    "You're doing amazing—keep going!",
    "Progress is progress, no matter how small.",
    "One snapshot at a time, you're making memories.",
    "Be the reason someone smiles today."
  ];

  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  });

  ctx.fillText(`“${quote}”`, w / 2, h - 80);
  ctx.font = "20px 'Courier New', monospace";
  ctx.fillText(`Dubai, UAE • ${date}`, w / 2, h - 40);

  return strip;
}

async function uploadToFirebase(canvas, path) {
  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, blob);
}
