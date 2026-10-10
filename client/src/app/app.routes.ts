import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { FlightResultsComponent } from './features/flight-results/flight-results.component';
import { BookingFlowComponent } from './features/booking-flow/booking-flow.component';
import { BookingHistoryComponent } from './features/booking-history/booking-history.component';
import { ProfileComponent } from './features/profile/profile.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { WebCheckinComponent } from './features/web-checkin/web-checkin.component';
import { FlightStatusComponent } from './features/flight-status/flight-status.component';

import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { AdminFlightsComponent } from './features/admin/flights/admin-flights.component';
import { AdminAirportsComponent } from './features/admin/airports/admin-airports.component';
import { AdminAirlinesComponent } from './features/admin/airlines/admin-airlines.component';
import { AdminBookingsComponent } from './features/admin/bookings/admin-bookings.component';
import { AdminCouponsComponent } from './features/admin/coupons/admin-coupons.component';
import { AdminRefundsComponent } from './features/admin/refunds/admin-refunds.component';
import { AdminUsersComponent } from './features/admin/users/admin-users.component';

import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: FlightResultsComponent },
  { path: 'check-in', component: WebCheckinComponent },
  { path: 'flight-status', component: FlightStatusComponent },
  { path: 'booking', component: BookingFlowComponent, canActivate: [authGuard] },
  { path: 'my-bookings', component: BookingHistoryComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Admin Routes
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/flights', component: AdminFlightsComponent, canActivate: [adminGuard] },
  { path: 'admin/airports', component: AdminAirportsComponent, canActivate: [adminGuard] },
  { path: 'admin/airlines', component: AdminAirlinesComponent, canActivate: [adminGuard] },
  { path: 'admin/bookings', component: AdminBookingsComponent, canActivate: [adminGuard] },
  { path: 'admin/coupons', component: AdminCouponsComponent, canActivate: [adminGuard] },
  { path: 'admin/refunds', component: AdminRefundsComponent, canActivate: [adminGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: '' }
];
