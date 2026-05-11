import type { SourceSpecification, LayerSpecification } from 'maplibre-gl';

export interface LayerDef {
  id: string;
  name: string;
  source: SourceSpecification;
  layers: LayerSpecification[];
  defaultVisible?: boolean;
  requireAuth?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

// Basemaps (NLSC EMAP / orthophoto / vector maps) have been moved to
// `features/basemap/basemapConfig.ts`. This file is kept for future business layers.
export const LAYER_CONFIG: LayerDef[] = [];
