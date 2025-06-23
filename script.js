// Camera elements
const video = document.getElementById('camera');
const canvas = document.getElementById('snapshot');
const download = document.getElementById('download');

// Countdown overlay
const countdownText = document.createElement('div');
countdownText.id = 'countdown';
document.body.appendChild(countdownText);

// Start video stream
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Snap logic with countdown and upload
document.getElementById('snap').onclick = () => {
  let count = 3;
  countdownText.textContent = count;
  countdownText.style.display = 'block';

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownText.textContent = count;
    } else {
      clearInterval(interval);
      countdownText.style.display = 'none';

      // Flash effect
      document.body.style.backgroundColor = 'white';
      setTimeout(() => {
        document.body.style.backgroundColor = '#f4f4f4';
      }, 100);

      // Capture photo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      download.href = canvas.toDataURL('image/png');

      // Upload to Firebase
      canvas.toBlob(async (blob) => {
        const fileName = `photos/photo-${Date.now()}.png`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, blob);
        alert("Photo uploaded to Firebase!");
      });
    }
  }, 1000);
};
