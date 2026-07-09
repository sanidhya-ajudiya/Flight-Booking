import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly toasts = signal<Toast[]>([]);

  show(toast: Omit<Toast, 'id'>): void {
    const id = Date.now().toString();
    const newToast: Toast = { id, duration: 4000, ...toast };
    this.toasts.update(list => [...list, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => this.dismiss(id), newToast.duration);
    }
  }

  success(message: string, title?: string): void {
    this.show({ type: 'success', message, title: title || 'Success' });
  }

  error(message: string, title?: string): void {
    this.show({ type: 'error', message, title: title || 'Error', duration: 6000 });
  }

  info(message: string, title?: string): void {
    this.show({ type: 'info', message, title: title || 'Info' });
  }

  warning(message: string, title?: string): void {
    this.show({ type: 'warning', message, title: title || 'Warning', duration: 5000 });
  }

  dismiss(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
