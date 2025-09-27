import { clsx, type ClassValue } from "clsx";
import { twMerge as baseTwMerge } from "tailwind-merge";

const SPECIAL_CLASS_REGEXP = /(\[|\]|^size-|data-\[|group-data-)/;

export function cn(...inputs: ClassValue[]) {
  const raw = clsx(inputs).trim();
  if (!raw) return "";

  const tokens = raw.split(/\s+/);
  const specials = new Map<string, string>();
  const processed = tokens.map((token, index) => {
    if (SPECIAL_CLASS_REGEXP.test(token)) {
      const placeholder = `__tw_special_${index}__`;
      specials.set(placeholder, token);
      return placeholder;
    }
    return token;
  });

  const merged = baseTwMerge(...processed);
  if (!merged) return "";

  return merged
    .split(/\s+/)
    .map((token) => specials.get(token) ?? token)
    .join(" ");
}
