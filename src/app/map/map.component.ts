import { Component, OnInit } from '@angular/core';
import data from './dataGeo.json';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as Leaflet from 'leaflet';
import geojson2h3 from 'geojson2h3';
import { cellToBoundary, CoordPair } from 'h3-js';
import { GeoService } from './geo.service';
import { Feature, Geometry, GeoJsonProperties } from 'geojson';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
  public options: Leaflet.MapOptions = {};

  constructor(private geoService: GeoService) {}

  ngOnInit(): void {
    const start = performance.now();

    const dataGeoJson = data;
    const convertedDataGeo =
      this.geoService.transformGeoJSONCoordinates(dataGeoJson);
    const hexBoundsArray = this.transformDataToHexs(convertedDataGeo);
    this.initMapOpts(hexBoundsArray);

    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
    console.log(convertedDataGeo.features[0].geometry.coordinates[0][0][0]);
  }

  private transformDataToHexs(convertedDataGeo: any): any {
    const h3SetsArray: string[][] = [];

    convertedDataGeo.features.forEach(
      (feature: Feature<Geometry, GeoJsonProperties>) => {
        h3SetsArray.push(geojson2h3.featureToH3Set(feature, 3));
      }
    );

    const hexBoundsArray: CoordPair[][] = [];

    h3SetsArray.forEach((set) => {
      set.forEach((hex) => {
        hexBoundsArray.push(cellToBoundary(hex));
      });
    });
    console.log(hexBoundsArray);
  }

  private initMapOpts(hexLayers: any): void {
    this.options = {
      layers: this.getLayers(hexLayers),
      zoom: 4,
      center: new Leaflet.LatLng(21.804, 38.353),
    };
  }

  private getLayers(hexLayers: any): Leaflet.Layer[] {
    const polygonsArray = hexLayers.map((hex: any) => {
      return new Leaflet.Polygon(hex).setStyle({
        fillColor: '#FF5722',
        color: '#000000',
      });
    });
    return [
      new Leaflet.TileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 12,
          attribution: '&copy; OpenStreetMap contributors',
        } as Leaflet.TileLayerOptions
      ),
      ...polygonsArray,
    ] as Leaflet.Layer[];
  }
}
