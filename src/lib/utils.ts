import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Compara duas arrays de strings, ignorando a ordem.
 * @param arr1 Primeira array
 * @param arr2 Segunda array
 * @returns `true` se as arrays contêm os mesmos elementos, `false` caso contrário.
 */
export function arraysAreEqual(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }
  
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();
  
  return sortedArr1.every((value, index) => value === sortedArr2[index]);
}
