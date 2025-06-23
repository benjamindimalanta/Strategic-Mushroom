import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

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

const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const countdown = document.getElementById("countdown");
const frameMsg = document.getElementById("frame-msg");
const buttons = document.getElementById("buttons");
const download = document.getElementById("download");
const retake = document.getElementById("retake");
const stripBtn = document.getElementById("strip");

let streamHandle = null;

const prompts = [
  "Let's create a memorable picture together.",
  "Capturing 2nd picture.",
  "This is the last take—can't wait to show you the magic."
];

function startCamera() {
  return navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    streamHandle = stream;
    video.srcObject = stream;
    video.style.display = "block";
  });
}

startCamera();

stripBtn.onclick = async () => {
  stripBtn.style.display = "none";
  download.style.display = "none";
  retake.style.display = "none";
  canvas.style.display = "none";

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
  retake.style.display = "none";
  download.style.display = "none";
  canvas.style.display = "none";
  frameMsg.textContent = "";
  countdown.textContent = "";

  await startCamera();
  video.style.display = "block";
  stripBtn.style.display = "inline-block";
};

function buildStrip(frames) {
  const w = 1080;
  const h = 1920;
  const strip = document.createElement("canvas");
  strip.width = w;
  strip.height = h;
  const ctx = strip.getContext("2d");

  ctx
