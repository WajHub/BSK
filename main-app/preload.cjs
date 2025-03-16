const { contextBridge, ipcRenderer } = require("electron");

const API = {
  ping: () => ipcRenderer.invoke("ping"),
  loadKey: () => ipcRenderer.invoke("load-key"),
};

contextBridge.exposeInMainWorld("api", API);
