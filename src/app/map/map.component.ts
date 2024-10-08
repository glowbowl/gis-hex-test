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

  private transformDataToHexs(convertedDataGeo: any) {
    const h3SetsArray: { title: any; tileColor: any; h3Set: string[]; hexBounds: CoordPair[][]; }[] = [];

    convertedDataGeo.features.forEach(
      (feature: Feature<Geometry, GeoJsonProperties>) => {
        h3SetsArray.push(
          {
            title: feature!.properties!['ID'],
            tileColor: feature!.properties!['COLOR_HEX'],
            h3Set: geojson2h3.featureToH3Set(feature, 4),
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

    console.log(h3SetsArray);
    return h3SetsArray
  }

  private initMapOpts(hexLayers: any): void {
    this.options = {
      layers: this.getLayers(hexLayers),
      zoom: 6,
      center: new Leaflet.LatLng(21.804, 38.353),
    };
  }

  private getLayers(hexLayers: any): Leaflet.Layer[] {
    const polygonsArray = hexLayers.map((hex: any) => {
      return new Leaflet.Polygon(hex.hexBounds).setStyle({
        fillColor: '#' + hex.tileColor,
        fillOpacity: 0.6,
        color: '#000000',
      }).bindTooltip('Id:' + hex.title);
    });
    return [
      new Leaflet.TileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 8,
          minZoom: 6,
          attribution: '&copy; OpenStreetMap contributors',
        } as Leaflet.TileLayerOptions
      ),
      ...polygonsArray,
    ] as Leaflet.Layer[];
  }
}
