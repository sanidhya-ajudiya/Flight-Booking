import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page container">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <span class="auth-logo">✈️</span>
          <h2>Sign In to SkyWings</h2>
          <p>Access your bookings, wallet rewards, and e-tickets</p>
        </div>

        <!-- Quick Demo Credentials Box -->
        <div class="demo-credentials">
          <p><strong>Demo Accounts:</strong></p>
          <div class="demo-buttons">
            <button (click)="fillDemo('customer')" class="btn-demo">User: user&#64;skywings.com</button>
            <button (click)="fillDemo('admin')" class="btn-demo admin">Admin: admin&#64;skywings.com</button>
          </div>
        </div>

        <form (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="user@skywings.com" class="custom-input">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••" class="custom-input">
          </div>

          <div *ngIf="errorMessage" class="error-alert">
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary auth-btn">
            {{ loading ? 'Authenticating...' : 'SIGN IN ➔' }}
          </button>

          <div class="auth-footer">
            <span>Don't have an account? <a routerLink="/register">Register now</a></span>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: center; min-height: 80vh; padding-top: 40px; }
    .auth-card { width: 100%; max-width: 440px; padding: 40px; }

    .auth-header { text-align: center; margin-bottom: 24px; }
    .auth-logo { font-size: 2.5rem; display: block; margin-bottom: 8px; }
    .auth-header h2 { font-size: 1.6rem; font-weight: 800; }
    .auth-header p { color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px; }

    .demo-credentials {
      background: rgba(2, 132, 199, 0.08);
      border: 1px solid rgba(2, 132, 199, 0.2);
      padding: 12px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 0.8rem;
    }

    .demo-buttons { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
    .btn-demo {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      padding: 6px 10px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      text-align: left;
      color: var(--primary-accent);

      &.admin { color: #ef4444; }
    }

    .auth-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); } }

    .custom-input {
      height: 46px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      color: var(--text-primary);
      padding: 0 14px;
      font-weight: 600;
    }

    .error-alert { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 10px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-align: center; }

    .auth-btn { justify-content: center; height: 48px; font-size: 0.95rem; }

    .auth-footer { text-align: center; margin-top: 10px; font-size: 0.88rem; a { color: var(--primary-accent); font-weight: 700; } }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  fillDemo(type: 'customer' | 'admin') {
    if (type === 'admin') {
      this.email = 'admin@skywings.com';
      this.password = 'admin123';
    } else {
      this.email = 'user@skywings.com';
      this.password = 'user123';
    }
  }

  onLogin() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (user) => {
        this.loading = false;
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid login credentials';
      }
    });
  }
}
