import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import drivelist from "drivelist";
import fs from "fs";

var key = "";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), "preload.cjs"),
    },
  });
  win.loadURL("http://localhost:5173");
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("ping", () => "pong");
ipcMain.handle("load-key", loadKey);

async function loadKey() {
  const drives = await drivelist.list();
  for (const drive of drives) {
    if (drive.busType === "USB" && drive.mountpoints.length > 0) {
      const path_to_usb = drive.mountpoints[0].path;
      const files = fs.readdirSync(path_to_usb);
      for (const fileName of files) {
        if (fileName === "key_private.pem") {
          const filePath = path.join(path_to_usb, fileName);
          console.log(filePath);
          try {
            const data = fs.readFileSync(filePath, "utf8");
            console.log(data);
            key = data;
            return data;
          } catch (err) {
            console.error(err);
            return null;
          }
        }
      }
    }
  }
  return null;
}
