import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

export const generateAESKey = (): { key: Buffer; hex: string } => {
  const key = randomBytes(32);

  return {
    key,
    hex: key.toString("hex"),
  };
};

export const aesEncrypt = (text: string, hexKey: string): string => {
  const key = Buffer.from(hexKey, "hex");
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};

export const aesDecrypt = (encryptedText: string, hexKey: string): string => {
  const key = Buffer.from(hexKey, "hex");
  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts.shift()!, "hex");
  const encryptedTextBuffer = Buffer.from(parts.join(":"), "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedTextBuffer, undefined, "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};
