import { Injectable } from '@angular/core';
import proj4 from 'proj4';
import geojson2h3 from 'geojson2h3';
import { cellToBoundary } from 'h3-js';
import { Feature, Geometry, GeoJsonProperties, MultiPolygon, Position } from 'geojson';
import { IH3Sets } from './map.interface';
import * as Leaflet from 'leaflet';

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

  public transformDataToHexs(convertedDataGeo: any, resolution: number): IH3Sets[] {
    const h3SetsArray: IH3Sets[] = [];

    convertedDataGeo.features.forEach(
      (feature: Feature<Geometry, GeoJsonProperties>) => {
        h3SetsArray.push(
          {
            title: feature!.properties!['ID'],
            tileColor: feature!.properties!['COLOR_HEX'],
            h3Set: geojson2h3.featureToH3Set(feature, resolution),
            hexBounds: [],
          }
        );
      }
    );

    h3SetsArray.forEach((setObject) => {
      setObject.h3Set.forEach((hex) => {
        setObject.hexBounds.push(cellToBoundary(hex));
      });
    });

    return h3SetsArray
  }

  private transformCoordinates(geometry: MultiPolygon) {
    const { coordinates } = geometry;

    return coordinates.map((polygon: Position[][]) =>
      polygon.map((ring: Position[]) =>
        ring.map((coord: Position) => proj4(this.epsg3857, this.epsg4326, coord))
      )
    );
  }
}
