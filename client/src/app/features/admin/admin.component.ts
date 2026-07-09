import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';

import { FlightService } from '../../core/services/flight.service';
import { NotificationService } from '../../core/services/notification.service';
import { Coupon, Flight } from '../../core/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatIconModule, MatButtonModule,
    MatTabsModule, MatFormFieldModule, MatInputModule, MatTableModule, FormsModule
  ],
  template: `
    <div class="admin-page container animate-fadeIn">
      <div class="admin-header flex-between flex-wrap gap-md mb-xl">
        <div>
          <span class="badge badge-warn">Control Center</span>
          <h1 class="page-title">Admin <span>Dashboard</span></h1>
          <p class="subtitle">Real-time revenue analytics, flight controls, and passenger bookings.</p>
        </div>
        
        <button routerLink="/" class="btn-outline btn-sm flex-center gap-sm">
          <mat-icon>home</mat-icon> Portal Home
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid mb-xl">
        <div class="stat-card glass flex-between">
          <div>
            <span class="lbl">Monthly Revenue</span>
            <h3>₹4,85,200</h3>
            <span class="trend up">▲ 12% vs last month</span>
          </div>
          <span class="icon">💰</span>
        </div>

        <div class="stat-card glass flex-between">
          <div>
            <span class="lbl">Total Bookings</span>
            <h3>1,280</h3>
            <span class="trend up">▲ 8% vs last month</span>
          </div>
          <span class="icon">🎟️</span>
        </div>

        <div class="stat-card glass flex-between">
          <div>
            <span class="lbl">Active Flights</span>
            <h3>42</h3>
            <span class="trend down">▼ 2% this week</span>
          </div>
          <span class="icon">✈️</span>
        </div>

        <div class="stat-card glass flex-between">
          <div>
            <span class="lbl">Support Tickets</span>
            <h3>14</h3>
            <span class="trend neutral">0 changes</span>
          </div>
          <span class="icon">✉️</span>
        </div>
      </div>

      <!-- Admin Tabs Layout -->
      <div class="glass-card tabs-card">
        <mat-tab-group class="admin-tab-group">
          <!-- Tab 1: Analytics -->
          <mat-tab label="Analytics Overview">
            <div class="tab-pane-content flex-col gap-xl">
              <div class="chart-layout grid-2">
                <!-- Revenue Bar Chart -->
                <div class="chart-box glass flex-col gap-md">
                  <h4>Monthly Revenue (2024)</h4>
                  <div class="svg-chart-wrapper flex-center">
                    <svg viewBox="0 0 400 200" class="svg-bar-chart">
                      <!-- Grid lines -->
                      <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-color)" stroke-dasharray="4" />
                      <line x1="40" y1="70" x2="380" y2="70" stroke="var(--border-color)" stroke-dasharray="4" />
                      <line x1="40" y1="120" x2="380" y2="120" stroke="var(--border-color)" stroke-dasharray="4" />
                      <line x1="40" y1="170" x2="380" y2="170" stroke="var(--border-color)" />
                      
                      <!-- Bars -->
                      <!-- Jan -->
                      <rect x="60" y="100" width="24" height="70" rx="3" fill="url(#blueGrad)" />
                      <!-- Feb -->
                      <rect x="110" y="70" width="24" height="100" rx="3" fill="url(#blueGrad)" />
                      <!-- Mar -->
                      <rect x="160" y="50" width="24" height="120" rx="3" fill="url(#skyGrad)" />
                      <!-- Apr -->
                      <rect x="210" y="30" width="24" height="140" rx="3" fill="url(#blueGrad)" />
                      <!-- May -->
                      <rect x="260" y="40" width="24" height="130" rx="3" fill="url(#skyGrad)" />
                      <!-- Jun -->
                      <rect x="310" y="20" width="24" height="150" rx="3" fill="url(#blueGrad)" />

                      <!-- Labels -->
                      <text x="72" y="190" font-size="10" fill="var(--text-secondary)" text-anchor="middle">Jan</text>
                      <text x="122" y="190" font-size="10" fill="var(--text-secondary)" text-anchor="middle">Feb</text>
                      <text x="172" y="190" font-size="10" fill="var(--text-secondary)" text-anchor="middle">Mar</text>
                      <text x="222" y="190" font-size="10" fill="var(--text-secondary)" text-anchor="middle">Apr</text>
                      <text x="272" y="190" font-size="10" fill="var(--text-secondary)" text-anchor="middle">May</text>
                      <text x="322" y="190" font-size="10" fill="var(--text-secondary)" text-anchor="middle">Jun</text>

                      <!-- Gradients definition -->
                      <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="var(--color-primary)" />
                          <stop offset="100%" stop-color="var(--color-primary-dark)" />
                        </linearGradient>
                        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="var(--color-accent)" />
                          <stop offset="100%" stop-color="var(--color-primary-light)" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                <!-- Distribution Donut Chart -->
                <div class="chart-box glass flex-col gap-md">
                  <h4>Booking Share by Cabin Class</h4>
                  <div class="svg-chart-wrapper flex-center">
                    <svg viewBox="0 0 200 200" class="svg-donut-chart">
                      <!-- Donut rings -->
                      <!-- Economy (60%) -->
                      <circle cx="100" cy="100" r="60" fill="transparent" stroke="var(--color-primary)" stroke-width="24" stroke-dasharray="226 377" stroke-dashoffset="0" />
                      <!-- Business (25%) -->
                      <circle cx="100" cy="100" r="60" fill="transparent" stroke="var(--color-accent)" stroke-width="24" stroke-dasharray="94 377" stroke-dashoffset="-226" />
                      <!-- First (15%) -->
                      <circle cx="100" cy="100" r="60" fill="transparent" stroke="var(--color-warning)" stroke-width="24" stroke-dasharray="57 377" stroke-dashoffset="-320" />
                      
                      <circle cx="100" cy="100" r="40" fill="var(--bg-card)" />
                      <text x="100" y="105" font-size="12" font-weight="700" fill="var(--text-primary)" text-anchor="middle">Class</text>
                    </svg>
                    <div class="donut-legends flex-col gap-xs ml-md">
                      <div class="legend-row flex-start gap-sm"><span class="box eco"></span> Economy (60%)</div>
                      <div class="legend-row flex-start gap-sm"><span class="box biz"></span> Business (25%)</div>
                      <div class="legend-row flex-start gap-sm"><span class="box fst"></span> First Class (15%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 2: Flight Controls -->
          <mat-tab label="Flight Management">
            <div class="tab-pane-content flex-col gap-md">
              <div class="flex-between">
                <h4>System Flights</h4>
                <button class="btn-gradient btn-sm" (click)="addMockFlight()">Add Mock Flight</button>
              </div>

              <!-- Simple Table list of flights -->
              <div class="table-container">
                <table class="admin-table w-full">
                  <thead>
                    <tr>
                      <th>Flight No</th>
                      <th>Airline</th>
                      <th>Route</th>
                      <th>Dep Time</th>
                      <th>Fare</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let f of flights()">
                      <td><strong>{{ f.segments[0].flightNumber }}</strong></td>
                      <td>{{ f.segments[0].airline.name }}</td>
                      <td>{{ f.segments[0].origin.code }} → {{ f.segments[0].destination.code }}</td>
                      <td>{{ f.segments[0].departureTime | date:'dd MMM, HH:mm' }}</td>
                      <td>₹{{ f.price.total | number }}</td>
                      <td>
                        <button class="delete-btn" (click)="deleteFlight(f.id)">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 3: Coupon Management -->
          <mat-tab label="Coupon Codes">
            <div class="tab-pane-content grid-2">
              <!-- Coupon Creator -->
              <div class="coupon-creator glass-card flex-col gap-sm">
                <h4>Create Promo Coupon</h4>
                <div class="flex-col gap-sm">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Coupon Code</mat-label>
                    <input matInput [(ngModel)]="newCode" placeholder="e.g. MONSOON20">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Discount (Value or %)</mat-label>
                    <input matInput type="number" [(ngModel)]="newDiscount" placeholder="10 or 500">
                  </mat-form-field>
                  <button class="btn-gradient w-full" (click)="createCoupon()">Generate Coupon</button>
                </div>
              </div>

              <!-- Coupon List -->
              <div class="coupon-list-panel flex-col gap-md">
                <h4>Active Coupon Codes</h4>
                <div class="coupon-chips flex-col gap-sm">
                  <div class="coupon-item flex-between glass" *ngFor="let c of coupons()">
                    <div>
                      <strong>{{ c.code }}</strong>
                      <span class="detail">{{ c.type === 'percentage' ? c.discount + '%' : '₹' + c.discount }} discount</span>
                    </div>
                    <button class="delete-btn" (click)="removeCoupon(c.code)">&times;</button>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      padding-top: var(--space-4xl);
      padding-bottom: var(--space-4xl);
    }

    .page-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 2px;

      span {
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .subtitle { font-size: 0.9rem; color: var(--text-secondary); }

    // Stats Grid
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-md);

      @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: var(--space-md) var(--space-lg) !important;
      border-radius: var(--border-radius-md) !important;

      .lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
      h3 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-top: 2px; }
      
      .trend {
        font-size: 0.7rem;
        font-weight: 600;
        display: block;
        margin-top: 4px;

        &.up { color: var(--color-success); }
        &.down { color: var(--color-warn); }
        &.neutral { color: var(--text-muted); }
      }

      .icon { font-size: 32px; }
    }

    .tabs-card {
      padding: 0 !important;
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    .admin-tab-group {
      ::ng-deep .mat-mdc-tab-body-wrapper {
        padding: var(--space-xl);
      }
    }

    .tab-pane-content {
      padding: var(--space-sm) 0;
    }

    // Charts styling
    .chart-box {
      padding: var(--space-xl);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--border-color);
      background: var(--bg-card);

      h4 { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-md); }
    }

    .svg-chart-wrapper {
      width: 100%;
      height: 200px;
    }

    .svg-bar-chart {
      width: 100%;
      height: 180px;
    }

    .svg-donut-chart {
      width: 150px;
      height: 150px;
    }

    .donut-legends {
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-weight: 500;

      .box {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        display: inline-block;

        &.eco { background: var(--color-primary); }
        &.biz { background: var(--color-accent); }
        &.fst { background: var(--color-warning); }
      }
    }

    // Flight table
    .table-container {
      width: 100%;
      overflow-x: auto;
    }

    .admin-table {
      border-collapse: collapse;
      font-size: 0.85rem;

      th, td {
        padding: 12px var(--space-md);
        text-align: left;
        border-bottom: 1px solid var(--border-color);
      }

      th {
        font-weight: 700;
        color: var(--text-primary);
        background: var(--bg-primary);
      }

      td {
        color: var(--text-secondary);
      }
    }

    .delete-btn {
      background: none;
      border: none;
      color: var(--color-warn);
      font-weight: 600;
      cursor: pointer;

      &:hover { text-decoration: underline; }
    }

    // Coupons Creator
    .coupon-creator {
      border: 1px solid var(--border-color);
      padding: var(--space-xl) !important;
    }

    .coupon-item {
      padding: var(--space-sm) var(--space-md) !important;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);

      strong { font-size: 0.9rem; color: var(--color-primary-dark); }
      .detail { font-size: 0.75rem; color: var(--text-secondary); display: block; }
    }
  `]
})
export class AdminComponent {
  private flightService = inject(FlightService);
  private notify = inject(NotificationService);

  flights = signal<Flight[]>([]);
  coupons = signal<Coupon[]>([
    { code: 'EUROPE20', discount: 20, type: 'percentage' },
    { code: 'SAVE1000', discount: 1000, type: 'fixed' }
  ]);

  // Form binds
  newCode = '';
  newDiscount = 0;

  constructor() {
    this.flights.set(this.flightService.searchResults());
  }

  addMockFlight(): void {
    const defaultParams = {
      tripType: 'one-way' as const,
      origin: this.flightService.airports[0],
      destination: this.flightService.airports[1],
      departureDate: new Date(),
      passengers: { adults: 1, children: 0, infants: 0 },
      cabinClass: 'economy' as const
    };
    
    // Simulate additions
    const rand = Math.floor(Math.random() * 500);
    const newFlight: Flight = {
      id: 'FL-MOCK-' + rand,
      segments: [{
        flightNumber: 'AI' + rand,
        airline: this.flightService.airlines[0],
        origin: defaultParams.origin,
        destination: defaultParams.destination,
        departureTime: new Date().toISOString(),
        arrivalTime: new Date().toISOString(),
        duration: 180,
        aircraft: 'Boeing 787',
        stops: 0,
        baggageAllowance: { cabin: '7 kg', checkedIn: '15 kg', carryOn: '1 piece' }
      }],
      price: { base: 4500, taxes: 810, gst: 225, total: 5535, currency: 'INR', pricePerPassenger: 5535 },
      cabinClass: 'economy',
      seatsAvailable: 15,
      refundable: true,
      fareType: 'Flexi',
      amenities: ['Wi-Fi', 'Meal']
    };

    this.flights.update(list => [newFlight, ...list]);
    this.notify.success(`Flight ${newFlight.segments[0].flightNumber} created successfully!`);
  }

  deleteFlight(id: string): void {
    this.flights.update(list => list.filter(f => f.id !== id));
    this.notify.info('Flight removed from system index.');
  }

  createCoupon(): void {
    if (!this.newCode || !this.newDiscount) {
      this.notify.warning('Please enter valid code and discount values.');
      return;
    }

    const next: Coupon = {
      code: this.newCode.toUpperCase().trim(),
      discount: this.newDiscount,
      type: this.newDiscount < 100 ? 'percentage' : 'fixed'
    };

    this.coupons.update(list => [next, ...list]);
    this.notify.success(`Coupon code ${next.code} generated successfully!`);
    
    this.newCode = '';
    this.newDiscount = 0;
  }

  removeCoupon(code: string): void {
    this.coupons.update(list => list.filter(c => c.code !== code));
    this.notify.info(`Promo coupon ${code} removed.`);
  }
}
