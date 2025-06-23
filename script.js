const video = document.getElementById('camera');
const canvas = document.getElementById('snapshot');
const download = document.getElementById('download');

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  });

document.getElementById('snap').onclick = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  download.href = canvas.toDataURL('image/png');
};

