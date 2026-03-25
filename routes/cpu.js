import express from "express";
import os from "os";

const router = express.Router();

function getCpuUsage() {
  return new Promise((resolve) => {
    const cpus = os.cpus();
    const startIdle = cpus.reduce((acc, core) => acc + core.times.idle, 0);
    const startTotal = cpus.reduce((acc, core) => {
      return (
        acc + Object.values(core.times).reduce((sum, time) => sum + time, 0)
      );
    }, 0);
    setTimeout(() => {
      const endCpus = os.cpus();
      const endIdle = endCpus.reduce((acc, core) => acc + core.times.idle, 0);
      const endTotal = endCpus.reduce((acc, core) => {
        return (
          acc + Object.values(core.times).reduce((sum, time) => sum + time, 0)
        );
      }, 0);

      const idleDiff = endIdle - startIdle;
      const totalDiff = endTotal - startTotal;
      const percent =
        totalDiff === 0 ? 0 : 100 - Math.round((idleDiff / totalDiff) * 100);

      resolve(percent);
    }, 100);
  });
}
router.get("/api/cpu", async (req, res) => {
  const usage = await getCpuUsage();
  res.json({ usage });
});

router.get("/cpu", async (req, res) => {
  const initialUsage = await getCpuUsage();
  const cores = os.cpus().length;

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
      /* Dynamic variables controlled by JS */
      --brand: hsl(120, 90%, 55%);
      --brand-bg: hsla(120, 90%, 55%, 0.1);
      --brand-glow: hsla(120, 90%, 55%, 0.5);

      /* Static Theme Variables */
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

    .cpu-val {
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
      width: 0%; /* Set by JS */
      background: var(--brand);
      border-radius: 10px;
      transition: width 1s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s, box-shadow 0.5s;
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      </div>
      <div class="title-group">
        <p class="title">CPU</p>
        <p class="subtitle">Utilization</p>
      </div>
    </div>

    <div class="usage-row">
      <span class="cpu-val" id="cpu-display">${initialUsage}%</span>
      <span class="subtitle" style="color: var(--text); text-shadow: 0 0 6px var(--text-glow);">Usage</span>
    </div>

    <div class="bar-track">
      <div class="bar-fill" id="cpu-bar" style="width: ${initialUsage}%"></div>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Cores</span>
        <span class="stat-value">${cores}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Max</span>
        <span class="stat-value">100%</span>
      </div>
      <div class="stat-item" style="text-align: right;">
        <span class="stat-label">Load</span>
        <span class="stat-value" id="status-text">OK</span>
      </div>
    </div>
  </div>

  <script>
    function updateColors(usage) {
      let hue = Math.max(0, (1 - usage / 100) * 200);
      if (usage >= 90) hue = 0; 
      else if (usage >= 75) hue = 35;
      else if (usage >= 50) hue = 50;
      else if (usage >= 35) hue = 75;

      document.documentElement.style.setProperty('--brand', \`hsl(\${hue}, 90%, 55%)\`);
      document.documentElement.style.setProperty('--brand-bg', \`hsla(\${hue}, 90%, 55%, 0.1)\`);
      document.documentElement.style.setProperty('--brand-glow', \`hsla(\${hue}, 90%, 55%, 0.5)\`);

      const statusEl = document.getElementById('status-text');
      if (usage >= 95) {
    hue = 0; 
    statusEl.innerText = "CRITICAL";
  } else if (usage >= 85) {
    hue = 15;
    statusEl.innerText = "MAXED";
  } else if (usage >= 70) {
    hue = 30;
    statusEl.innerText = "EXTREME";
  } else if (usage >= 55) {
    hue = 45;
    statusEl.innerText = "HEAVY";
  } else if (usage >= 40) {
    hue = 60;
    statusEl.innerText = "ACTIVE"; 
  } else if (usage >= 25) {
    hue = 100;
    statusEl.innerText = "STEADY";
  } else if (usage >= 10) {
    hue = 140;
    statusEl.innerText = "LIGHT";
  } else if (usage >= 3) {
    hue = 170;
    statusEl.innerText = "NOMINAL"; 
  } else {
    hue = 200;
    statusEl.innerText = "IDLE";
  }
    }
    updateColors(${initialUsage});

    async function fetchCpu() {
      try {
        const response = await fetch('/api/cpu');
        const data = await response.json();

        if (data.usage !== null) {
          const usage = data.usage;

          document.getElementById('cpu-display').innerText = usage + '%';
          document.getElementById('cpu-bar').style.width = usage + '%';
          
          updateColors(usage);
        }
      } catch (err) {
        console.error("Failed to fetch cpu data", err);
      }
    }
    // Polling
    setInterval(fetchCpu, 750);
  </script>
</body>
</html>
  `);
});

export default router;
