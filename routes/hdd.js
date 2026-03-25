import express from "express";
import { execSync } from "child_process";
import os from "os";

const router = express.Router();

function getDisk(path = "") {
  const output = execSync(`df -h ${path}`).toString().split("\n")[1];
  const parts = output.trim().split(/\s+/);

  const percentNum = parseInt(parts[4].replace("%", ""));

  return {
    filesystem: parts[0],
    total: parts[1],
    used: parts[2],
    available: parts[3],
    percent: parts[4],
    percent_num: percentNum,
    mount: parts[5],
  };
}

router.get("/hdd", (req, res) => {
  const d = getDisk("/DATA/Mount");
  const percentNum = d.percent_num;

  res.send(`
    <!DOCTYPE html>
    <html style="color-scheme: dark; background: transparent;">
    <head>
    <meta charset="UTF-8">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#121214">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      /* Adjust these per-card if needed */
      --brand: hsl(${(1 - percentNum / 100) * 200}, 90%, 55%);
      --brand-bg: hsla(${(1 - percentNum / 100) * 200}, 90%, 55%, 0.1);

      --bg: #121214;
      --border: rgba(255, 255, 255, 0.06);
      --text: #ffffff;
      --text-dim: #fff;

      /* Glow Variables */
      --brand-glow: hsla(${(1 - percentNum / 100) * 200}, 90%, 55%, 0.5);
      --text-glow: rgba(255, 255, 255, 0.3);
    }

    * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

    body {
      margin: 0;
      /* Body now inherits the 'card' style for a full-page effect */
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
      /* Icon Glow */
      filter: drop-shadow(0 0 4px var(--brand-glow));
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
      font-size: 14px;
    }

    .percent-val {
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
      width: ${percentNum}%;
      background: var(--brand);
      border-radius: 10px;
      transition: width 1s ease-in-out;
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

    .health-ok {
      color: #22c55e;
      text-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="8" height="16" rx="1.5"/>
          <rect x="13" y="4" width="8" height="16" rx="1.5"/>
          <line x1="7" y1="8" x2="7" y2="8.01"/>
          <line x1="17" y1="8" x2="17" y2="8.01"/>
        </svg>
      </div>
      <div class="title-group">
        <p class="title">Media Storage</p>
        <p class="subtitle">/DATA/Mount</p>
      </div>
    </div>

    <div class="usage-row">
      <span class="percent-val">${d.percent}</span>
      <span class="subtitle" style="color: var(--text); text-shadow: 0 0 6px var(--text-glow);">${d.used} Used</span>
    </div>

    <div class="bar-track">
      <div class="bar-fill"></div>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Free</span>
        <span class="stat-value">${d.available}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total</span>
        <span class="stat-value">${d.total}</span>
      </div>
      <div class="stat-item" style="text-align: right;">
        <span class="stat-label">Running</span>
        <span class="stat-value health-ok">YES</span>
      </div>
    </div>
  </div>
</body>
</html>
  `);
});
export default router;
