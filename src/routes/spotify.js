import express from "express";
import { config } from "../config.js";

const router = express.Router();

const LASTFM_URL_BASE = Buffer.from(
  "aHR0cDovL3dzLmF1ZGlvc2Nyb2JibGVyLmNvbS8yLjAv",
  "base64",
).toString();

async function getItunesCover(artist, title) {
  if (!artist || !title)
    return "https://placehold.co/512x512/222222/FFFFFF?text=No+Cover";

  const cleanTitle = title
    .replace(/\(Official.*\)|\(Live\)|\(Remastered\)/gi, "")
    .trim();
  const query = encodeURIComponent(`${artist} ${cleanTitle}`);
  const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].artworkUrl100.replace("100x100bb", "512x512bb");
    }
  } catch (err) {
    console.error("iTunes API error:", err);
  }

  return "https://placehold.co/512x512/222222/FFFFFF?text=No+Cover";
}

router.get("/api/spotify/now-playing", async (req, res) => {
  try {
    const url = `${LASTFM_URL_BASE}?method=user.getrecenttracks&user=${config.lastfm.username}&api_key=${config.lastfm.apiKey}&format=json&limit=1`;
    const response = await fetch(url);
    const data = await response.json();

    const track = data.recenttracks?.track[0];
    const isPlaying =
      track && track["@attr"] && track["@attr"].nowplaying === "true";

    if (!isPlaying) return res.json({ isPlaying: false });

    const title = track.name;
    const artist = track.artist["#text"];
    let albumArt = track.image[3]["#text"]; // Size 3 is Extra Large

    if (!albumArt || albumArt === "") {
      albumArt = await getItunesCover(artist, title);
    }

    res.json({
      isPlaying: true,
      title: title,
      artist: artist,
      albumArt: albumArt,
    });
  } catch (e) {
    res.json({ isPlaying: false });
  }
});

router.get("/api/spotify/top-albums", async (req, res) => {
  try {
    const url = `${LASTFM_URL_BASE}?method=user.gettopalbums&user=${config.lastfm.username}&api_key=${config.lastfm.apiKey}&period=7day&limit=10&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    const albums = data.topalbums.album.map((a) => ({
      title: a.name,
      artist: a.artist.name,
      art:
        a.image[1]["#text"] ||
        "https://placehold.co/100x100/222222/FFFFFF?text=?",
    }));

    res.json(albums);
  } catch (e) {
    res.json([]);
  }
});

router.get("/spotify", (req, res) => {
  res.send(`
    <!DOCTYPE html>
<html style="color-scheme: dark; background: transparent;">
<head>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=2.0">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js"></script>
  <style>
    /* --- 1. AMBIENT GLOW BACKGROUND --- */
    #ambient-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: inherit;
      filter: blur(60px) brightness(0.6);
      transform: scale(1.3);
      z-index: -1;
      transition: background-image 1s ease, opacity 1s ease;
      opacity: 0;
      animation: rotateBg 10s linear infinite;
    }

    @keyframes rotateBg {
      from { transform: scale(1.3) rotate(0deg); }
      to { transform: scale(1.3) rotate(360deg); }
    }

    body {
      margin: 0;
      padding: 2vmin; 
      box-sizing: border-box;
      color: white;
      font-family: 'JetBrains Mono', monospace;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }

    #widget {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /* --- 2. THE CARD --- */
    .card {
      position: relative;
      width: clamp(100px, 65vmin, 500px); 
      aspect-ratio: 1 / 1;
      margin-top: 1vmin;
      margin-bottom: 3vmin;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: clamp(8px, 4vmin, 24px);
      transition: box-shadow 1s ease;
      box-shadow: 0 4px 25px var(--glow-color, rgba(33, 150, 243, 0.5));
      flex-shrink: 0;
    }

    #cover-art {
      width: 100%;
      height: 100%;
      border-radius: inherit;
      object-fit: cover;
      z-index: 2;
      background: #222;
    }

    /* --- SIDE VISUALIZERS (Absolutely Positioned) --- */
    .side-visualizer {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: clamp(3px, 1vmin, 8px);
      height: 60%; /* Scales relative to the card */
      opacity: 0;
      transition: opacity 0.5s ease;
      pointer-events: none; /* Prevents visualizer from blocking clicks */
    }

    .side-visualizer.active {
      opacity: 1;
    }

    /* Push exactly outside the card boundaries */
    #vis-left {
      right: 100%;
      margin-right: clamp(8px, 3vmin, 20px);
    }

    #vis-right {
      left: 100%;
      margin-left: clamp(8px, 3vmin, 20px);
    }

    .bar {
      width: clamp(3px, 1.2vmin, 8px);
      background-color: var(--glow-color, #1db954); 
      border-radius: 6px;
      box-shadow: 0 0 10px var(--glow-color, #1db954);
      height: 10%;
    }

    /* Left Side Animation Timings */
    #vis-left .bar:nth-child(1) { animation: eq 0.6s ease-in-out infinite alternate 0.0s; }
    #vis-left .bar:nth-child(2) { animation: eq 0.5s ease-in-out infinite alternate 0.2s; }
    #vis-left .bar:nth-child(3) { animation: eq 0.7s ease-in-out infinite alternate 0.4s; }
    #vis-left .bar:nth-child(4) { animation: eq 0.4s ease-in-out infinite alternate 0.1s; }

    /* Right Side Animation Timings */
    #vis-right .bar:nth-child(1) { animation: eq 0.4s ease-in-out infinite alternate 0.3s; }
    #vis-right .bar:nth-child(2) { animation: eq 0.7s ease-in-out infinite alternate 0.1s; }
    #vis-right .bar:nth-child(3) { animation: eq 0.5s ease-in-out infinite alternate 0.5s; }
    #vis-right .bar:nth-child(4) { animation: eq 0.6s ease-in-out infinite alternate 0.2s; }

    @keyframes eq {
      0% { height: 10%; }
      100% { height: 100%; }
    }

    /* --- 3. TEXT & UI --- */
    .scroll-wrap {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
    }

    .scroll-text {
      display: inline-block;
    }

    @keyframes scrollText {
      0%, 15% { transform: translateX(0); }
      85%, 100% { transform: translateX(var(--scroll-dist)); }
    }

    #active-view {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      text-align: center;
    }

    #now-playing {
      font-size: clamp(10px, 3.5vmin, 18px);
      font-weight: 200;
      margin-bottom: 1.5vmin;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(255, 255, 255, 0.8);
    }

    #track-title {
      font-size: clamp(16px, 7vmin, 36px);
      font-weight: 400;
      margin-bottom: 0.5vmin;
    }

    #track-artist {
      font-size: clamp(12px, 4.5vmin, 24px);
      color: rgba(255, 255, 255, 0.6);
    }

    .title-wrap {
      margin-top: -0.5vmin;
    }

    .artist-wrap {
      margin-top: -1vmin;
    }

    #inactive-view {
      display: none;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    .list-header {
      font-size: clamp(12px, 4vmin, 20px);
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 2vmin;
      margin-bottom: 3vmin;
      text-align: center;
      flex-shrink: 0;
    }

    #album-list {
      flex-grow: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: clamp(10px, 3vmin, 24px);
      padding-right: 1vmin;
    }

    .album-item {
      display: flex;
      align-items: center;
      gap: clamp(10px, 4vmin, 24px);
    }

    .mini-art {
      width: clamp(40px, 12vmin, 72px);
      aspect-ratio: 1 / 1;
      border-radius: clamp(4px, 2vmin, 12px);
      object-fit: cover;
      flex-shrink: 0;
    }

    .mini-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      width: 100%;
    }

    .mini-title {
      font-size: clamp(14px, 4.5vmin, 24px);
      font-weight: bold;
    }

    .mini-artist {
      font-size: clamp(11px, 3.5vmin, 18px);
      color: rgba(255, 255, 255, 0.6);
    }

  </style>
</head>
<body>

  <div id="ambient-bg"></div>

  <div id="widget">
    <div id="active-view">
      <div id="now-playing">♫ Now Playing on Spotify ♫</div>

      <div class="card" id="art-container">
        <div id="vis-left" class="side-visualizer">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>

        <img id="cover-art" src="" alt="" crossorigin="anonymous">

        <div id="vis-right" class="side-visualizer">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
      </div>

      <div class="scroll-wrap title-wrap"><div id="track-title" class="scroll-text">Connecting...</div></div>
      <div class="scroll-wrap artist-wrap"><div id="track-artist" class="scroll-text">Spotify</div></div>
    </div>

    <div id="inactive-view">
      <div class="list-header">Blazar's Top Albums This Week</div>
      <div id="album-list"></div>
    </div>
  </div>

<script>
    let currentTrackId = "";
    let albumsLoaded = false;

    const activeView = document.getElementById("active-view");
    const inactiveView = document.getElementById("inactive-view");
    const ambientBg = document.getElementById("ambient-bg");
    const artContainer = document.getElementById("art-container");
    const coverArt = document.getElementById("cover-art");
    const visLeft = document.getElementById("vis-left");
    const visRight = document.getElementById("vis-right");

    const colorThief = new ColorThief();

    coverArt.addEventListener('load', () => {
      try {
        const color = colorThief.getColor(coverArt);
        artContainer.style.setProperty('--glow-color', \`rgb(\${color[0]}, \${color[1]}, \${color[2]})\`);
      } catch (err) {
        console.warn("Could not extract dominant color", err);
        artContainer.style.setProperty('--glow-color', '#1db954');
      }
    });

    function updateScrollAnimations(container) {
      if (!container) return;
      container.querySelectorAll('.scroll-text').forEach(el => {
        el.style.animation = 'none';
        el.style.transform = 'translateX(0)';

        const parentWidth = el.parentElement.clientWidth;
        const textWidth = el.scrollWidth;

        if (textWidth > parentWidth) {
          const distance = parentWidth - textWidth;
          el.style.setProperty('--scroll-dist', distance + 'px');
          const speed = Math.abs(textWidth / 60);
          el.style.animation = \`scrollText \${speed}s linear infinite alternate\`;
        }
      });
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (activeView.style.display !== "none") {
          updateScrollAnimations(activeView);
        } else {
          updateScrollAnimations(document.getElementById("album-list"));
        }
      }, 150);
    });

    function showPlayingState(data) {
      activeView.style.display = "flex";
      inactiveView.style.display = "none";
      
      // Turn on animation bars
      visLeft.classList.add("active");
      visRight.classList.add("active");

      if (currentTrackId === data.title + data.artist) return;
      currentTrackId = data.title + data.artist;

      coverArt.src = data.albumArt;
      document.getElementById("track-title").innerText = data.title;
      document.getElementById("track-artist").innerText = data.artist;

      ambientBg.style.backgroundImage = \`url(\${data.albumArt})\`;
      ambientBg.style.opacity = "1";

      setTimeout(() => updateScrollAnimations(activeView), 100);
    }

    function showIdleState() {
      activeView.style.display = "none";
      inactiveView.style.display = "flex";
      ambientBg.style.opacity = "0";
      currentTrackId = "";
      
      // Turn off animation bars
      visLeft.classList.remove("active");
      visRight.classList.remove("active");

      if (!albumsLoaded) {
        fetchTopAlbums();
        albumsLoaded = true;
      }
    }

    async function fetchTopAlbums() {
      try {
        const res = await fetch("/api/spotify/top-albums");
        const albums = await res.json();
        const listHtml = document.getElementById("album-list");
        listHtml.innerHTML = "";

        albums.forEach(album => {
          listHtml.innerHTML += \`
            <div class="album-item">
              <img class="mini-art" src="\${album.art}" crossorigin="anonymous">
              <div class="mini-info">
                <div class="scroll-wrap"><span class="mini-title scroll-text">\${album.title}</span></div>
                <div class="scroll-wrap"><span class="mini-artist scroll-text">\${album.artist}</span></div>
              </div>
            </div>\`;
        });
        setTimeout(() => updateScrollAnimations(listHtml), 100);
      } catch (e) { console.error("Failed to load albums", e); }
    }

    async function checkSpotify() {
      try {
        const res = await fetch("/api/spotify/now-playing");
        const data = await res.json();
        if (data.isPlaying) showPlayingState(data);
        else showIdleState();
      } catch (e) { console.error("Spotify check failed", e); }
    }

    setInterval(checkSpotify, 3000);
    checkSpotify();
</script>
</body>
</html>
  `);
});

export default router;
