import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService, Language, Currency } from '../../../core/services/theme.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDividerModule
  ],
  template: `
    <div class="profile-tab flex-col gap-lg animate-fadeIn">
      <div class="glass-card profile-card">
        <h2>Profile Details</h2>
        <p class="subtitle">Manage your personal info and phone details.</p>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form mt-md flex-col gap-md">
          <div class="grid-2">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName">
              <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName">
              <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>

          <div class="grid-2">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email Address</mat-label>
              <input matInput formControlName="email" type="email" [readonly]="true">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>
          </div>

          <button type="submit" class="btn-gradient search-btn w-full mt-md" [disabled]="profileForm.invalid">
            Save Profile Details
          </button>
        </form>
      </div>

      <!-- App Preferences Card -->
      <div class="glass-card prefs-card flex-col gap-md">
        <h3>App Preferences</h3>
        <p class="subtitle">Customize language, currency settings and UI display properties.</p>

        <div class="grid-2 mt-sm">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Display Language</mat-label>
            <mat-select [value]="themeService.language()" (selectionChange)="updateLang($event.value)">
              <mat-option value="en">English (US)</mat-option>
              <mat-option value="hi">Hindi (हिन्दी)</mat-option>
              <mat-option value="fr">French (Français)</mat-option>
              <mat-option value="ar">Arabic (العربية)</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Preferred Currency</mat-label>
            <mat-select [value]="themeService.currency()" (selectionChange)="updateCurrency($event.value)">
              <mat-option value="INR">INR (₹) Indian Rupee</mat-option>
              <mat-option value="USD">USD ($) US Dollar</mat-option>
              <mat-option value="EUR">EUR (€) Euro</mat-option>
              <mat-option value="GBP">GBP (£) British Pound</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-card, .prefs-card {
      padding: var(--space-xl) !important;
      border: 1px solid var(--border-color);
      h2, h3 { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); }
      .subtitle { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }
    }

    .profile-form {
      margin-top: var(--space-md);
    }

    .search-btn {
      height: 48px;
      font-size: 0.9rem !important;
      border-radius: var(--border-radius-md) !important;
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private notify = inject(NotificationService);

  profileForm!: FormGroup;

  ngOnInit(): void {
    const user = this.auth.currentUser();
    this.profileForm = this.fb.group({
      firstName: [user?.firstName || '', Validators.required],
      lastName: [user?.lastName || '', Validators.required],
      email: [user?.email || ''],
      phone: [user?.phone || '']
    });
  }

  updateLang(val: Language): void {
    this.themeService.setLanguage(val);
    this.notify.success(`Language preference set to ${val.toUpperCase()}`);
  }

  updateCurrency(val: Currency): void {
    this.themeService.setCurrency(val);
    this.notify.success(`Currency preference set to ${val}`);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.auth.updateProfile(this.profileForm.value);
  }
}
