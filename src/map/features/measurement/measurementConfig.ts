export const MEASUREMENT_PALETTE = [
  '#e74c3c',
  '#e67e22',
  '#f1c40f',
  '#2ecc71',
  '#1abc9c',
  '#3498db',
] as const;

export const MAX_MEASUREMENTS = 10;

export function pickColor(index: number): string {
  return MEASUREMENT_PALETTE[index % MEASUREMENT_PALETTE.length];
}

export function measureSourcePrefix(mapKey: string): string {
  return `measure-${mapKey}-`;
}
