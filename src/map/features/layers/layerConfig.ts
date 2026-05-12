import type { SourceSpecification, LayerSpecification } from 'maplibre-gl';

export interface LayerDef {
  id: string;
  name: string;
  source: SourceSpecification;
  layers: LayerSpecification[];
  defaultVisible?: boolean;
  defaultOpacity?: number;
  legend?: { color: string; label: string }[];
  minZoom?: number;
  maxZoom?: number;
}

const TERRARIUM_TILES =
  'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
const OPENTOPO_TILES = 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png';
const WAYMARKED_HIKING_TILES =
  'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png';
const OFM_PLANET_TILEJSON = 'https://tiles.openfreemap.org/planet';

export const LAYER_CONFIG: LayerDef[] = [
  {
    id: 'hillshade',
    name: 'Hillshade / Terrain',
    defaultVisible: false,
    defaultOpacity: 60,
    source: {
      type: 'raster-dem',
      tiles: [TERRARIUM_TILES],
      tileSize: 256,
      encoding: 'terrarium',
      maxzoom: 15,
      attribution: '© Mapzen / AWS Terrain Tiles',
    },
    layers: [
      {
        id: 'hillshade-layer',
        type: 'hillshade',
        source: 'hillshade',
        paint: {
          'hillshade-shadow-color': '#473b24',
          'hillshade-exaggeration': 0.6,
        },
      },
    ],
    legend: [{ color: '#7a6a4f', label: 'Shaded relief' }],
  },
  {
    id: 'contours',
    name: 'Contours / Topo',
    defaultVisible: false,
    defaultOpacity: 55,
    source: {
      type: 'raster',
      tiles: [OPENTOPO_TILES],
      tileSize: 256,
      maxzoom: 17,
      attribution: '© OpenTopoMap (CC-BY-SA)',
    },
    layers: [
      {
        id: 'contours-layer',
        type: 'raster',
        source: 'contours',
        paint: { 'raster-opacity': 0.55 },
      },
    ],
    legend: [{ color: '#a06b3a', label: 'Topographic raster' }],
  },
  {
    id: 'osm-trails',
    name: 'Hiking Trails',
    defaultVisible: true,
    defaultOpacity: 80,
    source: {
      type: 'raster',
      tiles: [WAYMARKED_HIKING_TILES],
      tileSize: 256,
      maxzoom: 18,
      attribution: '© waymarkedtrails.org (CC-BY-SA)',
    },
    layers: [
      {
        id: 'osm-trails-layer',
        type: 'raster',
        source: 'osm-trails',
        paint: { 'raster-opacity': 0.8 },
      },
    ],
    legend: [
      { color: '#d62728', label: 'Major route' },
      { color: '#2ca02c', label: 'Local trail' },
    ],
  },
  {
    id: 'peaks',
    name: 'Peaks',
    defaultVisible: false,
    defaultOpacity: 100,
    minZoom: 8,
    source: {
      type: 'vector',
      url: OFM_PLANET_TILEJSON,
    },
    layers: [
      {
        id: 'peaks-circle',
        type: 'circle',
        source: 'peaks',
        'source-layer': 'mountain_peak',
        minzoom: 8,
        paint: {
          'circle-radius': 3,
          'circle-color': '#7c3a17',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1,
          'circle-opacity': 1,
        },
      },
      {
        id: 'peaks-label',
        type: 'symbol',
        source: 'peaks',
        'source-layer': 'mountain_peak',
        minzoom: 10,
        layout: {
          'text-field': ['coalesce', ['get', 'name:zh'], ['get', 'name']],
          'text-size': 11,
          'text-offset': [0, -1.1],
          'text-anchor': 'bottom',
          'text-optional': true,
        },
        paint: {
          'text-color': '#3d2410',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.2,
          'text-opacity': 1,
        },
      },
    ],
    legend: [{ color: '#7c3a17', label: 'Mountain peak' }],
  },
];

/** Opacity 0..1 paint property used per layer type to honor the panel slider. */
export function opacityPaintProp(
  layer: LayerSpecification,
): string | undefined {
  switch (layer.type) {
    case 'raster':
      return 'raster-opacity';
    case 'hillshade':
      return 'hillshade-exaggeration';
    case 'circle':
      return 'circle-opacity';
    case 'symbol':
      return 'text-opacity';
    case 'fill':
      return 'fill-opacity';
    case 'line':
      return 'line-opacity';
    default:
      return undefined;
  }
}

export function getLayerDef(id: string): LayerDef | undefined {
  return LAYER_CONFIG.find((l) => l.id === id);
}
