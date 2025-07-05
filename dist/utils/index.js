"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aesDecrypt = exports.aesEncrypt = exports.generateAESKey = void 0;
const crypto_1 = require("crypto");
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
const generateAESKey = () => {
    const key = (0, crypto_1.randomBytes)(32);
    return {
        key,
        hex: key.toString("hex"),
    };
};
exports.generateAESKey = generateAESKey;
const aesEncrypt = (text, hexKey) => {
    const key = Buffer.from(hexKey, "hex");
    const iv = (0, crypto_1.randomBytes)(IV_LENGTH);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, "utf-8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
};
exports.aesEncrypt = aesEncrypt;
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
