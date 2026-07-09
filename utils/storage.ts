export function getStorage(key: string): string | null {
  return localStorage.getItem(key);
}

export function setStorage(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function removeStorage(key: string): void {
  localStorage.removeItem(key);
}
