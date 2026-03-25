import express from "express";
import { execSync } from "child_process";
import os from "os";
import memoryRoute from "./routes/memory.js";
import ssdRoute from "./routes/ssd.js";
import hddRoute from "./routes/hdd.js";
import tempRoute from "./routes/temp.js";
import cpuRoute from "./routes/cpu.js";
import uptimeRoute from "./routes/uptime.js";
import networkRoute from "./routes/network.js";

const app = express();
app.use(express.static("public"));

app.use("/", uptimeRoute);
app.use("/", networkRoute);
app.use("/", cpuRoute);
app.use("/", tempRoute);
app.use("/", hddRoute);
app.use("/", ssdRoute);
app.use("/", memoryRoute);

const PORT = 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Running on port ${PORT}`);
});

server.ref();
