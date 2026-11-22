import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const [year, month, day] = dateString.split("T")[0].split("-");
    if (!year || !month || !day) return dateString;
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export function getInitials(name?: string, lastName?: string): string {
  const first = name ? name.trim().charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.trim().charAt(0).toUpperCase() : "";
  return first + last || "U";
}
