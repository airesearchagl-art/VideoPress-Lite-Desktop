const PRESET_SETTINGS = {
  light: { width: "720", crf: 32, preset: "veryfast", audio: "64k" },
  standard: { width: "1280", crf: 28, preset: "veryfast", audio: "96k" },
  high: { width: "1920", crf: 23, preset: "fast", audio: "128k" },
};
const TARGET_SIZE_SETTINGS = {
  outlook20: { targetSizeMB: 20, width: "720", audio: "64k" },
  teams100: { targetSizeMB: 100, width: "1280", audio: "96k" },
  site300: { targetSizeMB: 300, width: "1920", audio: "128k" },
};
const NVENC_LABELS = {
  h264_nvenc: "GPU(H264 NVENC)",
  hevc_nvenc: "GPU(H265 NVENC)",
  av1_nvenc: "GPU(AV1 NVENC)",
};

const state = {
  tools: null,
  metadata: null,
  outputDirectory: null,
};

const els = {
  toolStatus: document.querySelector("#toolStatus"),
  gpuStatus: document.querySelector("#gpuStatus"),
  dropZone: document.querySelector("#dropZone"),
  selectButton: document.querySelector("#selectButton"),
  errorBox: document.querySelector("#errorBox"),
  warningBox: document.querySelector("#warningBox"),
  fileStatus: document.querySelector("#fileStatus"),
  infoName: document.querySelector("#infoName"),
  infoSize: document.querySelector("#infoSize"),
  infoDuration: document.querySelector("#infoDuration"),
  infoResolution: document.querySelector("#infoResolution"),
  infoVideoCodec: document.querySelector("#infoVideoCodec"),
  infoAudioCodec: document.querySelector("#infoAudioCodec"),
  infoBitrate: document.querySelector("#infoBitrate"),
  infoFrameRate: document.querySelector("#infoFrameRate"),
  settingsForm: document.querySelector("#settingsForm"),
  modeSelect: document.querySelector("#modeSelect"),
  targetSizeField: document.querySelector("#targetSizeField"),
  targetSizeInput: document.querySelector("#targetSizeInput"),
  widthSelect: document.querySelector("#widthSelect"),
  crfInput: document.querySelector("#crfInput"),
  presetSelect: document.querySelector("#presetSelect"),
  audioSelect: document.querySelector("#audioSelect"),
  encoderSelect: document.querySelector("#encoderSelect"),
  estimateOriginal: document.querySelector("#estimateOriginal"),
  estimateOutput: document.querySelector("#estimateOutput"),
  estimateRate: document.querySelector("#estimateRate"),
  estimateTargetSize: document.querySelector("#estimateTargetSize"),
  estimateVideoBitrate: document.querySelector("#estimateVideoBitrate"),
  estimateTotalBitrate: document.querySelector("#estimateTotalBitrate"),
  estimateTargetStatus: document.querySelector("#estimateTargetStatus"),
  targetWarning: document.querySelector("#targetWarning"),
  compressButton: document.querySelector("#compressButton"),
  runStatus: document.querySelector("#runStatus"),
  elapsedText: document.querySelector("#elapsedText"),
  speedText: document.querySelector("#speedText"),
  percentText: document.querySelector("#percentText"),
  progressBar: document.querySelector("#progressBar"),
  resultPanel: document.querySelector("#resultPanel"),
  resultBefore: document.querySelector("#resultBefore"),
  resultAfter: document.querySelector("#resultAfter"),
  resultSaved: document.querySelector("#resultSaved"),
  resultTargetSize: document.querySelector("#resultTargetSize"),
  resultTargetDiff: document.querySelector("#resultTargetDiff"),
  resultTargetStatus: document.querySelector("#resultTargetStatus"),
  resultPath: document.querySelector("#resultPath"),
  videoPreview: document.querySelector("#videoPreview"),
  openFolderButton: document.querySelector("#openFolderButton"),
};

init();

function init() {
  bindEvents();
  applyPreset();
  checkTools();
  window.videoPress.onProgress(updateProgress);
}

function bindEvents() {
  els.selectButton.addEventListener("click", selectVideo);
  els.compressButton.addEventListener("click", compressVideo);
  els.openFolderButton.addEventListener("click", openOutputFolder);

  els.modeSelect.addEventListener("change", () => {
    applyPreset();
    updateEstimate();
  });
  els.settingsForm.addEventListener("input", updateEstimate);

  ["dragenter", "dragover"].forEach((eventName) => {
    els.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      els.dropZone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    els.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      els.dropZone.classList.remove("is-dragging");
    });
  });

  els.dropZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files?.[0];
    const filePath = file ? window.videoPress.getFilePath(file) : null;
    if (filePath) loadVideo(filePath);
  });
}

async function checkTools() {
  try {
    state.tools = await window.videoPress.checkTools();
    const ffmpegOk = state.tools.ffmpeg.available;
    const ffprobeOk = state.tools.ffprobe.available;
    const bundled = state.tools.ffmpegSource === "bundled" && state.tools.ffprobeSource === "bundled";
    els.toolStatus.textContent = ffmpegOk && ffprobeOk
      ? bundled
        ? "同梱FFmpeg検出済み"
        : "PATH FFmpeg検出済み"
      : "FFmpeg未検出";
    updateGpuStatus();

    if (!ffmpegOk) showWarning("同梱FFmpegが見つからず、PATH上のFFmpegも利用できません。resources/ffmpeg/win/ffmpeg.exe を確認してください。");
    if (!ffprobeOk) showWarning("同梱ffprobeが見つからず、PATH上のffprobeも利用できません。resources/ffmpeg/win/ffprobe.exe を確認してください。");
  } catch (error) {
    showError(toMessage(error));
  }
}

function updateGpuStatus() {
  const encoders = state.tools?.encoders || {};
  const availableNvenc = Object.keys(NVENC_LABELS).filter((encoder) => encoders[encoder]);
  const gpuNames = state.tools?.gpu?.names || [];

  for (const option of els.encoderSelect.options) {
    if (option.value === "cpu") continue;
    option.disabled = !encoders[option.value];
  }

  if (state.tools?.gpu?.hasRtx4090 && encoders.h264_nvenc) {
    els.encoderSelect.value = "h264_nvenc";
  }

  if (availableNvenc.length > 0) {
    const gpuText = gpuNames.length > 0
      ? `${gpuNames.join(", ")} 検出済み`
      : "GPU未確認";
    els.gpuStatus.textContent = `${gpuText} / NVENC利用可能`;
    return;
  }

  els.encoderSelect.value = "cpu";
  els.gpuStatus.textContent = "NVENC未検出 / CPU使用";
}

async function selectVideo() {
  clearMessages();
  const filePath = await window.videoPress.selectVideoFile();
  if (filePath) await loadVideo(filePath);
}

async function loadVideo(filePath) {
  clearMessages();
  resetResult();
  setRunStatus("動画解析中", 0);
  els.fileStatus.textContent = "解析中";

  try {
    state.metadata = await window.videoPress.probeVideo(filePath);
    renderMetadata();
    updateEstimate();
    els.compressButton.disabled = false;
    els.fileStatus.textContent = "選択済み";
    setRunStatus("待機中", 0);
  } catch (error) {
    state.metadata = null;
    els.compressButton.disabled = true;
    els.fileStatus.textContent = "読み込み失敗";
    showError(toMessage(error));
    setRunStatus("読み込み失敗", 0);
  }
}

async function compressVideo() {
  if (!state.metadata) return;

  clearMessages();
  resetResult();
  els.compressButton.disabled = true;
  setRunStatus("圧縮中", 0);

  try {
    const result = await window.videoPress.compressVideo({
      filePath: state.metadata.filePath,
      settings: getSettings(),
    });
    state.outputDirectory = result.outputDirectory;
    renderResult(result);
  } catch (error) {
    showError(toMessage(error));
    setRunStatus("圧縮失敗", 0);
  } finally {
    els.compressButton.disabled = !state.metadata;
  }
}

async function openOutputFolder() {
  if (!state.outputDirectory) return;
  try {
    await window.videoPress.openFolder(state.outputDirectory);
  } catch (error) {
    showError(toMessage(error));
  }
}

function applyPreset() {
  const settings = PRESET_SETTINGS[els.modeSelect.value];
  const targetSettings = TARGET_SIZE_SETTINGS[els.modeSelect.value];
  const customDetail = els.modeSelect.value === "custom";
  const customTarget = els.modeSelect.value === "targetCustom";
  const targetMode = isTargetSizeMode(els.modeSelect.value);

  if (settings) {
    els.widthSelect.value = settings.width;
    els.crfInput.value = settings.crf;
    els.presetSelect.value = settings.preset;
    els.audioSelect.value = settings.audio;
  }

  if (targetSettings) {
    els.widthSelect.value = targetSettings.width;
    els.audioSelect.value = targetSettings.audio;
    els.targetSizeInput.value = targetSettings.targetSizeMB;
  }

  els.targetSizeField.classList.toggle("hidden", !customTarget);
  els.widthSelect.disabled = !(customDetail || customTarget);
  els.crfInput.disabled = !customDetail;
  els.presetSelect.disabled = !customDetail;
  els.audioSelect.disabled = !(customDetail || customTarget);
  els.crfInput.closest("label").classList.toggle("hidden", targetMode);
  els.presetSelect.closest("label").classList.toggle("hidden", targetMode);
}

function getSettings() {
  return {
    mode: els.modeSelect.value,
    width: els.widthSelect.value === "original" ? "original" : Number(els.widthSelect.value),
    targetSizeMB: Number(els.targetSizeInput.value),
    crf: Number(els.crfInput.value),
    preset: els.presetSelect.value,
    audio: els.audioSelect.value,
    encoder: els.encoderSelect.value,
  };
}

function renderMetadata() {
  const meta = state.metadata;
  els.infoName.textContent = meta.fileName;
  els.infoSize.textContent = formatBytes(meta.size);
  els.infoDuration.textContent = formatDuration(meta.duration);
  els.infoResolution.textContent = meta.width && meta.height ? `${meta.width} x ${meta.height}` : "不明";
  els.infoVideoCodec.textContent = meta.videoCodec;
  els.infoAudioCodec.textContent = meta.audioCodec;
  els.infoBitrate.textContent = meta.bitRate ? `${formatNumber(meta.bitRate / 1000)} kbps` : "不明";
  els.infoFrameRate.textContent = meta.frameRate ? `${meta.frameRate.toFixed(2)} fps` : "不明";
}

function updateEstimate() {
  if (!state.metadata) {
    els.estimateOriginal.textContent = "-";
    els.estimateOutput.textContent = "-";
    els.estimateRate.textContent = "-";
    renderTargetEstimate(null);
    return;
  }

  const settings = getSettings();
  const targetEstimate = calculateTargetEstimate(state.metadata, settings);
  const estimated = targetEstimate ? targetEstimate.estimatedBytes : estimateOutputSize(state.metadata, settings);
  const saved = Math.max(0, state.metadata.size - estimated);
  const rate = state.metadata.size > 0 ? (saved / state.metadata.size) * 100 : 0;

  els.estimateOriginal.textContent = formatBytes(state.metadata.size);
  els.estimateOutput.textContent = formatBytes(estimated);
  els.estimateRate.textContent = `${rate.toFixed(1)}%`;
  renderTargetEstimate(targetEstimate);
}

function estimateOutputSize(meta, settings) {
  const duration = Math.max(meta.duration || 1, 1);
  const width = settings.width === "original" ? meta.width || 1280 : Number(settings.width);
  const baseMbps = width >= 1920 ? 6.5 : width >= 1280 ? 3.2 : width >= 960 ? 2.0 : 1.2;
  const crfFactor = Math.pow(2, (28 - settings.crf) / 6);
  const presetFactor = { veryfast: 1.08, fast: 1, medium: 0.96, slow: 0.92 }[settings.preset] || 1;
  const sourceMbps = meta.bitRate ? meta.bitRate / 1_000_000 : baseMbps;
  const videoMbps = Math.max(0.45, Math.min(sourceMbps * 0.85, baseMbps) * crfFactor * presetFactor);
  const audioMbps = Number.parseInt(settings.audio, 10) / 1000;
  return Math.round(((videoMbps + audioMbps) * 1_000_000 * duration) / 8);
}

function calculateTargetEstimate(meta, settings) {
  if (!isTargetSizeMode(settings.mode)) return null;

  const preset = TARGET_SIZE_SETTINGS[settings.mode];
  const targetSizeMB = preset ? preset.targetSizeMB : clampNumber(Number(settings.targetSizeMB), 1, 100000, 50);
  const audio = preset ? preset.audio : settings.audio;
  const duration = Math.max(meta.duration || 0, 1);
  const audioBitrateKbps = Number.parseInt(audio, 10);
  const targetTotalBitrateKbps = Math.max(1, Math.round((targetSizeMB * 8192) / duration));
  const videoBitrateKbps = Math.max(300, Math.round(targetTotalBitrateKbps - audioBitrateKbps));
  const actualTotalBitrateKbps = videoBitrateKbps + audioBitrateKbps;

  return {
    targetSizeMB,
    videoBitrateKbps,
    targetTotalBitrateKbps,
    actualTotalBitrateKbps,
    achievable: videoBitrateKbps >= 500,
    estimatedBytes: Math.round(((actualTotalBitrateKbps * 1000) * duration) / 8),
  };
}

function renderTargetEstimate(estimate) {
  if (!estimate) {
    els.estimateTargetSize.textContent = "-";
    els.estimateVideoBitrate.textContent = "-";
    els.estimateTotalBitrate.textContent = "-";
    els.estimateTargetStatus.textContent = "-";
    els.targetWarning.classList.add("hidden");
    return;
  }

  els.estimateTargetSize.textContent = `${formatNumber(estimate.targetSizeMB)} MB`;
  els.estimateVideoBitrate.textContent = `${formatNumber(estimate.videoBitrateKbps)} kbps`;
  els.estimateTotalBitrate.textContent = `${formatNumber(estimate.actualTotalBitrateKbps)} kbps`;
  els.estimateTargetStatus.textContent = estimate.achievable ? "おおむね達成可能" : "画質低下の可能性あり";
  els.targetWarning.classList.toggle("hidden", estimate.achievable);
}

function isTargetSizeMode(mode) {
  return mode === "targetCustom" || Object.prototype.hasOwnProperty.call(TARGET_SIZE_SETTINGS, mode);
}

function renderTargetResult(result) {
  if (!result?.target) {
    els.resultTargetSize.textContent = "-";
    els.resultTargetDiff.textContent = "-";
    els.resultTargetStatus.textContent = "-";
    return;
  }

  const targetBytes = result.target.targetSizeMB * 1024 * 1024;
  const diffBytes = result.afterSize - targetBytes;
  const achieved = result.afterSize <= targetBytes;
  const sign = diffBytes > 0 ? "+" : diffBytes < 0 ? "-" : "";

  els.resultTargetSize.textContent = `${formatNumber(result.target.targetSizeMB)} MB`;
  els.resultTargetDiff.textContent = `${sign}${formatBytes(Math.abs(diffBytes))}`;
  els.resultTargetStatus.textContent = achieved ? "達成" : "未達成";
}

function updateProgress(progress) {
  setRunStatus(progress.status, progress.percent);
  els.elapsedText.textContent = `経過時間: ${formatDuration(progress.elapsedSeconds || 0)}`;
  els.speedText.textContent = `速度: ${progress.speed || "-"}`;
}

function renderResult(result) {
  const saved = Math.max(0, result.beforeSize - result.afterSize);
  els.resultBefore.textContent = formatBytes(result.beforeSize);
  els.resultAfter.textContent = formatBytes(result.afterSize);
  els.resultSaved.textContent = formatBytes(saved);
  renderTargetResult(result);
  els.resultPath.textContent = result.outputPath;
  if (result.previewUrl) {
    els.videoPreview.src = result.previewUrl;
    els.videoPreview.classList.remove("hidden");
  }
  els.resultPanel.classList.remove("hidden");
}

function setRunStatus(status, percent) {
  const rounded = Math.round(percent || 0);
  els.runStatus.textContent = status;
  els.progressBar.value = rounded;
  els.percentText.textContent = `${rounded}%`;
}

function resetResult() {
  state.outputDirectory = null;
  renderTargetResult(null);
  els.videoPreview.pause();
  els.videoPreview.removeAttribute("src");
  els.videoPreview.load();
  els.videoPreview.classList.add("hidden");
  els.resultPanel.classList.add("hidden");
}

function showError(message) {
  els.errorBox.textContent = message;
  els.errorBox.classList.remove("hidden");
}

function showWarning(message) {
  const current = els.warningBox.textContent;
  els.warningBox.textContent = current ? `${current} ${message}` : message;
  els.warningBox.classList.remove("hidden");
}

function clearMessages() {
  els.errorBox.classList.add("hidden");
  els.warningBox.classList.add("hidden");
  els.errorBox.textContent = "";
  els.warningBox.textContent = "";
}

function toMessage(error) {
  return error?.message || String(error);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function formatNumber(value) {
  return new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 }).format(value);
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}
