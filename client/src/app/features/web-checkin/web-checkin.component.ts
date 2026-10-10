import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/interfaces';

@Component({
  selector: 'app-web-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="checkin-page container">
      <!-- Header Banner -->
      <div class="checkin-header text-center">
        <span class="badge-tag">✈️ AIRPORT SERVICES</span>
        <h1>Web Check-In & Boarding Pass</h1>
        <p>Check in online 24 hours prior to departure, select your seat, and generate your digital boarding pass instantly.</p>
      </div>

      <!-- PNR Search Card -->
      <div class="pnr-search-card glass-card">
        <form (ngSubmit)="onLookupPNR()" class="pnr-form">
          <div class="input-wrap">
            <label>Booking Reference (PNR Number)</label>
            <input 
              type="text" 
              [(ngModel)]="pnrInput" 
              name="pnr" 
              placeholder="e.g. PNR89421A" 
              class="custom-input pnr-field"
              required
            >
          </div>
          <button type="submit" [disabled]="loading || !pnrInput" class="btn-primary search-btn">
            {{ loading ? 'Locating Flight...' : 'Find My Booking ➔' }}
          </button>
        </form>

        <div *ngIf="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Booking & Check-in Result Card -->
      <div *ngIf="booking" class="booking-result-section">
        <!-- Flight Info Bar -->
        <div class="glass-card flight-summary-bar">
          <div class="flight-main">
            <span class="airline-brand">{{ booking.flight?.airline?.name }}</span>
            <span class="flight-no">{{ booking.flight?.flightNumber }}</span>
          </div>
          <div class="route-display">
            <div class="route-point">
              <span class="airport-code">{{ booking.flight?.departureAirport?.code }}</span>
              <span class="airport-city">{{ booking.flight?.departureAirport?.city }}</span>
              <span class="time">{{ booking.flight?.departureTime }}</span>
            </div>
            <div class="route-arrow">✈️ ➔</div>
            <div class="route-point">
              <span class="airport-code">{{ booking.flight?.arrivalAirport?.code }}</span>
              <span class="airport-city">{{ booking.flight?.arrivalAirport?.city }}</span>
              <span class="time">{{ booking.flight?.arrivalTime }}</span>
            </div>
          </div>
          <div class="meta-tag">
            <span>Terminal: <strong>{{ booking.flight?.departureAirport?.terminal || 'T2' }}</strong></span>
            <span>Date: <strong>{{ booking.flight?.departureDate | date:'mediumDate' }}</strong></span>
          </div>
        </div>

        <!-- Passengers Check-in Cards -->
        <div class="passengers-list">
          <h3>Passengers & Check-In Status</h3>
          <div *ngFor="let p of booking.passengers; let i = index" class="glass-card passenger-checkin-card">
            <div class="p-info">
              <span class="p-name">{{ p.name }}</span>
              <div class="p-sub">
                <span>Seat: <strong>{{ p.seatNumber }}</strong></span>
                <span>Gender: {{ p.gender }}</span>
                <span>Passport: {{ p.passportNumber || 'N/A' }}</span>
              </div>
            </div>

            <div class="p-action">
              <div *ngIf="p.isCheckedIn" class="status-checked-in">
                <span class="check-icon">✓</span>
                <span>Checked In</span>
                <span class="bp-pill">{{ p.boardingPassNumber || ('BP-' + booking.pnr + '-' + (i+1)) }}</span>
              </div>

              <button 
                *ngIf="!p.isCheckedIn" 
                (click)="onCheckIn(i)" 
                [disabled]="checkingInIndex === i"
                class="btn-primary btn-checkin"
              >
                {{ checkingInIndex === i ? 'Checking In...' : 'Check In Now ➔' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Digital Boarding Pass Preview -->
        <div *ngIf="hasCheckedInPassenger()" class="boarding-pass-wrapper">
          <div class="boarding-pass glass-card">
            <div class="bp-left">
              <div class="bp-header">
                <span class="bp-logo">✈️ SKYWINGS AIRLINES</span>
                <span class="bp-badge">BOARDING PASS</span>
              </div>
              <div class="bp-body">
                <div class="bp-row">
                  <div>
                    <span class="bp-label">PASSENGER NAME</span>
                    <span class="bp-val">{{ getFirstCheckedIn()?.name }}</span>
                  </div>
                  <div>
                    <span class="bp-label">FLIGHT</span>
                    <span class="bp-val highlight">{{ booking.flight?.flightNumber }}</span>
                  </div>
                  <div>
                    <span class="bp-label">CABIN</span>
                    <span class="bp-val">{{ (booking.cabinClass || 'Economy') | uppercase }}</span>
                  </div>
                </div>
                <div class="bp-row">
                  <div>
                    <span class="bp-label">FROM</span>
                    <span class="bp-val">{{ booking.flight?.departureAirport?.city }} ({{ booking.flight?.departureAirport?.code }})</span>
                  </div>
                  <div>
                    <span class="bp-label">TO</span>
                    <span class="bp-val">{{ booking.flight?.arrivalAirport?.city }} ({{ booking.flight?.arrivalAirport?.code }})</span>
                  </div>
                  <div>
                    <span class="bp-label">BOARDING TIME</span>
                    <span class="bp-val highlight">{{ booking.flight?.departureTime }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bp-stub">
              <div>
                <span class="bp-label">SEAT</span>
                <span class="bp-val seat-big">{{ getFirstCheckedIn()?.seatNumber }}</span>
              </div>
              <div>
                <span class="bp-label">GATE</span>
                <span class="bp-val gate-big">{{ getFirstCheckedIn()?.gate || 'G12' }}</span>
              </div>
              <div>
                <span class="bp-label">PNR</span>
                <span class="bp-val">{{ booking.pnr }}</span>
              </div>
              <div class="barcode-visual">
                ||| | |||| | ||||| ||| || |
              </div>
            </div>
          </div>

          <div class="print-actions text-center">
            <button (click)="printBoardingPass()" class="btn-secondary">🖨️ Print Boarding Pass</button>
            <button (click)="downloadPDF()" class="btn-primary">📥 Download Full E-Ticket</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkin-page { padding-top: 40px; padding-bottom: 60px; max-width: 900px; margin: 0 auto; }
    .checkin-header { margin-bottom: 30px; text-align: center; }
    .badge-tag { font-size: 0.75rem; letter-spacing: 2px; font-weight: 800; color: var(--primary); display: block; margin-bottom: 8px; }
    .checkin-header h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 10px; }
    .checkin-header p { color: var(--text-muted); font-size: 0.95rem; max-width: 650px; margin: 0 auto; }

    .pnr-search-card { padding: 30px; margin-bottom: 30px; }
    .pnr-form { display: flex; gap: 16px; align-items: flex-end; }
    .input-wrap { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .input-wrap label { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); }
    .pnr-field { text-transform: uppercase; letter-spacing: 2px; font-size: 1.1rem; font-weight: bold; }
    .search-btn { height: 48px; padding: 0 24px; white-space: nowrap; font-weight: 700; }

    .error-alert { margin-top: 16px; padding: 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; border-radius: 8px; font-size: 0.9rem; }

    .flight-summary-bar { display: flex; justify-content: space-between; align-items: center; padding: 20px 28px; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .airline-brand { font-size: 0.85rem; color: var(--text-muted); display: block; }
    .flight-no { font-size: 1.4rem; font-weight: 800; color: var(--primary); }
    .route-display { display: flex; align-items: center; gap: 20px; }
    .route-point { display: flex; flex-direction: column; align-items: center; }
    .airport-code { font-size: 1.6rem; font-weight: 800; }
    .airport-city { font-size: 0.8rem; color: var(--text-muted); }
    .time { font-size: 0.9rem; font-weight: 600; color: var(--primary); }
    .route-arrow { color: var(--text-muted); font-size: 1.2rem; }
    .meta-tag { display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem; color: var(--text-muted); }

    .passengers-list { margin-bottom: 30px; }
    .passengers-list h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 16px; }
    .passenger-checkin-card { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; margin-bottom: 12px; }
    .p-name { font-size: 1.1rem; font-weight: 700; display: block; margin-bottom: 4px; }
    .p-sub { display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-muted); }

    .status-checked-in { display: flex; align-items: center; gap: 8px; color: #34d399; font-weight: 700; font-size: 0.9rem; }
    .check-icon { background: rgba(16, 185, 129, 0.2); width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .bp-pill { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; }
    .btn-checkin { padding: 8px 18px; font-size: 0.85rem; }

    /* Boarding Pass Ticket Design */
    .boarding-pass { display: flex; margin-bottom: 24px; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; overflow: hidden; background: #0f172a; color: #fff; }
    .bp-left { flex: 1; padding: 24px 30px; border-right: 2px dashed rgba(255, 255, 255, 0.15); }
    .bp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px; }
    .bp-logo { font-size: 1.1rem; font-weight: 800; color: #38bdf8; letter-spacing: 1px; }
    .bp-badge { font-size: 0.75rem; background: #38bdf8; color: #0f172a; font-weight: 800; padding: 3px 10px; border-radius: 12px; }
    .bp-row { display: flex; justify-content: space-between; margin-bottom: 16px; }
    .bp-label { font-size: 0.7rem; color: #94a3b8; display: block; font-weight: 700; margin-bottom: 3px; }
    .bp-val { font-size: 1rem; font-weight: 700; }
    .bp-val.highlight { color: #38bdf8; font-size: 1.1rem; }

    .bp-stub { width: 180px; padding: 24px 20px; background: #1e293b; display: flex; flex-direction: column; justify-content: space-between; text-align: center; }
    .seat-big { font-size: 1.8rem; font-weight: 800; color: #38bdf8; }
    .gate-big { font-size: 1.4rem; font-weight: 800; color: #4ade80; }
    .barcode-visual { font-family: monospace; letter-spacing: 4px; font-size: 1.1rem; color: #94a3b8; transform: scaleY(1.4); margin-top: 10px; }

    .print-actions { display: flex; justify-content: center; gap: 16px; }

    @media (max-width: 768px) {
      .pnr-form { flex-direction: column; align-items: stretch; }
      .boarding-pass { flex-direction: column; }
      .bp-left { border-right: none; border-bottom: 2px dashed rgba(255, 255, 255, 0.15); }
      .bp-stub { width: 100%; }
    }
  `]
})
export class WebCheckinComponent implements OnInit {
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);

  pnrInput = '';
  booking: Booking | null = null;
  loading = false;
  checkingInIndex: number | null = null;
  errorMessage = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['pnr']) {
        this.pnrInput = params['pnr'];
        this.onLookupPNR();
      }
    });
  }

  onLookupPNR() {
    if (!this.pnrInput) return;
    this.loading = true;
    this.errorMessage = '';
    this.booking = null;

    this.bookingService.lookupBookingByPNR(this.pnrInput).subscribe({
      next: (data) => {
        this.booking = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'No active booking found for this PNR. Please check the code and try again.';
      }
    });
  }

  onCheckIn(passengerIndex: number) {
    if (!this.booking) return;
    this.checkingInIndex = passengerIndex;

    this.bookingService.webCheckIn(this.booking.pnr, passengerIndex).subscribe({
      next: (res) => {
        this.checkingInIndex = null;
        if (this.booking && this.booking.passengers[passengerIndex]) {
          this.booking.passengers[passengerIndex].isCheckedIn = true;
          this.booking.passengers[passengerIndex].boardingPassNumber = res.passenger.boardingPassNumber;
          this.booking.passengers[passengerIndex].gate = res.passenger.gate;
        }
      },
      error: (err) => {
        this.checkingInIndex = null;
        alert(err.error?.message || 'Check-in failed');
      }
    });
  }

  hasCheckedInPassenger(): boolean {
    return !!this.booking?.passengers?.some(p => p.isCheckedIn);
  }

  getFirstCheckedIn(): any {
    return this.booking?.passengers?.find(p => p.isCheckedIn) || this.booking?.passengers?.[0];
  }

  printBoardingPass() {
    window.print();
  }

  downloadPDF() {
    if (!this.booking?._id) return;
    this.bookingService.downloadTicketPDF(this.booking._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `E-Ticket-${this.booking?.pnr}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error(err)
    });
  }
}
