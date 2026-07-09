import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { FlightService } from '../../core/services/flight.service';
import { Booking, Coupon } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, FormsModule,
    MatTabsModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatDividerModule
  ],
  template: `
    <div class="payment-page container animate-fadeIn" *ngIf="bookingData()">
      <!-- Processing Overlay -->
      <div class="processing-overlay flex-center flex-col" *ngIf="isProcessing()">
        <div class="shield-icon animate-pulse">🛡️</div>
        <h3>Securing Your Transaction</h3>
        <p>Please do not refresh the page or click back button...</p>
        <div class="loader-dots mt-md">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div class="layout-grid" *ngIf="!isProcessing()">
        <!-- Left Column: Payment Methods -->
        <div class="payment-methods-block">
          <div class="glass-card methods-card">
            <h2>Select Payment Method</h2>
            <p class="subtitle">All transactions are fully encrypted and secure.</p>

            <mat-tab-group class="payment-tabs" [(selectedIndex)]="selectedTab">
              <!-- Credit/Debit Card -->
              <mat-tab label="Credit/Debit Card">
                <div class="tab-pane-content">
                  <!-- Interactive Card Flip Visual -->
                  <div class="card-visual-wrapper flex-center">
                    <div class="credit-card" [class.flipped]="cardFlipped()">
                      <!-- Front -->
                      <div class="card-face card-front flex-col">
                        <div class="flex-between">
                          <span class="chip-logo">🎛️</span>
                          <span class="card-logo">VISA</span>
                        </div>
                        <div class="card-number">
                          {{ cardNumberInput || '•••• •••• •••• ••••' }}
                        </div>
                        <div class="flex-between mt-auto">
                          <div class="card-holder-group">
                            <span class="lbl">Card Holder</span>
                            <span class="val">{{ cardHolderInput || 'ARJUN SHARMA' }}</span>
                          </div>
                          <div class="card-expiry-group">
                            <span class="lbl">Expires</span>
                            <span class="val">{{ cardExpiryInput || 'MM/YY' }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Back -->
                      <div class="card-face card-back flex-col">
                        <div class="magnetic-strip"></div>
                        <div class="signature-cvv-row flex-between">
                          <div class="signature-line">Authorized Sign</div>
                          <div class="cvv-box">{{ cardCvvInput || '•••' }}</div>
                        </div>
                        <span class="secure-stamp mt-auto">🔒 100% Secured Transact</span>
                      </div>
                    </div>
                  </div>

                  <!-- Card Form -->
                  <form [formGroup]="cardForm" class="card-form flex-col gap-sm">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Card Number</mat-label>
                      <input matInput type="text" formControlName="number" placeholder="16 Digit Card Number" 
                             [(ngModel)]="cardNumberInput" maxLength="19" (focus)="cardFlipped.set(false)">
                      <mat-error *ngIf="cardForm.get('number')?.hasError('required')">Card Number is required</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Card Holder Name</mat-label>
                      <input matInput type="text" formControlName="holder" placeholder="Name on Card"
                             [(ngModel)]="cardHolderInput" (focus)="cardFlipped.set(false)">
                    </mat-form-field>

                    <div class="grid-2 gap-sm">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Expiry Date</mat-label>
                        <input matInput type="text" formControlName="expiry" placeholder="MM/YY"
                               [(ngModel)]="cardExpiryInput" maxLength="5" (focus)="cardFlipped.set(false)">
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>CVV</mat-label>
                        <input matInput type="password" formControlName="cvv" placeholder="3 Digits"
                               [(ngModel)]="cardCvvInput" maxLength="3" (focus)="cardFlipped.set(true)">
                      </mat-form-field>
                    </div>

                    <button class="btn-gradient w-full search-btn mt-md" [disabled]="cardForm.invalid" (click)="processPayment()">
                      Pay ₹{{ finalTotal() | number }} Securely
                    </button>
                  </form>
                </div>
              </mat-tab>

              <!-- UPI -->
              <mat-tab label="UPI">
                <div class="tab-pane-content flex-col gap-md">
                  <div class="upi-visual flex-center flex-col gap-sm">
                    <div class="qr-placeholder">🔳</div>
                    <p class="desc">Scan the secure dynamic QR code using GPay, PhonePe or Paytm</p>
                  </div>
                  <div class="divider-text">or enter virtual payment address</div>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>UPI ID (VPA)</mat-label>
                    <input matInput placeholder="e.g. arjun@okaxis" [(ngModel)]="upiAddress">
                  </mat-form-field>
                  <button class="btn-gradient w-full search-btn" [disabled]="!upiAddress" (click)="processPayment()">
                    Verify & Pay ₹{{ finalTotal() | number }}
                  </button>
                </div>
              </mat-tab>

              <!-- Net Banking -->
              <mat-tab label="Net Banking">
                <div class="tab-pane-content flex-col gap-md">
                  <p class="desc">Select your retail online banking provider from the popular list:</p>
                  <div class="bank-grid">
                    <button class="bank-btn flex-center flex-col" (click)="selectBank('SBI')">
                      <span>🏦</span> SBI
                    </button>
                    <button class="bank-btn flex-center flex-col" (click)="selectBank('HDFC')">
                      <span>🏦</span> HDFC Bank
                    </button>
                    <button class="bank-btn flex-center flex-col" (click)="selectBank('ICICI')">
                      <span>🏦</span> ICICI Bank
                    </button>
                    <button class="bank-btn flex-center flex-col" (click)="selectBank('AXIS')">
                      <span>🏦</span> Axis Bank
                    </button>
                  </div>
                  <button class="btn-gradient w-full search-btn" [disabled]="!selectedBank()" (click)="processPayment()">
                    Pay via {{ selectedBank() || 'Net Banking' }}
                  </button>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>

        <!-- Right Column: Promo Code & Pricing Summary -->
        <div class="pricing-sidebar flex-col gap-lg">
          <!-- Promo Code Card -->
          <div class="glass-card promo-card flex-col gap-sm">
            <h3>🏷️ Have a Coupon?</h3>
            <div class="promo-form flex-start gap-sm">
              <input type="text" [(ngModel)]="couponCode" placeholder="Enter Code" class="promo-input">
              <button class="btn-outline btn-sm" (click)="applyCoupon()">Apply</button>
            </div>
            <p class="coupon-success-text" *ngIf="appliedCoupon()">
              🎉 Coupon <strong>{{ appliedCoupon()?.code }}</strong> Applied! Save ₹{{ discount() | number }}
            </p>
          </div>

          <!-- Price Recap Card -->
          <div class="glass-card recap-card flex-col gap-md">
            <h3>Fare Summary</h3>
            <div class="recap-lines flex-col gap-sm">
              <div class="flex-between">
                <span>Base Fare</span>
                <span>₹{{ bookingData()?.flight?.price?.base | number }}</span>
              </div>
              <div class="flex-between">
                <span>Taxes & Fees</span>
                <span>₹{{ bookingData()?.flight?.price?.taxes | number }}</span>
              </div>
              <div class="flex-between">
                <span>GST (5%)</span>
                <span>₹{{ bookingData()?.flight?.price?.gst | number }}</span>
              </div>
              <div class="flex-between discount-line" *ngIf="discount() > 0">
                <span>Coupon Discount</span>
                <span>- ₹{{ discount() | number }}</span>
              </div>
              <mat-divider></mat-divider>
              <div class="flex-between final-row">
                <span>Final Amount</span>
                <span class="final-price">₹{{ finalTotal() | number }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-page {
      padding-top: var(--space-4xl);
      padding-bottom: var(--space-4xl);
    }

    .layout-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-xl);

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .methods-card {
      padding: var(--space-2xl) !important;
      border: 1px solid var(--border-color);
      h2 { font-size: 1.5rem; font-weight: 800; }
      .subtitle { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: var(--space-lg); }
    }

    .payment-tabs {
      ::ng-deep .mat-mdc-tab-body-wrapper {
        padding-top: var(--space-xl);
      }
    }

    .tab-pane-content {
      padding: var(--space-sm) 0;
    }

    // Flipping card styles
    .card-visual-wrapper {
      perspective: 1000px;
      margin-bottom: var(--space-xl);
    }

    .credit-card {
      width: 320px;
      height: 190px;
      position: relative;
      transform-style: preserve-3d;
      transition: transform var(--transition-slow);
      cursor: pointer;

      &.flipped {
        transform: rotateY(180deg);
      }
    }

    .card-face {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      border-radius: 12px;
      padding: var(--space-lg);
      color: white;
      box-shadow: var(--shadow-lg);

      &.card-front {
        background: linear-gradient(135deg, #0d2137 0%, #1565C0 100%);
      }

      &.card-back {
        background: linear-gradient(135deg, #1565C0 0%, #0d2137 100%);
        transform: rotateY(180deg);
        padding-left: 0;
        padding-right: 0;
      }
    }

    .chip-logo { font-size: 28px; }
    .card-logo { font-size: 1.1rem; font-weight: 800; letter-spacing: 1px; }
    
    .card-number {
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: 3px;
      margin-top: 24px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }

    .card-holder-group, .card-expiry-group {
      .lbl { font-size: 0.6rem; text-transform: uppercase; display: block; color: rgba(255,255,255,0.7); }
      .val { font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
    }

    // Card Back
    .magnetic-strip {
      height: 40px;
      background: #111;
      width: 100%;
      margin-top: 10px;
    }

    .signature-cvv-row {
      padding: 0 var(--space-lg);
      margin-top: 20px;

      .signature-line {
        background: rgba(255,255,255,0.8);
        color: #333;
        flex: 1;
        height: 36px;
        line-height: 36px;
        padding-left: var(--space-sm);
        font-size: 0.7rem;
        font-style: italic;
      }

      .cvv-box {
        background: white;
        color: #111;
        width: 50px;
        height: 36px;
        line-height: 36px;
        text-align: center;
        font-weight: 700;
        font-size: 0.95rem;
        border-left: 2px solid var(--color-warning);
      }
    }

    .secure-stamp {
      font-size: 0.65rem;
      color: rgba(255,255,255,0.6);
      text-align: center;
    }

    // UPI Visual
    .upi-visual {
      .qr-placeholder { font-size: 64px; }
      .desc { font-size: 0.8rem; color: var(--text-secondary); text-align: center; }
    }

    // Net Banking
    .bank-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-sm);

      .bank-btn {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        padding: 12px;
        border-radius: var(--border-radius-md);
        font-family: var(--font-family);
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-primary);
        cursor: pointer;
        transition: all var(--transition-fast);

        span { font-size: 24px; margin-bottom: 4px; }

        &:hover { border-color: var(--color-primary-light); }
      }
    }

    // Promo Code
    .promo-card {
      padding: var(--space-xl) !important;
      border: 1px solid var(--border-color);
      h3 { font-size: 1rem; font-weight: 700; }
    }

    .promo-form {
      .promo-input {
        flex: 1;
        padding: 10px 14px;
        border-radius: 50px;
        border: 1px solid var(--border-color);
        font-family: var(--font-family);
        outline: none;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: 0.85rem;
      }
    }

    .coupon-success-text {
      font-size: 0.75rem;
      color: var(--color-success);
      font-weight: 600;
      margin-top: 4px;
    }

    // Recap card
    .recap-card {
      padding: var(--space-xl) !important;
      border: 1px solid var(--border-color);
      h3 { font-size: 1.1rem; font-weight: 700; }
    }

    .recap-lines {
      font-size: 0.85rem;
      color: var(--text-secondary);

      .discount-line { color: var(--color-success); font-weight: 600; }

      .final-row {
        font-weight: 700;
        color: var(--text-primary);
        font-size: 1rem;
        margin-top: var(--space-sm);

        .final-price { font-size: 1.5rem; color: var(--color-primary-dark); }
      }
    }

    // Processing screen
    .processing-overlay {
      height: 400px;
      .shield-icon { font-size: 64px; }
      h3 { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin-top: 12px; }
      p { font-size: 0.85rem; color: var(--text-secondary); }
    }

    .loader-dots {
      display: flex;
      gap: 8px;

      span {
        width: 8px;
        height: 8px;
        background: var(--color-primary);
        border-radius: 50%;
        animation: dotBounce 1.4s ease-in-out infinite;

        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }
  `]
})
export class PaymentComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private flightService = inject(FlightService);
  private notify = inject(NotificationService);

  bookingData = signal<any | null>(null);
  isProcessing = signal(false);
  cardFlipped = signal(false);

  // Forms and binding
  selectedTab = 0;
  cardForm!: FormGroup;

  cardNumberInput = '';
  cardHolderInput = '';
  cardExpiryInput = '';
  cardCvvInput = '';

  upiAddress = '';
  selectedBank = signal<string | null>(null);

  // Promo code
  couponCode = '';
  appliedCoupon = signal<Coupon | null>(null);
  discount = computed(() => {
    const c = this.appliedCoupon();
    if (!c) return 0;
    const base = this.bookingData()?.flight?.price?.total || 0;
    if (c.type === 'percentage') {
      return Math.floor((base * c.discount) / 100);
    }
    return c.discount;
  });

  finalTotal = computed(() => {
    const baseTotal = this.bookingData()?.flight?.price?.total || 0;
    return Math.max(0, baseTotal - this.discount());
  });

  constructor() {
    this.cardForm = this.fb.group({
      number: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      holder: ['', Validators.required],
      expiry: ['', [Validators.required, Validators.pattern('^[0-9]{2}/[0-9]{2}$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3}$')]]
    });
  }

  ngOnInit(): void {
    const data = this.flightService.currentBooking();
    if (data) {
      this.bookingData.set(data);
    } else {
      // Mock Fallback
      const defaultFlight = this.flightService.searchResults()[0] || { price: { base: 6000, taxes: 1080, gst: 300, total: 7380 } };
      this.bookingData.set({
        flight: defaultFlight,
        passengers: [{ title: 'Mr', firstName: 'Arjun', lastName: 'Sharma' }]
      });
    }
  }

  applyCoupon(): void {
    const code = this.couponCode.toUpperCase().trim();
    if (code === 'EUROPE20' || code === 'SAVE1000' || code === 'SKYWINGS') {
      const isPercent = code === 'EUROPE20';
      const c: Coupon = {
        code,
        discount: isPercent ? 20 : 1000,
        type: isPercent ? 'percentage' : 'fixed'
      };
      this.appliedCoupon.set(c);
      this.notify.success(`Coupon code ${code} applied successfully!`);
      this.couponCode = '';
    } else {
      this.notify.warning('Invalid coupon code.');
    }
  }

  selectBank(bank: string): void {
    this.selectedBank.set(bank);
    this.notify.info(`Selected ${bank} retail NetBanking`);
  }

  processPayment(): void {
    this.isProcessing.set(true);

    // Call service booking mockup
    const partialBooking = {
      flight: this.bookingData().flight,
      passengers: this.bookingData().passengers,
      contactEmail: this.bookingData().contactEmail || 'arjun@example.com',
      contactPhone: this.bookingData().contactPhone || '9876543210'
    };

    setTimeout(() => {
      this.flightService.createBooking(partialBooking as any).subscribe(booking => {
        this.isProcessing.set(false);
        this.notify.success('Booking Confirmed! ✈️ Ticket code: ' + booking.bookingRef);
        this.router.navigate(['/booking-confirmation']);
      });
    }, 2500);
  }
}
