import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { FlightService } from '../../core/services/flight.service';
import { Flight, Seat, CabinClass } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatTooltipModule, MatDividerModule],
  template: `
    <div class="seat-selection-page container animate-fadeIn" *ngIf="flight()">
      <div class="back-link flex-start gap-sm">
        <a [routerLink]="['/flight', flight()?.id]"><mat-icon>arrow_back</mat-icon> Back to Flight Details</a>
      </div>

      <div class="seat-layout">
        <!-- Interactive Seat Map -->
        <div class="map-container glass-card flex-center flex-col">
          <div class="airplane-nose"></div>
          <div class="airplane-cabin flex-col">
            <!-- Seat Legend -->
            <div class="seat-legend flex-center gap-lg">
              <div class="legend-item"><span class="legend-box available"></span> Economy</div>
              <div class="legend-item"><span class="legend-box business"></span> Business</div>
              <div class="legend-item"><span class="legend-box first"></span> First Class</div>
              <div class="legend-item"><span class="legend-box occupied"></span> Occupied</div>
              <div class="legend-item"><span class="legend-box selected"></span> Selected</div>
            </div>

            <!-- Seat Rows Grid -->
            <div class="cabin-grid flex-col gap-sm">
              <div class="row-container flex-center gap-md" *ngFor="let row of seatMap()">
                <span class="row-number">{{ row[0].row }}</span>
                
                <!-- Left Seats (A, B, C) -->
                <div class="seat-group flex-start gap-sm">
                  <button *ngFor="let s of row.slice(0, 3)" 
                          [class]="'seat-btn ' + s.class + (s.available ? '' : ' occupied') + (s.selected ? ' selected' : '')"
                          [disabled]="!s.available"
                          [matTooltip]="getSeatTooltip(s)"
                          (click)="toggleSeat(s)">
                    {{ s.column }}
                  </button>
                </div>

                <!-- Aisle Space -->
                <div class="aisle-spacer">Aisle</div>

                <!-- Right Seats (D, E, F) -->
                <div class="seat-group flex-start gap-sm">
                  <button *ngFor="let s of row.slice(3, 6)" 
                          [class]="'seat-btn ' + s.class + (s.available ? '' : ' occupied') + (s.selected ? ' selected' : '')"
                          [disabled]="!s.available"
                          [matTooltip]="getSeatTooltip(s)"
                          (click)="toggleSeat(s)">
                    {{ s.column }}
                  </button>
                </div>

                <span class="row-number">{{ row[0].row }}</span>
              </div>
            </div>
          </div>
          <div class="airplane-tail"></div>
        </div>

        <!-- Selection Panel Sidebar -->
        <div class="summary-sidebar">
          <div class="glass-card summary-card flex-col gap-lg">
            <div class="summary-head">
              <h3>Selected Seats</h3>
              <p>Please select {{ maxSeats() }} seat{{ maxSeats() > 1 ? 's' : '' }} for passenger{{ maxSeats() > 1 ? 's' : '' }}.</p>
            </div>

            <div class="selected-seats-list flex-col gap-sm" *ngIf="selectedSeats().length > 0">
              <div class="selected-seat-item flex-between" *ngFor="let s of selectedSeats()">
                <div>
                  <strong>Seat {{ s.row }}{{ s.column }}</strong>
                  <span class="seat-class">{{ s.class | titlecase }}</span>
                </div>
                <div class="flex-start gap-md">
                  <span class="seat-price">₹{{ s.price | number }}</span>
                  <button class="remove-btn" (click)="toggleSeat(s)">&times;</button>
                </div>
              </div>
            </div>

            <div class="no-selection text-center" *ngIf="selectedSeats().length === 0">
              <mat-icon class="seat-icon">airline_seat_recline_extra</mat-icon>
              <p>No seats selected yet. Please select your seats from the map.</p>
            </div>

            <mat-divider></mat-divider>

            <div class="price-summary flex-col gap-sm">
              <div class="flex-between">
                <span>Seat Price Total</span>
                <span>₹{{ getSeatsPriceTotal() | number }}</span>
              </div>
              <div class="flex-between total-row">
                <span>Total Fare</span>
                <span class="total-price">₹{{ (flight()?.price?.total! + getSeatsPriceTotal()) | number }}</span>
              </div>
            </div>

            <button class="btn-gradient w-full text-center" 
                    [disabled]="selectedSeats().length !== maxSeats()" 
                    (click)="confirmSeats()">
              Confirm Seats
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seat-selection-page {
      padding-top: var(--space-4xl);
      padding-bottom: var(--space-4xl);
    }

    .back-link {
      margin-bottom: var(--space-xl);
      a {
        color: var(--text-secondary);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    .seat-layout {
      display: grid;
      grid-template-columns: 2fr 1.2fr;
      gap: var(--space-xl);

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    // Map container
    .map-container {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: var(--space-2xl) !important;
      border-radius: var(--border-radius-xl) !important;
      overflow-x: auto;
    }

    .airplane-nose {
      width: 140px;
      height: 70px;
      background: var(--bg-primary);
      border-radius: 70px 70px 0 0;
      border: 2px solid var(--border-color);
      border-bottom: none;
      margin-bottom: -2px;
    }

    .airplane-cabin {
      border: 2px solid var(--border-color);
      background: var(--bg-primary);
      padding: var(--space-xl);
      border-radius: 0 0 16px 16px;
      width: 380px;
      max-width: 100%;
    }

    .airplane-tail {
      width: 80px;
      height: 40px;
      background: var(--bg-primary);
      border: 2px solid var(--border-color);
      border-top: none;
      border-radius: 0 0 10px 10px;
      margin-top: -2px;
    }

    .seat-legend {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: var(--space-md);
      margin-bottom: var(--space-xl);
      flex-wrap: wrap;
      width: 100%;

      .legend-item {
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        color: var(--text-secondary);
      }

      .legend-box {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        display: inline-block;

        &.available { background: #E0E0E0; border: 1px solid var(--text-muted); }
        &.business { background: var(--color-primary-light); }
        &.first { background: var(--color-primary); }
        &.occupied { background: var(--text-muted); opacity: 0.3; }
        &.selected { background: var(--color-success); }
      }
    }

    .cabin-grid {
      width: 100%;
    }

    .row-container {
      width: 100%;
      height: 38px;
    }

    .row-number {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      width: 20px;
      text-align: center;
    }

    .seat-group {
      display: flex;
    }

    .seat-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius-sm);
      border: 1px solid var(--border-color);
      font-family: var(--font-family);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-primary);
      background: #E0E0E0;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;

      &.business { background: rgba(66, 165, 245, 0.25); border-color: var(--color-primary-light); color: var(--color-primary-dark); }
      &.first { background: rgba(21, 101, 192, 0.2); border-color: var(--color-primary); color: var(--color-primary-dark); }

      &.selected {
        background: var(--color-success) !important;
        border-color: transparent !important;
        color: white !important;
        box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.25);
      }

      &.occupied {
        background: var(--text-muted) !important;
        border-color: transparent !important;
        color: rgba(255,255,255,0.4) !important;
        opacity: 0.3 !important;
        cursor: not-allowed;
      }

      &:hover:not(.occupied):not(.selected) {
        transform: scale(1.1);
        border-color: var(--color-primary);
      }
    }

    .aisle-spacer {
      width: 44px;
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--text-muted);
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    // Summary card
    .summary-card {
      padding: var(--space-xl) !important;

      .summary-head {
        border-bottom: 1px solid var(--border-color);
        padding-bottom: var(--space-sm);
        h3 { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); }
        p { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }
      }
    }

    .selected-seat-item {
      padding: var(--space-sm) var(--space-md);
      background: var(--bg-primary);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--border-color);

      strong { font-size: 0.9rem; color: var(--text-primary); }
      .seat-class { font-size: 0.75rem; color: var(--text-secondary); display: block; }
      .seat-price { font-size: 0.9rem; font-weight: 700; color: var(--color-primary); }
      .remove-btn { background: none; border: none; font-size: 1.2rem; color: var(--text-muted); cursor: pointer; &:hover { color: var(--color-warn); } }
    }

    .no-selection {
      padding: var(--space-lg) 0;
      color: var(--text-muted);
      .seat-icon { font-size: 36px; width: 36px; height: 36px; margin-bottom: 8px; }
      p { font-size: 0.8rem; }
    }

    .price-summary {
      font-size: 0.85rem;
      color: var(--text-secondary);

      .total-row {
        font-weight: 700;
        color: var(--text-primary);
        font-size: 1rem;
        margin-top: 4px;

        .total-price { font-size: 1.4rem; color: var(--color-primary-dark); }
      }
    }
  `]
})
export class SeatSelectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private flightService = inject(FlightService);
  private notify = inject(NotificationService);

  flight = signal<Flight | null>(null);
  maxSeats = signal<number>(1);
  selectedSeats = signal<Seat[]>([]);
  seatMap = signal<Seat[][]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const match = this.flightService.getFlightById(id);
      if (match) {
        this.flight.set(match);
      } else {
        const defaultFlight = this.flightService.searchResults()[0];
        if (defaultFlight) this.flight.set(defaultFlight);
      }
      
      const search = this.flightService.searchParams();
      if (search) {
        this.maxSeats.set(search.passengers.adults + search.passengers.children);
      } else {
        this.maxSeats.set(1);
      }

      this.generateSeatMap();
    }
  }

  generateSeatMap(): void {
    const rows = 12;
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    const map: Seat[][] = [];

    for (let r = 1; r <= rows; r++) {
      const rowSeats: Seat[] = [];
      let cabin: CabinClass = 'economy';
      let price = 300;

      if (r <= 2) {
        cabin = 'first';
        price = 1500;
      } else if (r <= 5) {
        cabin = 'business';
        price = 800;
      }

      cols.forEach(c => {
        const isWindow = c === 'A' || c === 'F';
        const isAisle = c === 'C' || c === 'D';
        const type = isWindow ? 'window' : isAisle ? 'aisle' : 'middle';

        rowSeats.push({
          id: `${r}${c}`,
          row: r,
          column: c,
          class: cabin,
          available: Math.random() > 0.35, // Mock availability
          price,
          type
        });
      });

      map.push(rowSeats);
    }
    this.seatMap.set(map);
  }

  toggleSeat(seat: Seat): void {
    if (!seat.available) return;

    const list = [...this.selectedSeats()];
    const idx = list.findIndex(s => s.id === seat.id);

    if (idx > -1) {
      list.splice(idx, 1);
      seat.selected = false;
    } else {
      if (list.length >= this.maxSeats()) {
        const removed = list.shift();
        if (removed) {
          // Deselect previously automatically deselected seat
          this.seatMap().forEach(row => {
            const found = row.find(s => s.id === removed.id);
            if (found) found.selected = false;
          });
        }
      }
      seat.selected = true;
      list.push(seat);
    }

    this.selectedSeats.set(list);
  }

  getSeatTooltip(s: Seat): string {
    return `Seat ${s.row}${s.column} - ${s.class.toUpperCase()} - ₹${s.price}`;
  }

  getSeatsPriceTotal(): number {
    return this.selectedSeats().reduce((sum, s) => sum + (s.price || 0), 0);
  }

  confirmSeats(): void {
    if (this.selectedSeats().length !== this.maxSeats()) {
      this.notify.warning(`Please select exactly ${this.maxSeats()} seats.`);
      return;
    }
    
    // Store selected seat ids inside booking context
    const currentFlight = this.flight();
    if (currentFlight) {
      // Navigate to passenger details flow
      this.router.navigate(['/passengers']);
    }
  }
}
