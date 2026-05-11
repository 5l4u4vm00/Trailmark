import area from '@turf/area';
import { polygon } from '@turf/helpers';
import type { Position } from 'geojson';

export type AreaUnit = 'm2' | 'ha' | 'km2';

export class Area {
  private constructor(public readonly squareMeters: number) {
    if (!Number.isFinite(squareMeters) || squareMeters < 0) {
      throw new Error(`Invalid area: ${squareMeters}`);
    }
  }

  static fromSquareMeters(m2: number): Area {
    return new Area(m2);
  }

  static fromRing(ring: Position[]): Area {
    if (ring.length < 3) return new Area(0);
    const closed =
      sameCoord(ring[0], ring[ring.length - 1]) ? ring : [...ring, ring[0]];
    return new Area(area(polygon([closed])));
  }

  toHectares(): number {
    return this.squareMeters / 10_000;
  }

  toSquareKilometers(): number {
    return this.squareMeters / 1_000_000;
  }

  format(unit: AreaUnit = 'm2', fractionDigits = 2): string {
    switch (unit) {
      case 'ha':
        return `${this.toHectares().toFixed(fractionDigits)} ha`;
      case 'km2':
        return `${this.toSquareKilometers().toFixed(fractionDigits)} km²`;
      default:
        return `${this.squareMeters.toFixed(fractionDigits)} m²`;
    }
  }
}

function sameCoord(a: Position, b: Position): boolean {
  return a[0] === b[0] && a[1] === b[1];
}
