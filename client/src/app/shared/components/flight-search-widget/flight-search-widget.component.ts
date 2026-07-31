import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AirportService } from '../../../core/services/airport.service';
import { Airport } from '../../../core/interfaces';

@Component({
  selector: 'app-flight-search-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-widget glass-card">
      <!-- Trip Type Tabs -->
      <div class="trip-tabs">
        <button [class.active]="tripType === 'one-way'" (click)="tripType = 'one-way'">
          ✈️ One Way
        </button>
        <button [class.active]="tripType === 'round-trip'" (click)="tripType = 'round-trip'">
          🔄 Round Trip
        </button>
      </div>

      <!-- Main Search Inputs -->
      <div class="search-form-grid">
        <!-- Origin -->
        <div class="form-group">
          <label class="form-label">FROM</label>
          <div class="input-wrapper">
            <span class="icon">🛫</span>
            <select [(ngModel)]="origin" class="custom-select">
              <option value="">Select Departure Airport</option>
              <option *ngFor="let ap of airports" [value]="ap.code">
                {{ ap.city }} ({{ ap.code }}) - {{ ap.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Swap Icon -->
        <button (click)="swapAirports()" class="swap-btn" type="button" title="Swap Origin & Destination">
          ⇄
        </button>

        <!-- Destination -->
        <div class="form-group">
          <label class="form-label">TO</label>
          <div class="input-wrapper">
            <span class="icon">🛬</span>
            <select [(ngModel)]="destination" class="custom-select">
              <option value="">Select Destination Airport</option>
              <option *ngFor="let ap of airports" [value]="ap.code">
                {{ ap.city }} ({{ ap.code }}) - {{ ap.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Departure Date -->
        <div class="form-group">
          <label class="form-label">DEPARTURE DATE</label>
          <div class="input-wrapper">
            <span class="icon">📅</span>
            <input type="date" [(ngModel)]="departureDate" class="custom-input">
          </div>
        </div>

        <!-- Return Date (If Round Trip) -->
        <div class="form-group" *ngIf="tripType === 'round-trip'">
          <label class="form-label">RETURN DATE</label>
          <div class="input-wrapper">
            <span class="icon">📅</span>
            <input type="date" [(ngModel)]="returnDate" class="custom-input">
          </div>
        </div>

        <!-- Passengers & Class -->
        <div class="form-group">
          <label class="form-label">PASSENGERS & CLASS</label>
          <div class="input-wrapper row-split">
            <select [(ngModel)]="passengersCount" class="custom-select short">
              <option [value]="1">1 Pax</option>
              <option [value]="2">2 Pax</option>
              <option [value]="3">3 Pax</option>
              <option [value]="4">4 Pax</option>
              <option [value]="5">5 Pax</option>
            </select>
            <select [(ngModel)]="cabinClass" class="custom-select">
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="firstClass">First Class</option>
            </select>
          </div>
        </div>

        <!-- Search Action Button -->
        <div class="form-group action-group">
          <button (click)="onSearch()" class="btn-primary search-btn">
            🔍 SEARCH FLIGHTS
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-widget {
      padding: 28px;
      border-radius: 20px;
      margin-top: -60px;
      position: relative;
      z-index: 10;
    }

    .trip-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;

      button {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        padding: 10px 20px;
        border-radius: 30px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &.active {
          background: var(--primary-accent);
          color: #ffffff;
          border-color: var(--primary-accent);
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
        }
      }
    }

    .search-form-grid {
      display: grid;
      grid-template-columns: 2fr 40px 2fr 1.5fr 2fr 1.8fr;
      gap: 12px;
      align-items: end;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .icon {
        position: absolute;
        left: 12px;
        font-size: 1.1rem;
        pointer-events: none;
      }
    }

    .custom-input, .custom-select {
      width: 100%;
      height: 48px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 0 12px 0 40px;
      color: var(--text-primary);
      font-size: 0.95rem;
      font-weight: 600;
      outline: none;

      &:focus {
        border-color: var(--primary-accent);
        box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
      }
    }

    .row-split {
      gap: 6px;
      .short { width: 90px; padding-left: 12px; }
      .custom-select { padding-left: 12px; }
    }

    .swap-btn {
      height: 48px;
      border-radius: 50%;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      color: var(--primary-accent);
      font-size: 1.3rem;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: var(--primary-accent);
        color: #ffffff;
      }
    }

    .search-btn {
      height: 48px;
      width: 100%;
      justify-content: center;
      font-size: 1rem;
      letter-spacing: 0.5px;
    }

    @media (max-width: 1100px) {
      .search-form-grid {
        grid-template-columns: 1fr 1fr;
      }
      .swap-btn { display: none; }
    }

    @media (max-width: 600px) {
      .search-form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FlightSearchWidgetComponent implements OnInit {
  airportService = inject(AirportService);
  router = inject(Router);

  airports: Airport[] = [];
  tripType: 'one-way' | 'round-trip' = 'one-way';
  origin: string = 'BOM';
  destination: string = 'DEL';
  departureDate: string = new Date().toISOString().split('T')[0];
  returnDate: string = '';
  passengersCount: number = 1;
  cabinClass: string = 'economy';

  ngOnInit() {
    this.airportService.getAirports().subscribe({
      next: (data) => this.airports = data,
      error: (err) => console.error(err)
    });
  }

  swapAirports() {
    const temp = this.origin;
    this.origin = this.destination;
    this.destination = temp;
  }

  onSearch() {
    this.router.navigate(['/search'], {
      queryParams: {
        origin: this.origin,
        destination: this.destination,
        departureDate: this.departureDate,
        tripType: this.tripType,
        passengers: this.passengersCount,
        cabinClass: this.cabinClass
      }
    });
  }
}
