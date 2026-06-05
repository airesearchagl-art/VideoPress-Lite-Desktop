const fs = require("node:fs");
const path = require("node:path");

const distDir = path.join(__dirname, "..", "dist");
const latestPath = path.join(distDir, "latest.yml");
const artifactName = "VideoPress Lite Desktop Setup.exe";

if (!fs.existsSync(latestPath)) {
  process.exit(0);
}

const content = fs.readFileSync(latestPath, "utf8");
const normalized = content.replaceAll("VideoPress-Lite-Desktop-Setup.exe", artifactName);

fs.writeFileSync(latestPath, normalized);
