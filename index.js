var audioContext = new window.AudioContext();
var analyser = audioContext.createAnalyser();
analyser.smoothingTimeConstant = 0.1;
analyser.fftSize = 1024;
var source, dataArray, bufferLength;
var scene = document.getElementById('scene');
var WIDTH = scene.width;
var HEIGHT = scene.height;
var canvasCtx = scene.getContext('2d');

document.addEventListener('drop', onMP3Drop, false);
document.addEventListener('dragover', allowDrop, false);

function allowDrop(e) {
  e.preventDefault();
}

function onMP3Drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var droppedFiles = e.dataTransfer.files;
  var reader = new FileReader();
  reader.onload = function(fileEvent) {
    var data = fileEvent.target.result;
    onDroppedMP3Loaded(data);
  };
  reader.readAsArrayBuffer(droppedFiles[0]);
}

function onDroppedMP3Loaded(data) {
  audioContext.decodeAudioData(data, startSound, function(e) {
    console.log(e);
  });
}

function startSound(audioBuffer) {
  if (source) {
    source.stop(0.0);
    source.disconnect();
  }

  // Connect audio processing graph
  source = audioContext.createBufferSource();
  source.connect(audioContext.destination);
  source.connect(analyser);

  source.buffer = audioBuffer;
  source.loop = true;
  source.start(0.0);


  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  requestAnimationFrame(draw);
}

function draw() {
  drawVisual = requestAnimationFrame(draw);

  analyser.getByteFrequencyData(dataArray);

  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  var barWidth = (WIDTH / bufferLength) * 2.5;
  var barHeight;
  var x = 0;

  for(var i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];

    canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
    canvasCtx.fillRect(x, HEIGHT-barHeight/2, barWidth, barHeight/2);
    x += barWidth + 1;
  }
}
