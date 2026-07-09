import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-page flex-center">
      <div class="auth-card glass-card animate-fadeInUp">
        <div class="auth-header text-center">
          <div class="logo-icon">🔑</div>
          <h2>Reset Password</h2>
          <p>Enter your email and we'll send you instructions to reset your password.</p>
        </div>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="auth-form flex-col gap-md" *ngIf="!submitted()">
          <!-- Email -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="e.g. arjun@example.com">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="forgotForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="forgotForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>

          <!-- Submit Button -->
          <button type="submit" class="btn-gradient w-full mt-auto" [disabled]="forgotForm.invalid">
            Send Reset Link
          </button>
        </form>

        <!-- Success Message -->
        <div class="success-message text-center animate-fadeIn" *ngIf="submitted()">
          <mat-icon class="success-icon">check_circle</mat-icon>
          <h3>Verification Link Sent</h3>
          <p>We've sent a password reset link to <strong>{{ forgotForm.value.email }}</strong>.</p>
        </div>

        <div class="auth-footer text-center">
          <p>Remember your password? <a routerLink="/auth/login">Sign In</a></p>
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

    .success-message {
      padding: var(--space-md) 0;

      .success-icon {
        font-size: 54px;
        width: 54px;
        height: 54px;
        color: var(--color-success);
        margin-bottom: var(--space-sm);
      }

      h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-xs); }
      p { font-size: 0.9rem; color: var(--text-secondary); }
    }

    .auth-footer {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: var(--space-md);
      a { font-weight: 600; }
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);

  forgotForm: FormGroup;
  submitted = signal(false);

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.notify.success('Reset link sent to ' + this.forgotForm.value.email);
    this.submitted.set(true);
  }
}
