import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page container">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <span class="auth-logo">✈️</span>
          <h2>Create SkyWings Account</h2>
          <p>Get ₹500 welcome bonus credited instantly to your wallet!</p>
        </div>

        <form (ngSubmit)="onRegister()" class="auth-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="name" name="name" required placeholder="Alex Johnson" class="custom-input">
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="alex@example.com" class="custom-input">
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" [(ngModel)]="phone" name="phone" placeholder="+91 9876543210" class="custom-input">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••" class="custom-input">
          </div>

          <div *ngIf="errorMessage" class="error-alert">
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary auth-btn">
            {{ loading ? 'Creating Account...' : 'REGISTER ACCOUNT ➔' }}
          </button>

          <div class="auth-footer">
            <span>Already have an account? <a routerLink="/login">Sign In</a></span>
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
    .auth-header p { color: var(--primary-accent); font-size: 0.85rem; font-weight: 600; margin-top: 4px; }

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
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);

  name: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  onRegister() {
    this.loading = true;
    this.errorMessage = '';

    const payload = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: 'customer'
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed';
      }
    });
  }
}
