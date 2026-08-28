import "dotenv/config";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import memoryRoute from "./routes/memory.js";
import skylineRoute from "./routes/skyline.js";
import uptimeNetworkRoute from "./routes/uptime-network.js";
import ssdRoute from "./routes/ssd.js";
import tempRoute from "./routes/temp.js";
import hddRoute from "./routes/hdd.js";
import cpuRoute from "./routes/cpu.js";
import uptimeRoute from "./routes/uptime.js";
import networkRoute from "./routes/network.js";
import spotifyRoute from "./routes/spotify.js";
import timeGreetRoute from "./routes/time.js";

const app = express();
app.use(express.static("public"));

app.use("/", uptimeRoute);
app.use("/", networkRoute);
app.use("/", cpuRoute);
app.use("/", hddRoute);
app.use("/", ssdRoute);
app.use("/", memoryRoute);
app.use("/", timeGreetRoute);
app.use("/", spotifyRoute);
app.use("/", skylineRoute);
app.use("/", uptimeNetworkRoute);
app.use("/", tempRoute);

const PORT = 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Running on port ${PORT}`);
});

server.ref();
