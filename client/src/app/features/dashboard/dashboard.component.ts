import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard-shell container">
      <div class="dashboard-grid">
        <!-- Sidebar Navigation -->
        <aside class="dashboard-sidebar glass flex-col">
          <div class="user-block text-center flex-col gap-sm">
            <div class="avatar-circle">
              {{ getUserInitials() }}
            </div>
            <h3 class="user-name">{{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</h3>
            <span class="user-email">{{ auth.currentUser()?.email }}</span>
          </div>

          <nav class="sidebar-nav flex-col gap-xs">
            <a routerLink="bookings" routerLinkActive="active" class="nav-item flex-start gap-md">
              <mat-icon>flight_takeoff</mat-icon>
              <span>My Bookings</span>
            </a>
            <a routerLink="profile" routerLinkActive="active" class="nav-item flex-start gap-md">
              <mat-icon>person</mat-icon>
              <span>Profile Settings</span>
            </a>
            <button class="nav-item logout-btn flex-start gap-md w-full" (click)="auth.logout()">
              <mat-icon>logout</mat-icon>
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        <!-- Main Dashboard Viewport -->
        <main class="dashboard-content">
          <!-- Stats Summary widgets -->
          <div class="stats-grid mb-xl">
            <div class="stat-card glass flex-between">
              <div>
                <span class="label">Total Trips</span>
                <h3>4</h3>
              </div>
              <span class="icon">✈️</span>
            </div>

            <div class="stat-card glass flex-between">
              <div>
                <span class="label">SkyMiles Reward</span>
                <h3>12,450</h3>
              </div>
              <span class="icon">⭐</span>
            </div>

            <div class="stat-card glass flex-between">
              <div>
                <span class="label">Wishlist Flights</span>
                <h3>2</h3>
              </div>
              <span class="icon">❤️</span>
            </div>
          </div>

          <!-- Nested Router Outlet -->
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-shell {
      padding-top: var(--space-4xl);
      padding-bottom: var(--space-4xl);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: var(--space-xl);

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    // Sidebar
    .dashboard-sidebar {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: var(--space-xl);
      height: fit-content;
      position: sticky;
      top: 90px;
    }

    .user-block {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: var(--space-lg);
      margin-bottom: var(--space-lg);

      .avatar-circle {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--gradient-primary);
        color: white;
        font-size: 20px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        box-shadow: var(--shadow-sm);
      }

      .user-name { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
      .user-email { font-size: 0.75rem; color: var(--text-secondary); }
    }

    .sidebar-nav {
      .nav-item {
        padding: 12px var(--space-md);
        border-radius: var(--border-radius-md);
        color: var(--text-secondary);
        font-weight: 600;
        font-size: 0.9rem;
        text-decoration: none;
        transition: all var(--transition-fast);
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;

        mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--text-muted); }

        &:hover, &.active {
          background: var(--bg-primary);
          color: var(--color-primary);
          mat-icon { color: var(--color-primary); }
        }
      }

      .logout-btn {
        color: var(--color-warn);
        margin-top: var(--space-lg);
        mat-icon { color: var(--color-warn); }
        &:hover { background: rgba(255, 23, 68, 0.05); }
      }
    }

    // Stats Grid
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-md);

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: var(--space-md) var(--space-lg) !important;
      border-radius: var(--border-radius-md) !important;

      .label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
      h3 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-top: 2px; }
      .icon { font-size: 32px; opacity: 0.8; }
    }
  `]
})
export class DashboardComponent {
  readonly auth = inject(AuthService);

  getUserInitials(): string {
    const user = this.auth.currentUser();
    if (!user) return 'U';
    return (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase();
  }
}
