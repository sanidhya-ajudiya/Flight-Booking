import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PassengerCount } from '../../../core/models';

@Component({
  selector: 'app-passenger-counter',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="passenger-counter-panel glass">
      <!-- Adults -->
      <div class="counter-row flex-between">
        <div class="counter-label">
          <span class="title">Adults</span>
          <span class="subtitle">Age 12+</span>
        </div>
        <div class="counter-actions flex-center gap-md">
          <button mat-icon-button class="btn-ctrl" (click)="update('adults', -1)" [disabled]="value.adults <= 1">
            <mat-icon>remove</mat-icon>
          </button>
          <span class="count">{{ value.adults }}</span>
          <button mat-icon-button class="btn-ctrl" (click)="update('adults', 1)" [disabled]="getTotal() >= 9">
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </div>

      <!-- Children -->
      <div class="counter-row flex-between">
        <div class="counter-label">
          <span class="title">Children</span>
          <span class="subtitle">Age 2-11</span>
        </div>
        <div class="counter-actions flex-center gap-md">
          <button mat-icon-button class="btn-ctrl" (click)="update('children', -1)" [disabled]="value.children <= 0">
            <mat-icon>remove</mat-icon>
          </button>
          <span class="count">{{ value.children }}</span>
          <button mat-icon-button class="btn-ctrl" (click)="update('children', 1)" [disabled]="getTotal() >= 9">
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </div>

      <!-- Infants -->
      <div class="counter-row flex-between">
        <div class="counter-label">
          <span class="title">Infants</span>
          <span class="subtitle">Under age 2</span>
        </div>
        <div class="counter-actions flex-center gap-md">
          <button mat-icon-button class="btn-ctrl" (click)="update('infants', -1)" [disabled]="value.infants <= 0">
            <mat-icon>remove</mat-icon>
          </button>
          <span class="count">{{ value.infants }}</span>
          <button mat-icon-button class="btn-ctrl" (click)="update('infants', 1)" [disabled]="value.infants >= value.adults">
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .passenger-counter-panel {
      padding: var(--space-md);
      min-width: 250px;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      background: var(--bg-card);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--border-color);
    }

    .counter-row {
      padding-bottom: var(--space-xs);
      border-bottom: 1px solid rgba(21, 101, 192, 0.05);

      &:last-child {
        padding-bottom: 0;
        border-bottom: none;
      }
    }

    .counter-label {
      display: flex;
      flex-direction: column;

      .title {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .subtitle {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }
    }

    .btn-ctrl {
      background: var(--bg-primary) !important;
      border: 1px solid var(--border-color) !important;
      color: var(--color-primary) !important;
      width: 32px !important;
      height: 32px !important;
      line-height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;

      &:disabled {
        opacity: 0.4;
      }
    }

    .count {
      font-size: 0.95rem;
      font-weight: 700;
      min-width: 20px;
      text-align: center;
      color: var(--text-primary);
    }
  `]
})
export class PassengerCounterComponent {
  @Input() value: PassengerCount = { adults: 1, children: 0, infants: 0 };
  @Output() valueChange = new EventEmitter<PassengerCount>();

  update(field: keyof PassengerCount, delta: number): void {
    const updated = { ...this.value };
    updated[field] = Math.max(0, updated[field] + delta);
    if (field === 'adults' && updated.adults < updated.infants) {
      updated.infants = updated.adults;
    }
    this.value = updated;
    this.valueChange.emit(updated);
  }

  getTotal(): number {
    return this.value.adults + this.value.children + this.value.infants;
  }
}
