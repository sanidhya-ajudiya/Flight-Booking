import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
    MatButtonModule, MatIconModule, MatMenuModule,
    MatBadgeModule, MatTooltipModule, MatDividerModule
  ],
  template: `
    <header class="header" [class.scrolled]="isScrolled()" [class.dark]="theme.isDark()" [class.on-hero]="isLanding() && !isScrolled()">
      <div class="header-inner container">
        <!-- Logo -->
        <a routerLink="/" class="logo" aria-label="SkyWings Home">
          <div class="logo-icon">✈️</div>
          <div class="logo-text">
            <span class="logo-name">SkyWings</span>
            <span class="logo-tagline">Fly Premium</span>
          </div>
        </a>

        <!-- Desktop Nav -->
        <nav class="nav-links" aria-label="Main navigation">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Home</a>
          <a routerLink="/search" routerLinkActive="active" class="nav-link">Flights</a>
          <a routerLink="/destinations" routerLinkActive="active" class="nav-link">Destinations</a>
          <a routerLink="/offers" routerLinkActive="active" class="nav-link">Offers</a>
          <a routerLink="/admin" routerLinkActive="active" class="nav-link" *ngIf="auth.isAdmin()">Admin</a>
        </nav>

        <!-- Actions -->
        <div class="header-actions">
          <!-- Currency Selector -->
          <button mat-button class="currency-btn" [matMenuTriggerFor]="currencyMenu">
            <span class="currency-symbol">{{ currencySymbols[theme.currency()] }}</span>
            {{ theme.currency() }}
          </button>
          <mat-menu #currencyMenu="matMenu" class="glass-menu">
            <button mat-menu-item *ngFor="let c of currencies" (click)="theme.setCurrency(c.code)">
              {{ c.symbol }} {{ c.code }} – {{ c.name }}
            </button>
          </mat-menu>



          <!-- Notifications (if logged in) -->
          <button mat-icon-button class="notif-btn" *ngIf="auth.isLoggedIn()"
                  [matBadge]="3" matBadgeColor="warn" matTooltip="Notifications">
            <mat-icon>notifications</mat-icon>
          </button>

          <!-- User Menu -->
          <div *ngIf="auth.isLoggedIn(); else loginBtn">
            <button mat-button class="user-btn" [matMenuTriggerFor]="userMenu">
              <span class="user-avatar">
                {{ getUserInitials() }}
              </span>
              <span class="user-name">{{ auth.currentUser()?.firstName }}</span>
              <mat-icon>keyboard_arrow_down</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu" class="glass-menu user-menu">
              <div class="user-menu-header">
                <div class="user-menu-avatar">{{ getUserInitials() }}</div>
                <div>
                  <div class="user-menu-name">{{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</div>
                  <div class="user-menu-email">{{ auth.currentUser()?.email }}</div>
                </div>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/dashboard">
                <mat-icon>dashboard</mat-icon> My Dashboard
              </button>
              <button mat-menu-item routerLink="/dashboard/bookings">
                <mat-icon>flight_takeoff</mat-icon> My Bookings
              </button>
              <button mat-menu-item routerLink="/dashboard/profile">
                <mat-icon>person</mat-icon> Profile Settings
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="auth.logout()" class="logout-item">
                <mat-icon>logout</mat-icon> Sign Out
              </button>
            </mat-menu>
          </div>

          <ng-template #loginBtn>
            <div class="auth-btns">
              <a routerLink="/auth/login" class="btn-outline btn-sm">Sign In</a>
              <a routerLink="/auth/register" class="btn-gradient btn-sm">Sign Up</a>
            </div>
          </ng-template>

          <!-- Mobile Menu Toggle -->
          <button mat-icon-button class="mobile-menu-btn" (click)="toggleMobileMenu()" aria-label="Toggle menu">
            <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" [class.open]="mobileMenuOpen()">
        <a routerLink="/" (click)="closeMobileMenu()" class="mobile-nav-link">🏠 Home</a>
        <a routerLink="/search" (click)="closeMobileMenu()" class="mobile-nav-link">✈️ Flights</a>
        <a routerLink="/destinations" (click)="closeMobileMenu()" class="mobile-nav-link">🌍 Destinations</a>
        <a routerLink="/offers" (click)="closeMobileMenu()" class="mobile-nav-link">🎁 Offers</a>
        <div class="mobile-auth" *ngIf="!auth.isLoggedIn()">
          <a routerLink="/auth/login" (click)="closeMobileMenu()" class="btn-outline w-full">Sign In</a>
          <a routerLink="/auth/register" (click)="closeMobileMenu()" class="btn-gradient w-full text-center">Sign Up</a>
        </div>
        <div class="mobile-user" *ngIf="auth.isLoggedIn()">
          <a routerLink="/dashboard" (click)="closeMobileMenu()" class="mobile-nav-link">📊 Dashboard</a>
          <a routerLink="/dashboard/bookings" (click)="closeMobileMenu()" class="mobile-nav-link">🎫 My Bookings</a>
          <button class="mobile-nav-link logout" (click)="auth.logout()">🚪 Sign Out</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: var(--z-sticky);
      background: transparent;
      transition: all var(--transition-base);
      padding: 8px 0;

      &.scrolled {
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--glass-border);
        box-shadow: var(--shadow-md);
        padding: 4px 0;
      }

      &.on-hero {
        .logo-name {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .logo-tagline {
          color: rgba(255, 255, 255, 0.75) !important;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.9) !important;
          &:hover, &.active {
            color: #ffffff !important;
            background: rgba(255, 255, 255, 0.15) !important;
          }
          &::after {
            background: #ffffff !important;
          }
        }

        .currency-btn {
          color: rgba(255, 255, 255, 0.9) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }

        .theme-toggle {
          color: rgba(255, 255, 255, 0.9) !important;
          &:hover {
            color: #ffffff !important;
          }
        }

        .notif-btn {
          color: rgba(255, 255, 255, 0.9) !important;
        }

        .user-btn {
          color: rgba(255, 255, 255, 0.9) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
          mat-icon { color: rgba(255, 255, 255, 0.9) !important; }
        }

        .user-name {
          color: rgba(255, 255, 255, 0.9) !important;
        }

        .auth-btns .btn-outline {
          color: #ffffff !important;
          border-color: #ffffff !important;
          &:hover {
            background: #ffffff !important;
            color: var(--color-primary) !important;
          }
        }

        .mobile-menu-btn {
          color: #ffffff !important;
        }
      }
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;

      .logo-icon {
        font-size: 28px;
        animation: planeWiggle 3s ease-in-out infinite;
      }

      .logo-text {
        display: flex;
        flex-direction: column;
        line-height: 1.1;
      }

      .logo-name {
        font-size: 1.4rem;
        font-weight: 800;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .logo-tagline {
        font-size: 0.65rem;
        font-weight: 500;
        color: var(--text-secondary);
        letter-spacing: 2px;
        text-transform: uppercase;
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;

      @media (max-width: 900px) { display: none; }
    }

    .nav-link {
      padding: 8px 16px;
      border-radius: 50px;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-primary);
      text-decoration: none;
      transition: all var(--transition-fast);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 2px;
        background: var(--gradient-primary);
        border-radius: 2px;
        transition: width var(--transition-base);
      }

      &:hover, &.active {
        color: var(--color-primary);
        background: var(--bg-overlay);

        &::after { width: 60%; }
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .currency-btn {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      border-radius: 50px;
      padding: 4px 12px !important;
      height: 34px;
      line-height: 1;

      .currency-symbol { margin-right: 2px; }

      @media (max-width: 768px) { display: none; }
    }

    .theme-toggle {
      color: var(--text-secondary);
      transition: transform var(--transition-spring), color var(--transition-fast);

      &:hover {
        color: var(--color-primary);
        transform: rotate(20deg) scale(1.1);
      }
    }

    .user-btn {
      border-radius: 50px;
      padding: 4px 12px !important;
      border: 1px solid var(--border-color);
      font-weight: 500;

      ::ng-deep .mdc-button__label {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      @media (max-width: 600px) {
        .user-name, mat-icon:last-child { display: none; }
      }
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--gradient-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-name {
      font-size: 0.9rem;
      color: var(--text-primary);
    }

    .auth-btns {
      display: flex;
      align-items: center;
      gap: 10px;

      @media (max-width: 600px) {
        .btn-outline { display: none; }
      }
    }

    .btn-sm {
      padding: 8px 18px !important;
      font-size: 0.85rem !important;
    }

    .mobile-menu-btn {
      display: none;
      color: var(--text-primary);

      @media (max-width: 900px) { display: flex; }
    }

    // Mobile Menu
    .mobile-menu {
      max-height: 0;
      overflow: hidden;
      transition: max-height var(--transition-slow);
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);

      &.open {
        max-height: 500px;
      }

      @media (min-width: 901px) { display: none; }
    }

    .mobile-nav-link {
      display: block;
      padding: 14px 24px;
      color: var(--text-primary);
      text-decoration: none;
      font-weight: 500;
      font-size: 1rem;
      border-bottom: 1px solid var(--border-color);
      transition: background var(--transition-fast), color var(--transition-fast);
      background: none;
      border-left: none;
      border-right: none;
      text-align: left;
      width: 100%;
      cursor: pointer;
      font-family: var(--font-family);

      &:hover { background: var(--bg-overlay); color: var(--color-primary); }

      &.logout { color: var(--color-warn); }
    }

    .mobile-auth, .mobile-user {
      padding: 16px 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    // User menu styles
    .user-menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }

    .user-menu-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--gradient-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 700;
    }

    .user-menu-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.95rem;
    }

    .user-menu-email {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .logout-item { color: var(--color-warn) !important; }
  `]
})
export class HeaderComponent {
  isScrolled = signal(false);
  mobileMenuOpen = signal(false);
  isLanding = signal(true);

  theme = inject(ThemeService);
  auth  = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.isLanding.set(this.router.url === '/' || this.router.url === '');
    this.router.events.subscribe(() => {
      const url = this.router.url.split('?')[0];
      this.isLanding.set(url === '/' || url === '');
    });
  }

  currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  ] as const;

  currencySymbols: Record<string, string> = {
    INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ'
  };

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
  }

  getUserInitials(): string {
    const user = this.auth.currentUser();
    if (!user) return 'U';
    return (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
