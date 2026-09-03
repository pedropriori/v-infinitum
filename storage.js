var STORAGE_KEY = 'vinfinitum_videos';

function uid() {
  return 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function defaultConfig() {
  return {
    style: {
      primaryColor: '#D4AF37',
      backgroundColor: '#0A0A0A',
      cornerRadius: 12,
      controls: {
        bigPlay: true, smallPlay: true, disablePause: false,
        progressBar: true, time: true, rewind10: true, forward10: true,
        volume: true, fullscreen: true, speed: false
      }
    },
    smartProgress: { enabled: true, color: '#D4AF37', height: 6 },
    smartAutoplay: { enabled: true, overlayText: 'Toque para ativar o som', startOffset: 0 },
    cta: { enabled: false, text: 'Quero garantir minha vaga', checkoutUrl: '', timeSeconds: 30, color: '#D4AF37', subtext: '' },
    continueWatching: { enabled: true, message: 'Continue de onde parou', continueLabel: 'Continuar', restartLabel: 'Recomeçar' },
    pixels: { enabled: false, pixelId: '', percentages: [25, 50, 75, 100] },
    playback: { smartPause: true, restart: false, speed: 'auto', fullscreen: { desktop: true, mobile: true } }
  };
}

function getVideos() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveVideos(videos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
}

function getVideo(id) {
  var videos = getVideos();
  for (var i = 0; i < videos.length; i++) {
    if (videos[i].id === id) return videos[i];
  }
  return null;
}

function upsertVideo(video) {
  var videos = getVideos();
  var idx = -1;
  for (var i = 0; i < videos.length; i++) {
    if (videos[i].id === video.id) { idx = i; break; }
  }
  if (idx === -1) videos.push(video); else videos[idx] = video;
  saveVideos(videos);
  return video;
}

function createVideo(name, sourceUrl) {
  var video = {
    id: uid(),
    name: name,
    createdAt: new Date().toISOString(),
    plays: 0,
    thumbnail: '',
    sourceUrl: sourceUrl,
    status: 'active',
    config: defaultConfig()
  };
  upsertVideo(video);
  return video;
}

function trashVideo(id) {
  var v = getVideo(id);
  if (!v) return;
  v.status = 'trash';
  upsertVideo(v);
}

function restoreVideo(id) {
  var v = getVideo(id);
  if (!v) return;
  v.status = 'active';
  upsertVideo(v);
}

function deleteVideoPermanently(id) {
  saveVideos(getVideos().filter(function (v) { return v.id !== id; }));
}

function getProgress(key) {
  var raw = localStorage.getItem('vinfinitum_progress_' + key);
  return raw ? parseFloat(raw) : 0;
}

function setProgress(key, seconds) {
  localStorage.setItem('vinfinitum_progress_' + key, String(seconds));
}
