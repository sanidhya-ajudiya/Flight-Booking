import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/interfaces';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2>Manage Master Bookings</h2>
          <p>Complete system booking ledger & passenger manifests</p>
        </div>
      </div>

      <div class="glass-card table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>PNR</th>
              <th>Customer</th>
              <th>Flight & Route</th>
              <th>Passengers</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of bookings">
              <td><strong>{{ b.pnr }}</strong></td>
              <td>{{ b.user?.name }}<br><small>{{ b.user?.email }}</small></td>
              <td>{{ b.flight?.flightNumber }} ({{ b.flight?.departureAirport?.code }} ➔ {{ b.flight?.arrivalAirport?.code }})</td>
              <td>{{ b.passengers.length }} Pax</td>
              <td>₹{{ b.totalAmount }}</td>
              <td><span class="badge badge-info">{{ b.paymentMethod }}</span></td>
              <td><span class="badge" [ngClass]="b.status === 'Confirmed' ? 'badge-success' : 'badge-danger'">{{ b.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 40px 0; }
    .admin-header { margin-bottom: 30px; h2 { font-size: 2rem; font-weight: 800; } }

    .table-card { padding: 24px; }
    .admin-table {
      width: 100%; border-collapse: collapse; font-size: 0.9rem;
      th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
      th { font-weight: 700; color: var(--text-muted); background: var(--bg-primary); }
    }
  `]
})
export class AdminBookingsComponent implements OnInit {
  bookingService = inject(BookingService);
  bookings: Booking[] = [];

  ngOnInit() {
    this.bookingService.getAllBookings().subscribe({ next: data => this.bookings = data });
  }
}
