import express from "express";
import os from "os";

const router = express.Router();

router.get("/api/memory", (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const percentNum = Math.round((usedMem / totalMem) * 100);

  const formatGB = (bytes) => (bytes / 1024 ** 3).toFixed(1) + "G";

  res.json({
    percentNum,
    used: formatGB(usedMem),
    free: formatGB(freeMem),
    total: formatGB(totalMem),
  });
});

router.get("/memory", (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const percentNum = Math.round((usedMem / totalMem) * 100);

  const formatGB = (bytes) => (bytes / 1024 ** 3).toFixed(1) + "G";
  const total = formatGB(totalMem);
  const used = formatGB(usedMem);
  const free = formatGB(freeMem);

  const initialHue = Math.max(0, (1 - percentNum / 100) * 200);

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
          /* Dynamic variables controlled by JS */
          --brand: hsl(${initialHue}, 90%, 55%);
          --brand-bg: hsla(${initialHue}, 90%, 55%, 0.1);
          --brand-glow: hsla(${initialHue}, 90%, 55%, 0.5);

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
        
        .container { width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 16px; }
        .header { display: flex; align-items: center; gap: 12px; }
        
        .icon-wrapper {
          width: 42px; height: 42px; background: var(--brand-bg); color: var(--brand);
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          filter: drop-shadow(0 0 4px var(--brand-glow)); 
          transition: background 0.5s, color 0.5s, filter 0.5s;
        }
        
        .title-group { display: flex; flex-direction: column; }
        .title { font-size: 14px; color: var(--text); text-transform: uppercase; margin: 0; text-shadow: 0 0 8px var(--text-glow); letter-spacing: 0.5px; }
        .subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }
        
        .usage-row { display: flex; align-items: baseline; justify-content: space-between; margin-top: 4px; }
        .percent-val { font-size: 32px; color: var(--text); font-weight: 700; text-shadow: 0 0 12px var(--text-glow); letter-spacing: -1px; }
        
        .bar-track { width: 100%; height: 8px; background: #27272a; border-radius: 10px; overflow: hidden; }
        .bar-fill {
          height: 100%; width: ${percentNum}%; background: var(--brand);
          border-radius: 10px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s, box-shadow 0.5s;
          box-shadow: 0 0 10px var(--brand-glow);
        }
        
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding-top: 16px; border-top: 1px solid var(--border); }
        .stat-item { display: flex; flex-direction: column; gap: 2px; }
        .stat-label { font-size: 11px; color: var(--text-dim); text-transform: uppercase; }
        .stat-value { font-size: 14px; color: var(--text); text-shadow: 0 0 6px var(--text-glow); }
        
        #status-val {
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
              <rect x="2" y="8" width="20" height="8" rx="1.5" /><line x1="7" y1="12" x2="7" y2="12.01" /><line x1="12" y1="12" x2="12" y2="12.01" /><line x1="17" y1="12" x2="17" y2="12.01" />
            </svg>
          </div>
          <div class="title-group">
            <p class="title">Memory Usage</p>
            <p class="subtitle">RAM</p>
          </div>
        </div>
        
        <div class="usage-row">
          <span class="percent-val" id="val-percent">${percentNum}%</span>
          <span class="subtitle" id="val-used" style="color: var(--text); text-shadow: 0 0 6px var(--text-glow);">${used} Used</span>
        </div>
        
        <div class="bar-track">
          <div class="bar-fill" id="bar-fill"></div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Free</span>
            <span class="stat-value" id="val-free">${free}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total</span>
            <span class="stat-value">${total}</span>
          </div>
          <div class="stat-item" style="text-align: right;">
            <span class="stat-label">Status</span>
            <span class="stat-value" id="status-val">OK</span>
          </div>
        </div>
      </div>

      <script>
        function updateColors(percent) {
          let hue = Math.max(0, (1 - percent / 100) * 200);

          const root = document.documentElement;
          root.style.setProperty('--brand', \`hsl(\${hue}, 90%, 55%)\`);
          root.style.setProperty('--brand-bg', \`hsla(\${hue}, 90%, 55%, 0.1)\`);
          root.style.setProperty('--brand-glow', \`hsla(\${hue}, 90%, 55%, 0.5)\`);

          const statusEl = document.getElementById('status-val');
          if (percent >= 95) statusEl.innerText = "OOM RISK";
          else if (percent >= 90) statusEl.innerText = "CRITICAL";
          else if (percent >= 80) statusEl.innerText = "HEAVY";
          else if (percent >= 70) statusEl.innerText = "ACTIVE";
          else if (percent >= 50) statusEl.innerText = "BUSY";
          else if (percent >= 40) statusEl.innerText = "NORMAL";
          else if (percent >= 30) statusEl.innerText = "LIGHT";
          else if (percent >= 20) status.El.innerText = "LOW";
          else statusEl.innerText = "IDLE";
        }

        updateColors(${percentNum});

        async function fetchMemory() {
          try {
            const res = await fetch('/api/memory');
            const data = await res.json();

            document.getElementById('val-percent').innerText = data.percentNum + '%';
            document.getElementById('val-used').innerText = data.used + ' Used';
            document.getElementById('val-free').innerText = data.free;
            document.getElementById('bar-fill').style.width = data.percentNum + '%';

            updateColors(data.percentNum);
          } catch (err) {
            console.error("Failed to fetch memory data:", err);
          }
        }

        setInterval(fetchMemory, 1000);
      </script>
    </body>
    </html>
  `);
});

export default router;
