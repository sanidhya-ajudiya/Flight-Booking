import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { FlightService } from '../../core/services/flight.service';
import { Flight, Passenger, PassengerCount } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-passenger-details',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDividerModule
  ],
  template: `
    <div class="passenger-page container animate-fadeIn" *ngIf="flight()">
      <div class="header-section text-center">
        <h2>Passenger Information</h2>
        <p>Please enter details matching passport or valid photo identification.</p>
      </div>

      <div class="layout-grid">
        <!-- Passenger Forms Form -->
        <form [formGroup]="paxForm" (ngSubmit)="onSubmit()" class="flex-col gap-lg">
          <div formArrayName="passengers">
            <div class="glass-card passenger-form-block mb-md" 
                 *ngFor="let p of passengersArray.controls; let i = index" 
                 [formGroupName]="i">
              
              <div class="form-block-header flex-between">
                <h3 class="passenger-title">✈️ Passenger {{ i + 1 }}</h3>
                <span class="badge badge-primary">Adult</span>
              </div>

              <div class="fields-grid mt-md">
                <!-- Title -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Title</mat-label>
                  <mat-select formControlName="title">
                    <mat-option value="Mr">Mr.</mat-option>
                    <mat-option value="Mrs">Mrs.</mat-option>
                    <mat-option value="Ms">Ms.</mat-option>
                    <mat-option value="Miss">Miss.</mat-option>
                  </mat-select>
                  <mat-error *ngIf="p.get('title')?.hasError('required')">Required</mat-error>
                </mat-form-field>

                <!-- First Name -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" placeholder="Given name">
                  <mat-error *ngIf="p.get('firstName')?.hasError('required')">Required</mat-error>
                </mat-form-field>

                <!-- Last Name -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" placeholder="Surname">
                  <mat-error *ngIf="p.get('lastName')?.hasError('required')">Required</mat-error>
                </mat-form-field>
              </div>

              <div class="fields-grid">
                <!-- Gender -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Gender</mat-label>
                  <mat-select formControlName="gender">
                    <mat-option value="Male">Male</mat-option>
                    <mat-option value="Female">Female</mat-option>
                    <mat-option value="Other">Other</mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Passport Number -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Passport Number</mat-label>
                  <input matInput formControlName="passportNumber" placeholder="Required for international routes">
                </mat-form-field>

                <!-- Meal Preference -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Meal Preference</mat-label>
                  <mat-select formControlName="mealPreference">
                    <mat-option value="Standard">Standard Veg/Non-Veg</mat-option>
                    <mat-option value="AsianVegetarian">Asian Veg</mat-option>
                    <mat-option value="Kosher">Kosher</mat-option>
                    <mat-option value="GlutenFree">Gluten-Free</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Special Assistance -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Special Assistance</mat-label>
                <mat-select formControlName="specialAssistance">
                  <mat-option value="None">None Required</mat-option>
                  <mat-option value="Wheelchair">Wheelchair Required</mat-option>
                  <mat-option value="VisualSupport">Visual Support</mat-option>
                  <mat-option value="HearingSupport">Hearing Support</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Contact Details Section -->
          <div class="glass-card contact-card">
            <h3>📞 Contact Details</h3>
            <p class="desc">E-ticket details and updates will be sent to this contact address.</p>

            <div class="fields-grid mt-md">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Email Address</mat-label>
                <input matInput type="email" formControlName="contactEmail">
                <mat-error *ngIf="paxForm.get('contactEmail')?.hasError('required')">Email is required</mat-error>
                <mat-error *ngIf="paxForm.get('contactEmail')?.hasError('email')">Enter valid email</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Phone Number</mat-label>
                <input matInput type="tel" formControlName="contactPhone">
                <mat-error *ngIf="paxForm.get('contactPhone')?.hasError('required')">Phone is required</mat-error>
              </mat-form-field>
            </div>
          </div>

          <button type="submit" class="btn-gradient search-btn w-full flex-center">
            Proceed to Payment <mat-icon>payment</mat-icon>
          </button>
        </form>

        <!-- Right Side sticky flight recap -->
        <div class="details-sidebar">
          <div class="glass-card sticky-sidebar flex-col gap-md">
            <h3>Flight Summary</h3>
            <div class="flight-recap flex-col gap-sm">
              <div class="flex-between">
                <span>Route</span>
                <strong>{{ flight()?.segments?.[0]?.origin?.code }} → {{ flight()?.segments?.[0]?.destination?.code }}</strong>
              </div>
              <div class="flex-between">
                <span>Date</span>
                <span>{{ flight()?.segments?.[0]?.departureTime | date:'dd MMM yyyy' }}</span>
              </div>
              <div class="flex-between">
                <span>Cabin</span>
                <span>{{ flight()?.cabinClass | titlecase }}</span>
              </div>
              <mat-divider></mat-divider>
              <div class="flex-between price-row">
                <span>Total Amount</span>
                <span class="price-val">₹{{ flight()?.price?.total | number }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .passenger-page {
      padding-top: var(--space-4xl);
      padding-bottom: var(--space-4xl);
    }

    .header-section {
      margin-bottom: var(--space-2xl);
      h2 { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
      p { font-size: 0.9rem; color: var(--text-secondary); }
    }

    .layout-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-xl);

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .passenger-form-block {
      padding: var(--space-xl) !important;
      border: 1px solid var(--border-color);
    }

    .form-block-header {
      border-bottom: 1px solid rgba(21, 101, 192, 0.05);
      padding-bottom: var(--space-xs);
    }

    .passenger-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .fields-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-md);

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .mb-md { margin-bottom: var(--space-md); }

    .contact-card {
      padding: var(--space-xl) !important;
      border: 1px solid var(--border-color);
      h3 { font-size: 1rem; font-weight: 700; }
      .desc { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }
    }

    .details-sidebar {
      position: sticky;
      top: 90px;
      height: fit-content;
    }

    .sticky-sidebar {
      padding: var(--space-xl) !important;
      h3 { font-size: 1.1rem; font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-xs); }
    }

    .flight-recap {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: var(--space-md);

      .price-row {
        font-weight: 700;
        color: var(--text-primary);
        font-size: 1rem;
        margin-top: var(--space-sm);

        .price-val { font-size: 1.4rem; color: var(--color-primary-dark); }
      }
    }

    .search-btn {
      height: 54px;
      border-radius: var(--border-radius-md) !important;
      font-size: 0.95rem !important;
      font-weight: 600;
    }
  `]
})
export class PassengerDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private flightService = inject(FlightService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  flight = signal<Flight | null>(null);
  paxForm!: FormGroup;

  ngOnInit(): void {
    // Check selected flight
    const match = this.flightService.selectedFlight();
    if (match) {
      this.flight.set(match);
    } else {
      // Mock Fallback
      this.flight.set(this.flightService.searchResults()[0]);
    }

    let adultsCount = 1;
    const search = this.flightService.searchParams();
    if (search) {
      adultsCount = search.passengers.adults + search.passengers.children;
    }

    this.paxForm = this.fb.group({
      passengers: this.fb.array([]),
      contactEmail: ['arjun@example.com', [Validators.required, Validators.email]],
      contactPhone: ['9876543210', [Validators.required]]
    });

    for (let i = 0; i < adultsCount; i++) {
      this.addPassenger();
    }
  }

  get passengersArray(): FormArray {
    return this.paxForm.get('passengers') as FormArray;
  }

  addPassenger(): void {
    const pGroup = this.fb.group({
      title: ['Mr', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['Male', Validators.required],
      passportNumber: [''],
      mealPreference: ['Standard', Validators.required],
      specialAssistance: ['None', Validators.required]
    });
    this.passengersArray.push(pGroup);
  }

  onSubmit(): void {
    if (this.paxForm.invalid) {
      this.notify.warning('Please complete passenger details.');
      return;
    }

    const val = this.paxForm.value;
    // Map form items to Passenger schema
    const passengers: Passenger[] = val.passengers.map((p: any) => ({
      type: 'adult',
      title: p.title,
      firstName: p.firstName,
      lastName: p.lastName,
      passportNumber: p.passportNumber,
      mealPreference: p.mealPreference,
      specialAssistance: p.specialAssistance
    }));

    // Create temporary booking object inside flight service
    const bookingDetails = {
      flight: this.flight()!,
      passengers,
      contactEmail: val.contactEmail,
      contactPhone: val.contactPhone
    };

    // Store temporarily
    this.flightService.currentBooking.set(bookingDetails as any);

    this.router.navigate(['/payment']);
  }
}
