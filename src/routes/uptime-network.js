import express from "express";
import os from "os";
import fs from "fs/promises";

const router = express.Router();

const getUptime = () => {
  const uptimeSeconds = os.uptime();
  const days = Math.floor(uptimeSeconds / (3600 * 24));
  const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  return { days, hours, minutes, raw: uptimeSeconds };
};

const getNetworkBytes = async () => {
  try {
    const rx = await fs.readFile(
      "/sys/class/net/eno1/statistics/rx_bytes",
      "utf8",
    );
    const tx = await fs.readFile(
      "/sys/class/net/eno1/statistics/tx_bytes",
      "utf8",
    );
    return { rx: parseInt(rx.trim()), tx: parseInt(tx.trim()) };
  } catch (err) {
    return { rx: 0, tx: 0 };
  }
};

router.get("/api/uptime-network", async (req, res) => {
  const uptime = getUptime();
  const network = await getNetworkBytes();
  res.json({ uptime, network });
});

router.get("/uptime-network", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html style="color-scheme: dark; background: transparent;">
    <head>
    <meta charset="UTF-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg: #121214;
      --border: rgba(255, 255, 255, 0.06);
      --text: #ffffff;
      --text-dim: rgba(255, 255, 255, 0.6);
      --text-glow: rgba(255, 255, 255, 0.3);

      /* Component Colors */
      --up-color: hsl(190, 90%, 55%);
      --tx-color: hsl(280, 90%, 70%);
      --rx-color: hsl(120, 90%, 65%);
    }

    * { box-sizing: border-box; -webkit-font-smoothing: antialiased; margin: 0; padding: 0; }

    body {
      background: none;
      border: none;
      font-family: 'JetBrains Mono', 'Cascadia Code', monospace;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      padding: 24px;
    }

    .container {
      width: 100%;
      max-width: 320px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Row Structure */
    .row {
      display: flex;
      flex-direction: column;
      gap: 8px; /* Tighter gap to bar */
      width: 100%;
    }

    /* Bulletproof layout: splits left info and right value */
    .row-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .row-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Icons - Locked to 42px to match CPU */
    .icon-wrapper {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-uptime { background: hsla(190, 90%, 55%, 0.1); color: var(--up-color); filter: drop-shadow(0 0 4px hsla(190, 90%, 55%, 0.5)); }
    .icon-tx { background: hsla(280, 90%, 70%, 0.1); color: var(--tx-color); filter: drop-shadow(0 0 4px hsla(280, 90%, 70%, 0.5)); }
    .icon-rx { background: hsla(120, 90%, 65%, 0.1); color: var(--rx-color); filter: drop-shadow(0 0 4px hsla(120, 90%, 65%, 0.5)); }

    /* Text Data */
    .info {
      display: flex;
      flex-direction: column;
    }
    
    .title {
      font-size: 14px;
      color: var(--text);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-shadow: 0 0 8px var(--text-glow);
    }
    .subtitle { 
      font-size: 12px; 
      color: var(--text-dim); 
      font-weight: 400; 
    }

    /* Safe Value Sizing */
    .value {
      font-size: 12px; /* Reduced slightly to fit Uptime string safely */
      color: var(--text);
      font-weight: 400;
      text-shadow: 0 0 12px var(--text-glow);
      text-align: right;
      letter-spacing: -1px;
      white-space: nowrap;
    }
    
    .value span.unit {
      font-size: 12px;
      margin-left: 2px;
      letter-spacing: 0;
      font-weight: 500;
    }

    /* Unit specific coloring */
    .unit-up { color: var(--up-color); }
    .unit-tx { color: var(--tx-color); text-shadow: 0 0 8px hsla(280, 90%, 70%, 0.4); }
    .unit-rx { color: var(--rx-color); text-shadow: 0 0 8px hsla(120, 90%, 65%, 0.4); }

    /* Bars - Slimmed to 4px to reduce visual bloat */
    .bar-track {
      width: 100%;
      height: 8px; /* FIXED THICKNESS */
      background: #27272a;
      border-radius: 4px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 1s ease-in-out;
    }
    
    .fill-uptime { width: 100%; background: var(--up-color); box-shadow: 0 0 8px hsla(190, 90%, 55%, 0.5); }
    .fill-tx { width: 0%; background: var(--tx-color); box-shadow: 0 0 8px hsla(280, 90%, 70%, 0.5); }
    .fill-rx { width: 0%; background: var(--rx-color); box-shadow: 0 0 8px hsla(120, 90%, 65%, 0.5); }

  </style>
</head>
<body>
  <div class="container">
    
    <!-- Row 1: Uptime -->
    <div class="row">
      <div class="row-top">
        <div class="row-left">
          <div class="icon-wrapper icon-uptime">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="info">
            <p class="title">Uptime</p>
            <p class="subtitle">Online</p>
          </div>
        </div>
        <div class="value" id="uptime-display">
          --<span class="unit unit-up">d</span> --<span class="unit unit-up">h</span> --<span class="unit unit-up">m</span>
        </div>
      </div>
      <div class="bar-track"><div class="bar-fill fill-uptime"></div></div>
    </div>

    <!-- Row 2: TX (Up) -->
    <div class="row">
      <div class="row-top">
        <div class="row-left">
          <div class="icon-wrapper icon-tx">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </div>
          <div class="info">
            <p class="title">Upload</p>
          </div>
        </div>
        <div class="value" id="ul-val">0<span class="unit unit-tx">B/s</span></div>
      </div>
      <div class="bar-track"><div class="bar-fill fill-tx" id="ul-bar"></div></div>
    </div>

    <!-- Row 3: RX (Down) -->
    <div class="row">
      <div class="row-top">
        <div class="row-left">
          <div class="icon-wrapper icon-rx">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
          <div class="info">
            <p class="title">Download</p>
          </div>
        </div>
        <div class="value" id="dl-val">0<span class="unit unit-rx">B/s</span></div>
      </div>
      <div class="bar-track"><div class="bar-fill fill-rx" id="dl-bar"></div></div>
    </div>

  </div>

  <script>
    let prevRx = null, prevTx = null, prevTime = null;
    const maxSpeedBytes = 12.5 * 1024 * 1024; // 100Mbps scale

    function formatBytes(bytes, unitClass) {
      if (bytes < 1024) return bytes.toFixed(0) + \`<span class="unit \${unitClass}">B/s</span>\`;
      const k = 1024;
      const sizes = [\`<span class="unit \${unitClass}">B/s</span>\`, \`<span class="unit \${unitClass}">KB/s</span>\`, \`<span class="unit \${unitClass}">MB/s</span>\`, \`<span class="unit \${unitClass}">GB/s</span>\`];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(1) + sizes[i];
    }

    async function fetchData() {
      try {
        const res = await fetch('/api/uptime-network');
        const data = await res.json();
        const now = Date.now();

        // --- Handle Uptime ---
        const u = data.uptime;
        document.getElementById('uptime-display').innerHTML = 
          u.days + '<span class="unit unit-up">d</span> ' +
          u.hours + '<span class="unit unit-up">h</span> ' +
          u.minutes + '<span class="unit unit-up">m</span>';

        // --- Handle Network Speed ---
        const net = data.network;
        if (prevRx !== null) {
          const timeDiff = (now - prevTime) / 1000;
          const rxSpeed = Math.max(0, (net.rx - prevRx) / timeDiff);
          const txSpeed = Math.max(0, (net.tx - prevTx) / timeDiff);

          document.getElementById('dl-val').innerHTML = formatBytes(rxSpeed, 'unit-rx');
          document.getElementById('ul-val').innerHTML = formatBytes(txSpeed, 'unit-tx');

          document.getElementById('dl-bar').style.width = Math.min(100, (rxSpeed / maxSpeedBytes) * 100) + '%';
          document.getElementById('ul-bar').style.width = Math.min(100, (txSpeed / maxSpeedBytes) * 100) + '%';
        }
        
        prevRx = net.rx; 
        prevTx = net.tx; 
        prevTime = now;

      } catch (err) {
        console.error("Failed to fetch status", err);
      }
    }

    setInterval(fetchData, 1000);
    fetchData();
  </script>
</body>
</html>
  `);
});

export default router;
