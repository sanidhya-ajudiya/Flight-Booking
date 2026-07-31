import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { BookingService } from '../../core/services/booking.service';
import { CouponService } from '../../core/services/coupon.service';
import { AuthService } from '../../core/services/auth.service';
import { SeatMapComponent } from '../../shared/components/seat-map/seat-map.component';
import { Flight, Booking, Passenger } from '../../core/interfaces';

@Component({
  selector: 'app-booking-flow',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SeatMapComponent],
  template: `
    <div class="container booking-page">
      <!-- Checkout Stepper Bar -->
      <div class="stepper-bar glass-card">
        <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
          <span class="step-num">1</span>
          <span class="step-title">Passenger Info</span>
        </div>
        <div class="step-line"></div>
        <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
          <span class="step-num">2</span>
          <span class="step-title">Seat Matrix</span>
        </div>
        <div class="step-line"></div>
        <div class="step" [class.active]="currentStep >= 3" [class.completed]="currentStep > 3">
          <span class="step-num">3</span>
          <span class="step-title">Payment & Coupon</span>
        </div>
        <div class="step-line"></div>
        <div class="step" [class.active]="currentStep >= 4">
          <span class="step-num">4</span>
          <span class="step-title">Confirmation</span>
        </div>
      </div>

      <div class="booking-grid" *ngIf="flight">
        <!-- Main Form Area -->
        <div class="main-checkout-area">

          <!-- STEP 1: Passenger Details -->
          <div *ngIf="currentStep === 1" class="step-container glass-card">
            <h2 class="step-heading">Passenger Details</h2>

            <div *ngFor="let passenger of passengers; let i = index" class="passenger-card">
              <h4 class="pass-title">Passenger #{{ i + 1 }}</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>Full Name (as per Passport/ID)</label>
                  <input type="text" [(ngModel)]="passenger.name" placeholder="John Doe" class="custom-input">
                </div>

                <div class="form-group">
                  <label>Gender</label>
                  <select [(ngModel)]="passenger.gender" class="custom-select">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Date of Birth</label>
                  <input type="date" [(ngModel)]="passenger.dob" class="custom-input">
                </div>

                <div class="form-group">
                  <label>Passport Number</label>
                  <input type="text" [(ngModel)]="passenger.passportNumber" placeholder="Z1234567" class="custom-input">
                </div>

                <div class="form-group">
                  <label>Extra Baggage (+15kg)</label>
                  <select [(ngModel)]="passenger.extraBaggageKg" class="custom-select">
                    <option [value]="0">Standard Included (15kg)</option>
                    <option [value]="10">+10kg Extra (₹800)</option>
                    <option [value]="20">+20kg Extra (₹1500)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button (click)="goToStep(2)" [disabled]="!validatePassengerStep()" class="btn-primary">
                PROCEED TO SEAT SELECTION ➔
              </button>
            </div>
          </div>

          <!-- STEP 2: Seat Map Selection -->
          <div *ngIf="currentStep === 2" class="step-container glass-card">
            <h2 class="step-heading">Select Seats for Aircraft Cabin</h2>
            <p class="step-sub">Pick 1 seat for each passenger from the map</p>

            <app-seat-map
              [occupiedSeats]="flight.occupiedSeats || []"
              [maxSeats]="passengers.length"
              (seatSelected)="onSeatsSelected($event)">
            </app-seat-map>

            <div class="step-actions">
              <button (click)="goToStep(1)" class="btn-secondary">◀ Back</button>
              <button (click)="goToStep(3)" [disabled]="selectedSeats.length < passengers.length" class="btn-primary">
                PROCEED TO PAYMENT ➔
              </button>
            </div>
          </div>

          <!-- STEP 3: Coupon & Payment -->
          <div *ngIf="currentStep === 3" class="step-container glass-card">
            <h2 class="step-heading">Payment & Promo Discounts</h2>

            <!-- Coupon Input -->
            <div class="coupon-box">
              <label class="form-label">APPLY PROMO COUPON CODE</label>
              <div class="coupon-flex">
                <input type="text" [(ngModel)]="couponCode" placeholder="Enter coupon (e.g. SKY2026)" class="custom-input uppercase">
                <button (click)="applyCoupon()" class="btn-secondary">Apply</button>
              </div>
              <span *ngIf="couponMessage" class="coupon-msg" [class.success]="discountAmount > 0">{{ couponMessage }}</span>
            </div>

            <!-- Payment Method Choice -->
            <div class="payment-methods">
              <label class="form-label">CHOOSE PAYMENT METHOD</label>
              <div class="method-options">
                <label class="method-card" [class.selected]="paymentMethod === 'Card'">
                  <input type="radio" name="pay" value="Card" [(ngModel)]="paymentMethod">
                  <span>💳 Credit / Debit Card</span>
                </label>
                <label class="method-card" [class.selected]="paymentMethod === 'UPI'">
                  <input type="radio" name="pay" value="UPI" [(ngModel)]="paymentMethod">
                  <span>📲 UPI / Instant QR</span>
                </label>
                <label class="method-card" [class.selected]="paymentMethod === 'Wallet'">
                  <input type="radio" name="pay" value="Wallet" [(ngModel)]="paymentMethod">
                  <span>👛 SkyWings Wallet Balance (₹{{ authService.currentUser()?.walletBalance || 0 }})</span>
                </label>
              </div>
            </div>

            <div class="step-actions">
              <button (click)="goToStep(2)" class="btn-secondary">◀ Back</button>
              <button (click)="processBooking()" [disabled]="processing" class="btn-primary pay-btn">
                {{ processing ? 'Processing Payment...' : 'PAY & CONFIRM BOOKING (₹' + calculateTotal() + ')' }}
              </button>
            </div>
          </div>

          <!-- STEP 4: Success & E-Ticket Download -->
          <div *ngIf="currentStep === 4 && confirmedBooking" class="step-container glass-card confirmation-box">
            <div class="success-icon">🎉</div>
            <h2 class="success-title">Booking Confirmed!</h2>
            <p class="success-subtitle">Your PNR Code: <strong class="pnr-tag">{{ confirmedBooking.pnr }}</strong></p>
            <p>A confirmation email with your e-ticket has been sent to {{ authService.currentUser()?.email }}.</p>

            <div class="confirmation-actions">
              <button (click)="downloadPDF()" class="btn-primary">
                📄 DOWNLOAD E-TICKET (PDF)
              </button>
              <a routerLink="/my-bookings" class="btn-secondary">
                View My Bookings
              </a>
            </div>
          </div>
        </div>

        <!-- Sidebar Fare Summary -->
        <aside class="fare-summary-sidebar glass-card">
          <h3 class="sidebar-heading">Fare Summary</h3>

          <div class="flight-mini-card">
            <img [src]="flight.airline?.logo" class="mini-logo">
            <div>
              <h4>{{ flight.airline?.name }}</h4>
              <span>{{ flight.flightNumber }} • {{ cabinClass | uppercase }}</span>
            </div>
          </div>

          <div class="mini-route">
            <div>
              <strong>{{ flight.departureTime }}</strong>
              <span>{{ flight.departureAirport?.code }}</span>
            </div>
            <div class="mini-arrow">➔</div>
            <div>
              <strong>{{ flight.arrivalTime }}</strong>
              <span>{{ flight.arrivalAirport?.code }}</span>
            </div>
          </div>

          <hr class="divider">

          <div class="summary-line">
            <span>Base Fare (x{{ passengers.length }})</span>
            <span>₹{{ baseFarePrice * passengers.length }}</span>
          </div>
          <div class="summary-line">
            <span>Taxes & Airport Fees</span>
            <span>₹{{ taxAmount }}</span>
          </div>
          <div class="summary-line" *ngIf="extraBaggageFee > 0">
            <span>Extra Baggage Fee</span>
            <span>+₹{{ extraBaggageFee }}</span>
          </div>
          <div class="summary-line discount" *ngIf="discountAmount > 0">
            <span>Coupon Discount</span>
            <span>-₹{{ discountAmount }}</span>
          </div>

          <hr class="divider">

          <div class="total-line">
            <span>Total Payable</span>
            <span class="total-amount">₹{{ calculateTotal() }}</span>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .booking-page { padding-top: 40px; }

    .stepper-bar {
      padding: 20px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30px;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0.5;

      &.active { opacity: 1; }
      &.completed .step-num { background: #16a34a; color: #fff; }
    }

    .step-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--border-color);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
    }

    .step-title { font-weight: 700; font-size: 0.9rem; }
    .step-line { flex: 1; height: 2px; background: var(--border-color); margin: 0 16px; }

    .booking-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 30px;
    }

    .step-container { padding: 32px; }
    .step-heading { font-size: 1.5rem; font-weight: 800; margin-bottom: 20px; }

    .passenger-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .pass-title { font-weight: 700; margin-bottom: 12px; color: var(--primary-accent); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .custom-input, .custom-select {
      width: 100%;
      height: 44px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--bg-surface);
      color: var(--text-primary);
      padding: 0 12px;
      font-weight: 600;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }

    .coupon-box { margin-bottom: 30px; }
    .coupon-flex { display: flex; gap: 10px; width: 100%; max-width: 400px; margin-top: 6px; }
    .coupon-msg { display: block; margin-top: 8px; font-size: 0.85rem; color: #ef4444; &.success { color: #16a34a; } }

    .payment-methods { margin-bottom: 30px; }
    .method-options { display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }
    .method-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      cursor: pointer;
      font-weight: 700;

      &.selected { border-color: var(--primary-accent); background: rgba(2, 132, 199, 0.08); }
    }

    .confirmation-box { text-align: center; padding: 60px 30px; }
    .success-icon { font-size: 3.5rem; margin-bottom: 16px; }
    .success-title { font-size: 2rem; font-weight: 800; }
    .pnr-tag { font-size: 1.6rem; color: var(--primary-accent); letter-spacing: 2px; }
    .confirmation-actions { display: flex; justify-content: center; gap: 20px; margin-top: 30px; }

    .fare-summary-sidebar { padding: 24px; height: fit-content; }
    .sidebar-heading { font-weight: 800; font-size: 1.1rem; margin-bottom: 16px; }
    .flight-mini-card { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
    .mini-logo { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
    .mini-route { display: flex; justify-content: space-between; align-items: center; background: var(--bg-primary); padding: 12px; border-radius: 10px; margin-bottom: 16px; }

    .divider { border: none; border-top: 1px solid var(--border-color); margin: 16px 0; }
    .summary-line { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 8px; color: var(--text-secondary); }
    .summary-line.discount { color: #16a34a; font-weight: 700; }
    .total-line { display: flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem; }
    .total-amount { color: var(--primary-accent); }

    @media (max-width: 900px) {
      .booking-grid { grid-template-columns: 1fr; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class BookingFlowComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  flightService = inject(FlightService);
  bookingService = inject(BookingService);
  couponService = inject(CouponService);
  authService = inject(AuthService);

  flight: Flight | null = null;
  cabinClass: string = 'economy';
  currentStep: number = 1;

  passengers: Passenger[] = [
    { name: '', gender: 'Male', dob: '1995-05-15', passportNumber: '', nationality: 'Indian', seatNumber: '', extraBaggageKg: 0 }
  ];

  selectedSeats: string[] = [];
  couponCode: string = '';
  discountAmount: number = 0;
  couponMessage: string = '';
  paymentMethod: string = 'Card';
  processing: boolean = false;
  confirmedBooking: Booking | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const flightId = params['flightId'];
      this.cabinClass = params['cabinClass'] || 'economy';
      if (flightId) {
        this.flightService.getFlightById(flightId).subscribe({
          next: data => this.flight = data,
          error: err => console.error(err)
        });
      }
    });

    // Auto-fill user details if logged in
    const user = this.authService.currentUser();
    if (user) {
      this.passengers[0].name = user.name || '';
      this.passengers[0].passportNumber = user.passportNumber || '';
    }
  }

  get baseFarePrice(): number {
    if (!this.flight) return 0;
    if (this.cabinClass === 'business') return this.flight.businessPrice;
    if (this.cabinClass === 'firstClass') return this.flight.firstClassPrice;
    return this.flight.economyPrice;
  }

  get taxAmount(): number {
    return Math.round(this.baseFarePrice * 0.12 * this.passengers.length);
  }

  get extraBaggageFee(): number {
    return this.passengers.reduce((sum, p) => sum + (Number(p.extraBaggageKg) === 10 ? 800 : Number(p.extraBaggageKg) === 20 ? 1500 : 0), 0);
  }

  calculateTotal(): number {
    const total = (this.baseFarePrice * this.passengers.length) + this.taxAmount + this.extraBaggageFee - this.discountAmount;
    return Math.max(0, Math.round(total));
  }

  validatePassengerStep(): boolean {
    return this.passengers.every(p => p.name && p.name.length > 2);
  }

  onSeatsSelected(seats: string[]) {
    this.selectedSeats = seats;
    seats.forEach((seat, idx) => {
      if (this.passengers[idx]) {
        this.passengers[idx].seatNumber = seat;
      }
    });
  }

  applyCoupon() {
    if (!this.couponCode) return;
    this.couponService.validateCoupon(this.couponCode, this.baseFarePrice * this.passengers.length).subscribe({
      next: (res: any) => {
        this.discountAmount = res.discountAmount;
        this.couponMessage = res.message;
      },
      error: (err: any) => {
        this.discountAmount = 0;
        this.couponMessage = err.error?.message || 'Invalid coupon code';
      }
    });
  }

  goToStep(step: number) {
    this.currentStep = step;
  }

  processBooking() {
    if (!this.flight) return;
    this.processing = true;

    const payload = {
      flightId: this.flight._id,
      tripType: 'one-way',
      cabinClass: this.cabinClass,
      passengers: this.passengers,
      baseFare: this.baseFarePrice * this.passengers.length,
      taxAmount: this.taxAmount,
      extraBaggageFee: this.extraBaggageFee,
      discountAmount: this.discountAmount,
      couponCode: this.couponCode,
      totalAmount: this.calculateTotal(),
      paymentMethod: this.paymentMethod
    };

    this.bookingService.createBooking(payload).subscribe({
      next: (booking) => {
        this.confirmedBooking = booking;
        this.processing = false;
        this.currentStep = 4;
      },
      error: (err) => {
        alert(err.error?.message || 'Booking failed. Please try again.');
        this.processing = false;
      }
    });
  }

  downloadPDF() {
    if (!this.confirmedBooking) return;
    this.bookingService.downloadTicketPDF(this.confirmedBooking._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `E-Ticket-${this.confirmedBooking?.pnr}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }
}
