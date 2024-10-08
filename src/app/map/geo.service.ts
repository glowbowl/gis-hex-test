import { Injectable } from '@angular/core';
import proj4 from 'proj4';

@Injectable({
  providedIn: 'root'
})
export class GeoService {
  private readonly epsg3857 = 'EPSG:3857';
  private readonly epsg4326 = 'EPSG:4326';

  constructor() {
    proj4.defs(this.epsg3857, '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');
    proj4.defs(this.epsg4326, '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees');
  }

  public transformGeoJSONCoordinates(geoData: any) {
    if (geoData.type === 'FeatureCollection') {
      geoData.features.forEach((feature: any) => this.transformGeoJSONCoordinates(feature));
    } else if (geoData.type === 'Feature' && geoData.geometry) {
      geoData.geometry.coordinates = this.transformCoordinates(geoData.geometry);
    }

    return geoData;
  }

  private transformCoordinates(geometry: any) {
    const { coordinates } = geometry;

    return coordinates.map((polygon: []) =>
      polygon.map((ring: any) =>
        ring.map((coord: any) => proj4(this.epsg3857, this.epsg4326, coord))
      )
    );
  }
}
