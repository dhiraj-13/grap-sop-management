import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppError {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  source?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private errorsSubject = new BehaviorSubject<AppError[]>([]);
  public errors$ = this.errorsSubject.asObservable();

  private maxErrors = 50;

  constructor() {}

  /**
   * Add an error to the error stream
   */
  addError(message: string, type: 'error' | 'warning' | 'info' = 'error', source?: string): void {
    const error: AppError = {
      message,
      type,
      timestamp: new Date(),
      source
    };

    const currentErrors = this.errorsSubject.value;
    const updatedErrors = [error, ...currentErrors].slice(0, this.maxErrors);
    this.errorsSubject.next(updatedErrors);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errorsSubject.next([]);
  }

  /**
   * Remove a specific error by timestamp
   */
  removeError(timestamp: Date): void {
    const currentErrors = this.errorsSubject.value;
    const updatedErrors = currentErrors.filter(e => e.timestamp.getTime() !== timestamp.getTime());
    this.errorsSubject.next(updatedErrors);
  }

  /**
   * Get current errors
   */
  getErrors(): AppError[] {
    return this.errorsSubject.value;
  }
}