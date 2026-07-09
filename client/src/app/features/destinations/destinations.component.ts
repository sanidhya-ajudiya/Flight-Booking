import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlightService } from '../../core/services/flight.service';
import { Airport, SearchParams } from '../../core/models';

interface HolidayDestination {
  city: string;
  country: string;
  code: string;
  rating: number;
  price: number;
  image: string;
  region: 'asia' | 'europe' | 'middle_east' | 'americas';
  description: string;
}

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="destinations-page container section">
      <!-- Page Header -->
      <div class="destinations-header text-center animate-fadeIn">
        <span class="badge badge-primary mb-sm">Inspirational Travel</span>
        <h1 class="page-title">Explore <span>Popular Destinations</span></h1>
        <p class="page-subtitle">Wanderlust starts here. Book direct flights to iconic cities at exclusive premium rates.</p>
        
        <!-- Filter Tabs -->
        <div class="filter-tabs flex-center gap-sm mt-lg">
          <button class="filter-tab" [class.active]="activeTab() === 'all'" (click)="activeTab.set('all')">All Regions</button>
          <button class="filter-tab" [class.active]="activeTab() === 'asia'" (click)="activeTab.set('asia')">Asia</button>
          <button class="filter-tab" [class.active]="activeTab() === 'europe'" (click)="activeTab.set('europe')">Europe</button>
          <button class="filter-tab" [class.active]="activeTab() === 'middle_east'" (click)="activeTab.set('middle_east')">Middle East</button>
          <button class="filter-tab" [class.active]="activeTab() === 'americas'" (click)="activeTab.set('americas')">Americas</button>
        </div>
      </div>

      <!-- Destinations Grid -->
      <div class="destinations-grid mt-2xl">
        <div class="destination-card premium-card glass-card" *ngFor="let dest of filteredDestinations()" [class.animate-fadeInUp]="true">
          <div class="dest-img" [style.background-image]="'url(' + dest.image + ')'">
            <div class="dest-badge flex-between">
              <span class="badge badge-success">★ {{ dest.rating }}</span>
              <span class="dest-code">{{ dest.code }}</span>
            </div>
          </div>
          
          <div class="dest-body">
            <h3>{{ dest.city }}, {{ dest.country }}</h3>
            <p class="desc">{{ dest.description }}</p>
            
            <div class="dest-footer flex-between">
              <span class="price-lbl">Fares from <strong>₹{{ dest.price | number }}</strong></span>
              <button class="btn-gradient btn-sm" (click)="bookFlights(dest)">Book Flights</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .destinations-page {
      padding-top: var(--space-4xl);
      min-height: 80vh;
    }

    .destinations-header {
      max-width: 700px;
      margin: 0 auto var(--space-2xl);
    }

    .page-title {
      font-size: var(--font-size-4xl);
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: var(--space-sm);

      span {
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .page-subtitle {
      font-size: var(--font-size-md);
      color: var(--text-secondary);
    }

    // Filter tabs
    .filter-tabs {
      background: var(--bg-card);
      padding: 4px;
      border-radius: 50px;
      border: 1px solid var(--border-color);
      display: inline-flex;
    }

    .filter-tab {
      background: none;
      border: none;
      padding: 8px 20px;
      border-radius: 50px;
      font-family: var(--font-family);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover {
        color: var(--color-primary);
      }

      &.active {
        background: var(--gradient-primary);
        color: white;
        box-shadow: var(--shadow-sm);
      }
    }

    // Grid
    .destinations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: var(--space-xl);
    }

    .destination-card {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      border-radius: var(--border-radius-lg);
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-6px);
        border-color: var(--color-primary-light);
        box-shadow: var(--shadow-lg);

        .dest-img::before {
          background: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.3));
        }
      }
    }

    .dest-img {
      height: 220px;
      background-size: cover;
      background-position: center;
      padding: var(--space-md);
      position: relative;
      transition: background-image 0.4s ease;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.45));
        transition: background 0.3s ease;
      }

      .dest-badge {
        position: relative;
        z-index: 2;
        .dest-code { color: white; font-weight: 700; font-size: 1.15rem; letter-spacing: 0.5px; }
      }
    }

    .dest-body {
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: var(--space-xs);
      }

      .desc {
        font-size: 0.85rem;
        color: var(--text-secondary);
        line-height: 1.5;
        margin-bottom: var(--space-lg);
      }
    }

    .dest-footer {
      margin-top: auto;
      border-top: 1px solid var(--border-color);
      padding-top: var(--space-md);
    }

    .price-lbl {
      font-size: 0.8rem;
      color: var(--text-secondary);
      strong { font-size: 1.25rem; color: var(--color-primary); font-weight: 800; }
    }
  `]
})
export class DestinationsComponent {
  private flightService = inject(FlightService);
  private router = inject(Router);

  activeTab = signal<'all' | 'asia' | 'europe' | 'middle_east' | 'americas'>('all');

  destinationsList: HolidayDestination[] = [
    {
      city: 'Dubai',
      country: 'UAE',
      code: 'DXB',
      rating: 4.9,
      price: 24500,
      image: 'assets/images/dubai.jpg',
      region: 'middle_east',
      description: 'Experience ultra-modern architectures, luxury shopping, and exciting desert safaris.'
    },
    {
      city: 'Singapore',
      country: 'Singapore',
      code: 'SIN',
      rating: 4.8,
      price: 22000,
      image: 'assets/images/singapore.jpg',
      region: 'asia',
      description: 'A global financial hub famous for clean streets, Marina Bay Sands, and tropical gardens.'
    },
    {
      city: 'London',
      country: 'UK',
      code: 'LHR',
      rating: 4.7,
      price: 55000,
      image: 'assets/images/london.jpg',
      region: 'europe',
      description: 'Discover rich historic landmarks, royal palaces, Big Ben, and world-class theatrical arts.'
    },
    {
      city: 'Paris',
      country: 'France',
      code: 'CDG',
      rating: 4.8,
      price: 49000,
      image: 'assets/images/paris.jpg',
      region: 'europe',
      description: 'The romantic city of lights, renowned for art, fashion, gastronomy, and Eiffel Tower views.'
    },
    {
      city: 'Tokyo',
      country: 'Japan',
      code: 'NRT',
      rating: 4.9,
      price: 42000,
      image: 'assets/images/tokyo.jpg',
      region: 'asia',
      description: 'Neon skyscrapers blended with historic temples, gourmet sushi, and futuristic tech.'
    },
    {
      city: 'Bangkok',
      country: 'Thailand',
      code: 'BKK',
      rating: 4.6,
      price: 15000,
      image: 'assets/images/bangkok.jpg',
      region: 'asia',
      description: 'Vibrant street life, ornate shrines, floating markets, and famous thai massages.'
    },
    {
      city: 'New York',
      country: 'USA',
      code: 'JFK',
      rating: 4.8,
      price: 68000,
      image: 'assets/images/newyork.jpg',
      region: 'americas',
      description: 'The city that never sleeps. Explore Times Square, Broadway, Central Park, and Statue of Liberty.'
    },
    {
      city: 'Bali',
      country: 'Indonesia',
      code: 'DPS',
      rating: 4.7,
      price: 19500,
      image: 'assets/images/bali.jpg',
      region: 'asia',
      description: 'An island paradise of forested volcanic mountains, iconic beaches, and spiritual retreats.'
    }
  ];

  filteredDestinations() {
    const tab = this.activeTab();
    if (tab === 'all') return this.destinationsList;
    return this.destinationsList.filter(d => d.region === tab);
  }

  bookFlights(dest: HolidayDestination): void {
    // Find the airport object from our FlightService list matching code
    const matchingAirport = this.flightService.airports.find(a => a.code === dest.code) || {
      code: dest.code,
      name: `${dest.city} Airport`,
      city: dest.city,
      country: dest.country
    };

    const origin = this.flightService.airports[0]; // BOM
    const params: SearchParams = {
      tripType: 'one-way',
      origin,
      destination: matchingAirport as Airport,
      departureDate: new Date(),
      returnDate: null,
      passengers: { adults: 1, children: 0, infants: 0 },
      cabinClass: 'economy'
    };

    this.flightService.isSearching.set(true);
    this.flightService.searchFlights(params).subscribe(flights => {
      this.flightService.searchResults.set(flights);
      this.flightService.isSearching.set(false);
      this.router.navigate(['/results']);
    });
  }
}
