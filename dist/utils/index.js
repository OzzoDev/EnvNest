"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aesDecrypt = void 0;
const crypto_1 = require("crypto");
const ALGORITHM = "aes-256-cbc";
const aesDecrypt = (encryptedText, hexKey) => {
    const key = Buffer.from(hexKey, "hex");
    const parts = encryptedText.split(":");
    const iv = Buffer.from(parts.shift(), "hex");
    const encryptedTextBuffer = Buffer.from(parts.join(":"), "hex");
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedTextBuffer, undefined, "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
};
exports.aesDecrypt = aesDecrypt;
