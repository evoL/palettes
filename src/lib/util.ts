export function randomString(): string {
  return Math.random().toString(36).slice(2).padStart(1, '0');
}
