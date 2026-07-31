import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlightSearchWidgetComponent } from '../../shared/components/flight-search-widget/flight-search-widget.component';
import { CouponService } from '../../core/services/coupon.service';
import { AirlineService } from '../../core/services/airline.service';
import { Coupon, Airline } from '../../core/interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FlightSearchWidgetComponent],
  template: `
    <!-- Hero Banner -->
    <section class="hero-section">
      <div class="container hero-content">
        <div class="hero-text">
          <span class="hero-badge">✨ LUXURY AVIATION REDEFINED</span>
          <h1 class="hero-title">Fly Higher, Book Smarter with SkyWings</h1>
          <p class="hero-subtitle">
            Search 500+ destinations worldwide, enjoy zero cancellation fees on wallet refunds, and unlock instant promotional rewards.
          </p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-value">99.4%</span>
              <span class="stat-label">On-Time Performance</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">2.4M+</span>
              <span class="stat-label">Happy Travelers</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">24/7</span>
              <span class="stat-label">Customer Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Embedded Search Widget -->
    <div class="container">
      <app-flight-search-widget></app-flight-search-widget>
    </div>

    <!-- Active Coupon Offers -->
    <section class="container offers-section">
      <div class="section-header">
        <h2>Exclusive Promo Offers</h2>
        <p>Apply discount codes at checkout to save extra on your flight tickets</p>
      </div>

      <div class="offers-grid">
        <div *ngFor="let coupon of coupons" class="offer-card glass-card">
          <div class="offer-badge">{{ coupon.discountType === 'percentage' ? coupon.discountValue + '% OFF' : '₹' + coupon.discountValue + ' FLAT' }}</div>
          <h3 class="offer-code">{{ coupon.code }}</h3>
          <p class="offer-desc">Valid on minimum booking of ₹{{ coupon.minBookingAmount }}</p>
          <span class="offer-expiry">Expires: {{ coupon.expiryDate | date:'mediumDate' }}</span>
        </div>
      </div>
    </section>

    <!-- Top Partner Airlines -->
    <section class="container airlines-section">
      <div class="section-header">
        <h2>Partner Airlines</h2>
        <p>Fly with premier world-class carriers</p>
      </div>

      <div class="airlines-grid">
        <div *ngFor="let airline of airlines" class="airline-card glass-card">
          <img [src]="airline.logo" [alt]="airline.name" class="airline-logo">
          <h4>{{ airline.name }}</h4>
          <span class="airline-country">📍 {{ airline.country }}</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      background: var(--hero-gradient);
      padding: 90px 0 140px 0;
      color: #ffffff;
      position: relative;
    }

    .hero-content {
      max-width: 800px;
    }

    .hero-badge {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.15;
      margin: 20px 0 16px 0;
    }

    .hero-subtitle {
      font-size: 1.1rem;
      color: #cbd5e1;
      line-height: 1.6;
      margin-bottom: 30px;
    }

    .hero-stats {
      display: flex;
      gap: 40px;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: 800;
      color: #38bdf8;
      display: block;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .offers-section, .airlines-section {
      margin-top: 60px;
    }

    .section-header {
      margin-bottom: 30px;
      h2 { font-size: 1.8rem; font-weight: 800; }
      p { color: var(--text-secondary); font-size: 0.95rem; }
    }

    .offers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .offer-card {
      padding: 24px;
      position: relative;
      border-left: 4px solid var(--primary-accent);
    }

    .offer-badge {
      background: var(--primary-accent);
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      display: inline-block;
      margin-bottom: 10px;
    }

    .offer-code {
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .offer-desc {
      font-size: 0.88rem;
      color: var(--text-secondary);
      margin: 8px 0 14px 0;
    }

    .offer-expiry {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .airlines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }

    .airline-card {
      padding: 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .airline-logo {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 12px;
      border: 2px solid var(--border-color);
    }

    .airline-country {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    @media (max-width: 768px) {
      .hero-title { font-size: 2.2rem; }
      .hero-stats { gap: 20px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  couponService = inject(CouponService);
  airlineService = inject(AirlineService);

  coupons: Coupon[] = [];
  airlines: Airline[] = [];

  ngOnInit() {
    this.couponService.getCoupons().subscribe({
      next: data => this.coupons = data
    });
    this.airlineService.getAirlines().subscribe({
      next: data => this.airlines = data
    });
  }
}
