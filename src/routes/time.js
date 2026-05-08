import express from "express";
import { execSync } from "child_process";

const router = express.Router();

export function getTime() {
  const output = execSync(`date +"%A, %B %d, %Y %I:%M:%S %p"`, {
    encoding: "utf-8",
  });

  const parts = output.trim().split(/\s+/);
  const timeString = parts[4];
  const ampm = parts[5];
  const dayName = parts[0].replace(parts[0][parts[0].length - 1], "");
  const day = parts[2].replace(parts[2][parts[2].length - 1], "");

  let hour = parseInt(timeString.split(":")[0], 10);

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  if (hour >= 0 && hour < 3) {
    return {
      greeting: "Midnight",
      day_name: dayName,
      month: parts[1],
      day: day,
      year: parts[3],
      time: timeString,
    };
  }
  if (hour >= 3 && hour < 6) {
    return {
      greeting: "Early Morning",
      day_name: dayName,
      month: parts[1],
      day: day,
      year: parts[3],
      time: timeString,
    };
  }
  if (hour >= 6 && hour < 12) {
    return {
      greeting: "Good Morning",
      day_name: dayName,
      month: parts[1],
      day: day,
      year: parts[3],
      time: timeString,
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      greeting: "Good Afternoon",
      day_name: dayName,
      month: parts[1],
      day: day,
      year: parts[3],
      time: timeString,
    };
  }
  if (hour >= 17 && hour < 21) {
    return {
      greeting: "Good Evening",
      day_name: dayName,
      month: parts[1],
      day: day,
      year: parts[3],
      time: timeString,
    };
  }
  if (hour >= 21 && hour <= 24) {
    return {
      greeting: "Good Night",
      day_name: dayName,
      month: parts[1],
      day: day,
      year: parts[3],
      time: timeString,
    };
  }
}

router.get("/api/time", (req, res) => {
  res.json(getTime());
});

router.get("/time", (req, res) => {
  const data = getTime();

  const shortTime = data.time.split(":").slice(0, 2).join(":");

  const html = `
    <!DOCTYPE html>
    <html style="color-scheme: dark; background: transparent;">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="refresh" content="60">
      <style>
        :root {
      --text: #ffffff;
      --text-dim: #e4e4e7; 
      --text-glow: rgba(255, 255, 255, 0.4);
    }

    * { 
      box-sizing: border-box; 
      -webkit-font-smoothing: antialiased; 
    }

    body {
      margin: 0;
      padding: 0;
      background-color: transparent;
      color: var(--text);
      font-family: 'JetBrains Mono', 'Cascadia Code', monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }

    .greeting {
      font-size: 15px;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 10px;
      color: var(--text-dim);
      text-shadow: 0px 2px 4px rgba(0,0,0,0.8), 0 0 8px var(--text-glow);
    }

    .time {
      font-size: 30px;
      font-weight: bold;
      letter-spacing: 4px;
      margin: 0;
      color: var(--text);
      text-shadow: 0px 2px 6px rgba(0,0,0,0.8), 0 0 12px var(--text-glow);
    }

    .date {
      font-size: 15px;
      letter-spacing: 2px;
      font-weight: bold;
      margin-top: 10px;
      color: var(--text-dim);
      text-shadow: 0px 2px 4px rgba(0,0,0,0.8), 0 0 8px var(--text-glow);
    }
      </style>
    </head>
    <body>
      <div class="greeting">${data.greeting}</div>
      <div class="time">${shortTime}</div>
      <div class="date">${data.day_name}, ${data.day} ${data.month}</div>
    </body>
    </html>
  `;

  res.send(html);
});

export default router;
