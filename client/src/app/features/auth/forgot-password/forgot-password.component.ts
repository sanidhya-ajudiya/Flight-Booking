import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page container">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <span class="auth-logo">🔒</span>
          <h2>Password Recovery</h2>
          <p>Reset your password securely via OTP verification</p>
        </div>

        <!-- STEP 1: Request OTP -->
        <div *ngIf="step === 1">
          <form (ngSubmit)="onRequestOTP()" class="auth-form">
            <div class="form-group">
              <label>Registered Email Address</label>
              <input type="email" [(ngModel)]="email" name="email" required placeholder="user@skywings.com" class="custom-input">
            </div>

            <div *ngIf="infoMessage" class="info-alert">
              {{ infoMessage }}
            </div>

            <div *ngIf="errorMessage" class="error-alert">
              {{ errorMessage }}
            </div>

            <button type="submit" [disabled]="loading" class="btn-primary auth-btn">
              {{ loading ? 'Sending OTP...' : 'Send Verification OTP ➔' }}
            </button>

            <div class="auth-footer">
              <a routerLink="/login">Back to Sign In</a>
            </div>
          </form>
        </div>

        <!-- STEP 2: Verify OTP & Set New Password -->
        <div *ngIf="step === 2">
          <form (ngSubmit)="onResetPassword()" class="auth-form">
            <div class="otp-notice">
              <span>Code sent to: <strong>{{ email }}</strong></span>
              <button type="button" (click)="step = 1" class="btn-link">Change email</button>
            </div>

            <div class="form-group">
              <label>6-Digit Verification Code (OTP)</label>
              <input type="text" [(ngModel)]="otp" name="otp" required placeholder="123456" maxlength="6" class="custom-input otp-input">
            </div>

            <div class="form-group">
              <label>New Password</label>
              <input type="password" [(ngModel)]="newPassword" name="newPassword" required placeholder="Min 6 characters" class="custom-input">
            </div>

            <div class="form-group">
              <label>Confirm New Password</label>
              <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required placeholder="Re-enter password" class="custom-input">
            </div>

            <div *ngIf="infoMessage" class="info-alert">
              {{ infoMessage }}
            </div>

            <div *ngIf="errorMessage" class="error-alert">
              {{ errorMessage }}
            </div>

            <button type="submit" [disabled]="loading" class="btn-primary auth-btn">
              {{ loading ? 'Resetting Password...' : 'Set New Password ➔' }}
            </button>

            <div class="auth-footer">
              <a routerLink="/login">Remember password? Sign In</a>
            </div>
          </form>
        </div>

        <!-- STEP 3: Success Screen -->
        <div *ngIf="step === 3" class="success-screen">
          <span class="success-icon">✅</span>
          <h3>Password Reset Successful!</h3>
          <p>Your password has been securely updated. You can now log in with your new password.</p>
          <a routerLink="/login" class="btn-primary auth-btn" style="text-align: center; text-decoration: none;">Proceed to Sign In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: center; min-height: 80vh; padding-top: 40px; }
    .auth-card { width: 100%; max-width: 440px; padding: 40px; }
    .auth-header { text-align: center; margin-bottom: 24px; }
    .auth-logo { font-size: 2.5rem; display: block; margin-bottom: 8px; }
    .auth-header h2 { font-size: 1.6rem; font-weight: 700; margin-bottom: 6px; }
    .auth-header p { color: var(--text-muted); font-size: 0.9rem; margin: 0; }

    .auth-form { display: flex; flex-direction: column; gap: 18px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
    .otp-input { letter-spacing: 4px; font-size: 1.2rem; font-weight: bold; text-align: center; }

    .otp-notice { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px; }
    .btn-link { background: none; border: none; color: var(--primary); cursor: pointer; text-decoration: underline; font-size: 0.85rem; }

    .error-alert { padding: 10px 14px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; border-radius: 8px; font-size: 0.85rem; }
    .info-alert { padding: 10px 14px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 8px; font-size: 0.85rem; }

    .auth-btn { width: 100%; padding: 12px; margin-top: 4px; font-weight: 600; }
    .auth-footer { text-align: center; margin-top: 8px; font-size: 0.85rem; color: var(--text-muted); }
    .auth-footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
    .auth-footer a:hover { text-decoration: underline; }

    .success-screen { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 20px 0; }
    .success-icon { font-size: 3rem; }
    .success-screen h3 { margin: 0; font-size: 1.3rem; color: #4ade80; }
    .success-screen p { color: var(--text-muted); font-size: 0.9rem; margin: 0; }
  `]
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  step = 1;
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  errorMessage = '';
  infoMessage = '';

  onRequestOTP() {
    if (!this.email) {
      this.errorMessage = 'Please enter your registered email address';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.step = 2;
        this.infoMessage = res.message || 'OTP has been dispatched to your email.';
        if (res.otpDemo) {
          this.infoMessage += ` (Demo OTP: ${res.otpDemo})`;
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to send OTP. Please check your email.';
      }
    });
  }

  onResetPassword() {
    if (!this.otp || !this.newPassword) {
      this.errorMessage = 'Please enter the OTP and your new password';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.resetPassword({
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.step = 3;
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid or expired OTP';
      }
    });
  }
}
