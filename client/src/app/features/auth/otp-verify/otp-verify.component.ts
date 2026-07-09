import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-otp-verify',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-page flex-center">
      <div class="auth-card glass-card animate-fadeInUp">
        <div class="auth-header text-center">
          <div class="logo-icon">📱</div>
          <h2>OTP Verification</h2>
          <p *ngIf="!otpSent()">Enter your phone number to receive a one-time verification code.</p>
          <p *ngIf="otpSent()">We have sent a 6-digit OTP code to <strong>{{ phoneNo() }}</strong>.</p>
        </div>

        <!-- Phone Request Form -->
        <form [formGroup]="phoneForm" (ngSubmit)="sendOtp()" class="auth-form flex-col gap-md" *ngIf="!otpSent()">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Phone Number</mat-label>
            <input matInput type="tel" formControlName="phone" placeholder="e.g. 9876543210">
            <mat-icon matPrefix>phone</mat-icon>
            <mat-error *ngIf="phoneForm.get('phone')?.hasError('required')">Phone number is required</mat-error>
            <mat-error *ngIf="phoneForm.get('phone')?.hasError('pattern')">Enter valid 10-digit number</mat-error>
          </mat-form-field>

          <button type="submit" class="btn-gradient w-full mt-auto" [disabled]="phoneForm.invalid">
            Send OTP
          </button>
        </form>

        <!-- OTP Verify Form -->
        <form [formGroup]="otpForm" (ngSubmit)="verifyOtp()" class="auth-form flex-col gap-md" *ngIf="otpSent()">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Enter OTP Code</mat-label>
            <input matInput type="text" formControlName="code" maxLength="6" placeholder="e.g. 123456" class="otp-input">
            <mat-icon matPrefix>sms</mat-icon>
            <mat-error *ngIf="otpForm.get('code')?.hasError('required')">OTP Code is required</mat-error>
          </mat-form-field>

          <div class="flex-between">
            <span class="timer-text" *ngIf="timeLeft() > 0">Resend in {{ timeLeft() }}s</span>
            <button type="button" class="resend-btn" *ngIf="timeLeft() === 0" (click)="resendCode()">Resend OTP</button>
          </div>

          <button type="submit" class="btn-gradient w-full mt-auto" [disabled]="otpForm.invalid || isLoading()">
            <span *ngIf="!isLoading()">Verify & Login</span>
            <span *ngIf="isLoading()" class="flex-center gap-sm">
              <span class="spinner-small"></span> Verifying...
            </span>
          </button>
        </form>

        <div class="auth-footer text-center">
          <p>Prefer passwords? <a routerLink="/auth/login">Sign In</a></p>
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

    .otp-input {
      letter-spacing: 6px;
      font-size: 1.2rem;
      font-weight: 700;
      text-align: center;
    }

    .timer-text {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .resend-btn {
      background: none;
      border: none;
      color: var(--color-primary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
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
export class OtpVerifyComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  phoneForm: FormGroup;
  otpForm: FormGroup;

  otpSent = signal(false);
  phoneNo = signal('');
  timeLeft = signal(30);
  isLoading = signal(false);

  private timerInterval: any;

  constructor() {
    this.phoneForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]]
    });
    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.clearTimer();
  }

  sendOtp(): void {
    if (this.phoneForm.invalid) return;

    this.phoneNo.set(this.phoneForm.value.phone);
    this.otpSent.set(true);
    this.notify.success('OTP sent successfully!');
    this.startTimer();
  }

  startTimer(): void {
    this.timeLeft.set(30);
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.timeLeft.update(time => {
        if (time <= 1) {
          this.clearTimer();
          return 0;
        }
        return time - 1;
      });
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  resendCode(): void {
    this.notify.success('OTP has been resent.');
    this.startTimer();
  }

  verifyOtp(): void {
    if (this.otpForm.invalid) return;

    this.isLoading.set(true);
    // Simulate login success after verification
    setTimeout(() => {
      this.authService.login('otpuser@example.com', 'otppass').subscribe(() => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      });
    }, 1500);
  }
}
