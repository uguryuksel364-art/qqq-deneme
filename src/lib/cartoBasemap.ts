/**
 * 100% Ücretsiz ve Açık Harita Servisleri (API Anahtarı Gerektirmez, Sıfır Filigran)
 * OpenStreetMap & Esri World Basemaps Platformu
 */

export type BasemapStyle = 'street' | 'dark' | 'satellite';

export const FREE_TILE_SERVERS = {
  // 1. Esri World Street Map (Son derece kaliteli, Türkçe yerleşim yerleri, otoyol numaraları, filigransız & ücretsiz)
  street: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',

  // 2. OpenStreetMap Standart (Dünya çapında açık kaynak, %100 ücretsiz)
  osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',

  // 3. Esri Dark Gray Canvas (Mert VIP Transfer'in koyu lacivert/altın tasarımına özel lüks gece haritası)
  dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  darkLabels: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',

  // 4. Esri World Imagery (Yüksek çözünürlüklü gerçek dünya uydu görüntüsü)
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  satelliteLabels: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
};

export const FREE_MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> | &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a>';

// Geriye dönük uyumluluk (Eski importların bozulmaması için)
export const CARTO_ATTRIBUTION = FREE_MAP_ATTRIBUTION;
export const ESRI_SATELLITE_TILE_URL = FREE_TILE_SERVERS.satellite;
export const CARTO_API_KEY = '';

export type CartoStyle = 'voyager' | 'dark' | 'positron' | 'street' | 'satellite';

/**
 * Ücretsiz tile URL döndürür (Filigranlı Carto yerine temiz Esri/OSM kullanır)
 */
export function getCartoTileUrl(style: CartoStyle = 'voyager'): string {
  switch (style) {
    case 'dark':
      return FREE_TILE_SERVERS.dark;
    case 'satellite':
      return FREE_TILE_SERVERS.satellite;
    case 'positron':
    case 'voyager':
    case 'street':
    default:
      return FREE_TILE_SERVERS.street;
  }
}
