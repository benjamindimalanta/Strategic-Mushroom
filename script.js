// Firebase modules (loaded via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

// ✅ Your Firebase config (replace with your actual values)
const firebaseConfig = {
  apiKey: "AIzaSyCANQvUbZ0xMIyZi3l9RCeuS2pGVEcODDk",
  authDomain: "strategic-mushroom.firebaseapp.com",
  projectId: "strategic-mushroom",
  storageBucket: "strategic-mushroom.appspot.com",
  messagingSenderId: "850022773330",
  appId: "1:850022773330:web:5b6490518c0496b82e258b",
  measurementId: "G-DBRZSWJ2L3"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// 🌐 DOM Elements
const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const download = document.getElementById("download");

// ⏳ Countdown overlay setup
const countdownText = document.createElement("div");
countdownText.id = "countdown";
document.body.appendChild(countdownText);

// 🎥 Start webcam stream
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
}).catch((err) => {
  alert("Camera access denied or unavailable.");
  console.error(err);
});

// 📸 Take photo + upload
document.getElementById("snap").onclick = () => {
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

      // ⚡ Flash effect
      document.body.style.backgroundColor = "white";
      setTimeout(() => {
        document.body.style.backgroundColor = "#f4f4f4";
      }, 100);

      // 🖼️ Draw to canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      // 💾 Generate download link
      download.href = canvas.toDataURL("image/png");

      // ☁️ Upload to Firebase
      canvas.toBlob(async (blob) => {
        const timestamp = Date.now();
        const fileName = `photos/photo-${timestamp}.png`;
        const storageRef = ref(storage, fileName);

        try {
          await uploadBytes(storageRef, blob);
          alert("✅ Photo uploaded to Firebase!");
        } catch (err) {
          console.error("Upload failed:", err);
          alert("❌ Upload failed. Please try again.");
        }
      }, "image/png");
    }
  }, 1000);
};
