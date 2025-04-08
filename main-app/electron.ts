import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as drivelist from "drivelist";
import * as fs from "fs";
import { SHA256 } from "crypto-js";
import * as CryptoJS from "crypto-js";
import * as crypto from "crypto";

const __filename = process.argv[1];
const __dirname = path.dirname(__filename);
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
let private_rsa_key: string | null = null;
ipcMain.handle("ping", () => "pong");
ipcMain.handle("load-key", encode_key);
ipcMain.handle("sign-file", sign_file);
ipcMain.handle("verify-file", verify_file);

async function verify_file(_event: Electron.IpcMainInvokeEvent, file: Buffer): Promise<any> {
  try {
    const public_rsa_key = await load_public_key();
    const fileBuffer = Buffer.from(file);

    const fileData = fileBuffer.subarray(0, -SIGNATURE_LENGTH);
    const signature = fileBuffer.subarray(-SIGNATURE_LENGTH);

    const verify = crypto.createVerify("SHA256");
    verify.update(fileData);
    verify.end();

    console.log("Data length:", fileData.length);
    console.log("Signature length:", signature.length);

    if (public_rsa_key && verify.verify(public_rsa_key, signature)) {
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
    console.error(err);
    return { state: "error", message: "Public key not found", data: null };
  }
}
async function sign_file(_event: Electron.IpcMainInvokeEvent, file: Buffer | null): Promise<any> {
  if (!file) {
    console.error("Invalid file: File is null or undefined");
    return { state: "error", message: "Invalid file provided", data: null };
  }

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

      return { state: "success", message: "File has been signed", data: null };
    } catch (error) {
      console.error(error);
      return { state: "error", message: (error as Error).message, data: null };
    }
  }
}
/**
 * Calculates the square root of a number.
 *
 * @param x the number to calculate the root of.
 * @returns the square root if `x` is non-negative or `NaN` if `x` is negative.
 */
async function encode_key(_event: Electron.IpcMainInvokeEvent, pin: string): Promise<any> {
  return await load_data_from_pendrive().then((encrypted_key_base64) => {
    if (encrypted_key_base64 == null) {
      return { state: "error", message: "Key has not been found!", data: null };
    } else {
      var hash_pin = SHA256(pin);
      const encrypted_key = CryptoJS.enc.Base64.parse(encrypted_key_base64);
      try {
        const cipherParams = CryptoJS.lib.CipherParams.create({
          ciphertext: encrypted_key,
        });
        const decrypted = CryptoJS.AES.decrypt(
          cipherParams,
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

async function load_public_key() {
  const drives = await drivelist.list();
  for (const drive of drives) {
    if (drive.busType === "USB" && drive.mountpoints.length > 0) {
      const path_to_usb = drive.mountpoints[0].path + "/keys";
      const files = fs.readdirSync(path_to_usb);
      for (const fileName of files) {
        if (fileName === "public_key.pem") {
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
