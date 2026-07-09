import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { FlightService } from '../../../core/services/flight.service';
import { Booking } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDividerModule],
  template: `
    <div class="bookings-tab flex-col gap-lg animate-fadeIn">
      <div class="header-row flex-between">
        <h2 class="tab-title">My Bookings</h2>
      </div>

      <!-- Bookings list -->
      <div class="bookings-list flex-col gap-md" *ngIf="bookings().length > 0">
        <div class="booking-item glass-card flex-col gap-md" *ngFor="let b of bookings()">
          <div class="item-head flex-between flex-wrap gap-sm">
            <div class="flex-start gap-md">
              <span class="logo-circle">✈️</span>
              <div>
                <h4>{{ b.flight?.segments?.[0]?.origin?.city }} to {{ b.flight?.segments?.[0]?.destination?.city }}</h4>
                <span class="meta">Booking Ref: <strong>{{ b.bookingRef }}</strong> • PNR: <strong>{{ b.pnr }}</strong></span>
              </div>
            </div>
            
            <div class="flex-start gap-md">
              <span [class]="'badge ' + (b.status === 'confirmed' ? 'badge-success' : 'badge-error')">
                {{ b.status | titlecase }}
              </span>
              <span class="price-text">₹{{ b.flight?.price?.total | number }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Core details -->
          <div class="item-body flex-between gap-lg flex-wrap">
            <div class="schedule flex-start gap-xl">
              <div>
                <strong>{{ b.flight?.segments?.[0]?.departureTime | date:'HH:mm' }}</strong>
                <span>{{ b.flight?.segments?.[0]?.origin?.code }}</span>
              </div>
              <div class="route-arrow">
                <span>⏱️ {{ getFormattedDuration(b.flight?.segments?.[0]?.duration!) }}</span>
                <div class="line"></div>
              </div>
              <div>
                <strong>{{ b.flight?.segments?.[0]?.arrivalTime | date:'HH:mm' }}</strong>
                <span>{{ b.flight?.segments?.[0]?.destination?.code }}</span>
              </div>
            </div>

            <div class="actions flex-start gap-sm">
              <button class="btn-outline btn-sm" (click)="downloadTicket(b)">Download Ticket</button>
              <button class="cancel-btn" *ngIf="b.status === 'confirmed'" (click)="cancelBooking(b)">Cancel Booking</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state bookings -->
      <div class="empty-bookings text-center glass-card flex-center flex-col" *ngIf="bookings().length === 0">
        <span class="icon">🎟️</span>
        <h3>No Booking Records</h3>
        <p>You haven't booked any flights with SkyWings yet.</p>
      </div>
    </div>
  `,
  styles: [`
    .tab-title { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }

    .booking-item {
      padding: var(--space-xl) !important;
      border: 1px solid var(--border-color);
      transition: all var(--transition-base);

      &:hover {
        border-color: var(--color-primary-light);
      }
    }

    .item-head {
      .logo-circle {
        width: 38px;
        height: 38px;
        background: var(--bg-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      }

      h4 { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
      .meta { font-size: 0.75rem; color: var(--text-muted); }
      .price-text { font-size: 1.15rem; font-weight: 700; color: var(--color-primary); }
    }

    .item-body {
      .schedule {
        strong { font-size: 1.1rem; font-weight: 700; display: block; color: var(--text-primary); }
        span { font-size: 0.75rem; color: var(--text-secondary); display: block; }
      }

      .route-arrow {
        text-align: center;
        width: 100px;
        span { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; }
        .line { width: 100%; height: 2px; background: var(--border-color); margin-top: 4px; }
      }
    }

    .cancel-btn {
      background: none;
      border: none;
      color: var(--color-warn);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      padding: 8px 12px;

      &:hover {
        text-decoration: underline;
      }
    }

    .empty-bookings {
      padding: var(--space-3xl) !important;
      .icon { font-size: 48px; margin-bottom: var(--space-sm); }
      h3 { font-size: 1.15rem; font-weight: 700; }
      p { font-size: 0.85rem; color: var(--text-secondary); }
    }
  `]
})
export class BookingsComponent implements OnInit {
  private flightService = inject(FlightService);
  private notify = inject(NotificationService);

  bookings = signal<Booking[]>([]);

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.flightService.getMyBookings().subscribe(list => {
      this.bookings.set(list);
    });
  }

  getFormattedDuration(mins: number): string {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  }

  downloadTicket(b: Booking): void {
    this.notify.success('Downloading ticket PDF: ' + b.bookingRef);
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('SkyWings E-Ticket Summary Code: ' + b.bookingRef);
    link.download = `SkyWings_Ticket_${b.bookingRef}.txt`;
    link.click();
  }

  cancelBooking(b: Booking): void {
    if (confirm(`Are you sure you want to cancel booking ${b.bookingRef}?`)) {
      // Simulate cancellation
      b.status = 'cancelled';
      this.notify.success('Booking cancelled successfully. Refund initiated.');
      
      // Update in localStorage
      try {
        const list = JSON.parse(localStorage.getItem('skywings_bookings') || '[]');
        const idx = list.findIndex((x: any) => x.id === b.id);
        if (idx > -1) {
          list[idx].status = 'cancelled';
          localStorage.setItem('skywings_bookings', JSON.stringify(list));
        }
      } catch {}
    }
  }
}
