import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { FlightService } from '../../core/services/flight.service';
import { Airport, SearchParams, CabinClass, TripType, PassengerCount } from '../../core/models';
import { PassengerCounterComponent } from '../../shared/components/passenger-counter/passenger-counter.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, FormsModule,
    MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatMenuModule, PassengerCounterComponent
  ],
  template: `
    <div class="search-page container">
      <div class="header-banner text-center animate-fadeInDown">
        <h1 class="page-title">Find Your Next <span>Destination</span></h1>
        <p class="page-subtitle">Search, compare and book flights seamlessly.</p>
      </div>

      <div class="search-widget-wrapper premium-card glass">
        <!-- Trip Type Selector -->
        <div class="widget-header flex-between flex-wrap gap-md">
          <div class="trip-tabs flex-start gap-sm">
            <button class="trip-tab" [class.active]="tripType === 'one-way'" (click)="setTripType('one-way')">
              <mat-icon>trending_flat</mat-icon> One Way
            </button>
            <button class="trip-tab" [class.active]="tripType === 'round-trip'" (click)="setTripType('round-trip')">
              <mat-icon>sync</mat-icon> Round Trip
            </button>
          </div>

          <div class="extra-selectors flex-start gap-md">
            <!-- Passengers Selection -->
            <button mat-button [matMenuTriggerFor]="paxMenu" class="pax-select-btn">
              <mat-icon>people</mat-icon>
              <span>{{ getTotalPassengers() }} Passenger{{ getTotalPassengers() > 1 ? 's' : '' }}</span>
            </button>
            <mat-menu #paxMenu="matMenu" class="pax-menu-wrapper" [hasBackdrop]="true">
              <div (click)="$event.stopPropagation()">
                <app-passenger-counter [value]="passengers" (valueChange)="onPassengersChange($event)"></app-passenger-counter>
              </div>
            </mat-menu>

            <!-- Cabin Class Selection -->
            <button type="button" mat-button [matMenuTriggerFor]="cabinMenu" class="pax-select-btn">
              <mat-icon>airline_seat_recline_normal</mat-icon>
              <span>{{ getCabinLabel(cabinClass) }}</span>
              <mat-icon>keyboard_arrow_down</mat-icon>
            </button>
            <mat-menu #cabinMenu="matMenu" class="glass-menu">
              <button type="button" mat-menu-item (click)="cabinClass = 'economy'">Economy</button>
              <button type="button" mat-menu-item (click)="cabinClass = 'premium_economy'">Premium Economy</button>
              <button type="button" mat-menu-item (click)="cabinClass = 'business'">Business</button>
              <button type="button" mat-menu-item (click)="cabinClass = 'first'">First Class</button>
            </mat-menu>
          </div>
        </div>

        <!-- Form fields -->
        <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form-grid">
          <!-- Origin -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>From</mat-label>
            <input type="text" matInput formControlName="originInput" [matAutocomplete]="originAuto" placeholder="City or airport">
            <mat-icon matPrefix>flight_takeoff</mat-icon>
            <mat-autocomplete #originAuto="matAutocomplete" [displayWith]="displayAirport">
              <mat-option *ngFor="let airport of filteredOrigins()" [value]="airport">
                <div class="airport-option flex-between">
                  <div>
                    <span class="city-name">{{ airport.city }}</span>
                    <span class="airport-name">{{ airport.name }}</span>
                  </div>
                  <span class="airport-code-badge">{{ airport.code }}</span>
                </div>
              </mat-option>
            </mat-autocomplete>
          </mat-form-field>

          <!-- Swap button -->
          <button type="button" mat-icon-button class="swap-btn" (click)="swapAirports()" aria-label="Swap airports">
            <mat-icon>swap_horiz</mat-icon>
          </button>

          <!-- Destination -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>To</mat-label>
            <input type="text" matInput formControlName="destinationInput" [matAutocomplete]="destAuto" placeholder="City or airport">
            <mat-icon matPrefix>flight_land</mat-icon>
            <mat-autocomplete #destAuto="matAutocomplete" [displayWith]="displayAirport">
              <mat-option *ngFor="let airport of filteredDestinations()" [value]="airport">
                <div class="airport-option flex-between">
                  <div>
                    <span class="city-name">{{ airport.city }}</span>
                    <span class="airport-name">{{ airport.name }}</span>
                  </div>
                  <span class="airport-code-badge">{{ airport.code }}</span>
                </div>
              </mat-option>
            </mat-autocomplete>
          </mat-form-field>

          <!-- Datepicker departure -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Departure</mat-label>
            <input matInput [matDatepicker]="depPicker" formControlName="departureDate">
            <mat-icon matPrefix>calendar_today</mat-icon>
            <mat-datepicker-toggle matSuffix [for]="depPicker"></mat-datepicker-toggle>
            <mat-datepicker #depPicker></mat-datepicker>
          </mat-form-field>

          <!-- Datepicker return (if round trip) -->
          <mat-form-field appearance="outline" class="w-full" *ngIf="tripType === 'round-trip'">
            <mat-label>Return</mat-label>
            <input matInput [matDatepicker]="retPicker" formControlName="returnDate">
            <mat-icon matPrefix>calendar_today</mat-icon>
            <mat-datepicker-toggle matSuffix [for]="retPicker"></mat-datepicker-toggle>
            <mat-datepicker #retPicker></mat-datepicker>
          </mat-form-field>

          <button type="submit" class="btn-gradient search-btn flex-center">
            <mat-icon>search</mat-icon> Search Flights
          </button>
        </form>
      </div>

      <!-- Search History Section -->
      <section class="history-section" *ngIf="flightService.searchHistory().length > 0">
        <h3 class="section-sub-title">Your Recent Searches</h3>
        <div class="history-grid">
          <div class="history-card glass-card flex-between" *ngFor="let h of flightService.searchHistory()" (click)="selectHistory(h)">
            <div class="flex-start gap-md">
              <span class="hist-icon">🕒</span>
              <div>
                <h4 class="hist-route">{{ h.origin?.city }} ({{ h.origin?.code }}) → {{ h.destination?.city }} ({{ h.destination?.code }})</h4>
                <span class="hist-details">
                  {{ h.departureDate | date:'dd MMM yyyy' }} • {{ h.cabinClass | titlecase }} • {{ h.passengers.adults + h.passengers.children }} Pax
                </span>
              </div>
            </div>
            <mat-icon class="arrow-icon">arrow_forward_ios</mat-icon>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .search-page {
      padding-top: var(--space-4xl);
      padding-bottom: var(--space-4xl);
    }

    .header-banner {
      margin-bottom: var(--space-2xl);
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: var(--space-xs);

      span {
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .page-subtitle {
      font-size: 1rem;
      color: var(--text-secondary);
    }

    .search-widget-wrapper {
      padding: var(--space-xl);
      background: var(--bg-card);
      border-radius: var(--border-radius-xl);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-lg);
      margin-bottom: var(--space-3xl);
    }

    .widget-header {
      margin-bottom: var(--space-lg);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: var(--space-md);
    }

    .trip-tabs {
      background: var(--bg-primary);
      padding: 4px;
      border-radius: 50px;
      border: 1px solid var(--border-color);
    }

    .trip-tab {
      background: none;
      border: none;
      padding: 8px 16px;
      border-radius: 50px;
      font-family: var(--font-family);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all var(--transition-base);

      mat-icon { font-size: 16px; width: 16px; height: 16px; }

      &.active {
        background: var(--gradient-primary);
        color: white;
      }
    }

    .pax-select-btn {
      border: 1px solid var(--border-color) !important;
      border-radius: 50px !important;
      font-size: 0.85rem !important;
      color: var(--text-secondary) !important;
      height: 38px !important;
    }



    .search-form-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr 1.2fr auto;
      gap: var(--space-md);
      align-items: center;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr 1fr;
        .swap-btn { display: none; }
      }
      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .swap-btn {
      color: var(--color-primary);
      background: var(--bg-primary) !important;
      border: 1px solid var(--border-color);
      z-index: 2;
    }

    .airport-option {
      width: 100%;
      .city-name { font-weight: 600; display: block; font-size: 0.9rem; }
      .airport-name { font-size: 0.75rem; color: var(--text-secondary); display: block; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .airport-code-badge { font-weight: 700; color: var(--color-primary); font-size: 0.85rem; padding: 2px 6px; background: var(--bg-primary); border-radius: 4px; }
    }

    .search-btn {
      height: 56px;
      border-radius: var(--border-radius-md) !important;
      font-size: 1rem !important;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      @media (max-width: 1024px) {
        grid-column: span 2;
      }
      @media (max-width: 600px) {
        grid-column: span 1;
      }
    }

    // History
    .history-section {
      margin-top: var(--space-2xl);
    }

    .section-sub-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--space-md);
    }

    .history-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-md);
    }

    .history-card {
      cursor: pointer;
      padding: var(--space-md) !important;
      border: 1px solid var(--border-color);

      &:hover {
        border-color: var(--color-primary-light);
        .arrow-icon {
          transform: translateX(4px);
          color: var(--color-primary);
        }
      }
    }

    .hist-icon {
      font-size: 24px;
    }

    .hist-route {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .hist-details {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .arrow-icon {
      font-size: 16px;
      color: var(--text-muted);
      transition: all var(--transition-fast);
    }
  `]
})
export class SearchComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  readonly flightService = inject(FlightService);
  private notify = inject(NotificationService);

  tripType: TripType = 'one-way';
  cabinClass: CabinClass = 'economy';
  passengers: PassengerCount = { adults: 1, children: 0, infants: 0 };

  searchForm: FormGroup;

  constructor() {
    this.searchForm = this.fb.group({
      originInput: ['', Validators.required],
      destinationInput: ['', Validators.required],
      departureDate: [new Date(), Validators.required],
      returnDate: [null]
    });
  }

  setTripType(type: TripType): void {
    this.tripType = type;
    if (type === 'round-trip') {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      this.searchForm.get('returnDate')?.setValidators([Validators.required]);
      this.searchForm.get('returnDate')?.setValue(nextWeek);
    } else {
      this.searchForm.get('returnDate')?.clearValidators();
      this.searchForm.get('returnDate')?.setValue(null);
    }
    this.searchForm.get('returnDate')?.updateValueAndValidity();
  }

  getTotalPassengers(): number {
    return this.passengers.adults + this.passengers.children + this.passengers.infants;
  }

  onPassengersChange(count: PassengerCount): void {
    this.passengers = count;
  }

  filteredOrigins(): Airport[] {
    const query = this.searchForm.get('originInput')?.value;
    if (typeof query === 'string') {
      return this.flightService.searchAirports(query);
    }
    return this.flightService.airports.slice(0, 5);
  }

  filteredDestinations(): Airport[] {
    const query = this.searchForm.get('destinationInput')?.value;
    if (typeof query === 'string') {
      return this.flightService.searchAirports(query);
    }
    return this.flightService.airports.slice(5, 10);
  }

  displayAirport(airport: Airport | null): string {
    return airport ? `${airport.city} (${airport.code})` : '';
  }

  swapAirports(): void {
    const origin = this.searchForm.get('originInput')?.value;
    const dest = this.searchForm.get('destinationInput')?.value;
    this.searchForm.patchValue({
      originInput: dest,
      destinationInput: origin
    });
  }

  selectHistory(history: SearchParams): void {
    this.setTripType(history.tripType);
    this.passengers = history.passengers;
    this.cabinClass = history.cabinClass;

    this.searchForm.patchValue({
      originInput: history.origin,
      destinationInput: history.destination,
      departureDate: history.departureDate ? new Date(history.departureDate) : new Date(),
      returnDate: history.returnDate ? new Date(history.returnDate) : null
    });
    this.onSearch();
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      this.notify.warning('Please enter valid inputs.');
      return;
    }

    const val = this.searchForm.value;
    const origin = typeof val.originInput === 'object' ? val.originInput : this.flightService.airports[0];
    const destination = typeof val.destinationInput === 'object' ? val.destinationInput : this.flightService.airports[1];

    const params: SearchParams = {
      tripType: this.tripType,
      origin,
      destination,
      departureDate: val.departureDate,
      returnDate: val.returnDate,
      passengers: this.passengers,
      cabinClass: this.cabinClass
    };

    this.flightService.searchFlights(params).subscribe(flights => {
      this.flightService.searchResults.set(flights);
      this.flightService.isSearching.set(false);
      this.router.navigate(['/results']);
    });
  }

  getCabinLabel(cabin: CabinClass): string {
    switch (cabin) {
      case 'economy': return 'Economy';
      case 'premium_economy': return 'Premium Eco';
      case 'business': return 'Business';
      case 'first': return 'First Class';
      default: return 'Class';
    }
  }
}
