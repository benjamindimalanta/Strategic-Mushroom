const video = document.getElementById('camera');
const canvas = document.getElementById('snapshot');
const download = document.getElementById('download');
const countdownText = document.createElement('div');
countdownText.id = 'countdown';
document.body.appendChild(countdownText);

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  });

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

      // Take snapshot
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      download.href = canvas.toDataURL('image/png');
    }
  }, 1000);
};
