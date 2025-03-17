const { contextBridge, ipcRenderer } = require("electron");

const API = {
  ping: () => ipcRenderer.invoke("ping"),
  loadKey: (pin) => ipcRenderer.invoke("load-key", pin),
};

contextBridge.exposeInMainWorld("api", API);
