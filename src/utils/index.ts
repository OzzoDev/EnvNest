import { createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-cbc";

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
