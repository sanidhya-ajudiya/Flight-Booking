import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-page flex-center">
      <div class="auth-card glass-card animate-fadeInUp">
        <div class="auth-header text-center">
          <div class="logo-icon">✈️</div>
          <h2>Create Account</h2>
          <p>Join SkyWings and get 15% off your first booking.</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form flex-col gap-md">
          <!-- First Name & Last Name -->
          <div class="grid-2 gap-sm">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName">
              <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName">
              <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>

          <!-- Email -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Invalid email address</mat-error>
          </mat-form-field>

          <!-- Phone -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Phone Number</mat-label>
            <input matInput type="tel" formControlName="phone">
            <mat-icon matPrefix>phone</mat-icon>
            <mat-error *ngIf="registerForm.get('phone')?.hasError('required')">Phone is required</mat-error>
          </mat-form-field>

          <!-- Password -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password">
            <mat-icon matPrefix>lock</mat-icon>
            <button type="button" mat-icon-button matSuffix (click)="toggleHidePassword()" aria-label="Toggle password visibility">
              <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Minimum 6 characters required</mat-error>
          </mat-form-field>

          <!-- Submit Button -->
          <button type="submit" class="btn-gradient w-full mt-auto" [disabled]="registerForm.invalid || isLoading()">
            <span *ngIf="!isLoading()">Create Account</span>
            <span *ngIf="isLoading()" class="flex-center gap-sm">
              <span class="spinner-small"></span> Creating Account...
            </span>
          </button>
        </form>

        <div class="auth-footer text-center">
          <p>Already have an account? <a routerLink="/auth/login">Sign In</a></p>
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
      max-width: 480px;
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

    .gap-sm { gap: var(--space-sm); }

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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  hidePassword = signal(true);
  isLoading = this.authService.isLoading;

  registerForm: FormGroup;

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleHidePassword(): void {
    this.hidePassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.authService.register(this.registerForm.value).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
