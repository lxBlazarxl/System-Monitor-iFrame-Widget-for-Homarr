import express from "express";
import os from "os";

const router = express.Router();

const getUptime = () => {
  const uptimeSeconds = os.uptime();
  const days = Math.floor(uptimeSeconds / (3600 * 24));
  const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);

  return { days, hours, minutes, raw: uptimeSeconds };
};

router.get("/api/uptime", (req, res) => {
  res.json(getUptime());
});

router.get("/uptime", (req, res) => {
  const { days, hours } = getUptime();

  res.send(`
    <!DOCTYPE html>
    <html style="color-scheme: dark; background: transparent;">
    <head>
      <meta charset="UTF-8">
      <meta name="theme-color" content="#121214">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        :root {
          /* Fixed Blue Theme */
          --brand: hsl(210, 100%, 55%);
          --brand-bg: hsla(210, 100%, 55%, 0.15);
          --brand-glow: hsla(210, 100%, 55%, 0.5);
          
          --bg: #121214;
          --border: rgba(255, 255, 255, 0.06);
          --text: #ffffff;
          --text-dim: #fff;
          --text-glow: rgba(255, 255, 255, 0.3);
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body {
          margin: 0; background: none; font-family: 'JetBrains Mono', monospace;
          display: flex; justify-content: center; align-items: center;
          height: 100vh; width: 100vw; overflow: hidden; padding: 16px;
        }
        .container { 
          width: 100%; 
          max-width: 160px; 
          display: flex; flex-direction: column; gap: 12px; 
        }
        
        .top-row { 
          display: flex; align-items: center; justify-content: space-between; 
        }
        
        .left-group {
          display: flex; align-items: center; gap: 10px;
        }

        .icon-wrapper {
          width: 32px; height: 32px; background: var(--brand-bg); color: var(--brand);
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          filter: drop-shadow(0 0 4px var(--brand-glow)); 
          flex-shrink: 0;
        }

        .uptime-val { 
          font-size: 20px; color: var(--text); font-weight: 700; 
          text-shadow: 0 0 10px var(--text-glow); white-space: nowrap; 
        }
        
        .status-badge { 
          color: var(--brand); font-weight: 600; font-size: 10px; letter-spacing: 0.5px; margin: 7px;
        }
        
        .bar-track { width: 100%; height: 6px; background: #27272a; border-radius: 10px; overflow: hidden; }
        .bar-fill {
          height: 100%; width: 100%; background: var(--brand);
          border-radius: 10px; box-shadow: 0 0 10px var(--brand-glow);
          animation: pulse 3s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="top-row">
          <div class="left-group">
            <div class="icon-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </div>
            <span class="uptime-val" id="val-main">${days}d ${hours}h </span>
          </div>
          <span class="status-badge">ONLINE</span>
        </div>

        <div class="bar-track">
          <div class="bar-fill"></div>
        </div>
      </div>

      <script>
        setInterval(async () => {
          try {
            const res = await fetch('/api/uptime');
            const data = await res.json();
            document.getElementById('val-main').innerText = data.days + 'd ' + data.hours + 'h';
          } catch (err) {
            console.error("Fetch error:", err);
          }
        }, 60000);
      </script>
    </body>
    </html>
  `);
});
export default router;
