import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';

import { FlightService } from '../../core/services/flight.service';
import { Flight, FilterOptions, SortBy, SearchParams } from '../../core/models';
import { FlightCardComponent } from '../../shared/components/flight-card/flight-card.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatIconModule, MatButtonModule,
    MatCheckboxModule, MatSliderModule, MatButtonToggleModule, FormsModule,
    FlightCardComponent, SkeletonLoaderComponent
  ],
  template: `
    <div class="results-page container">
      <!-- Search Summary Bar -->
      <div class="search-summary-bar glass flex-between flex-wrap gap-md">
        <div class="route-info flex-start gap-md">
          <div class="summary-badge flex-center">✈️</div>
          <div>
            <h3 class="summary-route">
              {{ searchParams()?.origin?.city }} ({{ searchParams()?.origin?.code }}) 
              <mat-icon class="arrow-icon">arrow_forward</mat-icon>
              {{ searchParams()?.destination?.city }} ({{ searchParams()?.destination?.code }})
            </h3>
            <p class="summary-meta">
              {{ searchParams()?.departureDate | date:'dd MMM yyyy' }} • 
              {{ searchParams()?.cabinClass | titlecase }} • 
              {{ searchParams()?.passengers?.adults }} Adult{{ searchParams()?.passengers?.adults! > 1 ? 's' : '' }}
            </p>
          </div>
        </div>
        <button routerLink="/search" class="btn-outline btn-sm">Modify Search</button>
      </div>

      <div class="results-layout">
        <!-- Filters Sidebar -->
        <aside class="filters-sidebar glass">
          <div class="filter-header flex-between">
            <h3>Filters</h3>
            <button mat-button class="clear-filters-btn" (click)="resetFilters()">Clear All</button>
          </div>

          <!-- Price Range Slider -->
          <div class="filter-section">
            <h4>Price Range</h4>
            <div class="price-slider-container">
              <mat-slider min="2000" max="25000" step="500">
                <input matSliderStartThumb [(ngModel)]="filters.priceRange[0]" (change)="applyFilters()">
                <input matSliderEndThumb [(ngModel)]="ngModelPriceMax" (change)="applyMaxPriceChange($event)">
              </mat-slider>
              <div class="price-labels flex-between">
                <span>₹{{ filters.priceRange[0] | number }}</span>
                <span>₹{{ filters.priceRange[1] | number }}</span>
              </div>
            </div>
          </div>

          <!-- Stops Selector -->
          <div class="filter-section">
            <h4>Stops</h4>
            <div class="checkbox-group flex-col gap-sm">
              <mat-checkbox [checked]="filters.stops.includes(0)" (change)="toggleStop(0, $event.checked)">
                Non-stop
              </mat-checkbox>
              <mat-checkbox [checked]="filters.stops.includes(1)" (change)="toggleStop(1, $event.checked)">
                1 Stop
              </mat-checkbox>
            </div>
          </div>

          <!-- Airlines Selector -->
          <div class="filter-section">
            <h4>Airlines</h4>
            <div class="checkbox-group flex-col gap-sm">
              <mat-checkbox *ngFor="let airline of flightService.airlines" 
                            [checked]="filters.airlines.includes(airline.code)"
                            (change)="toggleAirline(airline.code, $event.checked)">
                {{ airline.name }}
              </mat-checkbox>
            </div>
          </div>

          <!-- Departure Time -->
          <div class="filter-section">
            <h4>Departure Time</h4>
            <div class="time-filters grid-2 gap-sm">
              <button class="time-btn" [class.active]="isTimeActive('morning')" (click)="setTimeRange('morning')">
                🌅 Morning <br> <span class="time-lbl">6AM - 12PM</span>
              </button>
              <button class="time-btn" [class.active]="isTimeActive('evening')" (click)="setTimeRange('evening')">
                🌇 Evening <br> <span class="time-lbl">6PM - 12AM</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- Main Results Pane -->
        <main class="results-main">
          <!-- Sort & Compare Head -->
          <div class="results-toolbar flex-between flex-wrap gap-md">
            <span class="results-count">
              Found <strong>{{ filteredFlights().length }}</strong> flight{{ filteredFlights().length === 1 ? '' : 's' }}
            </span>

            <div class="toolbar-actions flex-start gap-md">
              <!-- Sort Buttons -->
              <div class="sort-selector flex-start gap-sm">
                <span class="sort-label">Sort by:</span>
                <mat-button-toggle-group [(ngModel)]="sortBy" (change)="onSortChange()" name="sortBy" aria-label="Sort options">
                  <mat-button-toggle value="price">Price</mat-button-toggle>
                  <mat-button-toggle value="duration">Duration</mat-button-toggle>
                  <mat-button-toggle value="departure">Departure</mat-button-toggle>
                </mat-button-toggle-group>
              </div>

              <!-- Compare Toggle Button -->
              <button mat-button class="compare-toggle-bar" (click)="toggleCompareMode()" [class.active]="compareMode()">
                <mat-icon>compare_arrows</mat-icon>
                <span>Compare Mode ({{ selectedCompareFlights().length }}/3)</span>
              </button>
            </div>
          </div>

          <!-- Compare Box Overlay -->
          <div class="compare-overlay animate-fadeIn" *ngIf="compareMode() && selectedCompareFlights().length > 0">
            <div class="compare-card glass">
              <div class="compare-header flex-between">
                <h3>Compare Flights</h3>
                <button mat-icon-button (click)="compareMode.set(false)"><mat-icon>close</mat-icon></button>
              </div>
              <div class="compare-grid">
                <div class="compare-col text-center" *ngFor="let flight of selectedCompareFlights()">
                  <span class="airline">{{ flight.segments[0].airline.name }}</span>
                  <span class="time">{{ flight.segments[0].departureTime | date:'HH:mm' }} - {{ flight.segments[0].arrivalTime | date:'HH:mm' }}</span>
                  <span class="duration">⏱️ {{ getFormattedDuration(flight.segments[0].duration) }}</span>
                  <span class="stops">🔀 {{ flight.segments[0].stops === 0 ? 'Non-stop' : flight.segments[0].stops + ' Stop' }}</span>
                  <span class="price">₹{{ flight.price.total | number }}</span>
                  <button class="btn-gradient btn-sm mt-auto" (click)="selectFlight(flight)">Book</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loader Skeletons -->
          <div class="loader-container flex-col gap-md" *ngIf="flightService.isSearching()">
            <app-skeleton-loader height="140px" borderRadius="16px" *ngFor="let x of [1, 2, 3]"></app-skeleton-loader>
          </div>

          <!-- Flights list -->
          <div class="flights-list flex-col" *ngIf="!flightService.isSearching()">
            <app-flight-card *ngFor="let flight of filteredFlights()" 
                             [flight]="flight" 
                             [showCompare]="compareMode()"
                             [isSelectedForCompare]="isFlightInCompareList(flight)"
                             (select)="selectFlight($event)"
                             (compareToggle)="onCompareToggle(flight, $event)">
            </app-flight-card>

            <!-- Empty Results -->
            <div class="empty-results text-center glass-card animate-fadeIn" *ngIf="filteredFlights().length === 0">
              <div class="empty-icon">✈️</div>
              <h3>No Flights Found</h3>
              <p>Try widening your search price range or selecting other filters.</p>
              <button class="btn-gradient mt-auto" (click)="resetFilters()">Reset All Filters</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .results-page {
      padding-top: var(--space-4xl);
      padding-bottom: var(--space-4xl);
    }

    // Search summary
    .search-summary-bar {
      padding: var(--space-md) var(--space-xl);
      background: var(--bg-card);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--border-color);
      margin-bottom: var(--space-xl);

      .summary-badge {
        width: 44px;
        height: 44px;
        background: var(--bg-primary);
        color: var(--color-primary);
        border-radius: 50%;
        font-size: 20px;
      }

      .summary-route {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;

        .arrow-icon { font-size: 18px; width: 18px; height: 18px; color: var(--color-primary-light); }
      }

      .summary-meta {
        font-size: 0.8rem;
        color: var(--text-secondary);
        font-weight: 500;
      }
    }

    // Grid Layout
    .results-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: var(--space-lg);

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    // Sidebar Filters
    .filters-sidebar {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: var(--space-lg);
      border-radius: var(--border-radius-lg);
      height: fit-content;
      position: sticky;
      top: 90px;
    }

    .filter-header {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: var(--space-sm);
      margin-bottom: var(--space-md);

      h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
      .clear-filters-btn { font-size: 0.8rem !important; color: var(--color-primary) !important; padding: 0 !important; }
    }

    .filter-section {
      margin-bottom: var(--space-lg);
      border-bottom: 1px solid rgba(21, 101, 192, 0.05);
      padding-bottom: var(--space-md);

      &:last-child { border-bottom: none; padding-bottom: 0; }

      h4 { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-sm); }
    }

    .price-slider-container {
      padding: 0 var(--space-xs);
      mat-slider { width: 100%; }
      .price-labels { font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; }
    }

    .time-filters {
      .time-btn {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius-sm);
        padding: 8px;
        font-family: var(--font-family);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
        text-align: center;

        .time-lbl { font-size: 0.65rem; color: var(--text-muted); font-weight: 400; }

        &:hover { border-color: var(--color-primary-light); color: var(--color-primary); }
        &.active { background: var(--color-primary); color: white; border-color: transparent; .time-lbl { color: rgba(255,255,255,0.7); } }
      }
    }

    // Results Main
    .results-toolbar {
      background: var(--bg-primary);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--space-md);

      .results-count { font-size: 0.9rem; color: var(--text-secondary); }
      .sort-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
    }

    .compare-toggle-bar {
      border: 1px solid var(--border-color) !important;
      border-radius: 50px !important;
      font-size: 0.8rem !important;
      color: var(--text-secondary) !important;
      height: 38px !important;

      &.active {
        background: rgba(21, 101, 192, 0.1) !important;
        border-color: var(--color-primary) !important;
        color: var(--color-primary) !important;
      }
    }

    // Compare Panel
    .compare-overlay {
      margin-bottom: var(--space-lg);
    }

    .compare-card {
      background: var(--bg-card);
      border: 1px solid var(--color-primary-light);
      border-radius: var(--border-radius-lg);
      padding: var(--space-lg);

      .compare-header {
        border-bottom: 1px solid var(--border-color);
        margin-bottom: var(--space-md);
        padding-bottom: var(--space-xs);
        h3 { font-size: 1rem; font-weight: 700; color: var(--color-primary); }
      }
    }

    .compare-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-md);

      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .compare-col {
      background: var(--bg-primary);
      padding: var(--space-md);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 6px;

      .airline { font-weight: 700; font-size: 0.9rem; }
      .time { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
      .duration, .stops { font-size: 0.75rem; color: var(--text-secondary); }
      .price { font-size: 1.15rem; font-weight: 700; color: var(--color-primary-dark); margin: 6px 0; }
    }

    // Empty Results
    .empty-results {
      padding: var(--space-3xl) !important;
      display: flex;
      flex-direction: column;
      align-items: center;

      .empty-icon { font-size: 48px; margin-bottom: var(--space-md); }
      h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-xs); }
      p { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: var(--space-lg); }
    }
  `]
})
export class ResultsComponent implements OnInit {
  readonly flightService = inject(FlightService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  searchParams = this.flightService.searchParams;
  sortBy: SortBy = 'price';
  compareMode = signal(false);
  selectedCompareFlights = signal<Flight[]>([]);

  ngModelPriceMax = 25000;

  filters: FilterOptions = {
    airlines: [],
    stops: [],
    priceRange: [2000, 25000],
    departureTime: { from: 0, to: 24 },
    arrivalTime: { from: 0, to: 24 }
  };

  filteredFlights = computed(() => {
    let list = this.flightService.searchResults();
    list = this.flightService.filterFlights(list, this.filters);
    list = this.flightService.sortFlights(list, this.sortBy);
    return list;
  });

  ngOnInit(): void {
    // If user lands directly on this route without searching, trigger default mock search
    if (!this.searchParams()) {
      const defaultParams: SearchParams = {
        tripType: 'one-way',
        origin: this.flightService.airports[0], // BOM
        destination: this.flightService.airports[1], // DEL
        departureDate: new Date(),
        passengers: { adults: 1, children: 0, infants: 0 },
        cabinClass: 'economy'
      };
      this.flightService.searchFlights(defaultParams).subscribe(flights => {
        this.flightService.searchResults.set(flights);
      });
    }
  }

  applyFilters(): void {
    // Computed signal handles updates reactively
  }

  applyMaxPriceChange(event: any): void {
    this.filters.priceRange[1] = this.ngModelPriceMax;
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = {
      airlines: [],
      stops: [],
      priceRange: [2000, 25000],
      departureTime: { from: 0, to: 24 },
      arrivalTime: { from: 0, to: 24 }
    };
    this.ngModelPriceMax = 25000;
  }

  toggleAirline(code: string, checked: boolean): void {
    if (checked) {
      this.filters.airlines.push(code);
    } else {
      this.filters.airlines = this.filters.airlines.filter(c => c !== code);
    }
    this.applyFilters();
  }

  toggleStop(stops: number, checked: boolean): void {
    if (checked) {
      this.filters.stops.push(stops);
    } else {
      this.filters.stops = this.filters.stops.filter(s => s !== stops);
    }
    this.applyFilters();
  }

  setTimeRange(preset: 'morning' | 'evening'): void {
    if (preset === 'morning') {
      const active = this.isTimeActive('morning');
      this.filters.departureTime = active ? { from: 0, to: 24 } : { from: 6, to: 12 };
    } else {
      const active = this.isTimeActive('evening');
      this.filters.departureTime = active ? { from: 0, to: 24 } : { from: 18, to: 24 };
    }
    this.applyFilters();
  }

  isTimeActive(preset: 'morning' | 'evening'): boolean {
    const dep = this.filters.departureTime;
    if (preset === 'morning') return dep.from === 6 && dep.to === 12;
    if (preset === 'evening') return dep.from === 18 && dep.to === 24;
    return false;
  }

  onSortChange(): void {
    // Handled automatically via computed signal
  }

  toggleCompareMode(): void {
    this.compareMode.update(v => !v);
    this.selectedCompareFlights.set([]);
  }

  isFlightInCompareList(flight: Flight): boolean {
    return this.selectedCompareFlights().some(f => f.id === flight.id);
  }

  onCompareToggle(flight: Flight, checked: boolean): void {
    const list = [...this.selectedCompareFlights()];
    if (checked) {
      if (list.length >= 3) {
        this.notify.warning('You can compare a maximum of 3 flights.');
        return;
      }
      list.push(flight);
    } else {
      const idx = list.findIndex(f => f.id === flight.id);
      if (idx > -1) list.splice(idx, 1);
    }
    this.selectedCompareFlights.set(list);
  }

  getFormattedDuration(mins: number): string {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  }

  selectFlight(flight: Flight): void {
    this.flightService.selectedFlight.set(flight);
    this.router.navigate(['/flight', flight.id]);
  }
}
