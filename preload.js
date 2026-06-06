const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("videoPress", {
  getFilePath: (file) => webUtils.getPathForFile(file),
  checkTools: () => ipcRenderer.invoke("app:check-tools"),
  selectVideoFile: () => ipcRenderer.invoke("file:select-video"),
  probeVideo: (filePath) => ipcRenderer.invoke("video:probe", filePath),
  compressVideo: (payload) => ipcRenderer.invoke("video:compress", payload),
  openFolder: (folderPath) => ipcRenderer.invoke("folder:open", folderPath),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
  resetSettings: () => ipcRenderer.invoke("settings:reset"),
  onProgress: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("video:progress", listener);
    return () => ipcRenderer.removeListener("video:progress", listener);
  },
});
