import { describe, expect, it } from 'vitest';
import { Distance } from './Distance';

describe('Distance', () => {
  it('round-trips meters and kilometers', () => {
    const d = Distance.fromMeters(2500);
    expect(d.meters).toBe(2500);
    expect(d.toKilometers()).toBe(2.5);
  });

  it('formats with selected unit', () => {
    const d = Distance.fromMeters(1234.56);
    expect(d.format('m', 0)).toBe('1235 m');
    expect(d.format('km', 3)).toBe('1.235 km');
  });

  it('returns zero for fewer than 2 coordinates', () => {
    expect(Distance.fromCoordinates([]).meters).toBe(0);
    expect(Distance.fromCoordinates([[121, 25]]).meters).toBe(0);
  });

  it('computes great-circle distance between two points', () => {
    // Taipei 101 ≈ [121.5654, 25.0330], Taoyuan Airport ≈ [121.2342, 25.0797]
    // Great-circle distance between the two is roughly 33–34 km
    const d = Distance.fromCoordinates([
      [121.5654, 25.033],
      [121.2342, 25.0797],
    ]);
    expect(d.toKilometers()).toBeGreaterThan(33);
    expect(d.toKilometers()).toBeLessThan(35);
  });

  it('rejects negative or NaN meters', () => {
    expect(() => Distance.fromMeters(-1)).toThrow();
    expect(() => Distance.fromMeters(Number.NaN)).toThrow();
  });
});
