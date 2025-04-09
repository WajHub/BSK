"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var drivelist = require("drivelist");
var fs = require("fs");
var crypto_js_1 = require("crypto-js");
var CryptoJS = require("crypto-js");
var crypto = require("crypto");
var __filename = process.argv[1];
var __dirname = path.dirname(__filename);
var SIGNATURE_LENGTH = 512;
/**
 * Tworzy głowne okno aplikacji Electron.
 * Ustawia wymiary okna oraz wczytuje stronę główną.
 *
 * @returns {void}
 */
var createWindow = function () {
    var win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(electron_1.app.getAppPath(), "preload.cjs"),
        },
    });
    win.loadURL("http://localhost:5173");
};
/**
 * Obsługuje zdarzenie uruchomienia aplikacji Electron.
 * Tworzy okno aplikacji, gdy jest gotowe do wyświetlenia.
 * Obsługuje zdarzenie aktywacji aplikacji na systemach macOS.
 *
 * @returns {void}
 */
electron_1.app.whenReady().then(function () {
    createWindow();
    electron_1.app.on("activate", function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
var private_rsa_key = null;
electron_1.ipcMain.handle("ping", function () { return "pong"; });
electron_1.ipcMain.handle("load-key", encode_key);
electron_1.ipcMain.handle("sign-file", sign_file);
electron_1.ipcMain.handle("verify-file", verify_file);
/**
 * Weryfikuje podpis pliku za pomocą klucza publicznego RSA.
 *
 * @param {Electron.IpcMainInvokeEvent} _event - Obiekt zdarzenia IPC.
 * @param {Buffer} file - Bufor zawierający dane pliku oraz podpis.
 * @returns {Promise<{state: string, message: string, data: any}>} - Zwraca wynik weryfikacji.
 */
function verify_file(_event, file) {
    return __awaiter(this, void 0, void 0, function () {
        var public_rsa_key, fileBuffer, fileData, signature, verify, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, load_public_key()];
                case 1:
                    public_rsa_key = _a.sent();
                    fileBuffer = Buffer.from(file);
                    fileData = fileBuffer.subarray(0, -SIGNATURE_LENGTH);
                    signature = fileBuffer.subarray(-SIGNATURE_LENGTH);
                    verify = crypto.createVerify("SHA256");
                    verify.update(fileData);
                    verify.end();
                    console.log("Data length:", fileData.length);
                    console.log("Signature length:", signature.length);
                    if (public_rsa_key && verify.verify(public_rsa_key, signature)) {
                        return [2 /*return*/, {
                                state: "success",
                                message: "Pdf is correctly signed",
                                data: null,
                            }];
                    }
                    else {
                        return [2 /*return*/, {
                                state: "error",
                                message: "Pdf is not correctly signed",
                                data: null,
                            }];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [2 /*return*/, { state: "error", message: "Public key not found", data: null }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function sign_file(_event, file) {
    return __awaiter(this, void 0, void 0, function () {
        var fileBuffer, sign, signature;
        return __generator(this, function (_a) {
            if (!file) {
                console.error("Invalid file: File is null or undefined");
                return [2 /*return*/, { state: "error", message: "Invalid file provided", data: null }];
            }
            if (private_rsa_key == null || private_rsa_key == undefined) {
                console.log("Key is not loaded");
                return [2 /*return*/, { state: "error", message: "Key is not loaded", data: null }];
            }
            else {
                try {
                    fileBuffer = Buffer.from(file);
                    sign = crypto.createSign("SHA256");
                    sign.update(fileBuffer);
                    sign.end();
                    signature = sign.sign(private_rsa_key);
                    fs.writeFileSync(path.join(__dirname, "../signed_.pdf"), Buffer.concat([fileBuffer, signature]));
                    return [2 /*return*/, { state: "success", message: "File has been signed", data: null }];
                }
                catch (error) {
                    console.error(error);
                    return [2 /*return*/, { state: "error", message: error.message, data: null }];
                }
            }
            return [2 /*return*/];
        });
    });
}
function encode_key(_event, pin) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, load_data_from_pendrive().then(function (encrypted_key_base64) {
                        if (encrypted_key_base64 == null) {
                            return { state: "error", message: "Key has not been found!", data: null };
                        }
                        else {
                            var hash_pin = (0, crypto_js_1.SHA256)(pin);
                            var encrypted_key = CryptoJS.enc.Base64.parse(encrypted_key_base64);
                            try {
                                var cipherParams = CryptoJS.lib.CipherParams.create({
                                    ciphertext: encrypted_key,
                                });
                                var decrypted = CryptoJS.AES.decrypt(cipherParams, hash_pin, {
                                    mode: CryptoJS.mode.ECB,
                                    padding: CryptoJS.pad.Pkcs7,
                                });
                                var decryptedPem = decrypted.toString(CryptoJS.enc.Utf8);
                                console.log("DECRYPTED PEM (UTF-8):", decryptedPem);
                                private_rsa_key = decryptedPem;
                                return { state: "success", message: "Key is loaded", data: null };
                            }
                            catch (err) {
                                console.log(err);
                                return { state: "error", message: "Invalid PIN", data: null };
                            }
                        }
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function load_data_from_pendrive() {
    return __awaiter(this, void 0, void 0, function () {
        var drives, _i, drives_1, drive, path_to_usb, files, _a, files_1, fileName, filePath, data;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, drivelist.list()];
                case 1:
                    drives = _b.sent();
                    for (_i = 0, drives_1 = drives; _i < drives_1.length; _i++) {
                        drive = drives_1[_i];
                        if (drive.busType === "USB" && drive.mountpoints.length > 0) {
                            path_to_usb = drive.mountpoints[0].path + "/keys";
                            files = fs.readdirSync(path_to_usb);
                            for (_a = 0, files_1 = files; _a < files_1.length; _a++) {
                                fileName = files_1[_a];
                                if (fileName === "private_key.pem") {
                                    filePath = path.join(path_to_usb, fileName);
                                    try {
                                        data = fs.readFileSync(filePath, "utf8");
                                        return [2 /*return*/, data];
                                    }
                                    catch (err) {
                                        console.error(err);
                                        return [2 /*return*/, null];
                                    }
                                }
                            }
                        }
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
function load_public_key() {
    return __awaiter(this, void 0, void 0, function () {
        var drives, _i, drives_2, drive, path_to_usb, files, _a, files_2, fileName, filePath, data;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, drivelist.list()];
                case 1:
                    drives = _b.sent();
                    for (_i = 0, drives_2 = drives; _i < drives_2.length; _i++) {
                        drive = drives_2[_i];
                        if (drive.busType === "USB" && drive.mountpoints.length > 0) {
                            path_to_usb = drive.mountpoints[0].path + "/keys";
                            files = fs.readdirSync(path_to_usb);
                            for (_a = 0, files_2 = files; _a < files_2.length; _a++) {
                                fileName = files_2[_a];
                                if (fileName === "public_key.pem") {
                                    filePath = path.join(path_to_usb, fileName);
                                    try {
                                        data = fs.readFileSync(filePath, "utf8");
                                        return [2 /*return*/, data];
                                    }
                                    catch (err) {
                                        console.error(err);
                                        return [2 /*return*/, null];
                                    }
                                }
                            }
                        }
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
