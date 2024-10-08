import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoaderService } from './loader.service';
import { Subject, takeUntil } from 'rxjs';

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
  private destroy$ = new Subject<void>();

  constructor(private loaderService: LoaderService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loaderService.loaderVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isVisible: boolean) => {
        this.loaderVisible = isVisible;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
