import { describe, expect, it } from 'vitest';
import { Area } from './Area';

describe('Area', () => {
  it('round-trips square meters and hectares', () => {
    const a = Area.fromSquareMeters(50_000);
    expect(a.squareMeters).toBe(50_000);
    expect(a.toHectares()).toBe(5);
    expect(a.toSquareKilometers()).toBe(0.05);
  });

  it('formats with selected unit', () => {
    const a = Area.fromSquareMeters(1_234_567);
    expect(a.format('m2', 0)).toBe('1234567 m²');
    expect(a.format('ha', 2)).toBe('123.46 ha');
    expect(a.format('km2', 3)).toBe('1.235 km²');
  });

  it('returns zero for fewer than 3 vertices', () => {
    expect(Area.fromRing([]).squareMeters).toBe(0);
    expect(Area.fromRing([[121, 25]]).squareMeters).toBe(0);
    expect(
      Area.fromRing([
        [121, 25],
        [121.001, 25],
      ]).squareMeters,
    ).toBe(0);
  });

  it('auto-closes an open ring', () => {
    // ~1km × 1km rectangle (~0.009° × 0.009°), area should be close to 1km²
    const ring = [
      [121.0, 25.0],
      [121.009, 25.0],
      [121.009, 25.009],
      [121.0, 25.009],
    ];
    const a = Area.fromRing(ring);
    // Loose check: between 0.8 km² and 1.2 km²
    expect(a.toSquareKilometers()).toBeGreaterThan(0.8);
    expect(a.toSquareKilometers()).toBeLessThan(1.2);
  });

  it('rejects negative or NaN', () => {
    expect(() => Area.fromSquareMeters(-1)).toThrow();
    expect(() => Area.fromSquareMeters(Number.NaN)).toThrow();
  });
});
