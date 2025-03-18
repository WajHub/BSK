import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import drivelist from "drivelist";
import fs from "fs";
import sha256 from "crypto-js/sha256.js";
import CryptoJS from "crypto-js";
import { PDFDocument } from "pdf-lib";
import { P12Signer } from "@signpdf/signer-p12";
import { pdflibAddPlaceholder } from "@signpdf/placeholder-pdf-lib";
import { SignPdf } from "@signpdf/signpdf";
import { SUBFILTER_ETSI_CADES_DETACHED } from "@signpdf/utils";
import forge from "node-forge";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function sign_file(_event, file) {
  if (private_rsa_key == null) {
    return { state: "error", message: "Key is not loaded", data: null };
  } else {
    try {
      var certificateBuffer = generate_certificate();

      // var signer = new P12Signer(certificateBuffer);
      // const pdfDoc = await PDFDocument.load(file);
      // // Add a placeholder for a signature.
      // pdflibAddPlaceholder({
      //   pdfDoc: pdfDoc,
      //   reason: "The user is declaring consent through JavaScript.",
      //   contactInfo: "signpdf@example.com",
      //   name: "John Doe",
      //   location: "Free Text Str., Free World",
      //   subFilter: SUBFILTER_ETSI_CADES_DETACHED,
      // });
      // // Get the modified PDFDocument bytes
      // const pdfWithPlaceholderBytes = await pdfDoc.save();
      // // And finally sign the document.
      // const signPdf = new SignPdf();
      // const signedPdf = await signPdf.sign(pdfWithPlaceholderBytes, signer);
      // // signedPdf is a Buffer of an electronically signed PDF. Store it.
      // var targetPath = path.join(__dirname, "../Test.pdf");
      // fs.writeFileSync(targetPath, signedPdf);
      return { state: "success", message: "File signed", data: null };
    } catch (error) {
      console.error(error);
      return { state: "error", message: error.message, data: null };
    }
  }
}

function generate_certificate() {
  const publicKeyPem = fs.readFileSync(
    path.join(__dirname, "../keygen-app/keys/public.pem"),
    "utf8"
  );
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  var cert = pki.createCertificate();
  cert.publicKey = publicKey;
  cert.serialNumber = "01";
  cert.validFrom = new Date();
  cert.validTo = new Date();
  cert.validTo.setFullYear(cert.validTo.getFullYear() + 1);
}

async function encode_key(_event, pin) {
  return await load_data_from_pendrive().then((encrypted_key_base64) => {
    if (encrypted_key_base64 == null) {
      return { state: "error", message: "No USB found", data: null };
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
        private_rsa_key = decrypted;
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
