const { contextBridge, ipcRenderer } = require("electron");

const API = {
  ping: () => ipcRenderer.invoke("ping"),
  loadKey: (pin) => ipcRenderer.invoke("load-key", pin),
  signFile: (file) => ipcRenderer.invoke("sign-file", file),
  verifyFile: (file) => ipcRenderer.invoke("verify-file", file),
};

contextBridge.exposeInMainWorld("api", API);
