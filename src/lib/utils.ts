import { LINKS } from "@/config";
import { Link } from "@/types/types";
import { clsx, type ClassValue } from "clsx";
import { FieldError, FieldErrors } from "react-hook-form";
import { toast } from "sonner";
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

export const convertToLocalTime = (utcDateString: string): string =>
  new Date(utcDateString).toLocaleString().split(/:\d{2}(?=[^:]*$)/)[0];

export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const timeAgo = (dateString: string): string => {
  const inputDate = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 31536000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}y ago`;
  }
};

export const getLinks = (pathname: string, isAuthenticated: boolean): Link[] => {
  const protectedRoutes = ["/dashboard", "/collaboration", "/templates"];
  const onlyPublicRoutes = ["/auth"];

  return LINKS.filter((link) => {
    const l = link.link;

    const isCurrentRoute = l === pathname;
    const isHidden = isAuthenticated ? onlyPublicRoutes.includes(l) : protectedRoutes.includes(l);

    return !isCurrentRoute && !isHidden;
  });
};

export const getCurrentLinkName = (pathname: string) =>
  LINKS.find((link) => link.link === pathname)?.name;

export const getFirstErrorMessage = (errors: FieldErrors | undefined | null): string | null => {
  if (!errors || typeof errors !== "object") {
    return null;
  }

  for (const error of Object.values(errors)) {
    if (!error) continue;

    if (typeof (error as FieldError)?.message === "string") {
      return (error as FieldError).message ?? null;
    }

    if (Array.isArray(error)) {
      for (const item of error) {
        const nested = getFirstErrorMessage(item as FieldErrors);
        if (nested) return nested;
      }
    }

    if (typeof error === "object" && error !== null) {
      const nested = getFirstErrorMessage(error as FieldErrors);
      if (nested) return nested;
    }
  }

  return null;
};

export const copyToClipBoard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied!");
  } catch {
    toast.error("Error copying to clipboard");
  }
};
