import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar-header">
      <div class="container navbar-container">
        <!-- Logo -->
        <a routerLink="/" class="navbar-brand">
          <div class="brand-icon">✈️</div>
          <div class="brand-text">
            <span class="brand-name">SKYWINGS</span>
            <span class="brand-sub">AIRLINES</span>
          </div>
        </a>

        <!-- Nav Links -->
        <nav class="nav-menu">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Book Flight</a>
          <a routerLink="/search" routerLinkActive="active" class="nav-link">Search Flights</a>
          <a *ngIf="authService.isLoggedIn()" routerLink="/my-bookings" routerLinkActive="active" class="nav-link">My Bookings</a>
          <a *ngIf="authService.isAdmin()" routerLink="/admin" routerLinkActive="active" class="nav-link admin-badge">Admin Portal</a>
        </nav>

        <!-- Right Action Controls -->
        <div class="navbar-actions">
          <!-- Theme Toggle Button -->
          <button (click)="themeService.toggleTheme()" class="icon-btn" [attr.aria-label]="'Toggle theme'">
            <span>{{ themeService.isDarkMode() ? '☀️' : '🌙' }}</span>
          </button>

          <!-- User Logged In State -->
          <ng-container *ngIf="authService.isLoggedIn(); else authButtons">
            <div class="user-wallet-chip" routerLink="/profile">
              <span class="wallet-icon">👛</span>
              <span class="wallet-amount">₹{{ authService.currentUser()?.walletBalance || 0 }}</span>
            </div>

            <div class="user-menu" routerLink="/profile">
              <img [src]="authService.currentUser()?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'" alt="Avatar" class="avatar-img">
              <span class="user-name">{{ authService.currentUser()?.name }}</span>
            </div>

            <button (click)="logout()" class="btn-logout" title="Logout">
              <span>🚪</span>
            </button>
          </ng-container>

          <ng-template #authButtons>
            <a routerLink="/login" class="btn-secondary">Sign In</a>
            <a routerLink="/register" class="btn-primary">Register</a>
          </ng-template>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
      height: 72px;
      display: flex;
      align-items: center;
    }

    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      font-size: 1.8rem;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-weight: 800;
      font-size: 1.25rem;
      letter-spacing: 1px;
      color: var(--text-primary);
    }

    .brand-sub {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--primary-accent);
      letter-spacing: 2px;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .nav-link {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-secondary);
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover, &.active {
        color: var(--primary-accent);
        background: rgba(2, 132, 199, 0.08);
      }

      &.admin-badge {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        font-weight: 700;
      }
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .icon-btn {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      cursor: pointer;

      &:hover {
        transform: scale(1.05);
      }
    }

    .user-wallet-chip {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
      padding: 6px 14px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-weight: 700;
      color: #16a34a;
      font-size: 0.85rem;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 20px;

      &:hover {
        background: var(--bg-primary);
      }
    }

    .avatar-img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--primary-accent);
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-primary);
    }

    .btn-logout {
      background: transparent;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;

      &:hover {
        background: rgba(239, 68, 68, 0.1);
      }
    }

    @media (max-width: 768px) {
      .nav-menu { display: none; }
      .brand-sub { display: none; }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  logout() {
    this.authService.logout();
  }
}
