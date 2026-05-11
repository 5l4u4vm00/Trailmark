import length from '@turf/length';
import { lineString } from '@turf/helpers';
import type { Position } from 'geojson';

export type DistanceUnit = 'm' | 'km';

export class Distance {
  private constructor(public readonly meters: number) {
    if (!Number.isFinite(meters) || meters < 0) {
      throw new Error(`Invalid distance: ${meters}`);
    }
  }

  static fromMeters(meters: number): Distance {
    return new Distance(meters);
  }

  static fromCoordinates(coords: Position[]): Distance {
    if (coords.length < 2) return new Distance(0);
    const km = length(lineString(coords), { units: 'kilometers' });
    return new Distance(km * 1000);
  }

  toKilometers(): number {
    return this.meters / 1000;
  }

  format(unit: DistanceUnit = 'm', fractionDigits = 2): string {
    if (unit === 'km') {
      return `${this.toKilometers().toFixed(fractionDigits)} km`;
    }
    return `${this.meters.toFixed(fractionDigits)} m`;
  }
}
