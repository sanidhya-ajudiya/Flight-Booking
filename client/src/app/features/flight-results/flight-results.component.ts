import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { AirlineService } from '../../core/services/airline.service';
import { Flight, Airline } from '../../core/interfaces';

@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container search-results-page">
      <!-- Search Header Summary -->
      <div class="results-header glass-card">
        <div class="header-info">
          <h2>Flights from <span>{{ origin || 'All' }}</span> to <span>{{ destination || 'All' }}</span></h2>
          <p>Found {{ flights.length }} available flights for your travel parameters</p>
        </div>
        <button (click)="toggleFilterDrawer()" class="btn-secondary filter-toggle-btn">
          🎛️ Filter & Sort
        </button>
      </div>

      <div class="results-layout">
        <!-- Sidebar Filters -->
        <aside class="filter-sidebar glass-card" [class.open]="showMobileFilter">
          <h3 class="filter-title">Filter Results</h3>

          <!-- Sort By -->
          <div class="filter-group">
            <label class="filter-label">Sort By</label>
            <select [(ngModel)]="sortBy" (change)="applyFilters()" class="filter-select">
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration">Fastest Duration</option>
            </select>
          </div>

          <!-- Max Price Slider -->
          <div class="filter-group">
            <label class="filter-label">Max Price: ₹{{ maxPrice }}</label>
            <input type="range" min="2000" max="250000" step="1000" [(ngModel)]="maxPrice" (change)="applyFilters()" class="price-slider">
          </div>

          <!-- Stops Filter -->
          <div class="filter-group">
            <label class="filter-label">Stops</label>
            <div class="checkbox-list">
              <label><input type="radio" name="stops" value="" [(ngModel)]="stops" (change)="applyFilters()"> All Flights</label>
              <label><input type="radio" name="stops" value="0" [(ngModel)]="stops" (change)="applyFilters()"> Non-Stop Direct Only</label>
              <label><input type="radio" name="stops" value="1" [(ngModel)]="stops" (change)="applyFilters()"> 1+ Stop</label>
            </div>
          </div>

          <!-- Airlines Checklist -->
          <div class="filter-group">
            <label class="filter-label">Airlines</label>
            <select [(ngModel)]="selectedAirline" (change)="applyFilters()" class="filter-select">
              <option value="">All Airlines</option>
              <option *ngFor="let al of airlines" [value]="al._id">{{ al.name }}</option>
            </select>
          </div>
        </aside>

        <!-- Flight Cards List -->
        <main class="flights-list">
          <div *ngIf="loading" class="loading-skeleton">
            <div class="skeleton-card glass-card" *ngFor="let i of [1,2,3]">
              <div class="skeleton-line header"></div>
              <div class="skeleton-line body"></div>
            </div>
          </div>

          <div *ngIf="!loading && flights.length === 0" class="no-results glass-card">
            <h3>No Flights Found ✈️</h3>
            <p>Try adjusting your search filters or choosing a different departure date.</p>
          </div>

          <div *ngFor="let flight of flights" class="flight-card glass-card">
            <!-- Airline Branding -->
            <div class="airline-info">
              <img [src]="flight.airline.logo" [alt]="flight.airline.name" class="airline-logo">
              <div>
                <h4 class="airline-name">{{ flight.airline.name }}</h4>
                <span class="flight-no">{{ flight.flightNumber }}</span>
              </div>
            </div>

            <!-- Departure - Duration - Arrival -->
            <div class="route-info">
              <div class="dep-time">
                <span class="time">{{ flight.departureTime }}</span>
                <span class="code">{{ flight.departureAirport.code }}</span>
                <span class="city">{{ flight.departureAirport.city }}</span>
              </div>

              <div class="duration-bar">
                <span class="duration">{{ flight.duration }}</span>
                <div class="line">
                  <span class="plane-icon">✈</span>
                </div>
                <span class="stops-tag">{{ flight.stops === 0 ? 'Direct Non-Stop' : flight.stops + ' Stop' }}</span>
              </div>

              <div class="arr-time">
                <span class="time">{{ flight.arrivalTime }}</span>
                <span class="code">{{ flight.arrivalAirport.code }}</span>
                <span class="city">{{ flight.arrivalAirport.city }}</span>
              </div>
            </div>

            <!-- Pricing & Action -->
            <div class="price-action">
              <div class="price-tag">
                <span class="fare-label">{{ cabinClass | uppercase }} FARE</span>
                <span class="amount">₹{{ getFarePrice(flight) }}</span>
              </div>

              <button (click)="selectFlight(flight)" class="btn-primary select-btn">
                SELECT FLIGHT ➔
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .search-results-page {
      padding-top: 40px;
    }

    .results-header {
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;

      h2 span { color: var(--primary-accent); }
      p { color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px; }
    }

    .results-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 30px;
    }

    .filter-sidebar {
      padding: 24px;
      height: fit-content;
    }

    .filter-title {
      font-size: 1.1rem;
      font-weight: 800;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
    }

    .filter-group {
      margin-bottom: 20px;
    }

    .filter-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 8px;
      display: block;
    }

    .filter-select {
      width: 100%;
      height: 42px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      color: var(--text-primary);
      padding: 0 12px;
      font-weight: 600;
    }

    .price-slider {
      width: 100%;
      accent-color: var(--primary-accent);
    }

    .checkbox-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 0.88rem;
    }

    .flights-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .flight-card {
      padding: 24px;
      display: grid;
      grid-template-columns: 180px 1fr 180px;
      align-items: center;
      gap: 20px;
    }

    .airline-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .airline-logo {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .airline-name { font-weight: 700; font-size: 0.95rem; }
    .flight-no { font-size: 0.8rem; color: var(--text-muted); }

    .route-info {
      display: flex;
      align-items: center;
      justify-content: space-around;
      text-align: center;
    }

    .dep-time, .arr-time {
      display: flex;
      flex-direction: column;

      .time { font-size: 1.4rem; font-weight: 800; }
      .code { font-size: 0.9rem; font-weight: 700; color: var(--primary-accent); }
      .city { font-size: 0.8rem; color: var(--text-muted); }
    }

    .duration-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 140px;

      .duration { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
      .line {
        width: 100%;
        height: 2px;
        background: var(--border-color);
        position: relative;
        margin: 8px 0;

        .plane-icon {
          position: absolute;
          top: -9px;
          left: 45%;
          color: var(--primary-accent);
          font-size: 1rem;
        }
      }
      .stops-tag { font-size: 0.72rem; font-weight: 700; color: #16a34a; }
    }

    .price-action {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      padding-left: 20px;
      border-left: 1px solid var(--border-color);
    }

    .fare-label { font-size: 0.68rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px; }
    .amount { font-size: 1.6rem; font-weight: 800; color: var(--primary-accent); }

    .select-btn {
      width: 100%;
      justify-content: center;
      font-size: 0.85rem;
      padding: 10px 16px;
    }

    .no-results {
      padding: 60px;
      text-align: center;
      color: var(--text-secondary);
    }

    .filter-toggle-btn { display: none; }

    @media (max-width: 900px) {
      .results-layout { grid-template-columns: 1fr; }
      .flight-card { grid-template-columns: 1fr; gap: 16px; }
      .price-action { border-left: none; align-items: center; padding-left: 0; }
      .filter-toggle-btn { display: block; }
    }
  `]
})
export class FlightResultsComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  flightService = inject(FlightService);
  airlineService = inject(AirlineService);

  flights: Flight[] = [];
  airlines: Airline[] = [];
  loading: boolean = true;

  origin: string = '';
  destination: string = '';
  departureDate: string = '';
  cabinClass: string = 'economy';
  stops: string = '';
  maxPrice: number = 250000;
  selectedAirline: string = '';
  sortBy: string = 'price_asc';
  showMobileFilter: boolean = false;

  ngOnInit() {
    this.airlineService.getAirlines().subscribe({ next: data => this.airlines = data });
    this.route.queryParams.subscribe(params => {
      this.origin = params['origin'] || '';
      this.destination = params['destination'] || '';
      this.departureDate = params['departureDate'] || '';
      this.cabinClass = params['cabinClass'] || 'economy';
      this.fetchFlights();
    });
  }

  fetchFlights() {
    this.loading = true;
    const filters = {
      origin: this.origin,
      destination: this.destination,
      departureDate: this.departureDate,
      cabinClass: this.cabinClass,
      stops: this.stops,
      maxPrice: this.maxPrice,
      airlineId: this.selectedAirline,
      sortBy: this.sortBy
    };

    this.flightService.searchFlights(filters).subscribe({
      next: (data) => {
        this.flights = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.fetchFlights();
  }

  toggleFilterDrawer() {
    this.showMobileFilter = !this.showMobileFilter;
  }

  getFarePrice(flight: Flight): number {
    if (this.cabinClass === 'business') return flight.businessPrice;
    if (this.cabinClass === 'firstClass') return flight.firstClassPrice;
    return flight.economyPrice;
  }

  selectFlight(flight: Flight) {
    this.router.navigate(['/booking'], {
      queryParams: {
        flightId: flight._id,
        cabinClass: this.cabinClass
      }
    });
  }
}
