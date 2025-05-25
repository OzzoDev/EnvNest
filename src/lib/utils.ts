import { clsx, type ClassValue } from "clsx";
import { randomBytes } from "crypto";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sanitizeValues = (values: unknown[]): unknown[] => {
  return values.map((value) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return value;
  });
};

export const generateAESKey = (): { key: Buffer; hex: string } => {
  const key = randomBytes(32);
  return {
    key,
    hex: key.toString("hex"),
  };
};
