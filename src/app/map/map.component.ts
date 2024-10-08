import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import data from '../shared/dataGeo.json';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as Leaflet from 'leaflet';
import geojson2h3 from 'geojson2h3';
import { cellToBoundary, CoordPair } from 'h3-js';
import { GeoService } from '../shared/geo.service';
import { IH3Sets } from '../shared/map.interface';
import { LoaderService } from '../shared/loader/loader.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: Leaflet.Map;
  private convertedDataGeo: Leaflet.GeoJSON;

  constructor(
    private geoService: GeoService,
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef
  ) {
    const dataGeoJson = data;
    this.convertedDataGeo =
      this.geoService.transformGeoJSONCoordinates(dataGeoJson);
  }

  ngAfterViewInit(): void {
    const start = performance.now();

    this.initMap();

    let resolution = this.getResolutionBasedOnZoom(this.map.getZoom());
    const hexBoundsArray = this.geoService.transformDataToHexs(
      this.convertedDataGeo,
      resolution
    );
    this.updateHexLayers(this.map, hexBoundsArray);

    this.loaderService.hideLoader();

    this.map.on('zoomend', () => {
      this.loaderService.showLoader();
      this.cdr.detectChanges();
      const startUpdate = performance.now();

      const currentResolution = this.getResolutionBasedOnZoom(
        this.map.getZoom()
      );
      if (resolution !== currentResolution) {
        resolution = currentResolution;
        const updatedHexBoundsArray = this.geoService.transformDataToHexs(
          this.convertedDataGeo,
          resolution
        );
        this.updateHexLayers(this.map, updatedHexBoundsArray);
      }
      this.loaderService.hideLoader();
      this.cdr.detectChanges();

      const endUpdate = performance.now();
      console.log(`Execution update time: ${endUpdate - startUpdate} ms`);
    });

    const end = performance.now();
    console.log(`Initial execution time: ${end - start} ms`);
  }

  ngOnDestroy(): void {
    this.map.clearAllEventListeners();
    this.map.remove();
  }

  private updateHexLayers(map: Leaflet.Map, hexLayers: IH3Sets[]): void {
    map.eachLayer((layer) => {
      if (layer instanceof Leaflet.Polygon) {
        map.removeLayer(layer);
      }
    });

    const newLayers = this.getLayers(hexLayers);
    newLayers.forEach((layer) => map.addLayer(layer));
  }

  private getLayers(hexLayers: IH3Sets[]): Leaflet.Layer[] {
    const polygonsArray = hexLayers.map((hex: IH3Sets) => {
      return new Leaflet.Polygon(hex.hexBounds)
        .setStyle({
          fillColor: '#' + hex.tileColor,
          fillOpacity: 0.6,
          color: '#000000',
        })
        .bindTooltip('Id:' + hex.title);
    });
    return [...polygonsArray] as Leaflet.Layer[];
  }

  private initMap(): void {
    this.map = Leaflet.map('mapId').setView([21.804, 38.353], 6);
    this.map.addLayer(
      new Leaflet.TileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 9,
          minZoom: 6,
          attribution: '&copy; OpenStreetMap contributors',
        } as Leaflet.TileLayerOptions
      )
    );
  }

  private getResolutionBasedOnZoom(zoom: number): number {
    if (zoom >= 8) {
      return 5;
    } else if (zoom >= 7) {
      return 4;
    } else {
      return 3;
    }
  }
}
