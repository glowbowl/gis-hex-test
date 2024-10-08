import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent implements OnInit {
  public loaderVisible: boolean = false;

  constructor(private loaderService: LoaderService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loaderService.loaderVisible$.subscribe((isVisible) => {
      this.loaderVisible = isVisible;
      this.cdr.detectChanges();
    });
  }
}
