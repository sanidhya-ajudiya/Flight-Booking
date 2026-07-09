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
import { MatTabsModule } from '@angular/material/tabs';

import { FlightService } from '../../core/services/flight.service';
import { Airport, SearchParams, CabinClass, TripType, PassengerCount } from '../../core/models';
import { PassengerCounterComponent } from '../../shared/components/passenger-counter/passenger-counter.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, FormsModule,
    MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatMenuModule, MatTabsModule, PassengerCounterComponent
  ],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero flex-center">
        <!-- Plane fly background animation -->
        <div class="sky-plane">✈️</div>
        
        <div class="container hero-content text-center animate-fadeInUp">
          <span class="badge badge-primary mb-auto">Elevate Your Travel Experience</span>
          <h1 class="hero-title">Discover the World <br>With <span>SkyWings</span></h1>
          <p class="hero-subtitle">Book flights to 500+ destinations with curated luxury and best-price guarantee.</p>
        </div>
      </section>

      <!-- Search Widget Container (Glassmorphism overlay) -->
      <section class="search-section container">
        <div class="search-widget glass">
          <!-- Trip Type Tabs -->
          <div class="widget-header flex-between flex-wrap gap-md">
            <div class="trip-tabs flex-start gap-sm">
              <button class="trip-tab" [class.active]="tripType === 'one-way'" (click)="setTripType('one-way')">
                <mat-icon>trending_flat</mat-icon> One Way
              </button>
              <button class="trip-tab" [class.active]="tripType === 'round-trip'" (click)="setTripType('round-trip')">
                <mat-icon>sync</mat-icon> Round Trip
              </button>
              <button class="trip-tab" [class.active]="tripType === 'multi-city'" (click)="setTripType('multi-city')">
                <mat-icon>call_split</mat-icon> Multi City
              </button>
            </div>

            <div class="extra-selectors flex-start gap-md">
              <!-- Passengers Dropdown -->
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

          <!-- Main Form -->
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form-grid">
            <!-- Origin -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>From</mat-label>
              <input type="text" matInput formControlName="originInput" [matAutocomplete]="originAuto" placeholder="Airport or City">
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
              <input type="text" matInput formControlName="destinationInput" [matAutocomplete]="destAuto" placeholder="Airport or City">
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

            <!-- Departure Date -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Departure Date</mat-label>
              <input matInput [matDatepicker]="depPicker" formControlName="departureDate">
              <mat-icon matPrefix>calendar_today</mat-icon>
              <mat-datepicker-toggle matSuffix [for]="depPicker"></mat-datepicker-toggle>
              <mat-datepicker #depPicker></mat-datepicker>
            </mat-form-field>

            <!-- Return Date (only if Round Trip) -->
            <mat-form-field appearance="outline" class="w-full" *ngIf="tripType === 'round-trip'">
              <mat-label>Return Date</mat-label>
              <input matInput [matDatepicker]="retPicker" formControlName="returnDate">
              <mat-icon matPrefix>calendar_today</mat-icon>
              <mat-datepicker-toggle matSuffix [for]="retPicker"></mat-datepicker-toggle>
              <mat-datepicker #retPicker></mat-datepicker>
            </mat-form-field>

            <!-- Submit -->
            <button type="submit" class="btn-gradient search-btn flex-center">
              <mat-icon>search</mat-icon> Search Flights
            </button>
          </form>
        </div>
      </section>

      <!-- Offers & Discounts -->
      <section id="offers" class="section container">
        <h2 class="section-title">Exclusive <span>Offers & Deals</span></h2>
        <p class="section-subtitle">Grab the best discounts on international & domestic flight bookings.</p>
        
        <div class="grid-3">
          <!-- Offer 1 -->
          <div class="offer-card premium-card glass">
            <div class="offer-badge">LIMITED</div>
            <h3>Save 20% on flights to Europe</h3>
            <p>Use coupon code <strong>EUROPE20</strong> at check out.</p>
            <span class="expiry">Valid till 15th July</span>
          </div>

          <!-- Offer 2 -->
          <div class="offer-card premium-card glass">
            <div class="offer-badge">UPI SPECIAL</div>
            <h3>Flat ₹1,500 Instant Cashback</h3>
            <p>Book flights using UPI payment methods.</p>
            <span class="expiry">Valid till 31st July</span>
          </div>

          <!-- Offer 3 -->
          <div class="offer-card premium-card glass">
            <div class="offer-badge">PARTNER</div>
            <h3>Fly Emirates & Earn 2x Miles</h3>
            <p>Exclusive rewards for SkyWings SkyPass holders.</p>
            <span class="expiry">Valid till 10th August</span>
          </div>
        </div>
      </section>

      <!-- Popular Destinations -->
      <section id="destinations" class="section container">
        <h2 class="section-title">Explore <span>Popular Destinations</span></h2>
        <p class="section-subtitle">Curated recommendations for your next unforgettable getaway.</p>

        <div class="grid-3">
          <div class="destination-card premium-card" *ngFor="let dest of popularDestinations">
            <div class="destination-img" [style.background-image]="'url(' + dest.image + ')'">
              <div class="dest-badge flex-between">
                <span class="badge badge-success">★ {{ dest.rating }}</span>
                <span class="dest-code">{{ dest.code }}</span>
              </div>
            </div>
            <div class="destination-body">
              <h3 class="dest-title">{{ dest.city }}, {{ dest.country }}</h3>
              <p class="dest-desc">Direct flight connections available.</p>
              <div class="dest-footer flex-between">
                <span class="dest-price">Fares from <strong>₹{{ dest.price | number }}</strong></span>
                <button class="btn-outline btn-sm" (click)="searchToDestination(dest)">Book Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Why Choose Us -->
      <section class="section container">
        <h2 class="section-title">Why Fly with <span>SkyWings</span></h2>
        <p class="section-subtitle">We craft premium experiences that make flight bookings absolute luxury.</p>

        <div class="grid-3">
          <div class="feature-box text-center glass-card">
            <div class="icon-circle secure">
              <mat-icon>shield</mat-icon>
            </div>
            <h3>Secure & Safe Bookings</h3>
            <p>PCI-DSS compliance with state-of-the-art refund guarantees and flexible cancel options.</p>
          </div>
          <div class="feature-box text-center glass-card">
            <div class="icon-circle checkout">
              <mat-icon>bolt</mat-icon>
            </div>
            <h3>Ultrafast Checkout</h3>
            <p>Save passenger details, auto-fill forms, and check out instantly using UPI or card flow.</p>
          </div>
          <div class="feature-box text-center glass-card">
            <div class="icon-circle recommend">
              <mat-icon>psychology</mat-icon>
            </div>
            <h3>AI Recommendations</h3>
            <p>Smart alerts, price-drop forecasts, and tailored routing suggested directly by our engine.</p>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="section container">
        <h2 class="section-title">Voices of Our <span>Happy Travelers</span></h2>
        <p class="section-subtitle">Here is why travelers select us for their global voyages.</p>

        <div class="grid-3">
          <div class="testimonial-card glass-card">
            <div class="quote-mark">“</div>
            <p class="quote">The seat-selection visual interface is outstanding. Easiest premium flight booking flow I have ever used!</p>
            <div class="user-info flex-start gap-md">
              <div class="avatar avatar-rk">RK</div>
              <div>
                <h4>Rohan Kapoor</h4>
                <span>Business Traveler</span>
              </div>
            </div>
          </div>
          <div class="testimonial-card glass-card">
            <div class="quote-mark">“</div>
            <p class="quote">I had to reschedule my trip to London and customer support sorted my refund and booking in minutes.</p>
            <div class="user-info flex-start gap-md">
              <div class="avatar avatar-sj">SJ</div>
              <div>
                <h4>Sarah Jenkins</h4>
                <span>Holiday Maker</span>
              </div>
            </div>
          </div>
          <div class="testimonial-card glass-card">
            <div class="quote-mark">“</div>
            <p class="quote">Highly recommend the UPI payment flows. Literally finished the payment check out in under 15 seconds.</p>
            <div class="user-info flex-start gap-md">
              <div class="avatar avatar-am">AM</div>
              <div>
                <h4>Aakash Mehta</h4>
                <span>Tech Lead</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page {
      padding-top: 0;
    }

    // Hero
    .hero {
      position: relative;
      height: 55vh;
      min-height: 400px;
      background: var(--gradient-hero);
      color: white;
      overflow: hidden;
      z-index: 1;

      .hero-content {
        max-width: 800px;
        z-index: 2;
      }

      .hero-title {
        font-size: 3.5rem;
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: var(--space-md);
        
        span {
          background: linear-gradient(135deg, #00B0FF, #ffffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @media (max-width: 768px) { font-size: 2.2rem; }
      }

      .hero-subtitle {
        font-size: 1.15rem;
        color: rgba(255,255,255,0.85);
        max-width: 600px;
        margin: 0 auto;
        font-weight: 400;

        @media (max-width: 768px) { font-size: 0.95rem; }
      }

      .sky-plane {
        position: absolute;
        font-size: 64px;
        top: 25%;
        left: -100px;
        animation: planeFly 25s linear infinite;
        z-index: 1;
        pointer-events: none;
      }
    }

    // Search section overlay
    .search-section {
      margin-top: -100px;
      position: relative;
      z-index: 10;
      margin-bottom: var(--space-xl);
    }

    .search-widget {
      padding: var(--space-xl);
      border-radius: var(--border-radius-xl);
      box-shadow: var(--shadow-xl);
      background: var(--bg-card);
      border: 1px solid var(--border-color);
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
        box-shadow: var(--shadow-sm);
      }
    }

    .pax-select-btn {
      border: 1px solid var(--border-color) !important;
      border-radius: 50px !important;
      font-size: 0.85rem !important;
      color: var(--text-secondary) !important;
      height: 38px !important;
      line-height: 38px !important;
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

    // Offers
    .offer-card {
      padding: var(--space-xl);
      border-radius: var(--border-radius-lg);
      position: relative;
      overflow: hidden;

      .offer-badge {
        position: absolute;
        top: 12px; right: 12px;
        background: var(--color-accent);
        color: white;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px;
        letter-spacing: 0.5px;
      }

      h3 { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-sm); }
      p { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: var(--space-md); }
      .expiry { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
    }

    // Destinations
    .destination-card {
      overflow: hidden;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
    }

    .destination-img {
      height: 200px;
      background-size: cover;
      background-position: center;
      padding: var(--space-md);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4));
      }

      .dest-badge {
        position: relative;
        z-index: 2;
        .dest-code { color: white; font-weight: 700; font-size: 1.1rem; }
      }
    }

    .destination-body {
      padding: var(--space-lg);
      .dest-title { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
      .dest-desc { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: var(--space-lg); }
    }

    .dest-price {
      font-size: 0.8rem;
      color: var(--text-secondary);
      strong { font-size: 1.2rem; color: var(--color-primary); }
    }

    // Feature boxes
    .feature-box {
      padding: var(--space-xl) var(--space-lg);
      border-radius: var(--border-radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      
      .icon-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--space-md);
        box-shadow: var(--shadow-sm);

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
        }

        &.secure { background: rgba(21, 101, 192, 0.1); color: var(--color-primary); }
        &.checkout { background: rgba(255, 109, 0, 0.15); color: var(--color-warning); }
        &.recommend { background: rgba(106, 27, 154, 0.1); color: #6A1B9A; }
      }

      h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-sm); }
      p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.65; }
    }

    // Testimonials
    .testimonial-card {
      padding: var(--space-xl) !important;
      border-radius: var(--border-radius-lg);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;

      .quote-mark {
        position: absolute;
        top: -10px;
        left: 10px;
        font-size: 5rem;
        line-height: 1;
        color: rgba(21, 101, 192, 0.08);
        font-family: Georgia, serif;
        user-select: none;
        pointer-events: none;
      }

      .quote { 
        font-size: 0.9rem; 
        color: var(--text-secondary); 
        margin-bottom: var(--space-xl); 
        line-height: 1.6;
        position: relative;
        z-index: 2;
      }

      .user-info {
        margin-top: auto;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .avatar { 
        font-size: 0.82rem; 
        width: 42px; 
        height: 42px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-weight: 700;
        color: white;
        box-shadow: var(--shadow-sm);

        &.avatar-rk { background: linear-gradient(135deg, #1565C0, #42A5F5); }
        &.avatar-sj { background: linear-gradient(135deg, #FF6D00, #FFAB40); }
        &.avatar-am { background: linear-gradient(135deg, #00C853, #69F0AE); }
      }

      h4 { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0; }
      span { font-size: 0.78rem; color: var(--text-muted); }
    }
  `]
})
export class LandingComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private flightService = inject(FlightService);
  private notify = inject(NotificationService);

  tripType: TripType = 'one-way';
  cabinClass: CabinClass = 'economy';
  passengers: PassengerCount = { adults: 1, children: 0, infants: 0 };

  searchForm: FormGroup;
  popularDestinations = this.flightService.popularDestinations;

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

  searchToDestination(dest: any): void {
    const origin = this.flightService.airports[0]; // BOM
    const destination = this.flightService.airports.find(a => a.code === dest.code) || this.flightService.airports[8]; // DXB
    
    this.searchForm.patchValue({
      originInput: origin,
      destinationInput: destination
    });
    this.onSearch();
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      this.notify.warning('Please fill in all search fields.');
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
