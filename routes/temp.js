import express from "express";
import { execSync } from "child_process";
import os from "os";

const router = express.Router();

function getCpuTemp() {
  try {
    const output = execSync("sensors").toString();
    const match = output.match(/\+([0-9.]+)(?:°C)/);
    return match ? parseFloat(match[1]) : 0.0;
  } catch (error) {
    return 0.0;
  }
}

router.get("/api/temp", (req, res) => {
  res.json({ temp: getCpuTemp() });
});

router.get("/temp", (req, res) => {
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
      --brand: hsl(120, 90%, 55%);
      --brand-bg: hsla(120, 90%, 55%, 0.1);
      --brand-glow: hsla(120, 90%, 55%, 0.5);

      --bg: #121214;
      --border: rgba(255, 255, 255, 0.06);
      --text: #ffffff;
      --text-dim: #fff;
      --text-glow: rgba(255, 255, 255, 0.3);
    }

    * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

    body {
      margin: 0;
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
      transition: --brand 0.5s, --brand-bg 0.5s, --brand-glow 0.5s;
    }

    .container {
      width: 100%;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .icon-wrapper {
      width: 42px;
      height: 42px;
      background: var(--brand-bg);
      color: var(--brand);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 4px var(--brand-glow));
      transition: background 0.5s, color 0.5s, filter 0.5s;
    }

    .title-group { display: flex; flex-direction: column; }
    .title {
      font-size: 14px;
      color: var(--text);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
      text-shadow: 0 0 8px var(--text-glow);
    }
    .subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

    .usage-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-top: 4px;
    }

    .temp-val {
      font-size: 32px;
      color: var(--text);
      letter-spacing: -1px;
      text-shadow: 0 0 12px var(--text-glow);
      font-weight: 700;
    }

    .bar-track {
      width: 100%;
      height: 8px;
      background: #27272a;
      border-radius: 10px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      width: 0%; 
      background: var(--brand);
      border-radius: 10px;
      transition: width 1s ease-in-out, background 0.5s, box-shadow 0.5s;
      box-shadow: 0 0 10px var(--brand-glow);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    .stat-item { display: flex; flex-direction: column; gap: 2px;}
    .stat-label { font-size: 11px; color: var(--text-dim); text-transform: uppercase; }
    .stat-value {
      font-size: 14px;
      color: var(--text);
      text-shadow: 0 0 6px var(--text-glow);
    }

    #status-text {
      color: var(--brand);
      text-shadow: 0 0 8px var(--brand-glow);
      transition: color 0.5s, text-shadow 0.5s;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <rect x="9" y="9" width="6" height="6"></rect>
          <line x1="9" y1="1" x2="9" y2="4"></line>
          <line x1="15" y1="1" x2="15" y2="4"></line>
          <line x1="9" y1="20" x2="9" y2="23"></line>
          <line x1="15" y1="20" x2="15" y2="23"></line>
          <line x1="20" y1="9" x2="23" y2="9"></line>
          <line x1="20" y1="14" x2="23" y2="14"></line>
          <line x1="1" y1="9" x2="4" y2="9"></line>
          <line x1="1" y1="14" x2="4" y2="14"></line>
        </svg>
      </div>
      <div class="title-group">
        <p class="title">Temperature</p>
        <p class="subtitle">CPU Average</p>
      </div>
    </div>

    <div class="usage-row">
      <span class="temp-val" id="temp-display">--°C</span>
      <span class="subtitle" style="color: var(--text); text-shadow: 0 0 6px var(--text-glow);">Current</span>
    </div>

    <div class="bar-track">
      <div class="bar-fill" id="temp-bar"></div>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">High</span>
        <span class="stat-value">80°C</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Crit</span>
        <span class="stat-value">100°C</span>
      </div>
      <div class="stat-item" style="text-align: right;">
        <span class="stat-label">Load</span>
        <span class="stat-value" id="status-text">...</span>
      </div>
    </div>
  </div>

  <script>
    const MAX_TEMP = 100;

    function updateColors(temp) {
      let hue = Math.max(0, (1 - temp / MAX_TEMP) * 200);

      if (temp >= 90) hue = 0; 
      else if (temp >= 80) hue = 35;
      else if (temp >= 60) hue = 50;
      else if (temp >= 45) hue = 75;

      document.documentElement.style.setProperty('--brand', \`hsl(\${hue}, 90%, 55%)\`);
      document.documentElement.style.setProperty('--brand-bg', \`hsla(\${hue}, 90%, 55%, 0.1)\`);
      document.documentElement.style.setProperty('--brand-glow', \`hsla(\${hue}, 90%, 55%, 0.5)\`);

      const statusEl = document.getElementById('status-text');
      if (temp >= 90) statusEl.innerText = "CRIT";
      else if (temp >= 80) statusEl.innerText = "EXTREME";
      else if (temp >= 60) statusEl.innerText = "HEAVY";
      else if (temp >= 45) statusEl.innerText = "LIGHT";
      else statusEl.innerText = "IDLE";
    }

    async function fetchTemperature() {
      try {
        const response = await fetch('/api/temp');
        const data = await response.json();

        if (data.temp !== null) {
          const temp = data.temp;
          document.getElementById('temp-display').innerText = temp.toFixed(1) + '°C';
          const percent = Math.min((temp / MAX_TEMP) * 100, 100);
          document.getElementById('temp-bar').style.width = percent + '%';
          updateColors(temp);
        }
      } catch (err) {
        console.error("Failed to fetch temp", err);
      }
    }

    fetchTemperature();
    setInterval(fetchTemperature, 1000);
  </script>
</body>
</html>
  `);
});

export default router;
