import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { FlightService } from '../../core/services/flight.service';
import { Booking } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatDividerModule],
  template: `
    <div class="confirmation-page container animate-fadeIn" *ngIf="booking()">
      <div class="success-banner flex-center flex-col text-center mb-xl">
        <div class="success-icon-badge animate-float">🎉</div>
        <h1 class="title">Booking Confirmed!</h1>
        <p class="desc">Your flight ticket has been booked successfully. E-ticket details sent to <strong>{{ booking()?.contactEmail }}</strong>.</p>
      </div>

      <div class="layout-grid">
        <!-- Ticket Summary card -->
        <div class="ticket-card glass-card flex-col gap-lg">
          <div class="ticket-head flex-between">
            <div class="flex-start gap-md">
              <span class="logo">✈️</span>
              <div>
                <h3>SkyWings Airlines</h3>
                <span class="pnr">PNR: <strong>{{ booking()?.pnr }}</strong></span>
              </div>
            </div>
            <div class="ref-block text-right">
              <span class="lbl">Booking Reference</span>
              <span class="val">{{ booking()?.bookingRef }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Timeline -->
          <div class="timeline-summary flex-between gap-xl flex-wrap">
            <div class="time-block">
              <h3>{{ booking()?.flight?.segments?.[0]?.departureTime | date:'HH:mm' }}</h3>
              <span class="airport">{{ booking()?.flight?.segments?.[0]?.origin?.city }} ({{ booking()?.flight?.segments?.[0]?.origin?.code }})</span>
              <span class="date">{{ booking()?.flight?.segments?.[0]?.departureTime | date:'dd MMM yyyy' }}</span>
            </div>

            <div class="duration-block flex-center flex-col">
              <span class="duration">⏱️ {{ getFormattedDuration(booking()?.flight?.segments?.[0]?.duration!) }}</span>
              <div class="line"></div>
              <span class="stops">{{ booking()?.flight?.segments?.[0]?.stops === 0 ? 'Non-stop' : booking()?.flight?.segments?.[0]?.stops + ' Stop' }}</span>
            </div>

            <div class="time-block">
              <h3>{{ booking()?.flight?.segments?.[0]?.arrivalTime | date:'HH:mm' }}</h3>
              <span class="airport">{{ booking()?.flight?.segments?.[0]?.destination?.city }} ({{ booking()?.flight?.segments?.[0]?.destination?.code }})</span>
              <span class="date">{{ booking()?.flight?.segments?.[0]?.arrivalTime | date:'dd MMM yyyy' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Passengers list -->
          <div class="passengers-list">
            <h4>Passengers</h4>
            <div class="pax-grid mt-sm">
              <div class="pax-item flex-between" *ngFor="let p of booking()?.passengers; let i = index">
                <span>{{ p.title }} {{ p.firstName }} {{ p.lastName }}</span>
                <span class="seat-badge">Seat {{ i === 0 ? '3A' : '3B' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Actions & QR code -->
        <div class="actions-sidebar">
          <div class="glass-card flex-col gap-lg text-center">
            <!-- QR code visual -->
            <div class="qr-code-wrapper flex-center flex-col gap-sm">
              <div class="qr-box">
                🔳
              </div>
              <span class="qr-text">Scan for Mobile Boarding Pass</span>
            </div>

            <div class="action-buttons flex-col gap-sm">
              <button class="btn-gradient w-full flex-center gap-sm" (click)="downloadPdf()">
                <mat-icon>download</mat-icon> Download PDF Ticket
              </button>
              <button class="btn-outline w-full flex-center gap-sm" (click)="printTicket()">
                <mat-icon>print</mat-icon> Print Ticket
              </button>
            </div>

            <a routerLink="/" class="home-link">Go back to Homepage</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty booking confirmation -->
    <div class="empty-state container text-center" *ngIf="!booking()">
      <h2>No Booking Details Found</h2>
      <button routerLink="/" class="btn-gradient">Go Home</button>
    </div>
  `,
  styles: [`
    .confirmation-page {
      padding-top: var(--space-4xl);
      padding-bottom: var(--space-4xl);
    }

    .success-banner {
      .success-icon-badge {
        font-size: 70px;
        margin-bottom: var(--space-sm);
      }
      .title { font-size: 2.2rem; font-weight: 800; color: var(--color-success); }
      .desc { font-size: 0.95rem; color: var(--text-secondary); max-width: 600px; margin-top: 4px; }
    }

    .layout-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-xl);

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .ticket-card {
      padding: var(--space-2xl) !important;
      border: 1px solid var(--border-color);
    }

    .ticket-head {
      .logo { font-size: 32px; }
      h3 { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); }
      .pnr { font-size: 0.75rem; color: var(--text-secondary); }

      .ref-block {
        .lbl { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; display: block; }
        .val { font-size: 0.95rem; font-weight: 700; color: var(--color-primary); }
      }
    }

    .timeline-summary {
      .time-block {
        h3 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .airport { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); display: block; }
        .date { font-size: 0.75rem; color: var(--text-muted); }
      }

      .duration-block {
        width: 140px;
        .duration { font-size: 0.75rem; color: var(--text-muted); }
        .line { width: 100%; height: 2px; background: var(--border-color); margin: 6px 0; }
        .stops { font-size: 0.75rem; font-weight: 600; color: var(--color-primary-light); }
      }
    }

    .passengers-list {
      h4 { font-size: 0.95rem; font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-xs); margin-bottom: var(--space-sm); }
      .pax-item {
        font-size: 0.85rem;
        color: var(--text-secondary);
        padding: var(--space-xs) 0;

        .seat-badge { font-weight: 600; color: var(--color-primary); }
      }
    }

    // Sidebar qr
    .qr-code-wrapper {
      .qr-box { font-size: 80px; line-height: 1; }
      .qr-text { font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; }
    }

    .action-buttons {
      button { height: 48px; font-size: 0.9rem !important; }
    }

    .home-link {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-primary);
      text-decoration: underline;
    }
  `]
})
export class BookingConfirmationComponent implements OnInit {
  private flightService = inject(FlightService);
  private notify = inject(NotificationService);

  booking = signal<Booking | null>(null);

  ngOnInit(): void {
    const active = this.flightService.currentBooking();
    if (active) {
      this.booking.set(active);
    } else {
      // Mock Fallback confirmation
      this.booking.set({
        id: '1234',
        bookingRef: 'SKYWINGS10',
        pnr: 'PWQ987',
        status: 'confirmed',
        flight: this.flightService.searchResults()[0],
        passengers: [{ type: 'adult', title: 'Mr', firstName: 'Arjun', lastName: 'Sharma' }],
        totalPrice: { base: 6000, taxes: 1080, gst: 300, total: 7380, currency: 'INR', pricePerPassenger: 7380 },
        createdAt: new Date().toISOString(),
        contactEmail: 'arjun@example.com',
        contactPhone: '9876543210'
      });
    }
  }

  getFormattedDuration(mins: number): string {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  }

  downloadPdf(): void {
    this.notify.success('Downloading simulated e-ticket PDF...');
    // Simple browser download simulation
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('SkyWings E-Ticket Summary Code: ' + this.booking()?.bookingRef);
    link.download = `SkyWings_Ticket_${this.booking()?.bookingRef}.txt`;
    link.click();
  }

  printTicket(): void {
    window.print();
  }
}
