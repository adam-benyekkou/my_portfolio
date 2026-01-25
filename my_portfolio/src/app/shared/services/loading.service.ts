import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  setLoading(value: boolean): void {
    this._isLoading.set(value);
  }

  // Helper for easier usage in components/services
  start(): void {
    this._isLoading.set(true);
  }

  stop(): void {
    this._isLoading.set(false);
  }
}
