import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of notify.toasts()" 
           [class]="'toast-card ' + toast.type" 
           (click)="notify.dismiss(toast.id)">
        <div class="toast-icon">
          <mat-icon *ngIf="toast.type === 'success'">check_circle</mat-icon>
          <mat-icon *ngIf="toast.type === 'error'">error</mat-icon>
          <mat-icon *ngIf="toast.type === 'info'">info</mat-icon>
          <mat-icon *ngIf="toast.type === 'warning'">warning</mat-icon>
        </div>
        <div class="toast-body">
          <h4 class="toast-title" *ngIf="toast.title">{{ toast.title }}</h4>
          <p class="toast-msg">{{ toast.message }}</p>
        </div>
        <button class="toast-close" aria-label="Close notification">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 90px;
      right: 24px;
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 380px;
      width: calc(100vw - 48px);
      pointer-events: none;
    }

    .toast-card {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px 20px;
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-lg);
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(10px);
      cursor: pointer;
      animation: toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-fast);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-xl);
      }

      // Types
      &.success {
        &::before { background: var(--color-success); }
        .toast-icon { color: var(--color-success); }
      }
      &.error {
        &::before { background: var(--color-warn); }
        .toast-icon { color: var(--color-warn); }
      }
      &.info {
        &::before { background: var(--color-primary); }
        .toast-icon { color: var(--color-primary); }
      }
      &.warning {
        &::before { background: var(--color-warning); }
        .toast-icon { color: var(--color-warning); }
      }
    }

    .toast-icon {
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-body {
      flex: 1;
    }

    .toast-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .toast-msg {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 20px;
      line-height: 1;
      padding: 0;
      cursor: pointer;
      transition: color var(--transition-fast);

      &:hover {
        color: var(--text-primary);
      }
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateX(100px) translateY(0);
      }
      to {
        opacity: 1;
        transform: translateX(0) translateY(0);
      }
    }
  `]
})
export class ToastContainerComponent {
  readonly notify = inject(NotificationService);
}
