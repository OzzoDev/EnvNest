import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseISO, format, addHours } from "date-fns";
import { sv } from "date-fns/locale";

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

export const convertToLocalTime = (timestamp: string) => {
  const date = parseISO(timestamp);

  const swedenTime =
    date.getHours() >= 2 && date.getHours() < 3 ? addHours(date, 2) : addHours(date, 1);

  const formattedDate = format(swedenTime, "yyyy-MM-dd", { locale: sv });
  const formattedTime = format(swedenTime, "HH:mm", { locale: sv });

  return { full: `${formattedDate} ${formattedTime}`, date: formattedDate, time: formattedTime };
};

export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};
