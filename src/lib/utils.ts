import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function getInitials(name: string): string {
  const nameParts = name.trim().split(" ");

  // If there's only one name, return the first two characters
  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  // Otherwise, return the first character of the first and last names
  const firstInitial = nameParts[0][0].toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();

  return firstInitial + lastInitial;
}