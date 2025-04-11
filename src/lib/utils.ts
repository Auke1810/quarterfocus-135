import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Geeft een begroeting terug afhankelijk van de tijd van de dag
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Goedemorgen";
  } else if (hour >= 12 && hour < 18) {
    return "Goedemiddag";
  } else if (hour >= 18 && hour < 23) {
    return "Goedenavond";
  } else {
    return "Goedenacht";
  }
}
