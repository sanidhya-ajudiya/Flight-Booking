import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Landing ──────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },

  // ── Auth ─────────────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // ── Search ────────────────────────────────────────────────
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
  },

  // ── Results ───────────────────────────────────────────────
  {
    path: 'results',
    loadComponent: () => import('./features/results/results.component').then(m => m.ResultsComponent)
  },

  // ── Destinations ──────────────────────────────────────────
  {
    path: 'destinations',
    loadComponent: () => import('./features/destinations/destinations.component').then(m => m.DestinationsComponent)
  },

  // ── Offers ────────────────────────────────────────────────
  {
    path: 'offers',
    loadComponent: () => import('./features/offers/offers.component').then(m => m.OffersComponent)
  },

  // ── Flight Details ─────────────────────────────────────────
  {
    path: 'flight/:id',
    loadComponent: () => import('./features/flight-details/flight-details.component').then(m => m.FlightDetailsComponent)
  },

  // ── Seat Selection ─────────────────────────────────────────
  {
    path: 'seats/:id',
    loadComponent: () => import('./features/seat-selection/seat-selection.component').then(m => m.SeatSelectionComponent)
  },

  // ── Passenger Details ──────────────────────────────────────
  {
    path: 'passengers',
    loadComponent: () => import('./features/passenger-details/passenger-details.component').then(m => m.PassengerDetailsComponent)
  },

  // ── Payment ───────────────────────────────────────────────
  {
    path: 'payment',
    loadComponent: () => import('./features/payment/payment.component').then(m => m.PaymentComponent)
  },

  // ── Booking Confirmation ──────────────────────────────────
  {
    path: 'booking-confirmation',
    loadComponent: () => import('./features/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent)
  },

  // ── User Dashboard ─────────────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },

  // ── Admin Dashboard ────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // ── Wildcard ──────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
