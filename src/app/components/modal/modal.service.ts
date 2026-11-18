import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModalConfig {
  title: string;
  message: string;
  type: 'confirm' | 'alert' | 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalStateSubject = new BehaviorSubject<{
    isOpen: boolean;
    config: ModalConfig | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    config: null,
    resolve: null
  });

  modalState$ = this.modalStateSubject.asObservable();

  show(config: ModalConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalStateSubject.next({
        isOpen: true,
        config,
        resolve
      });
    });
  }

  close(result: boolean) {
    const current = this.modalStateSubject.value;
    if (current.resolve) {
      current.resolve(result);
    }
    this.modalStateSubject.next({
      isOpen: false,
      config: null,
      resolve: null
    });
  }

  // Convenience methods
  confirm(title: string, message: string, confirmText = 'Confirm', cancelText = 'Cancel'): Promise<boolean> {
    return this.show({
      title,
      message,
      type: 'confirm',
      confirmText,
      cancelText,
      showCancel: true
    });
  }

  alert(title: string, message: string, confirmText = 'OK'): Promise<boolean> {
    return this.show({
      title,
      message,
      type: 'alert',
      confirmText,
      showCancel: false
    });
  }

  info(title: string, message: string, confirmText = 'OK'): Promise<boolean> {
    return this.show({
      title,
      message,
      type: 'info',
      confirmText,
      showCancel: false
    });
  }

  success(title: string, message: string, confirmText = 'OK'): Promise<boolean> {
    return this.show({
      title,
      message,
      type: 'success',
      confirmText,
      showCancel: false
    });
  }

  warning(title: string, message: string, confirmText = 'OK', cancelText = 'Cancel'): Promise<boolean> {
    return this.show({
      title,
      message,
      type: 'warning',
      confirmText,
      cancelText,
      showCancel: true
    });
  }

  error(title: string, message: string, confirmText = 'OK'): Promise<boolean> {
    return this.show({
      title,
      message,
      type: 'error',
      confirmText,
      showCancel: false
    });
  }
}