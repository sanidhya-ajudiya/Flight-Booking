import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/interfaces';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container bookings-page">
      <div class="page-header">
        <h2>My Flight Bookings</h2>
        <p>Manage your active itineraries, download PDF e-tickets, or cancel bookings</p>
      </div>

      <div *ngIf="loading" class="loading">Loading your bookings...</div>

      <div *ngIf="!loading && bookings.length === 0" class="no-bookings glass-card">
        <h3>No Bookings Found 🛫</h3>
        <p>You haven't booked any flights yet. Start exploring flights today!</p>
        <a routerLink="/search" class="btn-primary" style="margin-top: 16px;">Search Flights</a>
      </div>

      <div class="bookings-list" *ngIf="!loading && bookings.length > 0">
        <div *ngFor="let b of bookings" class="booking-card glass-card">
          <!-- Top Row -->
          <div class="card-top">
            <div class="pnr-badge">
              <span>PNR:</span> <strong>{{ b.pnr }}</strong>
            </div>

            <div class="status-tags">
              <span class="badge" [ngClass]="{
                'badge-success': b.status === 'Confirmed',
                'badge-danger': b.status === 'Cancelled',
                'badge-info': b.status === 'Completed'
              }">{{ b.status }}</span>
            </div>
          </div>

          <!-- Flight Info -->
          <div class="card-body">
            <div class="flight-details">
              <img [src]="b.flight.airline.logo" class="airline-logo">
              <div>
                <h4>{{ b.flight.airline.name }}</h4>
                <span class="flight-no">{{ b.flight.flightNumber }} • {{ b.cabinClass | uppercase }}</span>
              </div>
            </div>

            <div class="route-display">
              <div>
                <span class="city-code">{{ b.flight.departureAirport.code }}</span>
                <span class="time">{{ b.flight.departureTime }}</span>
              </div>
              <div class="arrow">➔</div>
              <div>
                <span class="city-code">{{ b.flight.arrivalAirport.code }}</span>
                <span class="time">{{ b.flight.arrivalTime }}</span>
              </div>
            </div>

            <div class="passengers-count">
              👥 {{ b.passengers.length }} Passenger(s) (Seat: {{ getSeats(b) }})
            </div>

            <div class="amount-tag">
              ₹{{ b.totalAmount }}
            </div>
          </div>

          <!-- Actions -->
          <div class="card-footer">
            <span class="date-info">Booked on: {{ b.createdAt | date:'mediumDate' }}</span>

            <div class="actions-group">
              <button (click)="downloadTicket(b)" class="btn-secondary">
                📄 Download PDF
              </button>
              <button *ngIf="b.status === 'Confirmed'" (click)="cancelTicket(b)" class="btn-danger-outline">
                ❌ Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bookings-page { padding-top: 40px; }
    .page-header { margin-bottom: 30px; h2 { font-size: 2rem; font-weight: 800; } p { color: var(--text-secondary); } }

    .no-bookings { padding: 60px; text-align: center; color: var(--text-secondary); }

    .bookings-list { display: flex; flex-direction: column; gap: 20px; }
    .booking-card { padding: 24px; }

    .card-top { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 16px; }
    .pnr-badge { font-size: 0.95rem; strong { font-size: 1.2rem; color: var(--primary-accent); letter-spacing: 1px; } }

    .card-body { display: grid; grid-template-columns: 2fr 2fr 1.5fr 1fr; align-items: center; gap: 20px; margin-bottom: 20px; }
    .flight-details { display: flex; align-items: center; gap: 12px; }
    .airline-logo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .flight-no { font-size: 0.8rem; color: var(--text-muted); }

    .route-display { display: flex; align-items: center; gap: 16px; font-weight: 700; }
    .city-code { font-size: 1.2rem; color: var(--primary-accent); display: block; }
    .time { font-size: 0.85rem; color: var(--text-secondary); }

    .passengers-count { font-size: 0.9rem; font-weight: 600; }
    .amount-tag { font-size: 1.4rem; font-weight: 800; color: var(--primary-accent); text-align: right; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 16px; }
    .date-info { font-size: 0.8rem; color: var(--text-muted); }

    .actions-group { display: flex; gap: 12px; }
    .btn-danger-outline {
      background: transparent;
      border: 1px solid #ef4444;
      color: #ef4444;
      padding: 8px 16px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      &:hover { background: rgba(239, 68, 68, 0.1); }
    }

    @media (max-width: 900px) {
      .card-body { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class BookingHistoryComponent implements OnInit {
  bookingService = inject(BookingService);

  bookings: Booking[] = [];
  loading: boolean = true;

  ngOnInit() {
    this.fetchBookings();
  }

  fetchBookings() {
    this.loading = true;
    this.bookingService.getMyBookings().subscribe({
      next: data => {
        this.bookings = data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  getSeats(booking: Booking): string {
    return booking.passengers.map(p => p.seatNumber).join(', ');
  }

  downloadTicket(booking: Booking) {
    this.bookingService.downloadTicketPDF(booking._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `E-Ticket-${booking.pnr}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  cancelTicket(booking: Booking) {
    if (confirm(`Are you sure you want to cancel booking ${booking.pnr}? Refund will be credited to your SkyWings wallet.`)) {
      this.bookingService.cancelBooking(booking._id, 'User cancelled ticket').subscribe({
        next: (res) => {
          alert('Booking cancelled successfully! Refund credited to wallet.');
          this.fetchBookings();
        },
        error: (err) => alert(err.error?.message || 'Cancellation failed')
      });
    }
  }
}
