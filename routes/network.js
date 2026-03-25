import express from "express";
import fs from "fs/promises";

const router = express.Router();

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
    console.error("Error reading network stats:", err);
    return { rx: 0, tx: 0 };
  }
};

router.get("/api/network", async (req, res) => {
  const data = await getNetworkBytes();
  res.json(data);
});

router.get("/network", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html style="color-scheme: dark; background: transparent;">
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --brand-dl: hsl(270, 100%, 65%);
          --brand-dl-bg: hsla(270, 100%, 65%, 0.15);
          --brand-dl-glow: hsla(270, 100%, 65%, 0.4);
          --brand-ul: hsl(320, 100%, 60%);
          --brand-ul-bg: hsla(320, 100%, 60%, 0.15);
          --brand-ul-glow: hsla(320, 100%, 60%, 0.4);
          --text: #ffffff;
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body {
          margin: 0; background: none; font-family: 'JetBrains Mono', monospace;
          display: flex; justify-content: center; align-items: center;
          height: 100vh; width: 100vw; overflow: hidden;
        }
        .container { 
          width: 100%; 
          max-width: 160px; 
          padding: 0 12px; /* Added side padding to prevent border touching */
          display: flex; flex-direction: column; gap: 14px; 
        }
        
        .stat-group { display: flex; flex-direction: column; gap: 6px; }
        .top-row { display: flex; align-items: center; gap: 8px; }
        
        .icon-wrapper {
          width: 26px; height: 26px; border-radius: 6px; 
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .icon-dl { background: var(--brand-dl-bg); color: var(--brand-dl); }
        .icon-ul { background: var(--brand-ul-bg); color: var(--brand-ul); }

        .speed-val { 
          font-size: 13px; /* Slightly smaller to fit better */
          color: var(--text); font-weight: 700; 
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        
        .bar-track { width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 10px; transition: width 1s linear; }
        
        .bar-dl { background: var(--brand-dl); box-shadow: 0 0 8px var(--brand-dl-glow); width: 0%; }
        .bar-ul { background: var(--brand-ul); box-shadow: 0 0 8px var(--brand-ul-glow); width: 0%; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="stat-group">
          <div class="top-row">
            <div class="icon-wrapper icon-dl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 13l5 5 5-5M12 18V6"/></svg>
            </div>
            <span class="speed-val" id="dl-val">0 B/s</span>
          </div>
          <div class="bar-track"><div class="bar-fill bar-dl" id="dl-bar"></div></div>
        </div>

        <div class="stat-group">
          <div class="top-row">
            <div class="icon-wrapper icon-ul">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11l-5-5-5 5M12 6v12"/></svg>
            </div>
            <span class="speed-val" id="ul-val">0 B/s</span>
          </div>
          <div class="bar-track"><div class="bar-fill bar-ul" id="ul-bar"></div></div>
        </div>
      </div>

      <script>
        let prevRx = null, prevTx = null, prevTime = null;
        const maxSpeedBytes = 12.5 * 1024 * 1024; // 100Mbps scale, since my internet speed is capped to that

        function formatBytes(bytes) {
          if (bytes < 1024) return bytes.toFixed(0) + ' B/s';
          const k = 1024;
          const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
        }

        async function fetchNetwork() {
          try {
            const res = await fetch('/api/network');
            const data = await res.json();
            const now = Date.now();

            if (prevRx !== null) {
              const timeDiff = (now - prevTime) / 1000;
              const rxSpeed = Math.max(0, (data.rx - prevRx) / timeDiff);
              const txSpeed = Math.max(0, (data.tx - prevTx) / timeDiff);

              document.getElementById('dl-val').innerText = formatBytes(rxSpeed);
              document.getElementById('ul-val').innerText = formatBytes(txSpeed);

              document.getElementById('dl-bar').style.width = Math.min(100, (rxSpeed / maxSpeedBytes) * 100) + '%';
              document.getElementById('ul-bar').style.width = Math.min(100, (txSpeed / maxSpeedBytes) * 100) + '%';
            }
            prevRx = data.rx; prevTx = data.tx; prevTime = now;
          } catch (err) {}
        }
        setInterval(fetchNetwork, 1000);
        fetchNetwork();
      </script>
    </body>
    </html>
  `);
});

export default router;
