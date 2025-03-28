import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import drivelist from "drivelist";
import fs from "fs";
import sha256 from "crypto-js/sha256.js";
import CryptoJS from "crypto-js";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SIGNATURE_LENGTH = 512;

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
var private_rsa_key = null;
ipcMain.handle("ping", () => "pong");
ipcMain.handle("load-key", encode_key);
ipcMain.handle("sign-file", sign_file);
ipcMain.handle("verify-file", verify_file);

async function verify_file(_event, file) {
  try {
    const public_rsa_key = fs.readFileSync(
      path.join(__dirname, "../keygen-app/keys/public.pem"),
      "utf8"
    );
    const fileBuffer = Buffer.from(file);

    const fileData = fileBuffer.subarray(0, -SIGNATURE_LENGTH);
    const signature = fileBuffer.subarray(-SIGNATURE_LENGTH);

    const verify = crypto.createVerify("SHA256");
    verify.update(fileData);
    verify.end();

    console.log("Data length:", fileData.length);
    console.log("Signature length:", signature.length);

    if (verify.verify(public_rsa_key, signature, "hex")) {
      return {
        state: "success",
        message: "Pdf is correctly signed",
        data: null,
      };
    } else {
      return {
        state: "error",
        message: "Pdf is not correctly signed",
        data: null,
      };
    }
  } catch (err) {
    return { state: "error", message: "Public key not found", data: null };
  }
}

async function sign_file(_event, file) {
  if (private_rsa_key == null || private_rsa_key == undefined) {
    console.log("Key is not loaded");
    return { state: "error", message: "Key is not loaded", data: null };
  } else {
    try {
      const fileBuffer = Buffer.from(file);
      const sign = crypto.createSign("SHA256");
      sign.update(fileBuffer);
      sign.end();

      const signature = sign.sign(private_rsa_key);
      fs.writeFileSync(
        path.join(__dirname, "../signed_.pdf"),
        Buffer.concat([fileBuffer, signature])
      );

      return { state: "success", message: "File signed", data: null };
    } catch (error) {
      console.error(error);
      return { state: "error", message: error.message, data: null };
    }
  }
}

async function encode_key(_event, pin) {
  return await load_data_from_pendrive().then((encrypted_key_base64) => {
    if (encrypted_key_base64 == null) {
      return { state: "error", message: "Key has not been found!", data: null };
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
        const decryptedPem = decrypted.toString(CryptoJS.enc.Utf8);
        console.log("DECRYPTED PEM (UTF-8):", decryptedPem);
        private_rsa_key = decryptedPem;
        return { state: "success", message: "Key is loaded", data: null };
      } catch (err) {
        console.log(err);
        return { state: "error", message: "Invalid PIN", data: null };
      }
    }
  });
}

async function load_data_from_pendrive() {
  const drives = await drivelist.list();
  for (const drive of drives) {
    if (drive.busType === "USB" && drive.mountpoints.length > 0) {
      const path_to_usb = drive.mountpoints[0].path + "/keys";
      const files = fs.readdirSync(path_to_usb);
      for (const fileName of files) {
        if (fileName === "private_key.pem") {
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
