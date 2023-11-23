export function bytesToMegobytes(size: number, fixed = 2): number {
  return +(size / 1024 / 1024).toFixed(fixed);
}
