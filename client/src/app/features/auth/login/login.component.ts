import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-page flex-center">
      <div class="auth-card glass-card animate-fadeInUp">
        <div class="auth-header text-center">
          <div class="logo-icon">✈️</div>
          <h2>Welcome Back</h2>
          <p>Sign in to manage bookings and checkout instantly.</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form flex-col gap-md">
          <!-- Email -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="e.g. arjun@example.com">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>

          <!-- Password -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password">
            <mat-icon matPrefix>lock</mat-icon>
            <button type="button" mat-icon-button matSuffix (click)="toggleHidePassword()" aria-label="Toggle password visibility">
              <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
          </mat-form-field>

          <!-- Forgot Password Link -->
          <div class="flex-between">
            <a routerLink="/auth/forgot-password" class="forgot-link">Forgot Password?</a>
            <a routerLink="/auth/otp-verify" class="forgot-link">Login via OTP</a>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn-gradient w-full mt-auto" [disabled]="loginForm.invalid || isLoading()">
            <span *ngIf="!isLoading()">Sign In</span>
            <span *ngIf="isLoading()" class="flex-center gap-sm">
              <span class="spinner-small"></span> Authenticating...
            </span>
          </button>
        </form>

        <!-- Social Login UI -->
        <div class="divider-text">or continue with</div>

        <div class="social-login-grid">
          <button class="social-btn google-btn" (click)="socialLogin('Google')">
            <span class="social-icon">🌐</span> Google
          </button>
          <button class="social-btn facebook-btn" (click)="socialLogin('Facebook')">
            <span class="social-icon">📘</span> Facebook
          </button>
        </div>

        <div class="auth-footer text-center">
          <p>Don't have an account? <a routerLink="/auth/register">Sign Up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 120px);
      padding: var(--space-xl);
      background: radial-gradient(circle at 50% 30%, rgba(21, 101, 192, 0.05) 0%, transparent 60%);
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: var(--space-2xl) !important;
    }

    .auth-header {
      margin-bottom: var(--space-xl);
      .logo-icon { font-size: 40px; margin-bottom: var(--space-sm); }
      h2 { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin-bottom: var(--space-xs); }
      p { font-size: 0.85rem; color: var(--text-secondary); }
    }

    .auth-form {
      margin-bottom: var(--space-lg);
    }

    .forgot-link {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .social-login-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
      margin: var(--space-lg) 0;
    }

    .social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      padding: 10px;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      background: var(--bg-card);
      font-family: var(--font-family);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover {
        background: var(--bg-primary);
        border-color: var(--color-primary-light);
        transform: translateY(-1px);
      }
    }

    .auth-footer {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: var(--space-md);
      a { font-weight: 600; }
    }

    .spinner-small {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s ease-in-out infinite;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  hidePassword = signal(true);
  isLoading = this.authService.isLoading;

  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['arjun@example.com', [Validators.required, Validators.email]],
      password: ['password', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleHidePassword(): void {
    this.hidePassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    this.authService.login(email, password).subscribe(() => {
      const destination = this.authService.isAdmin() ? '/admin' : (returnUrl || '/');
      this.router.navigateByUrl(destination);
    });
  }

  socialLogin(provider: string): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.authService.login(`${provider.toLowerCase()}user@example.com`, 'socialpass').subscribe(() => {
      this.router.navigateByUrl(returnUrl);
    });
  }
}
