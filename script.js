// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCANQvUbZ0xMIyZi3l9RCeuS2pGVEcODDk",
  authDomain: "strategic-mushroom.firebaseapp.com",
  projectId: "strategic-mushroom",
  storageBucket: "strategic-mushroom.appspot.com",
  messagingSenderId: "850022773330",
  appId: "1:850022773330:web:5b6490518c0496b82e258b",
  measurementId: "G-DBRZSWJ2L3"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// DOM elements
const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const download = document.getElementById("download");

// Countdown overlay
const countdownText = document.createElement("div");
countdownText.id = "countdown";
document.body.appendChild(countdownText);

// Start camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => {
    alert("Camera access denied or unavailable.");
    console.error(err);
  });

// Single photo snap
document.getElementById("snap").onclick = () => {
  runCountdown(() => {
    flash();
    captureToCanvas(canvas);
    download.href = canvas.toDataURL("image/png");
    uploadToFirebase(canvas, `photos/photo-${Date.now()}.png`);
  });
};

// Photo strip button logic
document.getElementById("strip").onclick = async () => {
  const frames = [];

  for (let i = 0; i < 3; i++) {
    await runCountdown();
    flash();
    const shot = captureToTempCanvas();
    frames.push(shot);
    await wait(1000);
  }

  const finalStrip = renderStrip(frames);
  canvas.width = finalStrip.width;
  canvas.height = finalStrip.height;
  canvas.getContext("2d").drawImage(finalStrip, 0, 0);

  download.href = canvas.toDataURL("image/png");
  uploadToFirebase(canvas, `strips/strip-${Date.now()}.png`);
};

// Countdown helper
function runCountdown(callback) {
  return new Promise(resolve => {
    let count = 3;
    countdownText.textContent = count;
    countdownText.style.display = "block";

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownText.textContent = count;
      } else {
        clearInterval(interval);
        countdownText.style.display = "none";
        if (callback) callback();
        resolve();
      }
    }, 1000);
  });
}

// Flash effect
function flash() {
  document.body.style.backgroundColor = "white";
  setTimeout(() => {
    document.body.style.backgroundColor = "#f4f4f4";
  }, 100);
}

// Capture snapshot
function captureToCanvas(destCanvas) {
  destCanvas.width = video.videoWidth;
  destCanvas.height = video.videoHeight;
  const ctx = destCanvas.getContext("2d");
  ctx.drawImage(video, 0, 0);
}

// Capture to memory canvas
function captureToTempCanvas() {
  const c = document.createElement("canvas");
  c.width = video.videoWidth;
  c.height = video.videoHeight;
  c.getContext("2d").drawImage(video, 0, 0);
  return c;
}

// Render strip with vintage style
function renderStrip(frames) {
  const padding = 20;
  const footerHeight = 80;
  const width = frames[0].width;
  const height = frames.reduce((sum, f) => sum + f.height, 0) + padding * 2 + footerHeight;

  const strip = document.createElement("canvas");
  strip.width = width;
  strip.height = height;
  const ctx = strip.getContext("2d");

  // Background
  ctx.fillStyle = "#f9f2e7";
  ctx.fillRect(0, 0, width, height);

  // Add photos
  let y = padding;
  frames.forEach(f => {
    ctx.filter = "sepia(0.6) contrast(1.05) brightness(0.95)";
    ctx.drawImage(f, 0, y);
    y += f.height;
  });

  // Add quote and footer
  const messages = [
    "Be the reason someone smiles today.",
    "You're doing amazing—keep going!",
    "One snapshot at a time, you're making memories.",
    "Progress is progress, no matter how small.",
    "Shine in your own light ☀️"
  ];
  const quote = messages[Math.floor(Math.random() * messages.length)];
  const location = "Dubai, UAE";
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  ctx.filter = "none";
  ctx.fillStyle = "#444";
  ctx.textAlign = "center";
  ctx.font = "20px sans-serif";
  ctx.fillText(`“${quote}”`, width / 2, y + 30);
  ctx.font = "16px sans-serif";
  ctx.fillText(`${location} • ${date}`, width / 2, y + 55);

  return strip;
}

// Upload helper
function uploadToFirebase(canvas, filename) {
  canvas.toBlob(async (blob) => {
    const refPath = ref(storage, filename);
    try {
      await uploadBytes(refPath, blob);
      alert("✅ Uploaded to Firebase!");
    } catch (err) {
      alert("❌ Upload failed.");
      console.error(err);
    }
  }, "image/png");
}

// Delay helper
function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}
