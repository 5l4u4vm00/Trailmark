import generalThumb from '@/assets/basemap-general.jpg';
import orthoThumb from '@/assets/basemap-ortho.jpg';
import vectorLightThumb from '@/assets/basemap-vector-light.jpg';
import vectorDarkThumb from '@/assets/basemap-vector-dark.jpg';
import ofmLibertyThumb from '@/assets/basemap-ofm-liberty.jpg';
import ofmDarkThumb from '@/assets/basemap-ofm-dark.jpg';

export type BasemapKind = 'raster' | 'vector-style';

export interface BasemapDef {
  key: string;
  label: string;
  kind: BasemapKind;
  /** raster: tile URL template; vector-style: style.json URL */
  url: string;
  thumbnail?: string;
}

const ESRI_STREET =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
const ESRI_IMAGERY =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const VECTOR_LIGHT = 'https://richimap2.richitech.com.tw/RichiVT/styles/style.json';
const VECTOR_DARK = 'https://richimap2.richitech.com.tw/RichiVT/styles/style-dark.json';
const OFM_LIBERTY = 'https://tiles.openfreemap.org/styles/liberty';
const OFM_DARK = 'https://tiles.openfreemap.org/styles/dark';

export const BASEMAP_CONFIG: BasemapDef[] = [
  {
    key: 'general',
    label: 'Esri Street Map',
    kind: 'raster',
    url: ESRI_STREET,
    thumbnail: generalThumb,
  },
  {
    key: 'ortho',
    label: 'Esri Imagery',
    kind: 'raster',
    url: ESRI_IMAGERY,
    thumbnail: orthoThumb,
  },
  {
    key: 'vector-light',
    label: 'Vector Map (Light)',
    kind: 'vector-style',
    url: VECTOR_LIGHT,
    thumbnail: vectorLightThumb,
  },
  {
    key: 'vector-dark',
    label: 'Vector Map (Dark)',
    kind: 'vector-style',
    url: VECTOR_DARK,
    thumbnail: vectorDarkThumb,
  },
  {
    key: 'ofm-liberty',
    label: 'OpenFreeMap Liberty',
    kind: 'vector-style',
    url: OFM_LIBERTY,
    thumbnail: ofmLibertyThumb,
  },
  {
    key: 'ofm-dark',
    label: 'OpenFreeMap Dark',
    kind: 'vector-style',
    url: OFM_DARK,
    thumbnail: ofmDarkThumb,
  },
];

export const DEFAULT_BASEMAP_KEY = 'vector-light';

export function getBasemapDef(key: string): BasemapDef | undefined {
  return BASEMAP_CONFIG.find((b) => b.key === key);
}
