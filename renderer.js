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
  batchItems: [],
  batchRunning: false,
  stopAfterCurrent: false,
  activeBatchItemId: null,
  savedSettings: null,
  restoringSettings: false,
  saveTimer: null,
};

const els = {
  toolStatus: document.querySelector("#toolStatus"),
  gpuStatus: document.querySelector("#gpuStatus"),
  dropZone: document.querySelector("#dropZone"),
  selectButton: document.querySelector("#selectButton"),
  errorBox: document.querySelector("#errorBox"),
  warningBox: document.querySelector("#warningBox"),
  batchPanel: document.querySelector("#batchPanel"),
  batchCount: document.querySelector("#batchCount"),
  compressAllButton: document.querySelector("#compressAllButton"),
  stopBatchButton: document.querySelector("#stopBatchButton"),
  openBatchFolderButton: document.querySelector("#openBatchFolderButton"),
  currentBatchFile: document.querySelector("#currentBatchFile"),
  batchProgressText: document.querySelector("#batchProgressText"),
  batchProgressBar: document.querySelector("#batchProgressBar"),
  batchTableBody: document.querySelector("#batchTableBody"),
  summaryTotal: document.querySelector("#summaryTotal"),
  summarySuccess: document.querySelector("#summarySuccess"),
  summaryFailed: document.querySelector("#summaryFailed"),
  summarySaved: document.querySelector("#summarySaved"),
  summaryRate: document.querySelector("#summaryRate"),
  failedList: document.querySelector("#failedList"),
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
  settingsStatus: document.querySelector("#settingsStatus"),
  resetSettingsButton: document.querySelector("#resetSettingsButton"),
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

async function init() {
  bindEvents();
  applyPreset();
  await restoreSavedSettings();
  checkTools();
  window.videoPress.onProgress(updateProgress);
}

function bindEvents() {
  els.selectButton.addEventListener("click", selectVideo);
  els.compressButton.addEventListener("click", compressVideo);
  els.openFolderButton.addEventListener("click", openOutputFolder);
  els.compressAllButton.addEventListener("click", compressBatch);
  els.stopBatchButton.addEventListener("click", requestStopBatch);
  els.openBatchFolderButton.addEventListener("click", openOutputFolder);
  els.resetSettingsButton.addEventListener("click", resetSavedSettings);
  els.batchTableBody.addEventListener("change", (event) => {
    if (event.target.matches("[data-batch-select]")) {
      const item = state.batchItems.find((entry) => entry.id === event.target.dataset.batchSelect);
      if (item) item.selected = event.target.checked;
      updateBatchControls();
    }
  });

  els.modeSelect.addEventListener("change", () => {
    applyPreset();
    updateEstimate();
    scheduleSaveSettings("設定保存済み");
  });
  els.settingsForm.addEventListener("input", () => {
    updateEstimate();
    scheduleSaveSettings("設定保存済み");
  });
  els.settingsForm.addEventListener("change", () => {
    updateEstimate();
    scheduleSaveSettings("設定保存済み");
  });

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
    const files = Array.from(event.dataTransfer.files || []);
    const filePaths = files.map((file) => window.videoPress.getFilePath(file)).filter(Boolean);
    if (filePaths.length > 0) loadVideoFiles(filePaths);
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
  const selected = await window.videoPress.selectVideoFile();
  const filePaths = Array.isArray(selected) ? selected : selected ? [selected] : [];
  if (filePaths.length > 0) {
    await savePathSettings({ lastInputDirectory: directoryFromPath(filePaths[0]) }, "設定保存済み");
    await loadVideoFiles(filePaths);
  }
}

async function loadVideoFiles(filePaths) {
  clearMessages();
  resetResult();
  resetBatch();
  state.metadata = null;
  els.compressButton.disabled = true;
  setRunStatus("動画解析中", 0);
  els.fileStatus.textContent = "解析中";
  els.batchPanel.classList.remove("hidden");

  const uniquePaths = [...new Set(filePaths)];
  if (uniquePaths.length > 0) {
    await savePathSettings({ lastInputDirectory: directoryFromPath(uniquePaths[0]) }, "設定保存済み");
  }
  for (const filePath of uniquePaths) {
    const item = createBatchItem(filePath);
    state.batchItems.push(item);
    renderBatchTable();
    try {
      item.metadata = await window.videoPress.probeVideo(filePath);
      item.status = "待機中";
      if (!state.metadata) {
        state.metadata = item.metadata;
        renderMetadata();
        updateEstimate();
        els.compressButton.disabled = false;
        els.fileStatus.textContent = "選択済み";
        setRunStatus("待機中", 0);
      }
    } catch (error) {
      item.status = "失敗";
      item.error = toMessage(error);
    }
    renderBatchTable();
    updateBatchSummary();
  }

  if (!state.metadata) {
    els.compressButton.disabled = true;
    els.fileStatus.textContent = "読み込み失敗";
    setRunStatus("読み込み失敗", 0);
  }
  updateBatchControls();
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
    await savePathSettings({ lastOutputDirectory: result.outputDirectory }, "設定保存済み");
  } catch (error) {
    showError(toMessage(error));
    setRunStatus("圧縮失敗", 0);
  } finally {
    els.compressButton.disabled = !state.metadata;
  }
}

async function compressBatch() {
  const targets = getBatchTargets();
  if (targets.length === 0 || state.batchRunning) return;

  clearMessages();
  resetResult();
  state.batchRunning = true;
  state.stopAfterCurrent = false;
  els.compressButton.disabled = true;
  updateBatchControls();

  const settings = getSettings();
  for (const item of targets) {
    if (state.stopAfterCurrent) break;
    if (!item.metadata) continue;

    state.activeBatchItemId = item.id;
    item.status = "圧縮中";
    item.progress = 0;
    renderBatchTable();
    updateBatchProgress();
    setRunStatus("圧縮中", 0);

    try {
      const result = await window.videoPress.compressVideo({
        filePath: item.filePath,
        settings,
      });
      item.status = "完了";
      item.progress = 100;
      item.afterSize = result.afterSize;
      item.outputDirectory = result.outputDirectory;
      item.outputPath = result.outputPath;
      item.result = result;
      state.outputDirectory = result.outputDirectory;
      renderResult(result);
      await savePathSettings({ lastOutputDirectory: result.outputDirectory }, "設定保存済み");
    } catch (error) {
      item.status = "失敗";
      item.error = toMessage(error);
    }

    renderBatchTable();
    updateBatchSummary();
    updateBatchProgress();
    updateBatchControls();
  }

  state.activeBatchItemId = null;
  state.batchRunning = false;
  setRunStatus(state.stopAfterCurrent ? "停止済み" : "完了", state.stopAfterCurrent ? 0 : 100);
  els.currentBatchFile.textContent = "現在処理中: -";
  updateBatchControls();
  updateBatchSummary();
}

function requestStopBatch() {
  if (!state.batchRunning) return;
  state.stopAfterCurrent = true;
  els.stopBatchButton.disabled = true;
  setRunStatus("停止予約", Number(els.progressBar.value || 0));
}

async function openOutputFolder() {
  if (!state.outputDirectory) return;
  try {
    await window.videoPress.openFolder(state.outputDirectory);
    await savePathSettings({ lastOutputDirectory: state.outputDirectory }, "設定保存済み");
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

async function restoreSavedSettings() {
  try {
    state.restoringSettings = true;
    state.savedSettings = await window.videoPress.getSettings();
    applyCompressionSettings(state.savedSettings.compression);
    updateEstimate();
    setSettingsStatus("前回設定を復元しました");
  } catch (error) {
    setSettingsStatus("設定復元に失敗しました");
  } finally {
    state.restoringSettings = false;
  }
}

function applyCompressionSettings(compression = {}) {
  if (compression.mode) els.modeSelect.value = compression.mode;
  applyPreset();

  if (compression.width !== undefined) {
    els.widthSelect.value = String(compression.width);
  }
  if (compression.crf !== undefined) els.crfInput.value = compression.crf;
  if (compression.preset) els.presetSelect.value = compression.preset;
  if (compression.audio) els.audioSelect.value = compression.audio;
  if (compression.encoder) els.encoderSelect.value = compression.encoder;
  if (compression.targetSizeMB !== undefined) els.targetSizeInput.value = compression.targetSizeMB;

  applyPresetVisibilityOnly();
}

function buildPersistentSettings(pathOverrides = {}) {
  const current = state.savedSettings || {};
  return {
    compression: getSettings(),
    paths: {
      lastInputDirectory: current.paths?.lastInputDirectory || "",
      lastOutputDirectory: current.paths?.lastOutputDirectory || "",
      ...pathOverrides,
    },
  };
}

function scheduleSaveSettings(message) {
  if (state.restoringSettings) return;
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => {
    saveCurrentSettings(message);
  }, 250);
}

async function saveCurrentSettings(message = "設定保存済み") {
  if (state.restoringSettings) return;
  try {
    state.savedSettings = await window.videoPress.saveSettings(buildPersistentSettings());
    setSettingsStatus(message);
  } catch (error) {
    setSettingsStatus("設定保存に失敗しました");
  }
}

async function savePathSettings(pathOverrides, message = "設定保存済み") {
  try {
    state.savedSettings = await window.videoPress.saveSettings(buildPersistentSettings(pathOverrides));
    setSettingsStatus(message);
  } catch (error) {
    setSettingsStatus("設定保存に失敗しました");
  }
}

async function resetSavedSettings() {
  try {
    state.restoringSettings = true;
    state.savedSettings = await window.videoPress.resetSettings();
    applyCompressionSettings(state.savedSettings.compression);
    updateEstimate();
    setSettingsStatus("設定を初期化しました");
  } catch (error) {
    setSettingsStatus("設定初期化に失敗しました");
  } finally {
    state.restoringSettings = false;
  }
}

function setSettingsStatus(message) {
  els.settingsStatus.textContent = message;
}

function applyPresetVisibilityOnly() {
  const customDetail = els.modeSelect.value === "custom";
  const customTarget = els.modeSelect.value === "targetCustom";
  const targetMode = isTargetSizeMode(els.modeSelect.value);

  els.targetSizeField.classList.toggle("hidden", !customTarget);
  els.widthSelect.disabled = !(customDetail || customTarget);
  els.crfInput.disabled = !customDetail;
  els.presetSelect.disabled = !customDetail;
  els.audioSelect.disabled = !(customDetail || customTarget);
  els.crfInput.closest("label").classList.toggle("hidden", targetMode);
  els.presetSelect.closest("label").classList.toggle("hidden", targetMode);
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

function createBatchItem(filePath) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    filePath,
    selected: true,
    metadata: null,
    status: "解析中",
    progress: 0,
    afterSize: null,
    outputDirectory: null,
    outputPath: null,
    error: "",
  };
}

function resetBatch() {
  state.batchItems = [];
  state.batchRunning = false;
  state.stopAfterCurrent = false;
  state.activeBatchItemId = null;
  renderBatchTable();
  updateBatchProgress();
  updateBatchSummary();
  updateBatchControls();
  els.failedList.classList.add("hidden");
  els.failedList.textContent = "";
}

function renderBatchTable() {
  els.batchTableBody.innerHTML = "";
  for (const item of state.batchItems) {
    const meta = item.metadata;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" data-batch-select="${item.id}" ${item.selected ? "checked" : ""} ${state.batchRunning ? "disabled" : ""}></td>
      <td>${escapeHtml(meta?.fileName || fileNameFromPath(item.filePath))}</td>
      <td>${meta ? formatBytes(meta.size) : "-"}</td>
      <td>${meta ? formatDuration(meta.duration) : "-"}</td>
      <td>${meta?.width && meta?.height ? `${meta.width} x ${meta.height}` : "-"}</td>
      <td>${escapeHtml(formatBatchStatus(item))}</td>
      <td>${Number.isFinite(item.afterSize) ? formatBytes(item.afterSize) : "-"}</td>
    `;
    els.batchTableBody.appendChild(row);
  }
}

function formatBatchStatus(item) {
  if (item.status === "圧縮中") return `${item.status} ${Math.round(item.progress || 0)}%`;
  return item.status;
}

function getBatchTargets() {
  const selected = state.batchItems.filter((item) => item.selected && item.metadata && item.status !== "圧縮中");
  const source = selected.length > 0 ? selected : state.batchItems.filter((item) => item.metadata);
  return source.filter((item) => item.status !== "完了");
}

function updateBatchControls() {
  const hasReadyItems = state.batchItems.some((item) => item.metadata && item.status !== "完了");
  els.batchPanel.classList.toggle("hidden", state.batchItems.length === 0);
  els.compressAllButton.disabled = state.batchRunning || !hasReadyItems;
  els.stopBatchButton.disabled = !state.batchRunning || state.stopAfterCurrent;
  els.openBatchFolderButton.disabled = !state.outputDirectory;
}

function updateBatchProgress() {
  const total = state.batchItems.length;
  const done = state.batchItems.filter((item) => item.status === "完了" || item.status === "失敗").length;
  const active = state.batchItems.find((item) => item.id === state.activeBatchItemId);
  const activeProgress = active?.status === "圧縮中" ? (active.progress || 0) / 100 : 0;
  const percent = total > 0 ? Math.min(100, ((done + activeProgress) / total) * 100) : 0;

  els.batchCount.textContent = `${done} / ${total}`;
  els.batchProgressText.textContent = `${done} / ${total} 件`;
  els.batchProgressBar.value = Math.round(percent);
  els.currentBatchFile.textContent = active?.metadata
    ? `現在処理中: ${active.metadata.fileName}`
    : "現在処理中: -";
}

function updateBatchSummary() {
  const total = state.batchItems.length;
  const successItems = state.batchItems.filter((item) => item.status === "完了");
  const failedItems = state.batchItems.filter((item) => item.status === "失敗");
  const beforeTotal = successItems.reduce((sum, item) => sum + (item.metadata?.size || 0), 0);
  const afterTotal = successItems.reduce((sum, item) => sum + (item.afterSize || 0), 0);
  const saved = Math.max(0, beforeTotal - afterTotal);
  const rate = beforeTotal > 0 ? (saved / beforeTotal) * 100 : 0;

  els.summaryTotal.textContent = String(total);
  els.summarySuccess.textContent = String(successItems.length);
  els.summaryFailed.textContent = String(failedItems.length);
  els.summarySaved.textContent = successItems.length > 0 ? formatBytes(saved) : "-";
  els.summaryRate.textContent = successItems.length > 0 ? `${rate.toFixed(1)}%` : "-";

  if (failedItems.length > 0) {
    els.failedList.textContent = `失敗ファイル: ${failedItems.map((item) => item.metadata?.fileName || fileNameFromPath(item.filePath)).join(", ")}`;
    els.failedList.classList.remove("hidden");
  } else {
    els.failedList.classList.add("hidden");
    els.failedList.textContent = "";
  }
}

function updateProgress(progress) {
  setRunStatus(progress.status, progress.percent);
  els.elapsedText.textContent = `経過時間: ${formatDuration(progress.elapsedSeconds || 0)}`;
  els.speedText.textContent = `速度: ${progress.speed || "-"}`;
  if (state.batchRunning && state.activeBatchItemId) {
    const item = state.batchItems.find((entry) => entry.id === state.activeBatchItemId);
    if (item) {
      item.progress = Math.round(progress.percent || 0);
      renderBatchTable();
      updateBatchProgress();
    }
  }
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
  updateBatchControls();
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

function fileNameFromPath(filePath) {
  return String(filePath || "").split(/[\\/]/).pop() || "-";
}

function directoryFromPath(filePath) {
  const text = String(filePath || "");
  const index = Math.max(text.lastIndexOf("\\"), text.lastIndexOf("/"));
  return index > 0 ? text.slice(0, index) : "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
