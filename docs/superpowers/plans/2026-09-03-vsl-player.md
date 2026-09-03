# V Infinitum VSL Player + Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-hosted VTurb clone — a VSL dashboard (`index.html`) and an embeddable player (`player.html`) — with the Infinitum brand applied, deployable as static files with zero backend.

**Architecture:** Two HTML pages plus two small shared assets (`theme.css` for the visual system, `storage.js` for the `localStorage` data model), so both pages agree on colors and on the video-record schema without duplicating that logic. No framework, no build step, no bundler — `<script>`/`<link>` tags only. Deviation from a literal "everything inline in 2 files" reading: duplicating the `localStorage` schema logic in two places is a real bug risk (a key-name typo in one file would silently corrupt or lose data), so it's factored into `storage.js` and both pages load it. This keeps the deliverable at exactly 2 HTML *pages*, matching the spec's scope.

**Tech Stack:** Vanilla HTML5, CSS3 (custom properties), ES5-ish vanilla JS (no modules, so it also works if someone opens via `file://`), Google Fonts (Inter) with system-font fallback, native `<video>` element, `localStorage`.

**No automated test framework** — per spec, out of scope. Every task's verification step is a concrete manual check: exact URL to open, exact console commands to run, exact expected output/behavior. This is intentional, not a shortcut — the spec explicitly excludes test tooling for this static-file project.

---

## Shared Interfaces (locked in before task breakdown — do not diverge from these in later tasks)

### `localStorage` schema (`storage.js`)

```js
// Key: 'vinfinitum_videos' -> JSON array of video records
{
  id: 'v_<timestamp36>_<rand6>',   // from uid()
  name: 'My VSL',
  createdAt: '2026-09-03T12:00:00.000Z', // ISO string
  plays: 0,
  thumbnail: '',                   // data URL or '' 
  sourceUrl: 'blob:...' | 'https://...mp4',
  status: 'active' | 'trash',
  config: {
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
  }
}
```

`localStorage` also holds one key per video for resume position: `vinfinitum_progress_<encodeURIComponent(sourceUrl)>` → seconds (string).

### `player.html` query-param contract

| Param | Meaning | Default if absent |
|---|---|---|
| `v` | video source URL (required) | — |
| `poster` | poster image URL | `''` |
| `autoplay` | `1`/`0` smart autoplay on load | `1` |
| `mute_text` | overlay text shown while muted | `Toque para ativar o som` |
| `bar_color` | progress bar fill color | `#D4AF37` |
| `bar_height` | progress bar height in px | `6` |
| `cta` | `1`/`0` show CTA button | `0` |
| `cta_text` | CTA button label | `''` |
| `cta_url` | CTA checkout link | `''` |
| `cta_time` | seconds until CTA appears | `30` |
| `cta_color` | CTA button color | `#D4AF37` |
| `cta_sub` | CTA subtext | `''` |
| `cw` | `1`/`0` continue-watching enabled | `1` |
| `cw_msg` | continue-watching prompt message | `Continue de onde parou` |
| `pixel` | pixel ID (empty = disabled) | `''` |
| `pixel_pcts` | comma-separated percentages, e.g. `25,50,75,100` | `25,50,75,100` |
| `speed` | `auto`\|`low`\|`medium`\|`high` | `auto` |

### Brand tokens (`theme.css`)

```css
:root {
  --bg: #0A0A0A;
  --surface: #15130F;
  --border: rgba(212, 175, 55, 0.18);
  --gold: #D4AF37;
  --gold-warm: #C38B2F;
  --gold-aged: #B8973E;
  --purple: #5C2A7E;
  --crimson: #9B1C2C;
  --cream: #F8F6F0;
  --silver: #E5E0D8;
  --font: 'Inter', system-ui, -apple-system, Segoe UI, sans-serif;
}
```

---

## File Structure

- Create: `assets/logo.svg` — inline-friendly Ouroboros icon, also used as favicon via `<link rel="icon">`.
- Create: `theme.css` — brand tokens, reset, shared button/input/card styles.
- Create: `storage.js` — schema + CRUD helpers, shared by both pages.
- Create: `player.html` — embeddable player (self-contained `<script>`, uses `theme.css` + `storage.js` for resume position only).
- Create: `index.html` — dashboard SPA (self-contained `<script>`, uses `theme.css` + `storage.js`).

---

### Task 1: Brand assets — logo/favicon, theme.css, storage.js

**Files:**
- Create: `assets/logo.svg`
- Create: `theme.css`
- Create: `storage.js`

- [ ] **Step 1: Create the Ouroboros logo SVG**

`assets/logo.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <linearGradient id="ouroGold" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#B8973E"/>
      <stop offset="55%" stop-color="#D4AF37"/>
      <stop offset="82%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#9B1C2C"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="22" fill="none" stroke="url(#ouroGold)" stroke-width="4" stroke-linecap="round" stroke-dasharray="132 6"/>
  <circle cx="32" cy="32" r="3.2" fill="#D4AF37"/>
  <circle cx="48.5" cy="19.5" r="2.6" fill="#5C2A7E"/>
</svg>
```

- [ ] **Step 2: Create the shared theme**

`theme.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --bg: #0A0A0A;
  --surface: #15130F;
  --surface-2: #1C1912;
  --border: rgba(212, 175, 55, 0.18);
  --gold: #D4AF37;
  --gold-warm: #C38B2F;
  --gold-aged: #B8973E;
  --purple: #5C2A7E;
  --crimson: #9B1C2C;
  --cream: #F8F6F0;
  --silver: #E5E0D8;
  --font: 'Inter', system-ui, -apple-system, "Segoe UI", sans-serif;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--cream);
  font-family: var(--font);
}

.wordmark {
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cream);
}

.btn {
  font-family: var(--font);
  font-weight: 600;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--cream);
  padding: 10px 18px;
  cursor: pointer;
}

.btn:hover { border-color: var(--gold); }

.btn-primary {
  background: var(--gold);
  color: #1a1400;
  border-color: var(--gold);
}

.btn-primary:hover { background: var(--gold-warm); }

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
}

input, select, textarea {
  font-family: var(--font);
  background: var(--surface-2);
  color: var(--cream);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--gold);
}
```

- [ ] **Step 3: Create the shared storage module**

`storage.js`:

```js
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
```

- [ ] **Step 4: Verify in browser console**

Run: `npx http-server -p 3000` from the project root, then open `http://localhost:3000/theme.css` and `http://localhost:3000/storage.js` directly — both should load as plain text with no 404.

Open browser devtools console on `http://localhost:3000/` (any page that loads `storage.js` — this will exist after Task 4/5; for now, verify syntax only) by running:
`node -e "require('./storage.js')"` is not valid (browser globals) — instead run:
`node --check storage.js`
Expected: no output (syntax OK, exit code 0).

- [ ] **Step 5: Commit**

```bash
git add assets/logo.svg theme.css storage.js
git commit -m "feat: add brand assets, theme, and storage schema"
```

---

### Task 2: `player.html` — shell, param parsing, video engine core

**Files:**
- Create: `player.html`

- [ ] **Step 1: Create the player shell with param parsing and base video element**

`player.html`:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<title>V Infinitum Player</title>
<link rel="icon" href="assets/logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="theme.css">
<style>
  html, body { height: 100%; background: #000; overflow: hidden; }
  .player-wrap {
    position: relative;
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    background: #000;
  }
  video { width: 100%; height: 100%; object-fit: contain; background: #000; }
  .mute-overlay {
    position: absolute; left: 50%; top: 16px; transform: translateX(-50%);
    background: rgba(0,0,0,0.6); color: var(--cream, #F8F6F0);
    padding: 8px 14px; border-radius: 20px; font-size: 13px;
    display: flex; align-items: center; gap: 8px; pointer-events: none;
    transition: opacity .3s ease;
  }
  .big-play {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.25); border: none; cursor: pointer;
  }
  .big-play svg { width: 72px; height: 72px; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
  <div class="player-wrap" id="wrap">
    <video id="video" playsinline muted></video>
    <div class="mute-overlay" id="muteOverlay">🔇 <span id="muteText"></span></div>
    <button class="big-play" id="bigPlay" aria-label="Play">
      <svg viewBox="0 0 24 24" fill="#D4AF37"><path d="M8 5v14l11-7z"/></svg>
    </button>
  </div>

<script src="storage.js"></script>
<script>
(function () {
  var params = new URLSearchParams(location.search);
  var cfg = {
    src: params.get('v') || '',
    poster: params.get('poster') || '',
    autoplay: params.get('autoplay') !== '0',
    muteText: params.get('mute_text') || 'Toque para ativar o som',
    barColor: params.get('bar_color') || '#D4AF37',
    barHeight: parseInt(params.get('bar_height') || '6', 10),
    ctaEnabled: params.get('cta') === '1',
    ctaText: params.get('cta_text') || '',
    ctaUrl: params.get('cta_url') || '',
    ctaTime: parseFloat(params.get('cta_time') || '30'),
    ctaColor: params.get('cta_color') || '#D4AF37',
    ctaSub: params.get('cta_sub') || '',
    cwEnabled: params.get('cw') !== '0',
    cwMsg: params.get('cw_msg') || 'Continue de onde parou',
    pixelId: params.get('pixel') || '',
    pixelPcts: (params.get('pixel_pcts') || '25,50,75,100').split(',').map(Number).filter(function (n) { return !isNaN(n); }),
    speed: params.get('speed') || 'auto'
  };

  var video = document.getElementById('video');
  var muteOverlay = document.getElementById('muteOverlay');
  var muteTextEl = document.getElementById('muteText');
  var bigPlay = document.getElementById('bigPlay');

  muteTextEl.textContent = cfg.muteText;
  if (cfg.poster) video.setAttribute('poster', cfg.poster);
  if (cfg.src) video.setAttribute('src', cfg.src);

  function play() { video.play().catch(function () {}); }

  if (cfg.autoplay) {
    video.muted = true;
    play();
  } else {
    muteOverlay.hidden = true;
  }

  video.addEventListener('play', function () {
    bigPlay.hidden = true;
  });
  video.addEventListener('pause', function () {
    bigPlay.hidden = false;
  });

  bigPlay.addEventListener('click', function () {
    if (video.muted) video.muted = false;
    play();
  });

  video.addEventListener('click', function () {
    if (video.muted) {
      video.muted = false;
      muteOverlay.hidden = true;
    } else if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  if (cfg.autoplay) {
    setTimeout(function () { muteOverlay.style.opacity = '0'; setTimeout(function () { muteOverlay.hidden = true; }, 300); }, 4000);
  }

  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space') {
      e.preventDefault();
      if (video.paused) play(); else video.pause();
    } else if (e.code === 'ArrowRight') {
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
    } else if (e.code === 'ArrowLeft') {
      video.currentTime = Math.max(0, video.currentTime - 10);
    }
  });

  window.__player = { video: video, cfg: cfg };
})();
</script>
</body>
</html>
```

- [ ] **Step 2: Manual verification**

Run: `npx http-server -p 3000` (if not already running).

Open: `http://localhost:3000/player.html?v=https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4&mute_text=Toque%20aqui`

Expected: video starts muted and playing automatically, a pill reading "🔇 Toque aqui" appears top-center and fades out after ~4s, clicking the video unmutes it, spacebar toggles play/pause, right/left arrows jump ±10s.

- [ ] **Step 3: Commit**

```bash
git add player.html
git commit -m "feat: player shell with param parsing and core video engine"
```

---

### Task 3: `player.html` — custom progress bar (smart progress) + time + seek

**Files:**
- Modify: `player.html`

- [ ] **Step 1: Add progress bar markup**

In `player.html`, inside `<div class="player-wrap" id="wrap">`, after the `bigPlay` button, add:

```html
    <div class="controls-bar" id="controlsBar">
      <span class="time" id="timeLabel">0:00 / 0:00</span>
      <div class="progress-track" id="progressTrack">
        <div class="progress-fill" id="progressFill"></div>
      </div>
    </div>
```

- [ ] **Step 2: Add CSS**

In the `<style>` block, add:

```css
.controls-bar {
  position: absolute; left: 0; right: 0; bottom: 0;
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: linear-gradient(transparent, rgba(0,0,0,0.75));
}
.time { color: var(--cream, #F8F6F0); font-size: 12px; font-variant-numeric: tabular-nums; }
.progress-track {
  flex: 1; height: 6px; background: rgba(255,255,255,0.2); border-radius: 999px; cursor: pointer; position: relative;
}
.progress-fill {
  height: 100%; width: 0%; border-radius: 999px; background: #D4AF37;
}
```

- [ ] **Step 3: Add progress/seek logic**

In the `<script>` block, before the closing `window.__player = ...` line, add:

```js
  var progressTrack = document.getElementById('progressTrack');
  var progressFill = document.getElementById('progressFill');
  var timeLabel = document.getElementById('timeLabel');
  progressFill.style.background = cfg.barColor;
  document.getElementById('progressTrack').style.height = cfg.barHeight + 'px';

  var SMART_FACTOR = 1.15; // makes the bar read as "shorter" than actual duration

  function formatTime(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  video.addEventListener('timeupdate', function () {
    if (!video.duration) return;
    var pct = Math.min(100, (video.currentTime / video.duration) * 100 * SMART_FACTOR);
    progressFill.style.width = pct + '%';
    timeLabel.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
  });

  progressTrack.addEventListener('click', function (e) {
    if (!video.duration) return;
    var rect = progressTrack.getBoundingClientRect();
    var ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = Math.max(0, Math.min(1, ratio)) * video.duration / SMART_FACTOR;
  });
```

- [ ] **Step 4: Manual verification**

Reload `http://localhost:3000/player.html?v=https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4&bar_color=%23D4AF37`

Expected: a gold progress bar and `m:ss / m:ss` time label appear at the bottom, the bar fills as the video plays and visually reaches 100% slightly before the video actually ends (smart-progress effect), and clicking anywhere on the bar seeks to that position.

- [ ] **Step 5: Commit**

```bash
git add player.html
git commit -m "feat: player smart progress bar with seek"
```

---

### Task 4: `player.html` — CTA button, continue watching, pixel firing

**Files:**
- Modify: `player.html`

- [ ] **Step 1: Add CTA markup**

After the `controls-bar` div, add:

```html
    <a class="cta-btn" id="ctaBtn" href="#" target="_blank" rel="noopener" hidden>
      <span id="ctaText"></span>
      <small id="ctaSub"></small>
    </a>
    <div class="resume-prompt" id="resumePrompt" hidden>
      <p id="resumeMsg"></p>
      <div class="resume-actions">
        <button class="btn btn-primary" id="resumeContinue">Continuar</button>
        <button class="btn" id="resumeRestart">Recomeçar</button>
      </div>
    </div>
```

- [ ] **Step 2: Add CSS**

```css
.cta-btn {
  position: absolute; left: 50%; bottom: 56px; transform: translateX(-50%) translateY(12px);
  background: #D4AF37; color: #1a1400; text-decoration: none;
  padding: 12px 22px; border-radius: 999px; font-weight: 700; text-align: center;
  opacity: 0; transition: opacity .3s ease, transform .3s ease; pointer-events: none;
}
.cta-btn.visible { opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto; }
.cta-btn small { display: block; font-weight: 500; font-size: 11px; opacity: 0.8; }
.resume-prompt {
  position: absolute; inset: 0; background: rgba(0,0,0,0.8);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
  color: var(--cream, #F8F6F0); text-align: center; padding: 20px;
}
.resume-actions { display: flex; gap: 10px; }
```

- [ ] **Step 3: Add CTA timer, continue-watching, and pixel logic**

In the `<script>` block, replace the final `window.__player = { video: video, cfg: cfg };` line with:

```js
  // CTA
  var ctaBtn = document.getElementById('ctaBtn');
  if (cfg.ctaEnabled && cfg.ctaText) {
    document.getElementById('ctaText').textContent = cfg.ctaText;
    document.getElementById('ctaSub').textContent = cfg.ctaSub;
    ctaBtn.href = cfg.ctaUrl || '#';
    ctaBtn.style.background = cfg.ctaColor;
    ctaBtn.hidden = false;
    video.addEventListener('timeupdate', function onCtaTick() {
      if (video.currentTime >= cfg.ctaTime) {
        ctaBtn.classList.add('visible');
        video.removeEventListener('timeupdate', onCtaTick);
      }
    });
  }

  // Continue watching
  var progressKey = encodeURIComponent(cfg.src);
  var resumePrompt = document.getElementById('resumePrompt');
  if (cfg.cwEnabled && cfg.src) {
    var saved = getProgress(progressKey);
    if (saved > 5) {
      resumePrompt.hidden = false;
      document.getElementById('resumeMsg').textContent = cfg.cwMsg;
      video.pause();
      document.getElementById('resumeContinue').addEventListener('click', function () {
        video.currentTime = saved;
        resumePrompt.hidden = true;
        video.muted = false;
        play();
      });
      document.getElementById('resumeRestart').addEventListener('click', function () {
        video.currentTime = 0;
        resumePrompt.hidden = true;
        video.muted = false;
        play();
      });
    }
    video.addEventListener('timeupdate', function () {
      if (video.currentTime > 3) setProgress(progressKey, video.currentTime);
    });
  }

  // Pixels
  var pixelPcts = cfg.pixelPcts;
  var pixelFired = {};
  function firePixel(pct) {
    if (!cfg.pixelId) return;
    var detail = { pixelId: cfg.pixelId, percent: pct, video: cfg.src };
    window.dispatchEvent(new CustomEvent('vinfinitum:pixel', { detail: detail }));
    console.log('[VInfinitum Pixel]', detail);
  }
  video.addEventListener('timeupdate', function () {
    if (!video.duration) return;
    var watchedPct = (video.currentTime / video.duration) * 100;
    for (var i = 0; i < pixelPcts.length; i++) {
      var p = pixelPcts[i];
      if (watchedPct >= p && !pixelFired[p]) {
        pixelFired[p] = true;
        firePixel(p);
      }
    }
  });

  window.__player = { video: video, cfg: cfg };
```

- [ ] **Step 4: Manual verification**

Open: `http://localhost:3000/player.html?v=https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4&cta=1&cta_text=Quero%20a%20vaga&cta_time=3&cta_color=%23D4AF37&pixel=abc123&pixel_pcts=10,50,90`

Expected: gold CTA pill fades in ~3s after playback starts; open devtools console and confirm `[VInfinitum Pixel] {pixelId: 'abc123', percent: 10, ...}` logs appear as the video crosses 10%, 50%, 90% watched.

Then reload the same URL after letting it play past 5s, pause, and reload again — expected: a "Continue de onde parou" prompt appears with Continuar/Recomeçar buttons; Continuar resumes from the saved time, Recomeçar starts at 0.

- [ ] **Step 5: Commit**

```bash
git add player.html
git commit -m "feat: player CTA timer, continue watching, and pixel firing"
```

---

### Task 5: `index.html` — shell (header, sidebar, layout, theme)

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create the dashboard shell**

`index.html`:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>V Infinitum — Dashboard</title>
<link rel="icon" href="assets/logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="theme.css">
<style>
  body { display: flex; flex-direction: column; min-height: 100vh; }
  header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 24px; border-bottom: 1px solid var(--border); background: var(--surface);
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand img { width: 28px; height: 28px; }
  .brand span { font-size: 15px; }
  .avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--gold); color: #1a1400; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .layout { display: flex; flex: 1; }
  nav.sidebar {
    width: 220px; border-right: 1px solid var(--border); background: var(--surface);
    padding: 18px 10px;
  }
  nav.sidebar a {
    display: block; padding: 10px 14px; margin-bottom: 4px; border-radius: 8px;
    color: var(--silver); text-decoration: none; font-size: 14px;
  }
  nav.sidebar a.active, nav.sidebar a:hover { background: var(--surface-2); color: var(--gold); }
  main { flex: 1; padding: 24px; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
  <header>
    <div class="brand">
      <img src="assets/logo.svg" alt="">
      <span class="wordmark">Infinitum</span>
    </div>
    <div class="avatar">IN</div>
  </header>
  <div class="layout">
    <nav class="sidebar">
      <a href="#videos" class="active" data-nav="videos">Meus Vídeos</a>
      <a href="#security" data-nav="security">Segurança</a>
      <a href="#settings" data-nav="settings">Configurações</a>
    </nav>
    <main id="mainView"></main>
  </div>

<script src="storage.js"></script>
<script>
  var mainView = document.getElementById('mainView');
  var navLinks = document.querySelectorAll('nav.sidebar a');

  function setActiveNav(name) {
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.dataset.nav === name);
    });
  }

  navLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      setActiveNav(a.dataset.nav);
      if (a.dataset.nav === 'videos') renderVideoList();
      else mainView.innerHTML = '<p style="color:var(--silver)">Em breve.</p>';
    });
  });

  function renderVideoList() {
    mainView.innerHTML = '<p style="color:var(--silver)">Carregando biblioteca...</p>';
  }

  renderVideoList();
</script>
</body>
</html>
```

- [ ] **Step 2: Manual verification**

Open: `http://localhost:3000/index.html`

Expected: dark header with gold Ouroboros logo + "INFINITUM" wordmark + avatar circle "IN"; left sidebar with Meus Vídeos (active/gold) / Segurança / Configurações; clicking Segurança or Configurações shows "Em breve." and highlights that link instead.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: dashboard shell with header and sidebar nav"
```

---

### Task 6: `index.html` — video list (table, tabs, actions) wired to storage

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace `renderVideoList` with a real implementation**

Add this CSS to the `<style>` block:

```css
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.tabs { display: flex; gap: 6px; margin-bottom: 14px; }
.tabs button { background: transparent; border: 1px solid var(--border); color: var(--silver); padding: 6px 14px; border-radius: 999px; cursor: pointer; font-family: var(--font); }
.tabs button.active { background: var(--gold); color: #1a1400; border-color: var(--gold); }
table.video-table { width: 100%; border-collapse: collapse; }
table.video-table th, table.video-table td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); font-size: 14px; }
table.video-table th { color: var(--silver); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
.thumb { width: 64px; height: 36px; background: var(--surface-2); border-radius: 6px; object-fit: cover; }
.row-actions button { background: transparent; border: none; color: var(--silver); cursor: pointer; font-size: 16px; margin-right: 8px; }
.row-actions button:hover { color: var(--gold); }
.empty-state { color: var(--silver); text-align: center; padding: 60px 0; }
```

Replace the `renderVideoList` function and add supporting code:

```js
  var currentTab = 'active'; // 'active' | 'top' | 'trash'

  function renderVideoList() {
    var all = getVideos();
    var list;
    if (currentTab === 'trash') list = all.filter(function (v) { return v.status === 'trash'; });
    else if (currentTab === 'top') list = all.filter(function (v) { return v.status === 'active'; }).sort(function (a, b) { return b.plays - a.plays; });
    else list = all.filter(function (v) { return v.status === 'active'; });

    var rowsHtml = list.map(function (v) {
      var thumb = v.thumbnail ? '<img class="thumb" src="' + v.thumbnail + '">' : '<div class="thumb"></div>';
      var date = new Date(v.createdAt).toLocaleDateString('pt-BR');
      var actions = currentTab === 'trash'
        ? '<button data-action="restore" data-id="' + v.id + '" title="Restaurar">↺</button><button data-action="delete" data-id="' + v.id + '" title="Excluir definitivamente">🗑</button>'
        : '<button data-action="edit" data-id="' + v.id + '" title="Editar">✎</button><button data-action="embed" data-id="' + v.id + '" title="Embed">{ }</button><button data-action="trash" data-id="' + v.id + '" title="Excluir">🗑</button>';
      return '<tr>' +
        '<td>' + thumb + '</td>' +
        '<td>' + v.name + '</td>' +
        '<td>' + date + '</td>' +
        '<td>' + v.plays + '</td>' +
        '<td class="row-actions">' + actions + '</td>' +
        '</tr>';
    }).join('');

    mainView.innerHTML =
      '<div class="toolbar">' +
        '<div class="tabs" id="tabs">' +
          '<button data-tab="active" class="' + (currentTab === 'active' ? 'active' : '') + '">Biblioteca</button>' +
          '<button data-tab="top" class="' + (currentTab === 'top' ? 'active' : '') + '">Top vídeos</button>' +
          '<button data-tab="trash" class="' + (currentTab === 'trash' ? 'active' : '') + '">Lixeira</button>' +
        '</div>' +
        '<button class="btn btn-primary" id="uploadBtn">Upload</button>' +
      '</div>' +
      (list.length === 0
        ? '<div class="empty-state">Nenhum vídeo por aqui ainda.</div>'
        : '<table class="video-table"><thead><tr><th>Thumb</th><th>Nome</th><th>Data</th><th>Plays</th><th>Ações</th></tr></thead><tbody>' + rowsHtml + '</tbody></table>');

    document.getElementById('tabs').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-tab]');
      if (!btn) return;
      currentTab = btn.dataset.tab;
      renderVideoList();
    });

    document.getElementById('uploadBtn').addEventListener('click', function () {
      console.log('upload modal opens in Task 7');
    });

    mainView.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.id;
        var action = btn.dataset.action;
        if (action === 'trash') { trashVideo(id); renderVideoList(); }
        else if (action === 'restore') { restoreVideo(id); renderVideoList(); }
        else if (action === 'delete') { deleteVideoPermanently(id); renderVideoList(); }
        else if (action === 'edit') { console.log('editor opens in Task 8', id); }
        else if (action === 'embed') { console.log('embed modal opens in Task 11', id); }
      });
    });
  }
```

- [ ] **Step 2: Manual verification**

Open `http://localhost:3000/index.html`, open devtools console, run:

```js
createVideo('Teste VSL', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4');
renderVideoList();
```

Expected: table shows one row "Teste VSL", today's date, 0 plays, action icons. Click the 🗑 icon — row disappears from Biblioteca. Click "Lixeira" tab — the row reappears there with ↺/🗑 actions. Click ↺ — video returns to Biblioteca tab.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: video list with tabs and trash/restore actions"
```

---

### Task 7: `index.html` — upload modal (drag & drop + URL)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add modal CSS**

```css
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 50; }
.modal { width: 480px; max-width: 90vw; padding: 24px; }
.modal h3 { margin-top: 0; }
.dropzone {
  border: 2px dashed var(--border); border-radius: 10px; padding: 30px;
  text-align: center; color: var(--silver); margin-bottom: 14px; cursor: pointer;
}
.dropzone.dragover { border-color: var(--gold); color: var(--gold); }
.field { margin-bottom: 12px; }
.field label { display: block; font-size: 12px; color: var(--silver); margin-bottom: 4px; }
.field input { width: 100%; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
```

- [ ] **Step 2: Add modal render + wiring**

Add this function and wire it into `uploadBtn`:

```js
  function openUploadModal() {
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML =
      '<div class="modal card">' +
        '<h3>Upload de vídeo</h3>' +
        '<div class="dropzone" id="dropzone">Arraste um arquivo MP4 aqui ou clique pra escolher</div>' +
        '<input type="file" id="fileInput" accept="video/mp4" hidden>' +
        '<div class="field"><label>Ou cole uma URL de vídeo</label><input type="text" id="urlInput" placeholder="https://.../video.mp4"></div>' +
        '<div class="field"><label>Nome do vídeo</label><input type="text" id="nameInput" placeholder="Minha VSL"></div>' +
        '<div class="modal-actions">' +
          '<button class="btn" id="cancelUpload">Cancelar</button>' +
          '<button class="btn btn-primary" id="saveUpload">Salvar</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(backdrop);

    var chosenUrl = '';
    var dropzone = backdrop.querySelector('#dropzone');
    var fileInput = backdrop.querySelector('#fileInput');
    var urlInput = backdrop.querySelector('#urlInput');
    var nameInput = backdrop.querySelector('#nameInput');

    dropzone.addEventListener('click', function () { fileInput.click(); });
    dropzone.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('dragover'); });
    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      var file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });
    fileInput.addEventListener('change', function () {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });

    function handleFile(file) {
      chosenUrl = URL.createObjectURL(file);
      dropzone.textContent = 'Selecionado: ' + file.name;
      if (!nameInput.value) nameInput.value = file.name.replace(/\.[^.]+$/, '');
    }

    urlInput.addEventListener('input', function () {
      if (urlInput.value) chosenUrl = urlInput.value;
    });

    backdrop.querySelector('#cancelUpload').addEventListener('click', function () {
      document.body.removeChild(backdrop);
    });

    backdrop.querySelector('#saveUpload').addEventListener('click', function () {
      var url = urlInput.value || chosenUrl;
      var name = nameInput.value || 'Vídeo sem nome';
      if (!url) { alert('Escolha um arquivo ou cole uma URL.'); return; }
      createVideo(name, url);
      document.body.removeChild(backdrop);
      renderVideoList();
    });
  }
```

Replace the placeholder `uploadBtn` click handler (`console.log('upload modal opens in Task 7')`) with:

```js
    document.getElementById('uploadBtn').addEventListener('click', openUploadModal);
```

- [ ] **Step 3: Manual verification**

Open `http://localhost:3000/index.html`, click Upload. Expected: dark modal with dropzone, URL field, name field. Type a name and paste `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` in the URL field, click Salvar. Expected: modal closes, new row appears in the Biblioteca table. Also test dragging an actual local `.mp4` file onto the dropzone — expected: dropzone text changes to "Selecionado: <filename>" and the name field auto-fills.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: upload modal with drag-and-drop and URL input"
```

---

### Task 8: `index.html` — video editor shell + live preview iframe

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add editor CSS**

```css
.editor-layout { display: flex; gap: 20px; }
.editor-panel { width: 340px; flex-shrink: 0; max-height: calc(100vh - 160px); overflow-y: auto; padding-right: 4px; }
.editor-preview { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.preview-frame-wrap { width: 100%; max-width: 640px; aspect-ratio: 16/9; background: #000; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
.preview-frame-wrap.mobile { max-width: 300px; aspect-ratio: 9/16; }
.preview-frame-wrap iframe { width: 100%; height: 100%; border: 0; }
.device-toggle { display: flex; gap: 6px; }
.device-toggle button { background: transparent; border: 1px solid var(--border); color: var(--silver); padding: 6px 12px; border-radius: 8px; cursor: pointer; font-family: var(--font); }
.device-toggle button.active { background: var(--gold); color: #1a1400; border-color: var(--gold); }
.editor-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section { margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
.section h4 { margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gold); }
.row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 10px; }
.row label { font-size: 13px; color: var(--silver); flex: 1; }
.row input[type="text"], .row input[type="number"], .row input[type="url"], .row select { flex: 1; }
.row input[type="color"] { width: 36px; height: 28px; padding: 2px; background: none; }
.switch { position: relative; width: 38px; height: 22px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; inset: 0; background: var(--surface-2); border-radius: 999px; cursor: pointer; border: 1px solid var(--border); transition: .2s; }
.slider::before { content: ''; position: absolute; width: 16px; height: 16px; left: 2px; top: 2px; background: var(--silver); border-radius: 50%; transition: .2s; }
.switch input:checked + .slider { background: var(--gold); }
.switch input:checked + .slider::before { transform: translateX(16px); background: #1a1400; }
```

- [ ] **Step 2: Add `renderEditor` shell + `buildPlayerUrl` + preview wiring**

```js
  var currentDevice = 'desktop';

  function buildPlayerUrl(video) {
    var c = video.config;
    var params = new URLSearchParams();
    params.set('v', video.sourceUrl);
    if (video.thumbnail) params.set('poster', video.thumbnail);
    params.set('autoplay', c.smartAutoplay.enabled ? '1' : '0');
    params.set('mute_text', c.smartAutoplay.overlayText);
    params.set('bar_color', c.smartProgress.color);
    params.set('bar_height', String(c.smartProgress.height));
    params.set('cta', c.cta.enabled ? '1' : '0');
    params.set('cta_text', c.cta.text);
    params.set('cta_url', c.cta.checkoutUrl);
    params.set('cta_time', String(c.cta.timeSeconds));
    params.set('cta_color', c.cta.color);
    params.set('cta_sub', c.cta.subtext);
    params.set('cw', c.continueWatching.enabled ? '1' : '0');
    params.set('cw_msg', c.continueWatching.message);
    params.set('pixel', c.pixels.enabled ? c.pixels.pixelId : '');
    params.set('pixel_pcts', c.pixels.percentages.join(','));
    params.set('speed', c.playback.speed);
    return 'player.html?' + params.toString();
  }

  function refreshPreview(video) {
    var frame = document.getElementById('previewFrame');
    if (frame) frame.src = buildPlayerUrl(video);
  }

  function renderEditor(id) {
    var video = getVideo(id);
    if (!video) { renderVideoList(); return; }

    mainView.innerHTML =
      '<div class="editor-toolbar">' +
        '<button class="btn" id="backToList">← Voltar</button>' +
        '<button class="btn btn-primary" id="embedTopBtn">Embed</button>' +
      '</div>' +
      '<div class="editor-layout">' +
        '<div class="editor-panel card" id="editorPanel" style="padding:16px;"></div>' +
        '<div class="editor-preview">' +
          '<div class="device-toggle">' +
            '<button data-device="desktop" class="active">Desktop</button>' +
            '<button data-device="mobile">Mobile</button>' +
          '</div>' +
          '<div class="preview-frame-wrap" id="previewWrap"><iframe id="previewFrame"></iframe></div>' +
        '</div>' +
      '</div>';

    document.getElementById('backToList').addEventListener('click', renderVideoList);
    document.getElementById('embedTopBtn').addEventListener('click', function () { console.log('embed modal opens in Task 11', id); });

    mainView.querySelectorAll('.device-toggle button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentDevice = btn.dataset.device;
        mainView.querySelectorAll('.device-toggle button').forEach(function (b) { b.classList.toggle('active', b === btn); });
        document.getElementById('previewWrap').classList.toggle('mobile', currentDevice === 'mobile');
      });
    });

    renderConfigPanel(video); // implemented in Tasks 9-10
    refreshPreview(video);
  }
```

Wire the list's `edit` action (added in Task 6) to call this — replace `else if (action === 'edit') { console.log('editor opens in Task 8', id); }` with:

```js
        else if (action === 'edit') { renderEditor(id); }
```

Add a temporary stub so the file works standalone until Task 9 fills it in:

```js
  function renderConfigPanel(video) {
    document.getElementById('editorPanel').innerHTML = '<p style="color:var(--silver)">Config panel — Task 9/10.</p>';
  }
```

- [ ] **Step 3: Manual verification**

Open `http://localhost:3000/index.html`, click the ✎ icon on the "Teste VSL" row from Task 6/7. Expected: editor view with a "← Voltar" button, Embed button, a left panel placeholder card, and a right preview `<iframe>` playing `player.html` with the video's `sourceUrl` — confirm the video autoplays muted inside the iframe. Click "Mobile" — expected: preview frame narrows to a 9:16 portrait shape. Click "← Voltar" — expected: returns to the video list.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: video editor shell with live preview iframe and device toggle"
```

---

### Task 9: `index.html` — config panel: Estilo, Progresso Inteligente, Smart Autoplay

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Implement `renderConfigPanel` (part 1) replacing the Task 8 stub**

```js
  function toggleRow(label, checked, onChange) {
    var id = 'sw_' + Math.random().toString(36).slice(2, 8);
    var wrap = document.createElement('div');
    wrap.className = 'row';
    wrap.innerHTML =
      '<label for="' + id + '">' + label + '</label>' +
      '<label class="switch"><input type="checkbox" id="' + id + '" ' + (checked ? 'checked' : '') + '><span class="slider"></span></label>';
    wrap.querySelector('input').addEventListener('change', function (e) { onChange(e.target.checked); });
    return wrap;
  }

  function textRow(label, value, onChange, type) {
    var id = 'tx_' + Math.random().toString(36).slice(2, 8);
    var wrap = document.createElement('div');
    wrap.className = 'row';
    wrap.innerHTML = '<label for="' + id + '">' + label + '</label><input type="' + (type || 'text') + '" id="' + id + '" value="' + (value == null ? '' : value) + '">';
    wrap.querySelector('input').addEventListener('input', function (e) {
      onChange(type === 'number' ? parseFloat(e.target.value || '0') : e.target.value);
    });
    return wrap;
  }

  function selectRow(label, value, options, onChange) {
    var id = 'sel_' + Math.random().toString(36).slice(2, 8);
    var wrap = document.createElement('div');
    wrap.className = 'row';
    var optionsHtml = options.map(function (o) { return '<option value="' + o.value + '"' + (o.value === value ? ' selected' : '') + '>' + o.label + '</option>'; }).join('');
    wrap.innerHTML = '<label for="' + id + '">' + label + '</label><select id="' + id + '">' + optionsHtml + '</select>';
    wrap.querySelector('select').addEventListener('change', function (e) { onChange(e.target.value); });
    return wrap;
  }

  function section(title, rows) {
    var s = document.createElement('div');
    s.className = 'section';
    var h = document.createElement('h4');
    h.textContent = title;
    s.appendChild(h);
    rows.forEach(function (r) { s.appendChild(r); });
    return s;
  }

  function saveAndRefresh(video) {
    upsertVideo(video);
    refreshPreview(video);
  }

  function renderConfigPanel(video) {
    var panel = document.getElementById('editorPanel');
    panel.innerHTML = '';
    var c = video.config;

    var controlLabels = {
      bigPlay: 'Play grande', smallPlay: 'Play pequeno', disablePause: 'Desativar pause',
      progressBar: 'Barra de progresso', time: 'Tempo', rewind10: 'Voltar 10s', forward10: 'Avançar 10s',
      volume: 'Volume', fullscreen: 'Fullscreen', speed: 'Velocidade'
    };
    var controlRows = Object.keys(controlLabels).map(function (key) {
      return toggleRow(controlLabels[key], c.style.controls[key], function (val) {
        c.style.controls[key] = val;
        saveAndRefresh(video);
      });
    });

    panel.appendChild(section('Estilo', [
      textRow('Cor principal', c.style.primaryColor, function (v) { c.style.primaryColor = v; saveAndRefresh(video); }, 'color'),
      textRow('Background', c.style.backgroundColor, function (v) { c.style.backgroundColor = v; saveAndRefresh(video); }, 'color'),
      textRow('Cantos arredondados (px)', c.style.cornerRadius, function (v) { c.style.cornerRadius = v; saveAndRefresh(video); }, 'number')
    ].concat(controlRows)));

    panel.appendChild(section('Progresso Inteligente', [
      toggleRow('Ativado', c.smartProgress.enabled, function (v) { c.smartProgress.enabled = v; saveAndRefresh(video); }),
      textRow('Cor da barra', c.smartProgress.color, function (v) { c.smartProgress.color = v; saveAndRefresh(video); }, 'color'),
      textRow('Altura (px)', c.smartProgress.height, function (v) { c.smartProgress.height = v; saveAndRefresh(video); }, 'number')
    ]));

    panel.appendChild(section('Smart Autoplay', [
      toggleRow('Ativado', c.smartAutoplay.enabled, function (v) { c.smartAutoplay.enabled = v; saveAndRefresh(video); }),
      textRow('Texto overlay', c.smartAutoplay.overlayText, function (v) { c.smartAutoplay.overlayText = v; saveAndRefresh(video); }),
      textRow('Trecho inicial (s)', c.smartAutoplay.startOffset, function (v) { c.smartAutoplay.startOffset = v; saveAndRefresh(video); }, 'number')
    ]));

    renderConfigPanelPart2(panel, video); // Task 10
  }
```

Add a temporary stub for the part implemented in Task 10 so the file works standalone:

```js
  function renderConfigPanelPart2(panel, video) {
    var note = document.createElement('p');
    note.style.color = 'var(--silver)';
    note.textContent = 'CTA / Continuar / Pixels / Reprodução — Task 10.';
    panel.appendChild(note);
  }
```

- [ ] **Step 2: Manual verification**

Open the editor for "Teste VSL". Expected: left panel shows "Estilo" (color pickers for cor principal/background, number input for cantos arredondados, 10 toggle switches for controls), "Progresso Inteligente" (toggle + color + height), "Smart Autoplay" (toggle + text + number) sections, each in a bordered subsection with a gold uppercase heading. Change "Cor da barra" in Progresso Inteligente to a different color and confirm the preview iframe reloads with the new `bar_color` (inspect the iframe's `src` attribute via devtools, or visually confirm the progress bar color changed).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: config panel sections for style, smart progress, smart autoplay"
```

---

### Task 10: `index.html` — config panel: CTA, Continuar Assistindo, Pixels, Opções de Reprodução

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the Task 9 stub with the real implementation**

```js
  function renderConfigPanelPart2(panel, video) {
    var c = video.config;

    panel.appendChild(section('Botões de Ação', [
      toggleRow('Ativado', c.cta.enabled, function (v) { c.cta.enabled = v; saveAndRefresh(video); }),
      textRow('Texto', c.cta.text, function (v) { c.cta.text = v; saveAndRefresh(video); }),
      textRow('Link de checkout', c.cta.checkoutUrl, function (v) { c.cta.checkoutUrl = v; saveAndRefresh(video); }, 'url'),
      textRow('Tempo pra aparecer (s)', c.cta.timeSeconds, function (v) { c.cta.timeSeconds = v; saveAndRefresh(video); }, 'number'),
      textRow('Cor', c.cta.color, function (v) { c.cta.color = v; saveAndRefresh(video); }, 'color'),
      textRow('Subtexto', c.cta.subtext, function (v) { c.cta.subtext = v; saveAndRefresh(video); })
    ]));

    panel.appendChild(section('Continuar Assistindo', [
      toggleRow('Ativado', c.continueWatching.enabled, function (v) { c.continueWatching.enabled = v; saveAndRefresh(video); }),
      textRow('Mensagem', c.continueWatching.message, function (v) { c.continueWatching.message = v; saveAndRefresh(video); }),
      textRow('Botão continuar', c.continueWatching.continueLabel, function (v) { c.continueWatching.continueLabel = v; saveAndRefresh(video); }),
      textRow('Botão reiniciar', c.continueWatching.restartLabel, function (v) { c.continueWatching.restartLabel = v; saveAndRefresh(video); })
    ]));

    panel.appendChild(section('Pixels', [
      toggleRow('Ativado', c.pixels.enabled, function (v) { c.pixels.enabled = v; saveAndRefresh(video); }),
      textRow('Pixel ID', c.pixels.pixelId, function (v) { c.pixels.pixelId = v; saveAndRefresh(video); }),
      textRow('Percentuais (separados por vírgula)', c.pixels.percentages.join(','), function (v) {
        c.pixels.percentages = v.split(',').map(function (n) { return parseInt(n, 10); }).filter(function (n) { return !isNaN(n); });
        saveAndRefresh(video);
      })
    ]));

    panel.appendChild(section('Opções de Reprodução', [
      toggleRow('Smart pause', c.playback.smartPause, function (v) { c.playback.smartPause = v; saveAndRefresh(video); }),
      toggleRow('Recomeçar', c.playback.restart, function (v) { c.playback.restart = v; saveAndRefresh(video); }),
      selectRow('Velocidade', c.playback.speed, [
        { value: 'auto', label: 'Automática' }, { value: 'low', label: 'Baixa' },
        { value: 'medium', label: 'Média' }, { value: 'high', label: 'Alta' }
      ], function (v) { c.playback.speed = v; saveAndRefresh(video); }),
      toggleRow('Fullscreen desktop', c.playback.fullscreen.desktop, function (v) { c.playback.fullscreen.desktop = v; saveAndRefresh(video); }),
      toggleRow('Fullscreen mobile', c.playback.fullscreen.mobile, function (v) { c.playback.fullscreen.mobile = v; saveAndRefresh(video); })
    ]));
  }
```

- [ ] **Step 2: Manual verification**

Reopen the editor for "Teste VSL". Expected: four more sections appear below Smart Autoplay — Botões de Ação, Continuar Assistindo, Pixels, Opções de Reprodução — each with the fields listed above. Toggle "Botões de Ação" → Ativado on, set "Tempo pra aparecer (s)" to `2`, set a Texto. In the preview iframe, confirm the gold CTA pill fades in ~2s after the video starts. Change "Velocidade" to "Alta" and confirm no console errors are thrown (the player doesn't need to *act* on `speed` yet beyond accepting the param — that's fine, spec lists it as a config option in the panel).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: config panel sections for CTA, continue watching, pixels, playback"
```

---

### Task 11: `index.html` — Embed modal

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add embed modal CSS**

```css
.embed-modal { width: 560px; }
.embed-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
.embed-tabs button { background: transparent; border: 1px solid var(--border); color: var(--silver); padding: 6px 14px; border-radius: 999px; cursor: pointer; font-family: var(--font); }
.embed-tabs button.active { background: var(--gold); color: #1a1400; border-color: var(--gold); }
.embed-code { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px; font-family: monospace; font-size: 12px; color: var(--silver); white-space: pre-wrap; word-break: break-all; max-height: 160px; overflow-y: auto; }
.embed-preview { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 8px; overflow: hidden; margin: 12px 0; }
.embed-preview iframe { width: 100%; height: 100%; border: 0; }
```

- [ ] **Step 2: Implement `openEmbedModal`**

```js
  function embedSnippets(video) {
    var url = location.origin + location.pathname.replace(/index\.html$/, '') + buildPlayerUrl(video);
    var responsive = document.getElementById('embedResponsive') ? document.getElementById('embedResponsive').checked : true;
    var wrapOpen = responsive ? '<div style="position:relative;padding-top:56.25%;">' : '';
    var wrapClose = responsive ? '</div>' : '';
    var iframeStyle = responsive ? 'position:absolute;inset:0;width:100%;height:100%;border:0;' : 'width:100%;aspect-ratio:16/9;border:0;';
    return {
      recommended: wrapOpen + '<iframe src="' + url + '" style="' + iframeStyle + '" allow="autoplay; fullscreen" allowfullscreen></iframe>' + wrapClose,
      javascript: '<div id="vinfinitum-' + video.id + '"></div>\n<script>\n(function(){var f=document.createElement("iframe");f.src="' + url + '";f.style.cssText="' + iframeStyle + '";f.allow="autoplay; fullscreen";f.allowFullscreen=true;document.getElementById("vinfinitum-' + video.id + '").appendChild(f);})();\n<\/script>',
      iframe: '<iframe src="' + url + '" width="100%" height="360" allow="autoplay; fullscreen" allowfullscreen style="border:0;"></iframe>',
      direct: url
    };
  }

  function openEmbedModal(id) {
    var video = getVideo(id);
    if (!video) return;
    var currentEmbedTab = 'recommended';

    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    function render() {
      var snippets = embedSnippets(video);
      var codeMap = { recommended: snippets.recommended, javascript: snippets.javascript, iframe: snippets.iframe };
      backdrop.innerHTML =
        '<div class="modal card embed-modal">' +
          '<h3>Embed — ' + video.name + '</h3>' +
          '<div class="row"><label>Vídeo Responsivo</label><label class="switch"><input type="checkbox" id="embedResponsive" checked><span class="slider"></span></label></div>' +
          '<div class="embed-tabs">' +
            '<button data-tab="recommended" class="' + (currentEmbedTab === 'recommended' ? 'active' : '') + '">Recomendado</button>' +
            '<button data-tab="javascript" class="' + (currentEmbedTab === 'javascript' ? 'active' : '') + '">JavaScript</button>' +
            '<button data-tab="iframe" class="' + (currentEmbedTab === 'iframe' ? 'active' : '') + '">iFrame</button>' +
          '</div>' +
          '<div class="embed-code">' + codeMap[currentEmbedTab].replace(/</g, '&lt;') + '</div>' +
          '<div class="field"><label>Link direto</label><input type="text" id="directLink" readonly value="' + snippets.direct + '"></div>' +
          '<div class="embed-preview"><iframe src="' + buildPlayerUrl(video) + '"></iframe></div>' +
          '<div class="modal-actions">' +
            '<button class="btn" id="closeEmbed">Fechar</button>' +
            '<button class="btn btn-primary" id="copyEmbed">Copiar código</button>' +
          '</div>' +
        '</div>';

      backdrop.querySelector('#embedResponsive').addEventListener('change', render);
      backdrop.querySelectorAll('.embed-tabs button').forEach(function (btn) {
        btn.addEventListener('click', function () { currentEmbedTab = btn.dataset.tab; render(); });
      });
      backdrop.querySelector('#closeEmbed').addEventListener('click', function () { document.body.removeChild(backdrop); });
      backdrop.querySelector('#copyEmbed').addEventListener('click', function () {
        navigator.clipboard.writeText(codeMap[currentEmbedTab]).then(function () {
          var btn = backdrop.querySelector('#copyEmbed');
          var original = btn.textContent;
          btn.textContent = 'Copiado!';
          setTimeout(function () { btn.textContent = original; }, 1500);
        });
      });
    }

    render();
    document.body.appendChild(backdrop);
  }
```

Wire up the two remaining stubs. Replace `else if (action === 'embed') { console.log('embed modal opens in Task 11', id); }` in the list actions (Task 6) with:

```js
        else if (action === 'embed') { openEmbedModal(id); }
```

Replace `document.getElementById('embedTopBtn').addEventListener('click', function () { console.log('embed modal opens in Task 11', id); });` in `renderEditor` (Task 8) with:

```js
    document.getElementById('embedTopBtn').addEventListener('click', function () { openEmbedModal(id); });
```

- [ ] **Step 3: Manual verification**

From the video list, click the `{ }` embed icon on "Teste VSL". Expected: modal titled "Embed — Teste VSL" with a Vídeo Responsivo toggle, three tabs (Recomendado/JavaScript/iFrame) each showing different generated code containing `player.html?v=...`, a read-only "Link direto" field, a live preview iframe playing the video, and a "Copiar código" button. Click "Copiar código", then paste into a scratch text field (or devtools console via `navigator.clipboard.readText()`) to confirm the code was copied. Toggle "Vídeo Responsivo" off and confirm the code block updates to the non-responsive iframe markup.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: embed modal with responsive toggle, code tabs, and copy"
```

---

### Task 12: End-to-end verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full manual walkthrough**

With `npx http-server -p 3000` running, open `http://localhost:3000/index.html` in a fresh incognito/private window (clean `localStorage`) and walk through, confirming each works exactly as in its task's verification step:

1. Upload a video via URL (Task 7).
2. Open its editor, confirm live preview plays (Task 8).
3. Change several config fields across all sections and confirm the preview updates each time (Tasks 9-10).
4. Open Embed, copy the "Recomendado" snippet (Task 11).
5. Paste that snippet's `src` URL into a new browser tab directly — confirm `player.html` plays standalone with the CTA, progress bar, and continue-watching behavior from Tasks 2-4.
6. Go back to the dashboard, trash the video, confirm it moves to Lixeira, then restore it (Task 6).

- [ ] **Step 2: Check for console errors**

Run through the walkthrough above with devtools console open. Expected: zero uncaught errors at any step.

- [ ] **Step 3: Commit the verification note (only if any fixes were needed during the walkthrough)**

If Step 1 or 2 surfaced a bug, fix it in the relevant file and commit:

```bash
git add index.html player.html
git commit -m "fix: <describe the bug found during end-to-end walkthrough>"
```

If no bugs were found, no commit is needed for this task.

---

## Deferred (not part of this plan — do only if the user asks separately)

- `npx vercel --prod` deploy (spec marks this optional, user-triggered).
- Real analytics wiring, real auth, real backend storage — explicitly out of scope per the design spec.
