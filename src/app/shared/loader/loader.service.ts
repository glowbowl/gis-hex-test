import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loaderVisibleSubject = new BehaviorSubject<boolean>(true);
  public loaderVisible$ = this.loaderVisibleSubject.asObservable();

  showLoader() {
    this.loaderVisibleSubject.next(true);
  }

  hideLoader() {
    this.loaderVisibleSubject.next(false);
  }
}
