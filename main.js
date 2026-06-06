const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const { pathToFileURL } = require("node:url");

const SUPPORTED_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".avi", ".mkv", ".webm"]);
const PRESETS = {
  light: { width: 720, crf: 32, preset: "veryfast", audio: "64k" },
  standard: { width: 1280, crf: 28, preset: "veryfast", audio: "96k" },
  high: { width: 1920, crf: 23, preset: "fast", audio: "128k" },
};
const TARGET_SIZE_PRESETS = {
  outlook20: { targetSizeMB: 20, width: 720, audio: "64k" },
  teams100: { targetSizeMB: 100, width: 1280, audio: "96k" },
  site300: { targetSizeMB: 300, width: 1920, audio: "128k" },
};
const NVENC_ENCODERS = ["h264_nvenc", "hevc_nvenc", "av1_nvenc"];
const VIDEO_ENCODERS = new Set(["cpu", ...NVENC_ENCODERS]);
const DEFAULT_SAVED_SETTINGS = {
  compression: {
    mode: "standard",
    width: 1280,
    crf: 28,
    preset: "veryfast",
    audio: "96k",
    encoder: "cpu",
    targetSizeMB: 100,
  },
  paths: {
    lastInputDirectory: "",
    lastOutputDirectory: "",
  },
};

let mainWindow;
let currentProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 820,
    minWidth: 920,
    minHeight: 680,
    title: "VideoPress Lite Desktop",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  registerIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function registerIpc() {
  ipcMain.handle("app:check-tools", checkTools);
  ipcMain.handle("file:select-video", selectVideoFile);
  ipcMain.handle("video:probe", (_event, filePath) => probeVideo(filePath));
  ipcMain.handle("video:compress", (_event, payload) => compressVideo(payload));
  ipcMain.handle("folder:open", (_event, folderPath) => openFolder(folderPath));
  ipcMain.handle("settings:get", getSavedSettings);
  ipcMain.handle("settings:save", (_event, settings) => saveSettings(settings));
  ipcMain.handle("settings:reset", resetSettings);
}

async function checkTools() {
  const ffmpegTool = resolveTool("ffmpeg");
  const ffprobeTool = resolveTool("ffprobe");

  const [ffmpeg, ffprobe, encoders, gpu] = await Promise.all([
    getToolVersion(ffmpegTool.command, ["-version"]),
    getToolVersion(ffprobeTool.command, ["-version"]),
    getEncoderSupport(ffmpegTool.command),
    getGpuInfo(),
  ]);

  return {
    ffmpegPath: ffmpegTool.command,
    ffprobePath: ffprobeTool.command,
    ffmpegSource: ffmpegTool.source,
    ffprobeSource: ffprobeTool.source,
    ffmpeg,
    ffprobe,
    encoders,
    gpu,
  };
}

function resolveToolPath(toolName) {
  return resolveTool(toolName).command;
}

function resolveTool(toolName) {
  const exeName = process.platform === "win32" ? `${toolName}.exe` : toolName;
  const bundledPath = path.join(process.resourcesPath || __dirname, "ffmpeg", "win", exeName);
  const devBundledPath = path.join(__dirname, "resources", "ffmpeg", "win", exeName);

  if (fs.existsSync(devBundledPath)) return { command: devBundledPath, source: "bundled" };
  if (fs.existsSync(bundledPath)) return { command: bundledPath, source: "bundled" };
  return { command: toolName, source: "path" };
}

function getToolVersion(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { windowsHide: true });
    let output = "";
    let errorOutput = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });
    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });
    child.on("error", (error) => {
      resolve({ available: false, message: error.message });
    });
    child.on("close", (code) => {
      const text = output || errorOutput;
      resolve({
        available: code === 0,
        message: code === 0 ? firstLine(text) : errorOutput || output || `終了コード: ${code}`,
        version: firstLine(text),
      });
    });
  });
}

async function selectVideoFile() {
  const savedSettings = getSavedSettings();
  const defaultPath = savedSettings.paths.lastInputDirectory && fs.existsSync(savedSettings.paths.lastInputDirectory)
    ? savedSettings.paths.lastInputDirectory
    : undefined;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "動画ファイルを選択",
    properties: ["openFile", "multiSelections"],
    defaultPath,
    filters: [{ name: "Video", extensions: ["mp4", "mov", "m4v", "avi", "mkv", "webm"] }],
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths;
}

async function probeVideo(filePath) {
  validateInputFile(filePath);
  const ffprobePath = resolveToolPath("ffprobe");
  const args = [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    filePath,
  ];
  const result = await runProcess(ffprobePath, args);

  if (result.code !== 0) {
    throw new UserError("ffprobeの実行に失敗しました。ffprobeがインストールされているか確認してください。");
  }

  const data = JSON.parse(result.stdout);
  const videoStream = data.streams.find((stream) => stream.codec_type === "video") || {};
  const audioStream = data.streams.find((stream) => stream.codec_type === "audio") || {};
  const stat = fs.statSync(filePath);

  return {
    filePath,
    fileName: path.basename(filePath),
    directory: path.dirname(filePath),
    size: stat.size,
    duration: Number(data.format?.duration || videoStream.duration || 0),
    width: Number(videoStream.width || 0),
    height: Number(videoStream.height || 0),
    videoCodec: videoStream.codec_name || "不明",
    audioCodec: audioStream.codec_name || "なし",
    bitRate: Number(data.format?.bit_rate || videoStream.bit_rate || 0),
    frameRate: parseFrameRate(videoStream.avg_frame_rate || videoStream.r_frame_rate),
  };
}

async function compressVideo(payload) {
  validateInputFile(payload.filePath);
  const metadata = await probeVideo(payload.filePath);
  const ffmpegPath = resolveToolPath("ffmpeg");
  const outputPath = buildOutputPath(payload.filePath);

  if (fs.existsSync(outputPath)) {
    throw new UserError("出力ファイルが既に存在します。既存ファイルを移動または削除してから再実行してください。");
  }
  ensureWritable(path.dirname(outputPath));

  const settings = normalizeSettings(payload.settings, metadata);
  if (settings.encoder !== "cpu") {
    const support = await getEncoderSupport(ffmpegPath);
    if (!support[settings.encoder]) {
      throw new UserError(`${settings.encoder} がこのFFmpegで利用できません。CPUまたは利用可能なNVENCを選択してください。`);
    }
  }
  const args = buildFfmpegArgs(payload.filePath, outputPath, settings);
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    currentProcess = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = "";

    currentProcess.stderr.on("data", (data) => {
      const text = data.toString();
      stderr += text;
      emitProgress(text, metadata.duration, startedAt);
    });

    currentProcess.on("error", (error) => {
      currentProcess = null;
      reject(toUserError(error, "同梱FFmpegが見つからず、PATH上のFFmpegも利用できません。resources/ffmpeg/win/ffmpeg.exe を確認してください。"));
    });

    currentProcess.on("close", (code) => {
      currentProcess = null;
      if (code !== 0) {
        reject(new UserError(`圧縮に失敗しました。FFmpegログを確認してください。\n${lastLines(stderr, 8)}`));
        return;
      }

      const outputStat = fs.statSync(outputPath);
      const previewUrl = pathToFileURL(outputPath).href;
      sendProgress({
        status: "完了",
        percent: 100,
        elapsedSeconds: (Date.now() - startedAt) / 1000,
        speed: "-",
      });
      resolve({
        outputPath,
        outputDirectory: path.dirname(outputPath),
        previewUrl,
        beforeSize: metadata.size,
        afterSize: outputStat.size,
        target: settings.target || null,
      });
    });
  });
}

function buildFfmpegArgs(inputPath, outputPath, settings) {
  const args = ["-y", "-i", inputPath];

  if (settings.width !== "original") {
    args.push("-vf", `scale=${settings.width}:-2`);
  }

  if (settings.modeType === "targetSize") {
    const videoBitrate = `${settings.target.videoBitrateKbps}k`;
    const bufsize = `${settings.target.videoBitrateKbps * 2}k`;
    if (settings.encoder === "cpu") {
      args.push(
        "-c:v",
        "libx264",
        "-b:v",
        videoBitrate,
        "-maxrate",
        videoBitrate,
        "-bufsize",
        bufsize,
        "-preset",
        settings.preset,
      );
    } else {
      args.push(
        "-c:v",
        settings.encoder,
        "-b:v",
        videoBitrate,
        "-maxrate",
        videoBitrate,
        "-bufsize",
        bufsize,
        "-preset",
        "p5",
      );
    }
  } else if (settings.encoder === "cpu") {
    args.push("-c:v", "libx264", "-preset", settings.preset, "-crf", String(settings.crf));
  } else {
    args.push("-c:v", settings.encoder, "-preset", "p5", "-cq", String(settings.crf));
  }

  args.push("-c:a", "aac", "-b:a", settings.audio, "-movflags", "+faststart", outputPath);

  return args;
}

function normalizeSettings(settings = {}, metadata = {}) {
  const encoder = VIDEO_ENCODERS.has(settings.encoder) ? settings.encoder : "cpu";
  if (settings.mode && PRESETS[settings.mode]) {
    return { ...PRESETS[settings.mode], encoder };
  }

  if (settings.mode && TARGET_SIZE_PRESETS[settings.mode]) {
    return normalizeTargetSizeSettings({ ...settings, ...TARGET_SIZE_PRESETS[settings.mode], encoder }, metadata);
  }

  if (settings.mode === "targetCustom") {
    return normalizeTargetSizeSettings({ ...settings, encoder }, metadata);
  }

  return {
    width: settings.width || 1280,
    crf: clampNumber(Number(settings.crf), 18, 35, 28),
    preset: ["veryfast", "fast", "medium", "slow"].includes(settings.preset) ? settings.preset : "veryfast",
    audio: ["64k", "96k", "128k"].includes(settings.audio) ? settings.audio : "96k",
    encoder,
  };
}

function normalizeTargetSizeSettings(settings, metadata) {
  const durationSeconds = Math.max(Number(metadata.duration || 0), 1);
  const targetSizeMB = clampNumber(Number(settings.targetSizeMB), 1, 100000, 100);
  const audio = ["64k", "96k", "128k"].includes(settings.audio) ? settings.audio : "96k";
  const audioBitrateKbps = Number.parseInt(audio, 10);
  const targetTotalBitrateKbps = Math.max(1, Math.round((targetSizeMB * 8192) / durationSeconds));
  const rawVideoBitrateKbps = targetTotalBitrateKbps - audioBitrateKbps;
  const videoBitrateKbps = Math.max(300, Math.round(rawVideoBitrateKbps));

  return {
    modeType: "targetSize",
    width: settings.width || 1280,
    preset: "veryfast",
    audio,
    encoder: settings.encoder,
    target: {
      targetSizeMB,
      audioBitrateKbps,
      targetTotalBitrateKbps,
      videoBitrateKbps,
      achievable: videoBitrateKbps >= 500,
    },
  };
}

async function getEncoderSupport(ffmpegPath) {
  const support = Object.fromEntries(NVENC_ENCODERS.map((name) => [name, false]));

  try {
    const result = await runProcess(ffmpegPath, ["-encoders"]);
    const text = `${result.stdout}\n${result.stderr}`;
    for (const encoder of NVENC_ENCODERS) {
      support[encoder] = new RegExp(`\\b${encoder}\\b`).test(text);
    }
  } catch {
    // 起動時のFFmpeg未検出は別メッセージで扱う。
  }

  return support;
}

function getGpuInfo() {
  return new Promise((resolve) => {
    const child = spawn("nvidia-smi", ["--query-gpu=name", "--format=csv,noheader"], { windowsHide: true });
    let output = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });
    child.on("error", () => {
      resolve({ available: false, names: [], hasRtx4090: false });
    });
    child.on("close", (code) => {
      const names = code === 0 ? output.split(/\r?\n/).map((name) => name.trim()).filter(Boolean) : [];
      resolve({
        available: names.length > 0,
        names,
        hasRtx4090: names.some((name) => /rtx\s*4090/i.test(name)),
      });
    });
  });
}

function buildOutputPath(inputPath) {
  const parsed = path.parse(inputPath);
  return path.join(parsed.dir, `${parsed.name}-compressed.mp4`);
}

function emitProgress(text, duration, startedAt) {
  const timeMatch = text.match(/time=(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/);
  const speedMatch = text.match(/speed=\s*([^\s]+)/);
  const encodedSeconds = timeMatch ? toSeconds(timeMatch[1], timeMatch[2], timeMatch[3]) : 0;
  const percent = duration > 0 ? Math.min(99, Math.max(0, (encodedSeconds / duration) * 100)) : 0;

  sendProgress({
    status: "圧縮中",
    percent,
    elapsedSeconds: (Date.now() - startedAt) / 1000,
    speed: speedMatch?.[1] || "-",
  });
}

function sendProgress(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("video:progress", payload);
  }
}

async function openFolder(folderPath) {
  if (!folderPath || !fs.existsSync(folderPath)) {
    throw new UserError("保存先フォルダが見つかりません。");
  }
  await shell.openPath(folderPath);
  return true;
}

function getSettingsPath() {
  return path.join(app.getPath("userData"), "settings.json");
}

function getSavedSettings() {
  const settingsPath = getSettingsPath();
  if (!fs.existsSync(settingsPath)) return cloneDefaultSettings();

  try {
    const parsed = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    return normalizeSavedSettings(parsed);
  } catch {
    return cloneDefaultSettings();
  }
}

function saveSettings(settings = {}) {
  const normalized = normalizeSavedSettings(settings);
  const settingsPath = getSettingsPath();
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return { ...normalized, settingsPath };
}

function resetSettings() {
  const settingsPath = getSettingsPath();
  if (fs.existsSync(settingsPath)) fs.unlinkSync(settingsPath);
  return { ...cloneDefaultSettings(), settingsPath };
}

function normalizeSavedSettings(settings = {}) {
  const compression = settings.compression || {};
  const paths = settings.paths || {};
  const widthValue = compression.width === "original" ? "original" : Number(compression.width);

  return {
    compression: {
      mode: [
        "light",
        "standard",
        "high",
        "outlook20",
        "teams100",
        "site300",
        "targetCustom",
        "custom",
      ].includes(compression.mode) ? compression.mode : DEFAULT_SAVED_SETTINGS.compression.mode,
      width: widthValue === "original" || Number.isFinite(widthValue) ? widthValue : DEFAULT_SAVED_SETTINGS.compression.width,
      crf: clampNumber(Number(compression.crf), 18, 35, DEFAULT_SAVED_SETTINGS.compression.crf),
      preset: ["veryfast", "fast", "medium", "slow"].includes(compression.preset)
        ? compression.preset
        : DEFAULT_SAVED_SETTINGS.compression.preset,
      audio: ["64k", "96k", "128k"].includes(compression.audio) ? compression.audio : DEFAULT_SAVED_SETTINGS.compression.audio,
      encoder: VIDEO_ENCODERS.has(compression.encoder) ? compression.encoder : DEFAULT_SAVED_SETTINGS.compression.encoder,
      targetSizeMB: clampNumber(Number(compression.targetSizeMB), 1, 100000, DEFAULT_SAVED_SETTINGS.compression.targetSizeMB),
    },
    paths: {
      lastInputDirectory: typeof paths.lastInputDirectory === "string" ? paths.lastInputDirectory : "",
      lastOutputDirectory: typeof paths.lastOutputDirectory === "string" ? paths.lastOutputDirectory : "",
    },
  };
}

function cloneDefaultSettings() {
  return JSON.parse(JSON.stringify(DEFAULT_SAVED_SETTINGS));
}

function validateInputFile(filePath) {
  if (!filePath || typeof filePath !== "string" || !fs.existsSync(filePath)) {
    throw new UserError("ファイルの読み込みに失敗しました。");
  }
  if (!SUPPORTED_EXTENSIONS.has(path.extname(filePath).toLowerCase())) {
    throw new UserError("非対応形式です。mp4 / mov / m4v / avi / mkv / webm を選択してください。");
  }
}

function ensureWritable(directory) {
  try {
    fs.accessSync(directory, fs.constants.W_OK);
  } catch {
    throw new UserError("保存先に書き込めません。フォルダの権限を確認してください。");
  }
}

function runProcess(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    child.on("error", (error) => {
      reject(toUserError(error, "同梱ffprobeが見つからず、PATH上のffprobeも利用できません。resources/ffmpeg/win/ffprobe.exe を確認してください。"));
    });
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

function toUserError(error, fallbackMessage) {
  if (error instanceof UserError) return error;
  return new UserError(fallbackMessage, error);
}

function parseFrameRate(value) {
  if (!value || value === "0/0") return null;
  const [num, den] = value.split("/").map(Number);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  return num / den;
}

function toSeconds(hours, minutes, seconds) {
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function firstLine(text) {
  return String(text || "").split(/\r?\n/).find(Boolean) || "";
}

function lastLines(text, count) {
  return String(text || "").split(/\r?\n/).filter(Boolean).slice(-count).join("\n");
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

class UserError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "UserError";
    this.cause = cause;
  }
}
