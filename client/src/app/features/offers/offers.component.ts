import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../core/services/notification.service';

interface TravelOffer {
  id: string;
  category: 'flights' | 'banks' | 'partners';
  title: string;
  description: string;
  code: string;
  expiry: string;
  discount: string;
  badge: string;
}

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="offers-page container section">
      <!-- Page Header -->
      <div class="offers-header text-center animate-fadeIn">
        <span class="badge badge-primary mb-sm">Exclusive Savings</span>
        <h1 class="page-title">Travel Offers & <span>Promo Codes</span></h1>
        <p class="page-subtitle">Unlock unmatched discounts on flights, partner airlines, and bank card transactions.</p>
        
        <!-- Filter Tabs -->
        <div class="filter-tabs flex-center gap-sm mt-lg">
          <button class="filter-tab" [class.active]="activeTab() === 'all'" (click)="activeTab.set('all')">All Deals</button>
          <button class="filter-tab" [class.active]="activeTab() === 'flights'" (click)="activeTab.set('flights')">Flights</button>
          <button class="filter-tab" [class.active]="activeTab() === 'banks'" (click)="activeTab.set('banks')">Bank Cards</button>
          <button class="filter-tab" [class.active]="activeTab() === 'partners'" (click)="activeTab.set('partners')">Partners</button>
        </div>
      </div>

      <!-- Offers Grid -->
      <div class="offers-grid mt-2xl">
        <div class="offer-card glass-card premium-card" *ngFor="let offer of filteredOffers()" [class.animate-fadeInUp]="true">
          <div class="card-glow"></div>
          <div class="offer-badge" [class]="offer.category">{{ offer.badge }}</div>
          
          <div class="offer-content">
            <span class="discount-amount">{{ offer.discount }}</span>
            <h3>{{ offer.title }}</h3>
            <p>{{ offer.description }}</p>
          </div>

          <div class="offer-footer flex-between">
            <div class="promo-box">
              <span class="expiry">Expires: {{ offer.expiry }}</span>
              <div class="code-wrapper flex-start" (click)="copyCode(offer.code)">
                <code class="promo-code">{{ offer.code }}</code>
                <mat-icon class="copy-icon">content_copy</mat-icon>
              </div>
            </div>
            <a routerLink="/search" class="btn-gradient btn-sm">Book Now</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .offers-page {
      padding-top: var(--space-4xl);
      min-height: 80vh;
    }

    .offers-header {
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
    .offers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: var(--space-xl);
    }

    .offer-card {
      position: relative;
      overflow: hidden;
      padding: var(--space-xl) !important;
      display: flex;
      flex-direction: column;
      height: 100%;
      border-radius: var(--border-radius-lg);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-6px);
        border-color: var(--color-primary-light);
        box-shadow: var(--shadow-lg);

        .card-glow {
          opacity: 0.15;
        }
      }
    }

    .card-glow {
      position: absolute;
      top: -50%; left: -50%;
      width: 200%; height: 200%;
      background: radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }

    .offer-badge {
      position: absolute;
      top: 16px; right: 16px;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      text-transform: uppercase;

      &.flights { background: rgba(21, 101, 192, 0.1); color: var(--color-primary); }
      &.banks { background: rgba(255, 109, 0, 0.1); color: var(--color-warning); }
      &.partners { background: rgba(0, 200, 83, 0.1); color: var(--color-success); }
    }

    .discount-amount {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--color-primary);
      display: block;
      margin-bottom: var(--space-sm);
    }

    .offer-content {
      margin-bottom: var(--space-xl);

      h3 {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: var(--space-xs);
      }

      p {
        font-size: 0.85rem;
        color: var(--text-secondary);
        line-height: 1.5;
      }
    }

    .offer-footer {
      margin-top: auto;
      border-top: 1px solid var(--border-color);
      padding-top: var(--space-md);
    }

    .promo-box {
      .expiry {
        display: block;
        font-size: 0.72rem;
        color: var(--text-muted);
        margin-bottom: 4px;
      }
    }

    .code-wrapper {
      background: var(--bg-primary);
      border: 1px dashed var(--border-color);
      padding: 4px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all var(--transition-fast);

      &:hover {
        background: rgba(21, 101, 192, 0.08);
        border-color: var(--color-primary);
      }
    }

    .promo-code {
      font-family: monospace;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-primary-dark);
    }

    .copy-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: var(--text-secondary);
    }
  `]
})
export class OffersComponent {
  notify = inject(NotificationService);
  activeTab = signal<'all' | 'flights' | 'banks' | 'partners'>('all');

  offersList: TravelOffer[] = [
    {
      id: 'o1',
      category: 'flights',
      title: 'Europe Summer Getaway',
      description: 'Book international flight tickets to major European cities and receive flat 20% discount on base fares.',
      code: 'EUROPE20',
      expiry: '15th July 2026',
      discount: '20% OFF',
      badge: 'Summer Sale'
    },
    {
      id: 'o2',
      category: 'banks',
      title: 'Axis Bank Credit Cards Special',
      description: 'Get instant cashback discount on minimum bookings of ₹15,000 using Axis Bank credit cards.',
      code: 'AXIS3000',
      expiry: '31st July 2026',
      discount: '₹3,000 OFF',
      badge: 'Bank Card'
    },
    {
      id: 'o3',
      category: 'flights',
      title: 'Welcome First-Flyer Discount',
      description: 'Create a new SkyWings account and get flat discounts on your very first domestic booking.',
      code: 'WELCOME200',
      expiry: '31st Dec 2026',
      discount: '₹2,000 OFF',
      badge: 'First Booking'
    },
    {
      id: 'o4',
      category: 'partners',
      title: 'Emirates Companion Promo',
      description: 'Fly Premium with Emirates! Book companion seat tickets and avail flat 50% discount on second ticket.',
      code: 'EMIRATES2X',
      expiry: '10th August 2026',
      discount: 'Companion 50%',
      badge: 'Partner Deal'
    },
    {
      id: 'o5',
      category: 'banks',
      title: 'HDFC Instant UPI Cashback',
      description: 'Pay instantly via UPI using HDFC Mobile banking app and receive flat cashback on checkout.',
      code: 'HDFCUPI',
      expiry: '30th Sept 2026',
      discount: '₹1,500 BACK',
      badge: 'UPI Cashback'
    },
    {
      id: 'o6',
      category: 'partners',
      title: 'Singapore Stopover Free Hotel',
      description: 'Book flights to Australia via Singapore and enjoy a free 1-night premium transit hotel stay.',
      code: 'SIAFREE',
      expiry: '31st August 2026',
      discount: 'FREE STAY',
      badge: 'Free Hotel'
    }
  ];

  filteredOffers() {
    const tab = this.activeTab();
    if (tab === 'all') return this.offersList;
    return this.offersList.filter(o => o.category === tab);
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code);
    this.notify.success(`Promo code "${code}" copied to clipboard!`);
  }
}
