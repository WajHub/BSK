import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import drivelist from "drivelist";
import fs from "fs";
import sha256 from "crypto-js/sha256.js";
import CryptoJS from "crypto-js";

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
ipcMain.handle("load-key", async (_event, pin) => {
  return await load_data_from_pendrive().then((encrypted_key_base64) => {
    if (encrypted_key_base64 == null) {
      // return { state: "error", message: "No USB found", data: null };
    } else {
      var hash_pin = sha256(pin);

      const encrypted_key = CryptoJS.enc.Base64.parse(encrypted_key_base64);

      try {
        const decrypted = CryptoJS.AES.decrypt(
          { ciphertext: encrypted_key },
          hash_pin,
          {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
          }
        );
        console.log(
          "DECRYPTED PEM (UTF-8):",
          decrypted.toString(CryptoJS.enc.Utf8)
        );
        return { state: "success", message: "Key is loaded", data: null };
      } catch (err) {
        console.log(err);
        return { state: "error", message: "Invalid PIN", data: null };
      }
    }
  });
});

async function load_data_from_pendrive() {
  const drives = await drivelist.list();
  for (const drive of drives) {
    if (drive.busType === "USB" && drive.mountpoints.length > 0) {
      const path_to_usb = drive.mountpoints[0].path;
      const files = fs.readdirSync(path_to_usb);
      for (const fileName of files) {
        if (fileName === "private.pem") {
          const filePath = path.join(path_to_usb, fileName);
          try {
            const data = fs.readFileSync(filePath, "utf8");
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
