import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Flight } from '../../../core/models';

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCheckboxModule],
  template: `
    <div class="flight-card premium-card animate-fadeInUp" [class.expanded]="isExpanded">
      <div class="card-summary flex-between flex-wrap gap-md">
        <!-- Airline Info -->
        <div class="airline-section flex-start gap-md">
          <div class="airline-logo" [style.background]="flight.segments[0].airline.color || '#1565C0'">
            {{ flight.segments[0].airline.code }}
          </div>
          <div class="airline-details">
            <h4 class="airline-name">{{ flight.segments[0].airline.name }}</h4>
            <span class="flight-no">{{ flight.segments[0].flightNumber }} • {{ flight.segments[0].aircraft }}</span>
          </div>
        </div>

        <!-- Schedule Timeline -->
        <div class="timeline-section flex-center gap-xl">
          <div class="time-block text-right">
            <h3 class="time">{{ flight.segments[0].departureTime | date:'HH:mm' }}</h3>
            <span class="airport-code">{{ flight.segments[0].origin.code }}</span>
          </div>

          <div class="duration-block flex-center flex-col">
            <span class="duration-text">{{ getFormattedDuration(flight.segments[0].duration) }}</span>
            <div class="route-line" [class.has-stops]="flight.segments[0].stops > 0">
              <span class="dot origin"></span>
              <span class="stop-dot" *ngIf="flight.segments[0].stops > 0"></span>
              <span class="dot dest"></span>
              <mat-icon class="plane-icon">flight_takeoff</mat-icon>
            </div>
            <span class="stops-text" [class.direct]="flight.segments[0].stops === 0">
              {{ flight.segments[0].stops === 0 ? 'Non-stop' : flight.segments[0].stops + ' Stop' }}
            </span>
          </div>

          <div class="time-block">
            <h3 class="time">{{ flight.segments[0].arrivalTime | date:'HH:mm' }}</h3>
            <span class="airport-code">{{ flight.segments[0].destination.code }}</span>
          </div>
        </div>

        <!-- Price & Action -->
        <div class="price-action-section flex-center gap-lg">
          <div class="price-block text-right">
            <span class="price-label">Price starting from</span>
            <h2 class="price">₹{{ flight.price.total | number }}</h2>
            <span class="refund-badge badge" [class.badge-success]="flight.refundable" [class.badge-error]="!flight.refundable">
              {{ flight.refundable ? 'Refundable' : 'Non-refundable' }}
            </span>
          </div>
          
          <div class="action-buttons flex-col gap-sm">
            <button class="btn-gradient btn-sm" (click)="select.emit(flight)">Select</button>
            <button mat-button class="details-toggle-btn" (click)="toggleDetails()">
              {{ isExpanded ? 'Hide Details' : 'Details' }}
              <mat-icon>{{ isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Compare Checkbox -->
      <div class="compare-checkbox-container" *ngIf="showCompare">
        <mat-checkbox [checked]="isSelectedForCompare" (change)="compareToggle.emit($event.checked)">
          Compare this flight
        </mat-checkbox>
      </div>

      <!-- Expanded Details Panel -->
      <div class="details-panel" *ngIf="isExpanded">
        <div class="details-grid">
          <!-- Baggage Info -->
          <div class="details-col">
            <div class="info-title-row">
              <mat-icon>work</mat-icon>
              <h4>Baggage Policy</h4>
            </div>
            <ul class="info-list">
              <li><strong>Cabin:</strong> {{ flight.segments[0].baggageAllowance.cabin }}</li>
              <li><strong>Checked-In:</strong> {{ flight.segments[0].baggageAllowance.checkedIn }}</li>
              <li><strong>Carry-On:</strong> {{ flight.segments[0].baggageAllowance.carryOn }}</li>
            </ul>
          </div>

          <!-- Fare rules -->
          <div class="details-col">
            <div class="info-title-row">
              <mat-icon>gavel</mat-icon>
              <h4>Fare Rules</h4>
            </div>
            <ul class="info-list">
              <li><strong>Fare Type:</strong> {{ flight.fareType }}</li>
              <li><strong>Seats Remaining:</strong> {{ flight.seatsAvailable }} seats</li>
              <li><strong>Seat Class:</strong> {{ flight.cabinClass | titlecase }}</li>
            </ul>
          </div>

          <!-- Amenities -->
          <div class="details-col">
            <div class="info-title-row">
              <mat-icon>wifi</mat-icon>
              <h4>In-flight Amenities</h4>
            </div>
            <div class="amenities-chips flex-wrap gap-sm">
              <span class="amenity-chip" *ngFor="let am of flight.amenities">
                {{ am }}
              </span>
              <span class="amenity-chip" *ngIf="flight.amenities.length === 0">Standard Services</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .flight-card {
      background: var(--bg-card);
      margin-bottom: var(--space-md);
      position: relative;
      overflow: hidden;
      border: 1px solid var(--border-color);
      transition: all var(--transition-base);

      &:hover {
        border-color: var(--color-primary-light);
      }
    }

    .card-summary {
      padding: var(--space-lg);
    }

    .airline-logo {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 1.1rem;
      box-shadow: var(--shadow-sm);
    }

    .airline-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }

    .flight-no {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    // Timeline
    .time-block {
      .time {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.1;
      }
      .airport-code {
        font-size: 0.8rem;
        color: var(--text-secondary);
        font-weight: 500;
      }
    }

    .duration-block {
      width: 140px;

      .duration-text {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-weight: 500;
      }

      .stops-text {
        font-size: 0.75rem;
        font-weight: 600;
        margin-top: 4px;
        color: var(--color-warning);

        &.direct {
          color: var(--color-success);
        }
      }
    }

    .route-line {
      position: relative;
      width: 100%;
      height: 2px;
      background: var(--border-color);
      margin: 8px 0;

      .dot {
        position: absolute;
        top: -3px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--text-muted);
      }

      .origin { left: 0; }
      .dest { right: 0; }

      .stop-dot {
        position: absolute;
        top: -3px;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-warning);
      }

      .plane-icon {
        position: absolute;
        top: -11px;
        left: 40%;
        transform: rotate(90deg);
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--color-primary);
      }
    }

    // Price
    .price-block {
      display: flex;
      flex-direction: column;

      .price-label {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .price {
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--color-primary-dark);
        line-height: 1.1;
        margin: 2px 0;
      }
    }

    .details-toggle-btn {
      font-size: 0.8rem !important;
      color: var(--color-primary) !important;
      height: 32px !important;
      line-height: 32px !important;
      padding: 0 8px !important;
    }

    .compare-checkbox-container {
      padding: 0 var(--space-lg) var(--space-sm);
      border-bottom: 1px solid var(--border-color);
      font-size: 0.8rem;
    }

    // Expanded details
    .details-panel {
      background: var(--bg-primary);
      border-top: 1px solid var(--border-color);
      padding: var(--space-lg);
      animation: slideDown 0.3s ease-out;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-lg);
    }

    .details-col {
      .info-title-row {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-bottom: var(--space-sm);
        color: var(--color-primary);

        mat-icon { font-size: 20px; width: 20px; height: 20px; }
        h4 { font-size: 0.9rem; font-weight: 600; }
      }
    }

    .info-list {
      list-style: none;
      font-size: 0.8rem;
      color: var(--text-secondary);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .amenities-chips {
      display: flex;
      gap: 6px;
    }

    .amenity-chip {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 50px;
      padding: 4px 10px;
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    @keyframes slideDown {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 300px; }
    }
  `]
})
export class FlightCardComponent {
  @Input({ required: true }) flight!: Flight;
  @Input() showCompare = false;
  @Input() isSelectedForCompare = false;

  @Output() select = new EventEmitter<Flight>();
  @Output() compareToggle = new EventEmitter<boolean>();

  isExpanded = false;

  toggleDetails(): void {
    this.isExpanded = !this.isExpanded;
  }

  getFormattedDuration(mins: number): string {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  }
}
