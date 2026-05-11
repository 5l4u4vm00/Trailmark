export type BasemapKind = 'raster' | 'vector-style';

export interface BasemapDef {
  key: string;
  label: string;
  kind: BasemapKind;
  /** raster: tile URL template; vector-style: style.json URL */
  url: string;
  thumbnail?: string;
}

const NLSC_EMAP = 'https://wmts.nlsc.gov.tw/wmts/EMAP/default/EPSG:3857/{z}/{y}/{x}';
const NLSC_PHOTO = 'https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/EPSG:3857/{z}/{y}/{x}';
const VECTOR_LIGHT = 'https://richimap2.richitech.com.tw/RichiVT/styles/style.json';
const VECTOR_DARK = 'https://richimap2.richitech.com.tw/RichiVT/styles/style-dark.json';

export const BASEMAP_CONFIG: BasemapDef[] = [
  {
    key: 'general',
    label: 'Taiwan General Map',
    kind: 'raster',
    url: NLSC_EMAP,
    thumbnail: '',
  },
  {
    key: 'ortho',
    label: 'Orthophoto Imagery',
    kind: 'raster',
    url: NLSC_PHOTO,
    thumbnail: '',
  },
  {
    key: 'vector-light',
    label: 'Vector Map (Light)',
    kind: 'vector-style',
    url: VECTOR_LIGHT,
    thumbnail: '',
  },
  {
    key: 'vector-dark',
    label: 'Vector Map (Dark)',
    kind: 'vector-style',
    url: VECTOR_DARK,
    thumbnail: '',
  },
];

export const DEFAULT_BASEMAP_KEY = 'vector-light';

export function getBasemapDef(key: string): BasemapDef | undefined {
  return BASEMAP_CONFIG.find((b) => b.key === key);
}
