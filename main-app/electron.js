import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import drivelist from "drivelist";
import fs from "fs";
import sha256 from "crypto-js/sha256.js";
import CryptoJS from "crypto-js";
import aes from "crypto-js/aes.js";

var key =
  "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";

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
ipcMain.handle("load-key", (_event, pin) => {
  loadKey(pin);
  return key;
});

async function loadKey(pin) {
  console.log("PIN", pin);
  var hash = sha256(pin, { outputLength: 256 });
  var message = "test";
  var test_pin = "1234";
  var hash2 = sha256(test_pin, { outputLength: 256 });
  var encrypted = CryptoJS.AES.encrypt(message, hash.toString());
  var decrypted = CryptoJS.AES.decrypt(encrypted, hash2.toString());
  console.log("DECRYPTED", decrypted.toString(CryptoJS.enc.Utf8));

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
